import { NextResponse } from"next/server";

import { protectApi } from"@/lib/auth-checks";
import prisma from"@/lib/prisma";

export const dynamic ="force-dynamic";

export async function POST(req: Request) {
 const { errorResponse } = await protectApi(["FOUNDER", "ADMIN"]);
 if (errorResponse) return errorResponse;

 try {
 const { id, type, featureType } = await req.json();

 if (!id || !type || !featureType) {
 return NextResponse.json({ error:"Missing required fields" }, { status: 400 });
 }

 if (type ==="GIG") {
 if (featureType ==="PREMIUM") {
 await prisma.gig.update({
 where: { id },
 data: { isPremium: true }
 });
 }
 } else if (type ==="INTERNSHIP") {
 if (featureType ==="FEATURED") {
 await prisma.internship.update({
 where: { id },
 data: { isFeatured: true }
 });
 }
 } else {
 return NextResponse.json({ error:"Invalid type" }, { status: 400 });
 }

 return NextResponse.json({ success: true, message:"Promotion applied successfully" });
 } catch (error) {
 console.error("[POST /api/founder/monetize]", error);
 return NextResponse.json({ error:"Failed to apply promotion" }, { status: 500 });
 }
}
