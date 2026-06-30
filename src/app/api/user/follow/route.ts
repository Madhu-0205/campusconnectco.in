import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

interface ModelDelegate { create: (args: unknown) => Promise<unknown>; deleteMany: (args: unknown) => Promise<unknown>; }
const getFollows = () => (prisma as unknown as { follows: ModelDelegate }).follows;
const getNotification = () => (prisma as unknown as { notification: ModelDelegate }).notification;

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { followingId } = body;
        if (!followingId) return NextResponse.json({ error: "Missing followingId" }, { status: 400 });
        const followerId = user.id;

        if (followingId === followerId) {
            return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
        }

        // Create follow relation
        await getFollows().create({
            data: {
                followerId: followerId,
                followingId: followingId
            }
        });

        // Get follower details for notification
        const follower = await prisma.user.findUnique({
            where: { id: followerId },
            select: { name: true }
        });

        // Create notification for the user being followed
        // Use type casting to prevent TS errors if client is stale
        if (getNotification()) {
            await getNotification().create({
                data: {
                    userId: followingId,
                    type: "FOLLOW_ACTIVITY",
                    title: "New Follower",
                    message: `${follower?.name || "Someone"} started following you.`,
                    link: `/profile/${followerId}`
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Follow error:", error);
        // Checking for unique constraint violation (code P2002)
        return NextResponse.json({ error: "Already following or failed" }, { status: 400 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { followingId } = await request.json();

        if (!followingId) return NextResponse.json({ error: "Missing followingId" }, { status: 400 });

        const followerId = user.id;

        // Use deleteMany for safe deletion with composite key via standard filtering
        await getFollows().deleteMany({
            where: {
                followerId: followerId,
                followingId: followingId
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Unfollow error:", error);
        return NextResponse.json({ error: "Failed to unfollow" }, { status: 500 });
    }
}
