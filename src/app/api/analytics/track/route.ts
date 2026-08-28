import { NextResponse } from"next/server";

import { trackEvent } from"@/lib/analytics";

export async function POST(req: Request) {
 try {
 let body;
 try {
 body = await req.json();
 } catch (e) {
 return NextResponse.json({ error:"Invalid JSON body" }, { status: 400 });
 }
 const { event, data, userId, sessionId } = body;

 if (!event) {
 return NextResponse.json({ error:"Missing event name" }, { status: 400 });
 }

 await trackEvent({ event, data, userId, sessionId });

 return NextResponse.json({ success: true });
 } catch (error) {
 console.error("[Track API Error]", error);
 return NextResponse.json({ error:"Internal Server Error" }, { status: 500 });
 }
}
