import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user profile from database
        let profile = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                bio: true,
                skills: true,
                portfolio: true,
                createdAt: true,
            },
        });

        if (!profile) {
            // Auto-create profile if it doesn't exist
            profile = await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email!,
                    name: user.user_metadata?.name || user.email?.split("@")[0] || "Stellar Student",
                    role: "STUDENT",
                },
            });
        }

        return NextResponse.json(profile);
    } catch (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const { id, email, name, role } = await req.json();

        // Create user profile in database
        const user = await prisma.user.create({
            data: {
                id,
                email,
                name,
                role: role || "STUDENT",
            },
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error("Profile creation error:", error);
        return NextResponse.json(
            { error: "Failed to create profile" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const updates = await req.json();

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updates,
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
