import { NextResponse } from"next/server";

import { protectApi } from"@/lib/auth-checks";
import prisma from"@/lib/prisma";

export async function GET() {
 const { errorResponse } = await protectApi(["ADMIN"]);
 if (errorResponse) return errorResponse;

 try {
 const [
 escrows,
 totalLocked,
 totalReleased,
 totalRefunded,
 lockedAmount,
 releasedAmount,
 refundedAmount,
 ] = await Promise.all([
 prisma.escrow.findMany({ take: 50,
 include: {
 gig: { select: { title: true } },
 client: { select: { name: true, email: true } },
 worker: { select: { name: true, email: true } },
 },
 orderBy: { createdAt:"desc" },
 }),
 prisma.escrow.count({ where: { status:"LOCKED" } }),
 prisma.escrow.count({ where: { status:"RELEASED" } }),
 prisma.escrow.count({ where: { status:"REFUNDED" } }),
 prisma.escrow.aggregate({ where: { status:"LOCKED" }, _sum: { amount: true } }),
 prisma.escrow.aggregate({ where: { status:"RELEASED" }, _sum: { payout: true } }),
 prisma.escrow.aggregate({ where: { status:"REFUNDED" }, _sum: { amount: true } }),
 ]);

 return NextResponse.json({
 escrows,
 stats: {
 totalLocked,
 totalReleased,
 totalRefunded,
 lockedAmount: lockedAmount._sum.amount || 0,
 releasedAmount: releasedAmount._sum.payout || 0,
 refundedAmount: refundedAmount._sum.amount || 0,
 },
 });
 } catch (error) {
 console.error("[GET /api/founder/escrow]", error);
 return NextResponse.json({ error:"Internal server error" }, { status: 500 });
 }
}
