import { NextRequest, NextResponse } from"next/server"

import { protectApi } from"@/lib/auth-checks"
import prisma from"@/lib/prisma"

// GET /api/employer/talent-search?q=react&tier=1&year=3
export async function GET(req: NextRequest) {
 try {
 const auth = await protectApi(["FOUNDER","STARTUP","CLIENT"])
 if (auth.errorResponse) return auth.errorResponse
 
 const {} = auth;

 const { searchParams } = new URL(req.url)
 const query = searchParams.get("q") ||""
 const year = searchParams.get("year") ||""

 const candidates = await prisma.user.findMany({
 where: {
 role:"STUDENT",
 isVerified: true,
 ...(query ? {
 OR: [
 { skills: { contains: query, mode:"insensitive" } },
 { bio: { contains: query, mode:"insensitive" } },
 { careerGoal: { contains: query, mode:"insensitive" } },
 ],
 } : {}),
 ...(year ? { year } : {}),
 },
 select: {
 id: true,
 name: true,
 full_name: true,
 image: true,
 avatar_url: true,
 college: true,
 branch: true,
 year: true,
 skills: true,
 bio: true,
 isVerified: true,
 github: true,
 linkedin: true,
 portfolio: true,
 userSkills: {
 select: {
 skill: { select: { name: true, category: true, color: true } },
 },
 take: 6,
 },
 reviewsReceived: {
 select: { rating: true },
 take: 50,
 },
 gigsPosted: {
 where: { status:"COMPLETED" },
 select: { id: true },
 take: 30,
 },
 endorsementsReceived: {
 select: { id: true },
 take: 30,
 },
 },
 take: 50,
 orderBy: { createdAt:"desc" },
 })

 // Compute reputation scores
 const ranked = candidates
 .map((c: any) => {
 const avgRating =
 c.reviewsReceived.length > 0
 ? c.reviewsReceived.reduce((a: any, r: any) => a + r.rating, 0) / c.reviewsReceived.length
 : 0
 const reputationScore = Math.min(
 100,
 Math.round(c.gigsPosted.length * 15 + c.endorsementsReceived.length * 5 + avgRating * 10)
 )
 return { ...c, reputationScore, avgRating }
 })
 .sort((a: any, b: any) => b.reputationScore - a.reputationScore)

 return NextResponse.json(ranked)
 } catch (error) {
 console.error("[/api/employer/talent-search GET]", error)
 return NextResponse.json({ error:"Internal server error" }, { status: 500 })
 }
}
