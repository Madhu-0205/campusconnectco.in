import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
    try {
        const user = await getSession();
        if (!user || (user.role !== "CLIENT" && user.role !== "STARTUP" && user.role !== "FOUNDER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { gigId, workerId } = await req.json();
        if (!gigId || !workerId) {
            return NextResponse.json({ error: "gigId and workerId are required" }, { status: 400 });
        }

        // Validate Gig
        const gig = await prisma.gig.findUnique({ where: { id: gigId } });
        if (!gig) return NextResponse.json({ error: "Gig not found" }, { status: 404 });
        if (gig.posted_by !== user.id) return NextResponse.json({ error: "Unauthorized. You are not the gig poster." }, { status: 403 });

        // Calculate amount (Budget + 10% Platform Fee)
        const budget = gig.budget;
        const platformFee = budget * 0.10;
        const totalAmount = budget + platformFee;

        // Razorpay expects amount in paise (1 INR = 100 paise)
        const amountInPaise = Math.round(totalAmount * 100);

        // Generate Razorpay Order
        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `escrow_${gigId.slice(0, 8)}_${Date.now()}`,
            notes: {
                gigId,
                clientId: user.id,
                workerId,
            }
        };

        const order = await razorpay.orders.create(options);

        if (!order || !order.id) {
            throw new Error("Failed to create Razorpay order");
        }

        // Atomically Create Transaction and Escrow in PENDING state
        await prisma.$transaction(async (tx: any) => {
            const escrow = await tx.escrow.create({
                data: {
                    gigId,
                    clientId: user.id,
                    workerId,
                    amount: totalAmount,
                    platformFee,
                    payout: budget, // The worker gets the budget
                    commissionRate: 0.10,
                    status: "PENDING"
                }
            });

            await tx.transaction.create({
                data: {
                    gigId,
                    buyerId: user.id,
                    sellerId: workerId,
                    amount: totalAmount,
                    platformFee,
                    sellerPayout: budget,
                    paymentProvider: "Razorpay",
                    paymentId: order.id, // We store order_id here temporarily until verified
                    status: "PENDING",
                    description: `Escrow lock for Gig: ${gig.title}`,
                }
            });
        });

        return NextResponse.json({ orderId: order.id, amount: totalAmount, key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID });
    } catch (error: any) {
        console.error("[CREATE_ORDER_ERROR]", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
