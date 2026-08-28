import { NextResponse } from"next/server";

import { protectApi } from"@/lib/auth-checks";
import prisma from"@/lib/prisma";

export const dynamic ="force-dynamic";

export async function GET(req: Request) {
 try {
 const auth = await protectApi(["FOUNDER","ADMIN"]);
 if (auth.errorResponse) return auth.errorResponse;

 // Fetch recent moderation events
 const events = await prisma.moderationEvent.findMany({
 orderBy: { createdAt:"desc" },
 take: 50,
 });

 return NextResponse.json({ success: true, events });
 } catch (error) {
 console.error("ADMIN_MODERATION_EVENTS_ERROR:", error);
 return NextResponse.json(
 { success: false, error:"Failed to fetch moderation events" },
 { status: 500 }
 );
 }
}
