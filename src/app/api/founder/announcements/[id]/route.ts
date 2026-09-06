import { NextRequest, NextResponse } from"next/server";

import { protectApi } from"@/lib/auth-checks";
import prisma from"@/lib/prisma";

export async function PATCH(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const { errorResponse } = await protectApi(["FOUNDER", "ADMIN"]);
 if (errorResponse) return errorResponse;

 try {
 const { id } = await params;
 const body = await request.json();

 const announcement = await prisma.announcement.update({
 where: { id },
 data: {
 ...(body.title !== undefined && { title: body.title }),
 ...(body.body !== undefined && { body: body.body }),
 ...(body.priority !== undefined && { priority: body.priority }),
 ...(body.isActive !== undefined && { isActive: body.isActive }),
 },
 });

 return NextResponse.json({ announcement });
 } catch (error) {
 console.error("[PATCH /api/founder/announcements/[id]]", error);
 return NextResponse.json({ error:"Internal server error" }, { status: 500 });
 }
}

export async function DELETE(
 _request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const { errorResponse } = await protectApi(["FOUNDER", "ADMIN"]);
 if (errorResponse) return errorResponse;

 try {
 const { id } = await params;
 await prisma.announcement.delete({ where: { id } });
 return NextResponse.json({ success: true });
 } catch (error) {
 console.error("[DELETE /api/founder/announcements/[id]]", error);
 return NextResponse.json({ error:"Internal server error" }, { status: 500 });
 }
}
