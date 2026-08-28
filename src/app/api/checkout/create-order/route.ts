import { NextRequest, NextResponse } from"next/server";
import Razorpay from"razorpay";
import { z } from"zod";

import { logger } from"@/lib/logger";
import prisma from"@/lib/prisma";
import { createClient } from"@/lib/supabase/server";

const CreateOrderSchema = z.object({
 gigId: z.string().uuid(),
 applicationId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
 try {
 const supabase = await createClient();
 const { data: { user }, error: authError } = await supabase.auth.getUser();

 if (authError || !user) {
 return NextResponse.json({ error:"Unauthorized" }, { status: 401 });
 }

 const body = await req.json();
 const parseResult = CreateOrderSchema.safeParse(body);
 if (!parseResult.success) {
 return NextResponse.json({ error:"Invalid parameters", details: parseResult.error.format() }, { status: 400 });
 }

 const { gigId, applicationId } = parseResult.data;

 // Fetch the gig and application
 const gig = await prisma.gig.findUnique({
 where: { id: gigId },
 });

 if (!gig) {
 return NextResponse.json({ error:"Gig not found" }, { status: 404 });
 }

 if (gig.posted_by !== user.id) {
 return NextResponse.json({ error:"Forbidden: You do not own this gig" }, { status: 403 });
 }

 const application = await prisma.application.findUnique({
 where: { id: applicationId },
 });

 if (!application) {
 return NextResponse.json({ error:"Application not found" }, { status: 404 });
 }
 
 if (application.gigId !== gigId) {
 return NextResponse.json({ error:"Forbidden: Application does not belong to this gig" }, { status: 403 });
 }

 // Initialize Razorpay Client
 const keyId = process.env.RAZORPAY_KEY_ID ||"";
 const keySecret = process.env.RAZORPAY_KEY_SECRET ||"";

 if (!keyId || !keySecret || keyId ==="rzp_test_placeholder") {
 // In development/test mock mode when key is absent or placeholder, bypass direct Razorpay call and return mock order
 logger.warn("Razorpay API credentials missing or placeholder. Creating a simulated order.");
 const mockOrderId = `order_mock_${Math.random().toString(36).substring(2, 11)}`;
 
 await prisma.transaction.create({
 data: {
 buyerId: user.id,
 sellerId: application.applicantId,
 gigId: gigId,
 amount: gig.budget,
 platformFee: gig.budget * 0.10,
 sellerPayout: gig.budget * 0.90,
 currency:"INR",
 status:"PENDING",
 paymentProvider:"Razorpay",
 paymentIntentId: mockOrderId,
 description: `Escrow payment for Gig: ${gig.title}`,
 }
 });

 return NextResponse.json({
 mock: true,
 orderId: mockOrderId,
 amount: gig.budget * 100,
 currency:"INR",
 keyId:"rzp_test_placeholder"
 });
 }

 const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
 const order = await razorpay.orders.create({
 amount: Math.round(gig.budget * 100), // in paise
 currency:"INR",
 receipt: `rcpt_${gigId.substring(0, 8)}`,
 notes: {
 gigId,
 applicationId,
 clientId: user.id,
 workerId: application.applicantId,
 }
 });

 // Create a transaction in pending status
 await prisma.transaction.create({
 data: {
 buyerId: user.id,
 sellerId: application.applicantId,
 gigId: gigId,
 amount: gig.budget,
 platformFee: gig.budget * 0.10,
 sellerPayout: gig.budget * 0.90,
 currency:"INR",
 status:"PENDING",
 paymentProvider:"Razorpay",
 paymentIntentId: order.id,
 description: `Escrow payment for Gig: ${gig.title}`,
 }
 });

 return NextResponse.json({
 orderId: order.id,
 amount: order.amount,
 currency: order.currency,
 keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId
 });

 } catch (error) {
 logger.error("Create payment order error", error);
 return NextResponse.json({ error:"Internal Server Error" }, { status: 500 });
 }
}
