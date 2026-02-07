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
                linkedin: true,
                github: true,
                instagram: true,
                projects: true,
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
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    role: true,
                    bio: true,
                    skills: true,
                    portfolio: true,
                    linkedin: true,
                    github: true,
                    instagram: true,
                    projects: true,
                    createdAt: true,
                },
            });
        }

        // Calculate stats
        const earnings = await prisma.escrow.aggregate({
            where: {
                workerId: user.id,
                status: "RELEASED"
            },
            _sum: {
                amount: true
            }
        });

        const activeGigs = await prisma.application.count({
            where: {
                applicantId: user.id,
                status: "ACCEPTED",
                gig: {
                    status: "IN_PROGRESS"
                }
            }
        });

        const pendingApplications = await prisma.application.count({
            where: {
                applicantId: user.id,
                status: "PENDING"
            }
        });

        return NextResponse.json({
            ...profile,
            stats: {
                earnings: earnings._sum.amount || 0,
                activeGigs,
                pendingApplications
            }
        });
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

        const data = await req.json();
        const allowedFields = ['name', 'bio', 'skills', 'portfolio', 'role', 'image', 'linkedin', 'github', 'instagram', 'latitude', 'longitude'];
        const updates: any = {};

        allowedFields.forEach(field => {
            if (data[field] !== undefined) {
                updates[field] = data[field];
            }
        });

        // Special handling for skills if passed as string
        if (updates.skills && typeof updates.skills === 'string') {
            updates.skills = updates.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updates,
        });

        return NextResponse.json(updatedUser);
    } catch (error: any) {
        console.error("Profile update error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update profile" },
            { status: 500 }
        );
    }
}
