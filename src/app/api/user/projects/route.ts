import { NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security/sanitization";
import { createClient } from "@/lib/supabase/server";

const ProjectCreateSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters").max(100, "Title is too long").trim(),
    description: z.string().max(1000, "Description must be under 1000 characters").optional().nullable(),
    link: z.string().url("Invalid project URL").or(z.literal("")).optional().nullable(),
    image: z.string().max(1000).optional().nullable(),
});

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const parseResult = ProjectCreateSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const title = sanitizeInput(parseResult.data.title);
        const description = parseResult.data.description ? sanitizeInput(parseResult.data.description) : null;
        const link = parseResult.data.link ? sanitizeInput(parseResult.data.link) : null;
        const image = parseResult.data.image ? sanitizeInput(parseResult.data.image) : null;

        const project = await prisma.project.create({
            data: {
                title,
                description,
                link,
                image,
                userId: user.id
            }
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error("Project creation error:", error);
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("id");

        if (!projectId) {
            return NextResponse.json({ error: "Project ID required" }, { status: 400 });
        }

        // Validate UUID format to prevent DB casting crashes
        if (!z.string().uuid().safeParse(projectId).success) {
            return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
        }

        // Verify ownership
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project || project.userId !== user.id) {
            return NextResponse.json({ error: "Unauthorized or not found" }, { status: 403 });
        }

        await prisma.project.delete({
            where: { id: projectId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Project deletion error:", error);
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
}
