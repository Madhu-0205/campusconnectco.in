import crypto from"crypto";

import { NextRequest, NextResponse } from"next/server";

import { getSession } from"@/lib/auth-checks";
import { logger } from"@/lib/logger";
import prisma from"@/lib/prisma";

export async function POST(req: NextRequest) {
 try {
 const user = await getSession();
 if (!user || (user.role !=="CLIENT" && user.role !=="STARTUP" && user.role !=="FOUNDER")) {
 return NextResponse.json({ error:"Unauthorized" }, { status: 401 });
 }

 const { razorpay_order_id, razorpay_payment_id, razorpay_signature, gigId } = await req.json();

 if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !gigId) {
 return NextResponse.json({ error:"Missing verification parameters" }, { status: 400 });
 }

 // Verify Razorpay signature
 const secret = process.env.RAZORPAY_KEY_SECRET;
 if (!secret) throw new Error("Razorpay secret not configured");

 const generated_signature = crypto
 .createHmac("sha256", secret)
 .update(razorpay_order_id +"|" + razorpay_payment_id)
 .digest("hex");

 if (generated_signature !== razorpay_signature) {
 return NextResponse.json({ error:"Invalid payment signature" }, { status: 400 });
 }

 // Verify successful, update Escrow, Transaction and Gig
 const result = await prisma.$transaction(async (tx: any) => {
 // 1. Update Escrow to LOCKED
 await tx.escrow.updateMany({
 where: { gigId, clientId: user.id, status:"PENDING" },
 data: { status:"LOCKED" }
 });

 // 2. Update Transaction to PAID
 await tx.transaction.updateMany({
 where: { paymentId: razorpay_order_id, buyerId: user.id, status:"PENDING" },
 data: {
 status:"PAID",
 paymentId: razorpay_payment_id, // Replace order ID with actual payment ID
 paidAt: new Date()
 }
 });

 // 3. Mark Gig as IN_PROGRESS (Assuming standard gig flow here)
 const updatedGig = await tx.gig.update({
 where: { id: gigId },
 data: { status:"IN_PROGRESS" },
 select: { title: true }
 });
 
 // 4. Update the Application status for the worker
 const escrow = await tx.escrow.findFirst({ 
 where: { gigId, clientId: user.id },
 include: {
 client: { select: { name: true, email: true } },
 worker: { select: { name: true, email: true } }
 }
 });

 if (escrow) {
 await tx.application.updateMany({
 where: { gigId, applicantId: escrow.workerId },
 data: { status:"ACCEPTED" }
 });
 }

 return { escrow, gigTitle: updatedGig.title };
 }).catch(txError => {
 logger.error("Escrow verify transaction failed", txError, { gigId, clientId: user.id });
 throw txError;
 });

 // Fire-and-forget email notifications
 if (result.escrow) {
 import("@/lib/email/resend").then(async ({ sendTransactionalEmail }) => {
 const { PaymentStatusEmail } = await import("@/lib/email/templates/PaymentStatusEmail");
 
 // Notify Client
 if (result.escrow.client?.email) {
 await sendTransactionalEmail({
 to: result.escrow.client.email,
 subject: `Escrow Funded for ${result.gigTitle}`,
 react: PaymentStatusEmail({
 recipientName: result.escrow.client.name ||"Client",
 gigTitle: result.gigTitle,
 amount: Number(result.escrow.amount),
 status:"FUNDED"
 }) as any
 });
 }

 // Notify Worker
 if (result.escrow.worker?.email) {
 await sendTransactionalEmail({
 to: result.escrow.worker.email,
 subject: `Escrow Funded: ${result.gigTitle}`,
 react: PaymentStatusEmail({
 recipientName: result.escrow.worker.name ||"Freelancer",
 gigTitle: result.gigTitle,
 amount: Number(result.escrow.amount),
 status:"FUNDED"
 }) as any
 });
 }
 }).catch(console.error);
 }

 return NextResponse.json({ success: true });
 } catch (error) {
 logger.error("Verify Order Error", error);
 return NextResponse.json({ error:"Internal server error" }, { status: 500 });
 }
}
