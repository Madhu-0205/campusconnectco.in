import { NextResponse } from"next/server";

import { protectApi } from"@/lib/auth-checks";
import prisma from"@/lib/prisma";

export const dynamic ="force-dynamic";

export async function GET() {
 const { errorResponse, user } = await protectApi(["COLLEGE","FOUNDER"]);
 if (errorResponse) return errorResponse;

 try {
 const profile = await prisma.user.findUnique({
 where: { id: user.id },
 select: { college: true }
 });

 if (!profile?.college) {
 return NextResponse.json({ error:"College name not set in profile" }, { status: 400 });
 }

 // Aggregate analytics for the college
 const studentsCount = await prisma.user.count({
 where: {
 role:"STUDENT",
 college: profile.college
 }
 });

 return NextResponse.json({ 
 success: true,
 analytics: {
 totalStudents: studentsCount,
 placements: Math.floor(studentsCount * 0.4), // Placeholder estimation logic
 activeGigs: Math.floor(studentsCount * 0.1) // Placeholder estimation logic
 }
 });
 } catch (error) {
 console.error("[COLLEGE_ANALYTICS_GET]", error);
 return NextResponse.json({ error:"Internal server error" }, { status: 500 });
 }
}
