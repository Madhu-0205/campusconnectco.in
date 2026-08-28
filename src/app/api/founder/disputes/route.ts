import { Prisma } from"@prisma/client";
import { NextResponse } from"next/server";
import { z } from"zod";

import { protectApi } from"@/lib/auth-checks";
import { logger } from"@/lib/logger";
import prisma from"@/lib/prisma";

export const dynamic ="force-dynamic";

// GET /api/founder/disputes - List all disputes with full context
export async function GET(req: Request) {
 try {
 const auth = await protectApi(["ADMIN"]);
 if (auth.errorResponse) return auth.errorResponse;

 const url = new URL(req.url);
 const status = url.searchParams.get("status") || undefined;

 const disputes = await prisma.dispute.findMany({
 where: status ? { status: status as Prisma.DisputeWhereInput['status'] } : undefined,
 include: {
 transaction: {
 include: {
 buyer: { select: { id: true, name: true, email: true } },
 seller: { select: { id: true, name: true, email: true } },
 gig: { select: { id: true, title: true } },
 auditLogs: {
 orderBy: { createdAt:"desc" },
 take: 5,
 },
 },
 },
 },
 orderBy: { createdAt:"desc" },
 });

 // Aggregate stats
 const stats = {
 open: disputes.filter((d: any) => d.status ==="OPEN").length,
 inReview: disputes.filter((d: any) => d.status ==="UNDER_REVIEW").length,
 resolved: disputes.filter((d: any) => d.status ==="RESOLVED_SELLER").length,
 refunded: disputes.filter((d: any) => d.status ==="RESOLVED_BUYER").length,
 total: disputes.length,
 };

 return NextResponse.json({ disputes, stats });
 } catch (error) {
 logger.error("Disputes GET Error", error);
 return NextResponse.json({ error:"Internal Server Error" }, { status: 500 });
 }
}

const resolveSchema = z.object({
 disputeId: z.string().uuid(),
 resolution: z.enum(["RESOLVED_BUYER","RESOLVED_SELLER","UNDER_REVIEW"]),
 notes: z.string().min(5).optional(),
});

// POST /api/founder/disputes - Resolve a dispute
export async function POST(req: Request) {
 try {
 const auth = await protectApi(["ADMIN"]);
 if (auth.errorResponse) return auth.errorResponse;
 const { user } = auth;

 const body = await req.json();
 const { disputeId, resolution, notes } = resolveSchema.parse(body);

 const result = await prisma.$transaction(async (tx: any) => {
 const dispute = await tx.dispute.findUnique({
 where: { id: disputeId },
 include: { transaction: true },
 });

 if (!dispute) throw new Error("Dispute not found");
 if (dispute.status ==="RESOLVED_BUYER" || dispute.status ==="RESOLVED_SELLER") {
 throw new Error("Dispute already resolved");
 }

 // Map dispute resolution to transaction status
 let txStatus = dispute.transaction.status;
 if (resolution ==="RESOLVED_BUYER") txStatus ="REFUNDED";
 if (resolution ==="RESOLVED_SELLER") txStatus ="RELEASED";
 if (resolution ==="UNDER_REVIEW") txStatus ="DISPUTED";

 // Update dispute
 const updatedDispute = await tx.dispute.update({
 where: { id: disputeId },
 data: {
 status: resolution as Prisma.DisputeUpdateInput['status'],
 resolvedAt: new Date(),
 resolution: notes || `Resolved by admin as ${resolution}`,
 },
 });

 // Update transaction
 await tx.transaction.update({
 where: { id: dispute.transactionId },
 data: {
 status: txStatus as Prisma.TransactionUpdateInput['status'],
 ...(txStatus ==="RELEASED" ? { releasedAt: new Date() } : {}),
 },
 });

 // Audit log
 await tx.transactionAudit.create({
 data: {
 transactionId: dispute.transactionId,
 action:"DISPUTE_RESOLVED",
 previousState: dispute.transaction.status,
 newState: txStatus,
 performedBy: user?.id,
 metadata: { resolution, notes, disputeId },
 },
 });

 return updatedDispute;
 }).catch(txError => {
 logger.error("Dispute resolution transaction failed", txError, { disputeId, resolution });
 throw txError;
 });

 return NextResponse.json({
 success: true,
 message: `Dispute resolved as ${resolution}`,
 dispute: result,
 });
 } catch (error) {
 logger.error("Disputes POST Error", error);
 return NextResponse.json(
 { error: error instanceof Error ? error.message :"Internal Server Error" },
 { status: 400 }
 );
 }
}
