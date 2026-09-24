import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { safeCompare } from "@/lib/security/crypto";

// This route can be called periodically by Vercel Cron.
export const maxDuration = 60; // 1 min max

export async function GET(req: Request) {
  try {
    // 1. Fail closed if CRON_SECRET is not configured on the server
    if (!process.env.CRON_SECRET) {
      console.error("[CRON Error] CRON_SECRET is not configured on the server");
      return NextResponse.json(
        { error: "CRON_SECRET is not configured on the server" },
        { status: 500 }
      );
    }

    // 2. Enforce authentication strictly via Authorization: Bearer <CRON_SECRET> using safeCompare.
    // URL parameter (?secret=) authentication is strictly rejected to prevent credential leakage in logs.
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !safeCompare(authHeader, `Bearer ${process.env.CRON_SECRET}`)) {
      return NextResponse.json({ error: "Unauthorized cron agent" }, { status: 401 });
    }

    // 3. Preserve completed historical business transactions and escrows.
    // Gigs and Posts with status "COMPLETED" represent financial agreements, escrows,
    // and completed student portfolios. They must NEVER be hard-deleted.
    const completedGigsCount = await prisma.gig.count({
      where: {
        status: "COMPLETED",
      },
    });

    const completedPostsCount = await prisma.post.count({
      where: {
        status: "COMPLETED",
      },
    });

    // 4. Safe retention cleanup: only purge records explicitly marked for soft-deletion (deletedAt set)
    // that exceed the 30-day retention threshold, avoiding data loss for active/completed entities.
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const purgedDeletedGigs = await prisma.gig.deleteMany({
      where: {
        deletedAt: {
          not: null,
          lte: thirtyDaysAgo,
        },
      },
    });

    return NextResponse.json({
      success: true,
      preservedRecords: {
        completedGigs: completedGigsCount,
        completedPosts: completedPostsCount,
      },
      deletedCount: {
        gigs: purgedDeletedGigs.count,
        posts: 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("CRON_CLEANUP_ERROR:", error);
    return NextResponse.json({ error: "Failed to run automated cleanup system" }, { status: 500 });
  }
}
