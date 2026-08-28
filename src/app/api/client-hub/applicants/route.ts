import { NextResponse } from"next/server";

import prisma from"@/lib/prisma";
import { createClient } from"@/lib/supabase/server";

export async function GET() {
 try {
 const supabase = await createClient();
 const { data: { user }, error: authError } = await supabase.auth.getUser();

 if (authError || !user) {
 return NextResponse.json({ error:"Unauthorized" }, { status: 401 });
 }

 // Fetch applications for ALL gigs posted by the current user
 const applications = await prisma.application.findMany({ take: 50,
 where: {
 gig: {
 posted_by: user.id
 }
 },
 include: {
 applicant: {
 select: {
 id: true,
 name: true,
 image: true,
 skills: true,
 _count: {
 select: { applications: { where: { status:"ACCEPTED" } } }
 }
 }
 },
 gig: {
 select: {
 id: true,
 title: true,
 budget: true,
 status: true,
 escrows: {
 select: { status: true }
 }
 }
 }
 },
 orderBy: {
 createdAt:"desc"
 }
 });

 return NextResponse.json(applications);
 } catch (error: unknown) {
 console.error("Error fetching applicants:", error);
 return NextResponse.json({ error:"Internal Server Error" }, { status: 500 });
 }
}
