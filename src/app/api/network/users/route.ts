import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUserId = user.id;

    // Fetch users (limit 50 for performance)
    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        isSuspended: false
      },
      select: {
        id: true,
        name: true,
        full_name: true,
        role: true,
        college: true,
        branch: true,
        year: true,
        image: true,
        avatar_url: true,
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
    const formattedUsers = users.map((u) => {
      const displayName = u.full_name?.trim() || u.name?.trim() || "Campus Member";
      return {
        id: u.id,
        name: displayName,
        full_name: u.full_name || null,
        role: u.role || "Student",
        college: u.college || null,
        branch: u.branch || null,
        year: u.year || null,
        university: u.college || "Campus Connect",
        image: u.avatar_url || u.image || null,
        avatar_url: u.avatar_url || u.image || null,
        bio: u.bio?.trim() || "No bio yet",
        skills: typeof u.skills === "string" ? u.skills : Array.isArray(u.skills) ? (u.skills as string[]).join(",") : null,
        tags: typeof u.skills === "string" ? u.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(u.skills) ? u.skills : []),
        isFollowing: Boolean(u.followedBy && u.followedBy.length > 0)
      };
    });

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Network Users API Error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
