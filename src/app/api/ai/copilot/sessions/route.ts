import { NextResponse } from"next/server";

import { protectApi } from"@/lib/auth-checks";
import prisma from"@/lib/prisma";

export const dynamic ="force-dynamic";

export async function GET() {
 try {
 const auth = await protectApi(["FOUNDER","STUDENT","STARTUP","CLIENT"]);
 if (auth.errorResponse) return auth.errorResponse;
 const { user } = auth;
 if (!user) return NextResponse.json({ error:"Unauthorized" }, { status: 401 });

 const sessions = await prisma.copilotSession.findMany({ take: 50,
 where: { userId: user.id },
 orderBy: { updatedAt:"desc" },
 });

 return NextResponse.json({ success: true, data: sessions });
 } catch (error: any) {
 console.error("[COPILOT_SESSION_GET_ERROR]:", error);
 return NextResponse.json({ error:"Internal Server Error" }, { status: 500 });
 }
}

export async function POST(req: Request) {
 try {
 const auth = await protectApi(["FOUNDER","STUDENT","STARTUP","CLIENT"]);
 if (auth.errorResponse) return auth.errorResponse;
 const { user } = auth;
 if (!user) return NextResponse.json({ error:"Unauthorized" }, { status: 401 });

 const body = await req.json();
 const { id, title, messages } = body;

 if (!messages || !Array.isArray(messages)) {
 return NextResponse.json({ error:"messages array is required" }, { status: 400 });
 }

 let session;
 if (id) {
 session = await prisma.copilotSession.update({
 where: { id, userId: user.id },
 data: {
 messages: messages as any,
 title: title || undefined,
 },
 });
 } else {
 // Generate a default title from the first message if none provided
 let finalTitle = title;
 if (!finalTitle && messages.length > 0) {
 const firstUserMsg = messages.find(m => m.role ==="user");
 if (firstUserMsg && firstUserMsg.content) {
 finalTitle = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ?"..." :"");
 }
 }
 if (!finalTitle) finalTitle ="New Career Chat";

 session = await prisma.copilotSession.create({
 data: {
 userId: user.id,
 messages: messages as any,
 title: finalTitle,
 },
 });
 }

 return NextResponse.json({ success: true, data: session });
 } catch (error: any) {
 console.error("[COPILOT_SESSION_POST_ERROR]:", error);
 return NextResponse.json({ error:"Internal Server Error" }, { status: 500 });
 }
}

export async function DELETE(req: Request) {
 try {
 const auth = await protectApi(["FOUNDER","STUDENT","STARTUP","CLIENT"]);
 if (auth.errorResponse) return auth.errorResponse;
 const { user } = auth;
 if (!user) return NextResponse.json({ error:"Unauthorized" }, { status: 401 });

 const { searchParams } = new URL(req.url);
 const id = searchParams.get("id");

 if (!id) {
 return NextResponse.json({ error:"Session ID is required" }, { status: 400 });
 }

 await prisma.copilotSession.delete({
 where: { id, userId: user.id },
 });

 return NextResponse.json({ success: true, message:"Session deleted" });
 } catch (error: any) {
 console.error("[COPILOT_SESSION_DELETE_ERROR]:", error);
 return NextResponse.json({ error:"Internal Server Error" }, { status: 500 });
 }
}
