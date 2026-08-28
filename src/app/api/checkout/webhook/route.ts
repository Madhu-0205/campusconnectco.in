import crypto from"crypto";

import { TransactionStatus, EscrowStatus } from"@prisma/client";
import { NextRequest, NextResponse } from"next/server";

import { logger } from"@/lib/logger";
import prisma from"@/lib/prisma";
import { safeCompare } from"@/lib/security/crypto";

export async function POST(req: NextRequest) {
 try {
 const bodyText = await req.text();
 const signature = req.headers.get("x-razorpay-signature") ||"";
 const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ||"";

 let event: any = null;
 let isMock = false;

 const isProduction = process.env.NODE_ENV ==="production";

 // Signature verification
 if (signature && webhookSecret && webhookSecret !=="placeholder_webhook_secret") {
 const shasum = crypto.createHmac("sha256", webhookSecret);
 shasum.update(bodyText);
 const digest = shasum.digest("hex");

 if (!safeCompare(digest, signature)) {
 logger.warn("Razorpay Webhook Signature verification failed");
 return NextResponse.json({ error:"Invalid signature" }, { status: 400 });
 }
 event = JSON.parse(bodyText);
 } else {
 if (isProduction) {
 logger.error("Razorpay Webhook Signature verification bypassed or secret missing in production!");
 return NextResponse.json({ error:"Unauthorized - Signature validation required in production" }, { status: 401 });
 }
 
 // In development/test mode without production webhook secret, accept unsigned JSON body for local triggers
 logger.info("Razorpay Webhook Verification bypassed. Operating in local test mode.");
 try {
 event = JSON.parse(bodyText);
 isMock = true;
 } catch {
 return NextResponse.json({ error:"Invalid JSON payload" }, { status: 400 });
 }
 }

 const eventName = event.event;
 logger.info(`Razorpay Webhook Received event`, { eventName });

 // We respond to order.paid or payment.captured
 if (eventName ==="order.paid" || eventName ==="payment.captured" || isMock) {
 const paymentEntity = event.payload?.payment?.entity;
 const orderId = paymentEntity?.order_id || event.orderId || event.payload?.order?.entity?.id;

 if (!orderId) {
 return NextResponse.json({ error:"Order ID not found in payload" }, { status: 400 });
 }

 // Find the corresponding Transaction
 const transaction = await prisma.transaction.findFirst({
 where: { paymentIntentId: orderId },
 });

 if (!transaction) {
 logger.warn(`No transaction found for order ID: ${orderId}`);
 return NextResponse.json({ message:"Transaction not found" }, { status: 200 }); // Return 200 to prevent Razorpay retries
 }

 if (transaction.status === TransactionStatus.PENDING) {
 // Process transaction capture in a Prisma transaction block
 try {
 await prisma.$transaction(async (tx: any) => {
 // 1. Atomic update to prevent race conditions if multiple webhooks fire
 const updateResult = await tx.transaction.updateMany({
 where: { 
 id: transaction.id, 
 status: TransactionStatus.PENDING 
 },
 data: {
 status: TransactionStatus.PAID,
 paidAt: new Date(),
 paymentId: paymentEntity?.id || `pay_mock_${Math.random().toString(36).substring(2, 9)}`,
 },
 });
 
 if (updateResult.count === 0) {
 // Another thread already processed it
 logger.info(`Transaction ${transaction.id} already processed or no longer PENDING by concurrent webhook.`);
 return;
 }
 // 2. Create Escrow record (LOCKED status)
 await tx.escrow.create({
 data: {
 gigId: transaction.gigId!,
 clientId: transaction.buyerId,
 workerId: transaction.sellerId,
 amount: Number(transaction.amount),
 platformFee: Number(transaction.platformFee),
 payout: Number(transaction.sellerPayout),
 commissionRate: 10.0,
 status: EscrowStatus.LOCKED,
 },
 });

 // 3. Update Gig status to IN_PROGRESS
 await tx.gig.update({
 where: { id: transaction.gigId! },
 data: {
 status:"IN_PROGRESS",
 },
 });

 // 4. Update the accepted Application status
 const application = await tx.application.findFirst({
 where: {
 gigId: transaction.gigId!,
 applicantId: transaction.sellerId,
 },
 });

 if (application) {
 await tx.application.update({
 where: { id: application.id },
 data: {
 status:"ACCEPTED",
 },
 });
 }

 // 5. Create audit log
 await tx.transactionAudit.create({
 data: {
 transactionId: transaction.id,
 action:"PAYMENT_CAPTURED",
 previousState: TransactionStatus.PENDING,
 newState: TransactionStatus.PAID,
 performedBy:"SYSTEM_WEBHOOK",
 metadata: { message:"Payment captured successfully. Escrow funds locked." },
 },
 });

 // 6. Create notification
 await tx.notification.create({
 data: {
 userId: transaction.sellerId,
 title:"Gig In Progress",
 message: `Payment has been secured in Escrow for your gig. You can begin working!`,
 type:"GIG",
 link:"/dashboard/student/gigs",
 },
 });
 });
 } catch (txError: any) {
 logger.error("Razorpay Webhook transaction failed", txError, { transactionId: transaction.id });
 throw txError;
 }

 logger.info("Successfully processed payment for transaction", { transactionId: transaction.id });
 } else {
 logger.info("Transaction already processed", { transactionId: transaction.id, status: transaction.status });
 }
 }

 return NextResponse.json({ success: true });
 } catch (error) {
 logger.error("Razorpay webhook error", error);
 return NextResponse.json({ error:"Internal Server Error" }, { status: 500 });
 }
}
