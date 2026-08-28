import { NextResponse } from"next/server";

import { protectApi } from"@/lib/auth-checks";
import prisma from"@/lib/prisma";

export const dynamic ="force-dynamic";

export async function GET(req: Request) {
 const auth = await protectApi(["STUDENT"]);
 if (auth.errorResponse) return auth.errorResponse;

 try {
 const { user } = auth;
 const { searchParams } = new URL(req.url);
 const type = searchParams.get("type") ||"all";

 let internships: any[] = [];
 let gigs: any[] = [];

 if (type ==="all" || type ==="internships") {
 const savedInternships = await prisma.savedInternship.findMany({ take: 50,
 where: { userId: user.id },
 include: { internship: true },
 orderBy: { createdAt:"desc" }
 });
 internships = savedInternships.map(s => s.internship);
 }

 if (type ==="all" || type ==="gigs") {
 const savedGigs = await prisma.savedGig.findMany({ take: 50,
 where: { userId: user.id },
 include: { gig: true },
 orderBy: { createdAt:"desc" }
 });
 gigs = savedGigs.map(s => s.gig);
 }

 return NextResponse.json({ success: true, internships, gigs });
 } catch (error) {
 console.error("[USER_SAVED_GET]", error);
 return NextResponse.json({ error:"Internal server error" }, { status: 500 });
 }
}

export async function POST(req: Request) {
 const auth = await protectApi(["STUDENT"]);
 if (auth.errorResponse) return auth.errorResponse;

 try {
 const { user } = auth;
 const body = await req.json();
 const { id, type, action } = body; // action: 'save' | 'unsave'

 const { z } = require("zod");
 if (!id || !type || !action || !z.string().uuid().safeParse(id).success) {
 return NextResponse.json({ error:"Missing required fields or invalid ID format" }, { status: 400 });
 }

 if (type ==="internship") {
 if (action ==="save") {
 await prisma.savedInternship.upsert({
 where: { userId_internshipId: { userId: user.id, internshipId: id } },
 update: {},
 create: { userId: user.id, internshipId: id }
 });
 } else {
 await prisma.savedInternship.deleteMany({
 where: { userId: user.id, internshipId: id }
 });
 }
 } else if (type ==="gig") {
 if (action ==="save") {
 await prisma.savedGig.upsert({
 where: { userId_gigId: { userId: user.id, gigId: id } },
 update: {},
 create: { userId: user.id, gigId: id }
 });
 } else {
 await prisma.savedGig.deleteMany({
 where: { userId: user.id, gigId: id }
 });
 }
 } else {
 return NextResponse.json({ error:"Invalid type" }, { status: 400 });
 }

 return NextResponse.json({ success: true });
 } catch (error) {
 console.error("[USER_SAVED_POST]", error);
 return NextResponse.json({ error:"Internal server error" }, { status: 500 });
 }
}
