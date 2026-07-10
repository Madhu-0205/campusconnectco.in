import { NextResponse } from "next/server";
import { z } from "zod";

import { moderatePost } from "@/lib/ai/moderator";
import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";
import { generalApiLimiter } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/security/sanitization";

const PostCreateSchema = z.object({
    content: z.string().min(1, "Content cannot be empty").max(2000, "Content must be under 2000 characters"),
});

const PostPatchSchema = z.object({
    id: z.string().uuid("Invalid Post ID format"),
    status: z.enum(["OPEN", "COMPLETED", "PENDING_REVIEW"]),
});

export const dynamic = "force-dynamic";

// GET - Fetch all posts (Feed)
export async function GET(req: Request) {
    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    if (!(await generalApiLimiter.check(ip))) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    try {
        const searchParams = new URL(req.url).searchParams;
        const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
        const pageSize = Math.min(Math.max(parseInt(searchParams.get("limit") || "20"), 20), 100);
        const skip = (page - 1) * pageSize;

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where: { status: "OPEN" },
                include: {
                    author: { select: { name: true, image: true, role: true } },
                    _count: { select: { likes: true } }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
            }),
            prisma.post.count({ where: { status: "OPEN" } }),
        ]);

        return NextResponse.json({
            items: posts,
            page,
            pageSize,
            totalItems: total,
            totalPages: Math.ceil(total / pageSize),
            hasNextPage: skip + posts.length < total,
            hasPreviousPage: page > 1,
        });
    } catch (error) {
        console.error("[POSTS_GET]", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

// POST - Create a new post
export async function POST(req: Request) {
    const auth = await protectApi(["STUDENT", "FOUNDER"]);
    if (auth.errorResponse) return auth.errorResponse;

    try {
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const parseResult = PostCreateSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const content = sanitizeInput(parseResult.data.content);

        // AI Content Moderation
        const modResult = await moderatePost(content, auth.user!.id);
        if (modResult.autoReject) {
            return NextResponse.json(
                { error: `Your post was rejected: ${modResult.reason}` },
                { status: 422 }
            );
        }

        const post = await prisma.post.create({
            data: {
                content,
                authorId: auth.user!.id,
                status: modResult.action === 'FLAG' ? 'PENDING_REVIEW' : 'OPEN'
            },
            include: {
                author: { select: { name: true, image: true } }
            }
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error("[POSTS_CREATE]", error);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}

// DELETE - Delete a post (Author or Founder)
export async function DELETE(req: Request) {
    const auth = await protectApi(["STUDENT", "FOUNDER"]);
    if (auth.errorResponse) return auth.errorResponse;

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        // Validate UUID format to prevent DB casting crashes
        if (!z.string().uuid().safeParse(id).success) {
            return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
        }

        const post = await prisma.post.findUnique({
            where: { id }
        });

        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        // Security: Only author or a FOUNDER can delete
        if (post.authorId !== auth.user!.id && auth.role !== "FOUNDER") {
            return NextResponse.json({ error: "Unauthorized to delete this post" }, { status: 403 });
        }

        await prisma.post.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[POSTS_DELETE]", error);
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}

// PATCH - Update post status (e.g. mark as completed)
export async function PATCH(req: Request) {
    const auth = await protectApi(["STUDENT", "FOUNDER"]);
    if (auth.errorResponse) return auth.errorResponse;

    try {
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const parseResult = PostPatchSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { id, status } = parseResult.data;

        const post = await prisma.post.findUnique({ where: { id } });
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

        if (post.authorId !== auth.user!.id && auth.role !== "FOUNDER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const completedAt = status === "COMPLETED" ? new Date() : null;

        const updated = await prisma.post.update({
            where: { id },
            data: { 
                status,
                completedAt
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[POSTS_PATCH]", error);
        return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }
}
