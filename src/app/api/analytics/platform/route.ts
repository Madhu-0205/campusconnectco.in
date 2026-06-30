import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { protectApi } from "@/lib/auth-checks";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const auth = await protectApi(["FOUNDER"]);
        if (auth.errorResponse) return auth.errorResponse;

        // Calculate time periods
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        
        // 1. Total & New Users
        const totalUsers = await prisma.user.count({ where: { role: "STUDENT" } });
        const newRegistrations = await prisma.user.count({
            where: {
                role: "STUDENT",
                createdAt: { gte: thirtyDaysAgo }
            }
        });

        // 2. Platform Activity
        const totalApplications = await prisma.application.count();
        const activeApplications = await prisma.application.count({
            where: { createdAt: { gte: thirtyDaysAgo } }
        });

        // 3. Gig Completions
        const totalGigsCompleted = await prisma.gig.count({ where: { status: "COMPLETED" } });
        const recentGigCompletions = await prisma.gig.count({
            where: { status: "COMPLETED", completedAt: { gte: thirtyDaysAgo } }
        });

        // 4. Platform Engagement & Messages
        const activeConversations = await prisma.conversation.count();
        
        // Monetization stats (Premium Gigs/Internships)
        const premiumGigs = await prisma.gig.count({ where: { isPremium: true } });
        const featuredInternships = await prisma.internship.count({ where: { isFeatured: true } });

        return NextResponse.json({
            growth: {
                totalUsers,
                newUsers30d: newRegistrations,
                growthRate: totalUsers > 0 ? (newRegistrations / totalUsers) * 100 : 0
            },
            opportunities: {
                totalApplications,
                recentApplications30d: activeApplications,
                totalGigsCompleted,
                recentGigCompletions30d: recentGigCompletions
            },
            engagement: {
                activeConversations
            },
            monetization: {
                premiumGigs,
                featuredInternships,
                estimatedRevenue: (premiumGigs * 499) + (featuredInternships * 999) // arbitrary estimation for UI
            }
        });

    } catch (error) {
        console.error("ANALYTICS_ERROR:", error);
        return NextResponse.json({ error: "Failed to generate platform analytics" }, { status: 500 });
    }
}
