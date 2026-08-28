import { NextResponse } from"next/server";

import { protectApi } from"@/lib/auth-checks";
import prisma from"@/lib/prisma";

export const dynamic ="force-dynamic";

export async function GET() {
 try {
 const auth = await protectApi(["FOUNDER"]);
 if (auth.errorResponse) return auth.errorResponse;

 // Calculate time periods
 const now = new Date();
 const thirtyDaysAgo = new Date();
 thirtyDaysAgo.setDate(now.getDate() - 30);
 
 // 1. Total & New Users
 const totalUsers = await prisma.user.count({ where: { role:"STUDENT" } });
 const newRegistrations = await prisma.user.count({
 where: {
 role:"STUDENT",
 createdAt: { gte: thirtyDaysAgo }
 }
 });

 // 2. Platform Activity
 const totalApplications = await prisma.application.count();
 const activeApplications = await prisma.application.count({
 where: { createdAt: { gte: thirtyDaysAgo } }
 });

 // 3. Gig Completions
 const totalGigsCompleted = await prisma.gig.count({ where: { status:"COMPLETED" } });
 const recentGigCompletions = await prisma.gig.count({
 where: { status:"COMPLETED", completedAt: { gte: thirtyDaysAgo } }
 });

 // 4. Platform Engagement & Messages
 const activeConversations = await prisma.conversation.count();
 
 // Monetization stats (Premium Gigs/Internships)
 const premiumGigs = await prisma.gig.count({ where: { isPremium: true } });
 const featuredInternships = await prisma.internship.count({ where: { isFeatured: true } });

 // Calculate live platform revenue (sum of all platform fees)
 const escrowRev = await prisma.escrow.aggregate({ _sum: { platformFee: true } });
 const txRev = await prisma.transaction.aggregate({ _sum: { platformFee: true } });
 const estimatedRevenue = Number(escrowRev._sum.platformFee || 0) + Number(txRev._sum.platformFee || 0);

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
 estimatedRevenue: Number(estimatedRevenue.toFixed(2))
 }
 });

 } catch (error) {
 console.error("ANALYTICS_ERROR:", error);
 return NextResponse.json({ error:"Failed to generate platform analytics" }, { status: 500 });
 }
}
