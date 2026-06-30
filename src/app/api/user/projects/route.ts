import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, description, link, image } = await req.json();

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
