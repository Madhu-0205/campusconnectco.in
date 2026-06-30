import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// This route can be called periodically by Vercel Cron, GitHub Actions, or a simple interval.
// To ensure it's not maliciously triggered, we could add a basic secret check, but for this instance we allow any trusted runner to ping it.
export const maxDuration = 60; // 1 min max

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const secret = url.searchParams.get("secret");
        if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: "Unauthorized cron agent" }, { status: 401 });
        }

        // Calculate the threshold time: 1 hour ago
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);

        // 1. Clean up Gigs completed > 1 hour ago
        const deletedGigs = await prisma.gig.deleteMany({
            where: {
                status: "COMPLETED",
                completedAt: {
                    lte: oneHourAgo,
                }
            }
        });

        // 2. Clean up Posts marked as completed > 1 hour ago
        const deletedPosts = await prisma.post.deleteMany({
            where: {
                status: "COMPLETED",
                completedAt: {
                    lte: oneHourAgo,
                }
            }
        });

        return NextResponse.json({
            success: true,
            deletedCount: {
                gigs: deletedGigs.count,
                posts: deletedPosts.count
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("CRON_CLEANUP_ERROR:", error);
        return NextResponse.json({ error: "Failed to run automated cleanup system" }, { status: 500 });
    }
}
