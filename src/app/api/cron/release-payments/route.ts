import { TransactionStatus } from"@prisma/client";
import { NextResponse } from"next/server";

import { triggerReferralConversion } from"@/lib/growth";
import { logger } from"@/lib/logger";
import prisma from"@/lib/prisma";
import { safeCompare } from"@/lib/security/crypto";


export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
 try {
 const authHeader = req.headers.get("authorization");
 const cronSecret = process.env.CRON_SECRET;

 // 1. Basic auth for Cron (using CRON_SECRET or Vercel-provided check)
 // If running on Vercel, we can check for vercel-cron-signature
 if (!cronSecret || !authHeader || !safeCompare(authHeader, `Bearer ${cronSecret}`)) {
 return NextResponse.json({ error:"Unauthorized" }, { status: 401 });
 }

 // 2. Fetch eligible transactions
 const eligible = await prisma.transaction.findMany({
 where: {
 status: TransactionStatus.COMPLETED,
 releaseAt: { lte: new Date() },
 },
 take: 100, // Process in batches
 });

 logger.info(`Cron: Processing ${eligible.length} eligible releases`);

 const results = [];
 for (const transaction of eligible) {
 try {
 let didRelease = false;
 // 3. Robust release logic with optimistic status locking
 await prisma.$transaction(async (tx: any) => {
 // Re-verify status inside transaction (lock the row if possible or use status check)
 const current = await tx.transaction.findUnique({
 where: { id: transaction.id },
 select: { status: true },
 });

 if (!current || current.status !== TransactionStatus.COMPLETED) {
 logger.warn(`Transaction ${transaction.id} status changed, skipping.`);
 return;
 }

 // 4. Retrieve seller bank or UPI details for payout
 const seller = await tx.user.findUnique({
 where: { id: transaction.sellerId },
 select: { upiId: true, accNumber: true, ifscCode: true, name: true, email: true }
 });

 if (!seller) {
 throw new Error(`Seller user not found: ${transaction.sellerId}`);
 }

 let payoutSuccess = false;
 const isRealGateway = process.env.RAZORPAY_KEY_ID && 
 process.env.RAZORPAY_KEY_SECRET && 
 process.env.RAZORPAY_KEY_ID !=="rzp_test_placeholder";

 if (isRealGateway) {
 try {
 const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
 
 const fundAccountBody = seller.upiId 
 ? {
 account_type:"vpa",
 vpa: { address: seller.upiId }
 }
 : {
 account_type:"bank_account",
 bank_account: {
 name: seller.name ||"Gig Worker",
 ifsc: seller.ifscCode,
 account_number: seller.accNumber
 }
 };

 // 1. Create Payout Contact
 const contactController = new AbortController();
 const contactTimeoutId = setTimeout(() => contactController.abort(), 10000); // 10s
 
 const contactRes = await fetch("https://api.razorpay.com/v1/contacts", {
 method:"POST",
 headers: {
 Authorization: `Basic ${auth}`,
"Content-Type":"application/json",
 },
 body: JSON.stringify({
 name: seller.name ||"Gig Worker",
 email: seller.email,
 type:"employee",
 reference_id: seller.email,
 }),
 signal: contactController.signal,
 });
 
 clearTimeout(contactTimeoutId);

 if (!contactRes.ok) {
 const errText = await contactRes.text();
 throw new Error(`Razorpay contact creation failed: ${errText}`);
 }
 const contact = await contactRes.json();

 // 2. Create Fund Account
 const fundController = new AbortController();
 const fundTimeoutId = setTimeout(() => fundController.abort(), 10000);
 
 const fundRes = await fetch("https://api.razorpay.com/v1/fund_accounts", {
 method:"POST",
 headers: {
 Authorization: `Basic ${auth}`,
"Content-Type":"application/json",
 },
 body: JSON.stringify({
 contact_id: contact.id,
 ...fundAccountBody,
 }),
 signal: fundController.signal,
 });
 
 clearTimeout(fundTimeoutId);

 if (!fundRes.ok) {
 const errText = await fundRes.text();
 throw new Error(`Razorpay fund account creation failed: ${errText}`);
 }
 const fundAccount = await fundRes.json();

 // 3. Create Payout
 const payoutController = new AbortController();
 const payoutTimeoutId = setTimeout(() => payoutController.abort(), 15000);
 
 const payoutRes = await fetch("https://api.razorpay.com/v1/payouts", {
 method:"POST",
 headers: {
 Authorization: `Basic ${auth}`,
"Content-Type":"application/json",
 },
 body: JSON.stringify({
 account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER || "23456789012", // RazorpayX account number
 fund_account_id: fundAccount.id,
 amount: Math.round(Number(transaction.sellerPayout) * 100), // in paise
 currency:"INR",
 mode: seller.upiId ?"UPI" :"IMPS",
 purpose:"payout",
 queue_if_low_balance: true,
 reference_id: transaction.id,
 narration: `Payout for Gig: ${transaction.id.substring(0, 8)}`,
 }),
 signal: payoutController.signal,
 });
 
 clearTimeout(payoutTimeoutId);

 if (!payoutRes.ok) {
 const errText = await payoutRes.text();
 throw new Error(`Razorpay payout creation failed: ${errText}`);
 }
 
 payoutSuccess = true;
 } catch (payoutErr: any) {
 logger.error("Razorpay Payout Error", payoutErr, { transactionId: transaction.id });
 throw new Error(`Payout gateway failed: ${payoutErr.message}`);
 }
 } else {
 logger.info("Cron Payout Operating in Sandbox. Simulating successful payout.", { transactionId: transaction.id });
 payoutSuccess = true;
 }

 if (!payoutSuccess) throw new Error("Payout execution failed");

 // 5. Update transaction to RELEASED
 await tx.transaction.update({
 where: { id: transaction.id },
 data: {
 status: TransactionStatus.RELEASED,
 releasedAt: new Date(),
 },
 });

 await tx.transactionAudit.create({
 data: {
 transactionId: transaction.id,
 action:"AUTO_RELEASE",
 previousState: TransactionStatus.COMPLETED,
 newState: TransactionStatus.RELEASED,
 performedBy:"SYSTEM_CRON",
 metadata: { message:"Funds automatically released after escrow period." },
 },
 });

 didRelease = true;
 });

 if (didRelease) {
 // Trigger referral conversion check (payout received)
 await triggerReferralConversion(transaction.sellerId, transaction.id);
 results.push({ id: transaction.id, success: true });
 }
 } catch (err) {
 logger.error(`Error releasing transaction`, err, { transactionId: transaction.id });
 results.push({ id: transaction.id, success: false, error: (err as Error).message });
 
 // Notify admin/Slack on release failure
 // await slackClient.sendMessage(`Failed to auto-release payment ${transaction.id}`);
 }
 }

 return NextResponse.json({
 success: true,
 processed: eligible.length,
 results,
 });

 } catch (error) {
 logger.error("Cron Release Payment Error", error);
 return NextResponse.json({ error:"Internal Server Error" }, { status: 500 });
 }
}
