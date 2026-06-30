import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const currentUserId = user.id;

        // Fetch users (limit 50 for performance)
        const users = await prisma.user.findMany({
            where: {
                id: { not: currentUserId }
            },
            select: {
                id: true,
                name: true,
                role: true,

                bio: true,
                skills: true,
                followedBy: {
                    where: { followerId: currentUserId },
                    select: { followerId: true }
                }
            },
            take: 50,
            orderBy: { createdAt: "desc" }
        });

        // Transform for frontend
        const formattedUsers = users.map((u: any) => ({
            id: u.id,
            name: u.name || "Anonymous",
            role: u.role || "Student",
            university: "Campus Connect",
            year: "2026",
            bio: u.bio || "No bio yet",
            tags: u.skills || [],
            isFollowing: u.followedBy.length > 0
        }));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error("Network Users API Error:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
