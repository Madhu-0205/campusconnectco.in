import { NextResponse } from"next/server"

import { getSession } from"@/lib/auth-checks"
import { computeSmartScore } from"@/lib/gamification"
import prisma from"@/lib/prisma"

// GET /api/gamification/leaderboard?period=WEEKLY&college=IIT+Delhi&limit=50
export async function GET(req: Request) {
 try {
 const { searchParams } = new URL(req.url)
 const period = searchParams.get("period") ||"ALL_TIME"
 const college = searchParams.get("college") ||""
 const limit = Math.min(Number(searchParams.get("limit") ||"50"), 100)

 const user = await getSession()

 // Fetch top gamification records + user info
 
 const records: any[] = await (prisma as any).userGamification.findMany({
 orderBy: { smartScore:"desc" },
 take: limit,
 include: {
 user: {
 select: {
 id: true,
 name: true,
 username: true,
 image: true,
 college: true,
 year: true,
 },
 },
 userBadges: {
 include: { badge: { select: { icon: true, color: true, tier: true } } },
 take: 3,
 orderBy: { earnedAt:"desc" },
 },
 },
 ...(college
 ? { where: { user: { college: { equals: college, mode:"insensitive" } } } }
 : {}),
 })

 const leaderboard = records.map((r: any, i: number) => ({
 rank: i + 1,
 userId: r.userId,
 name: r.user?.name ||"Anonymous",
 username: r.user?.username,
 avatar: r.user?.image,
 college: r.user?.college ||"—",
 year: r.user?.year,
 smartScore: computeSmartScore(r.reliabilityScore, r.executionScore, r.learningScore, r.communityScore),
 totalXp: r.totalXp,
 level: r.level,
 levelTitle: r.levelTitle,
 gigsCompleted: r.gigsCompleted,
 totalEarned: r.totalEarned,
 currentStreak: r.currentStreak,
 topBadges: r.userBadges.map((ub: any) => ub.badge),
 isCurrentUser: r.userId === user?.id,
 }))

 // Find current user's rank if not in top N
 let myRank = null
 if (user && !leaderboard.find((l: any) => l.userId === user.id)) {
 
 const myGamif = await (prisma as any).userGamification.findUnique({ where: { userId: user.id } })
 if (myGamif) {
 
 const above = await (prisma as any).userGamification.count({
 where: { smartScore: { gt: myGamif.smartScore } },
 })
 myRank = { rank: above + 1, ...myGamif }
 }
 }

 return NextResponse.json({ leaderboard, myRank, period, college })
 } catch (error) {
 console.error("[GET /api/gamification/leaderboard]", error)
 return NextResponse.json({ error:"Internal server error" }, { status: 500 })
 }
}
