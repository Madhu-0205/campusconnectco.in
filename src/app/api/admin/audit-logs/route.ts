import { NextResponse } from"next/server";

import { protectApi } from"@/lib/auth-checks";
import prisma from"@/lib/prisma";

export const dynamic ="force-dynamic";

/**
 * GET handler to retrieve dynamic audit log events from database (Founder only).
 */
export async function GET() {
 try {
 const auth = await protectApi(["FOUNDER"]);
 if (auth.errorResponse) return auth.errorResponse;

 // Fetch security audit logs
 const logs = await prisma.analytics.findMany({
 where: {
 event: { startsWith:"SEC:" }
 },
 orderBy: {
 createdAt:"desc"
 },
 take: 200
 });

 return NextResponse.json({ success: true, logs });
 } catch (error) {
 console.error("[AuditLogs API Error]:", error);
 return NextResponse.json({ error:"Failed to list audit logs" }, { status: 500 });
 }
}
