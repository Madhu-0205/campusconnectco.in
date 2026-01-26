import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
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

        if (isAuthentic) {
            // Payment Successful -> Trigger Escrow Lock Logic

            const user = await prisma.user.findUnique({
                where: { email: session.user.email }
            });

            if (!user) return new NextResponse("User not found", { status: 404 });

            // Build transaction data dynamically
            const transactionData: any = {
                userId: user.id,
                amount: parseFloat(amount),
                status: "COMPLETED",
                description: `Payment via Razorpay: ${razorpay_payment_id}`
            };

            // Check if this is a specific Gig Escrow or General Deposit
            if (gigId && gigId !== "placeholder-gig-id") {
                const gig = await prisma.gig.findUnique({
                    where: { id: gigId }
                });

                if (!gig) return new NextResponse("Gig not found", { status: 404 });

                // Escrow Logic
                transactionData.gigId = gig.id;
                transactionData.type = "ESCROW_LOCK";

                // Update Gig Status + Create Transaction
                await prisma.$transaction([
                    prisma.gig.update({
                        where: { id: gig.id },
                        data: { status: "IN_PROGRESS" }
                    }),
                    prisma.transaction.create({ data: transactionData })
                ]);
            } else {
                // General Deposit / Wallet Top-up
                transactionData.type = "DEPOSIT";

                await prisma.transaction.create({ data: transactionData });
            }

            return NextResponse.json({ success: true });
        } else {
            return new NextResponse("Invalid Signature", { status: 400 });
        }
    } catch (error) {
        console.error("Payment Verification Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
