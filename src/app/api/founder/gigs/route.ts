import { NextResponse } from"next/server";

import { protectApi } from"@/lib/auth-checks";
import prisma from"@/lib/prisma";

// GET - Fetch all gigs for moderation
export async function GET() {
 try {
 const auth = await protectApi(["FOUNDER", "ADMIN"]);
 if (auth.errorResponse) return auth.errorResponse;

 // Fetch all gigs with poster info and application count
 const gigs = await prisma.gig.findMany({ take: 50,
 select: {
 id: true,
 title: true,
 description: true,
 budget: true,
 deadline: true,
 status: true,
 tags: true,
 createdAt: true,
 poster: {
 select: {
 name: true,
 email: true,
 },
 },
 _count: {
 select: {
 applications: true,
 },
 },
 },
 orderBy: {
 createdAt:"desc",
 },
 });

 // Calculate stats
 const stats = {
 total: gigs.length,
 open: gigs.filter((g: any) => g.status ==="OPEN").length,
 closed: gigs.filter((g: any) => g.status ==="CLOSED").length,
 pending: gigs.filter((g: any) => g.status ==="PENDING").length,
 };

 return NextResponse.json({ gigs, stats });
 } catch (error) {
 console.error("Error fetching gigs:", error);
 return NextResponse.json(
 { error:"Failed to fetch gigs" },
 { status: 500 }
 );
 }
}
