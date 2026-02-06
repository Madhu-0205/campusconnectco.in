import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            gigId,
            amount
        } = await req.json();

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
        }

        // Fetch payment details directly from Razorpay for ultimate security
        const payment = await razorpay.payments.fetch(razorpay_payment_id) as { status: string; order_id: string; amount: number };

        if (payment.status !== "captured" && payment.status !== "authorized") {
            return NextResponse.json({ error: "Payment not captured/authorized" }, { status: 400 });
        }

        // Verify order_id matches to prevent session/order swapping
        if (payment.order_id !== razorpay_order_id) {
            return NextResponse.json({ error: "Order ID mismatch" }, { status: 400 });
        }

        // Use the verified amount from Razorpay (converting paisa to INR)
        const verifiedAmount = (Number(payment.amount) / 100);

        // Security check: Verify that the amount user claims to have paid matches what Razorpay actually received
        const claimedAmount = parseFloat(amount);
        if (Math.abs(verifiedAmount - claimedAmount) > 0.01) {
            return NextResponse.json({ error: "Amount mismatch detected" }, { status: 400 });
        }

        // Payment Successful -> Trigger Escrow Lock Logic
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id }
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        // Build transaction data dynamically
        const transactionData: {
            userId: string;
            amount: number;
            status: string;
            description: string;
            type?: string;
            gigId?: string;
        } = {
            userId: dbUser.id,
            amount: verifiedAmount,
            status: "COMPLETED",
            description: `Payment via Razorpay: ${razorpay_payment_id}`
        };

        // Check if this is a specific Gig Escrow or General Deposit
        const isGigEscrow = gigId &&
            typeof gigId === 'string' &&
            gigId.length > 30 && // UUID length check
            gigId !== "placeholder-gig-id" &&
            gigId !== "undefined" &&
            gigId !== "null";

        if (isGigEscrow) {
            const gig = await prisma.gig.findUnique({
                where: { id: gigId }
            });

            if (!gig) {
                return NextResponse.json({ error: "Gig not found" }, { status: 404 });
            }

            // Escrow Logic
            transactionData.gigId = gig.id;
            transactionData.type = "ESCROW_LOCK";

            // Update Gig Status + Create Transaction
            await prisma.$transaction([
                prisma.gig.update({
                    where: { id: gig.id },
                    data: { status: "IN_PROGRESS" }
                }),
                prisma.transaction.create({ data: transactionData as any })
            ]);
        } else {
            // General Deposit / Wallet Top-up
            transactionData.type = "DEPOSIT";
            await prisma.transaction.create({ data: transactionData as any });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Payment Verification Error:", errorMessage);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message
        }, { status: 500 });
    }
}
