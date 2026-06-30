import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { filterAndRankGigs } from "@/lib/ai/filterAndRank";
import { moderateGig } from "@/lib/ai/moderator";
import prisma from "@/lib/prisma";
import { generalApiLimiter } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { validateSessionUserId } from "@/lib/uuid-utils";


export const dynamic = "force-dynamic";

// Input Validation Schemas
const GigCreateSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title cannot exceed 100 characters").trim(),
    description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description cannot exceed 2000 characters").trim(),
    budget: z.coerce.number().positive("Budget must be a positive number").max(1000000, "Budget cannot exceed 1,000,000"),
    deadline: z.string().nullish().transform(val => {
        if (!val || val.trim() === "") return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
    }),
});

const GigPatchSchema = z.object({
    id: z.string().uuid("Invalid gig ID format"),
    status: z.string().min(1, "Status cannot be empty").max(20, "Status is too long").trim(),
});

const GigQuerySchema = z.object({
    q: z.string().catch(""),
    category: z.string().catch(""),
    minBudget: z.coerce.number().int().nonnegative().catch(0),
    maxBudget: z.coerce.number().int().positive().catch(999999),
    sort: z.enum(["newest", "budget-high", "budget-low", "deadline", "relevant"]).catch("newest"),
    page: z.coerce.number().int().positive().catch(1),
});

//////////////////////////////////////////////////////
// GET GIGS
//////////////////////////////////////////////////////

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } =
            await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({
                gigs: [],
                matched: 0,
            });
        }

        //////////////////////////////////////////////////////
        // AUTO CREATE USER IF MISSING
        //////////////////////////////////////////////////////

        // ðŸ›¡ï¸ UUID Guard: Supabase can return a session with a non-UUID id in some edge-cases
        try {
            validateSessionUserId(user.id, "GET /api/gigs");
        } catch {
            return NextResponse.json({ gigs: [], matched: 0 });
        }

        let dbUser = await prisma.user.findUnique({
            where: { id: user.id },
        });

        if (!dbUser) {
            dbUser = await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email!,
                },
            });
        }

        if (!dbUser.latitude || !dbUser.longitude) {
            return NextResponse.json({
                gigs: [],
                matched: 0,
            });
        }

        const searchParams = new URL(req.url).searchParams;
        const queryParams = Object.fromEntries(searchParams.entries());
        const parsed = GigQuerySchema.parse(queryParams);
        const { q: query, category, minBudget, maxBudget, sort, page } = parsed;

        let orderByClause: Prisma.GigOrderByWithRelationInput = { createdAt: "desc" };
        if (sort === "budget-high") orderByClause = { budget: "desc" };
        else if (sort === "budget-low") orderByClause = { budget: "asc" };
        else if (sort === "deadline") orderByClause = { deadline: "asc" };
        else if (sort === "newest") orderByClause = { createdAt: "desc" };

        const gigs = await prisma.gig.findMany({
            where: {
                status: "OPEN",
                budget: {
                    gte: minBudget,
                    lte: maxBudget,
                },
                ...(category && category !== "All" && category.toLowerCase() !== "general" ? {
                    tags: {
                        contains: category,
                        mode: "insensitive"
                    }
                } : {}),
                ...(query ? {
                    OR: [
                        { title: { contains: query, mode: "insensitive" } },
                        { description: { contains: query, mode: "insensitive" } },
                        { tags: { contains: query, mode: "insensitive" } },
                        { poster: { name: { contains: query, mode: "insensitive" } } }
                    ]
                } : {})
            },
            include: {
                poster: { select: { id: true, name: true, image: true } },
                _count: { select: { applications: true } }
            },
            orderBy: orderByClause,
        });

        const ITEMS_PER_PAGE = 12;
        const start = (page - 1) * ITEMS_PER_PAGE;

        let finalGigs = gigs;
        // If sort is 'relevant', pass through filterAndRankGigs
        if (sort === "relevant") {
            finalGigs = filterAndRankGigs({
                user: dbUser,
                gigs,
            });
        }

        return NextResponse.json({
            gigs: finalGigs.slice(
                start,
                start + ITEMS_PER_PAGE
            ),
            matched: finalGigs.length,
            hasMore:
                start + ITEMS_PER_PAGE < finalGigs.length,
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Internal server error";
        console.error("[GIGS_GET_ERROR]:", error);
        return NextResponse.json(
            { gigs: [], error: msg },
            { status: 500 }
        );
    }
}

//////////////////////////////////////////////////////
// POST GIG
//////////////////////////////////////////////////////

import { cookies } from "next/headers";

export async function POST(req: Request) {
    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    if (!(await generalApiLimiter.check(ip))) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    try {
        const cookieStore = await cookies();
        const isPreview = (await cookieStore).get('admin_preview_mode')?.value === 'true';

        if (isPreview) {
            return NextResponse.json({ error: "Cannot post gigs in Preview Mode" }, { status: 403 });
        }
        const supabase = await createClient();
        const { data: { user }, error } =
            await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // ðŸ›¡ï¸ UUID Guard â€” prevent P2023 from invalid Supabase user IDs
        try {
            validateSessionUserId(user.id, "POST /api/gigs");
        } catch (uuidErr) {
            console.error("[P2023 Guard]", uuidErr);
            return NextResponse.json({ error: "Invalid session identity. Please sign out and sign in again." }, { status: 400 });
        }

        const body = await req.json();
        
        // Zod Validation
        const parseResult = GigCreateSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const {
            title,
            description,
            budget,
            deadline,
        } = parseResult.data;

        //////////////////////////////////////////////////////
        // AUTO CREATE PROFILE IF MISSING â­ FIX
        //////////////////////////////////////////////////////

        let dbUser = await prisma.user.findUnique({
            where: { id: user.id },
        });

        if (!dbUser) {
            dbUser = await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email!,
                },
            });
        }

        //////////////////////////////////////////////////////
        // AI CONTENT MODERATION
        //////////////////////////////////////////////////////

        const modResult = await moderateGig(title, description, dbUser.id);
        if (modResult.autoReject) {
            return NextResponse.json(
                { error: `Your gig was automatically rejected: ${modResult.reason}` },
                { status: 422 }
            );
        }

        // Flagged content goes to pending admin review, safe content auto-approves
        const initialStatus = modResult.action === 'FLAG' ? 'PENDING_APPROVAL' : 'OPEN';

        //////////////////////////////////////////////////////
        // CREATE GIG
        //////////////////////////////////////////////////////

        const gig = await prisma.gig.create({
            data: {
                title,
                description,
                budget: Number(budget),
                deadline,
                posted_by: dbUser.id,
                status: initialStatus,
                latitude: dbUser.latitude,
                longitude: dbUser.longitude,
            },
        });

        // Pre-compute gig vector embedding asynchronously in the background (fire-and-forget)
        import("@/lib/ai/embeddings").then(({ computeGigEmbedding }) => {
            computeGigEmbedding(gig.id).catch(err => {
                console.error("[GIGS_POST] Asynchronous embedding update failed:", err);
            });
        });

        // NOTIFICATIONS: Notify followers
        // Note: Using try-catch to prevent blocking the response if notification fails
        try {
            const followers = await prisma.follows.findMany({
                where: { followingId: dbUser.id },
                select: { followerId: true }
            });

            if (followers.length > 0) {
                await prisma.notification.createMany({
                    data: followers.map((f: any) => ({
                        userId: f.followerId,
                        type: "FOLLOW_ACTIVITY",
                        title: "New Post from Network",
                        message: `${dbUser.name || "A connection"} posted a new gig: ${title}`,
                        link: `/gigs/${gig.id}`
                    }))
                });
            }
        } catch (notifError) {
            console.error("Failed to send notifications:", notifError);
        }

        return NextResponse.json(gig, {
            status: 201,
        });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Internal server error";
        console.error("[GIGS_POST_ERROR]:", error);
        return NextResponse.json(
            { error: msg },
            { status: 500 }
        );
    }
}

// PATCH - Update Gig status (e.g. mark as completed)
export async function PATCH(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        
        // Zod Validation
        const parseResult = GigPatchSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { id, status } = parseResult.data;

        const gig = await prisma.gig.findUnique({ where: { id } });
        if (!gig) return NextResponse.json({ error: "Gig not found" }, { status: 404 });

        // Only poster or founder
        if (gig.posted_by !== user.id) {
            const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
            if (dbUser?.role !== "FOUNDER") {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        const completedAt = status === "COMPLETED" ? new Date() : null;

        const updated = await prisma.gig.update({
            where: { id },
            data: { 
                status,
                completedAt
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[GIGS_PATCH_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE - Remove a gig
export async function DELETE(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        // UUID Guard
        if (!z.string().uuid().safeParse(id).success) {
            return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
        }

        const gig = await prisma.gig.findUnique({ where: { id } });
        if (!gig) return NextResponse.json({ error: "Gig not found" }, { status: 404 });

        if (gig.posted_by !== user.id) {
            const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
            if (dbUser?.role !== "FOUNDER") {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        await prisma.gig.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[GIGS_DELETE_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

