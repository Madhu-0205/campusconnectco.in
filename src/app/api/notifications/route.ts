import { NextRequest, NextResponse } from"next/server";

import { requireUser } from"@/lib/auth-checks";
import prisma from"@/lib/prisma";

export async function GET() {
 try {
 const { user, errorResponse } = await requireUser();
 if (errorResponse) return errorResponse;

 // Fetch notifications using the properly typed Prisma client
 const notifications = await prisma.notification.findMany({
 where: { userId: user.id },
 orderBy: { createdAt:"desc" },
 take: 50,
 });

 return NextResponse.json({
 success: true,
 notifications
 });
 } catch (error) {
 console.error("Error fetching notifications:", error);
 return NextResponse.json({
 success: false,
 error:"Internal Server Error"
 }, { status: 500 });
 }
}

export async function PATCH(request: NextRequest) {
 try {
 const { user, errorResponse } = await requireUser();
 if (errorResponse) return errorResponse;

 const { id } = await request.json();

 if (id ==="all") {
 await prisma.notification.updateMany({
 where: { userId: user.id, isRead: false },
 data: { isRead: true },
 });
 } else {
 await prisma.notification.update({
 where: { id, userId: user.id },
 data: { isRead: true },
 });
 }

 return NextResponse.json({ success: true });
 } catch (error) {
 console.error("Error updating notification:", error);
 return NextResponse.json({ error:"Internal Server Error" }, { status: 500 });
 }
}
