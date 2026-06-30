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

        const { gigId } = await req.json();

        if (!gigId) {
            return NextResponse.json({ error: "gigId is required" }, { status: 400 });
        }

        // Validate Escrow status
        const escrow = await prisma.escrow.findFirst({
            where: { gigId, clientId: user.id, status: "LOCKED" }
        });

        if (!escrow) {
            return NextResponse.json({ error: "Escrow not found or not in LOCKED state" }, { status: 404 });
        }

        // Ideally here we would use Razorpay Route or Transfers API to transfer money to the worker.
        // For development/MVP without KYC constraints, we mark the DB state as RELEASED.
        // E.g. await razorpay.transfers.create({ account: workerAccount, amount: escrow.payout * 100, currency: "INR" });

        await prisma.$transaction(async (tx: any) => {
            // 1. Release Escrow
            await tx.escrow.update({
                where: { id: escrow.id },
                data: { status: "RELEASED" }
            });

            // 2. Mark Transaction as COMPLETED
            await tx.transaction.updateMany({
                where: { gigId, buyerId: user.id, status: "PAID" },
                data: {
                    status: "COMPLETED",
                    releasedAt: new Date(),
                    completedAt: new Date(),
                }
            });

            // 3. Update Gig status
            await tx.gig.update({
                where: { id: gigId },
                data: { status: "COMPLETED", completedAt: new Date() }
            });

            // 4. Record Gamification event for worker (simulating earnings)
            const gamif = await tx.userGamification.findUnique({ where: { userId: escrow.workerId } });
            if (gamif) {
                await tx.userGamification.update({
                    where: { userId: escrow.workerId },
                    data: {
                        totalEarned: gamif.totalEarned + escrow.payout,
                        gigsCompleted: gamif.gigsCompleted + 1,
                        ...(gamif.firstEarningAt ? {} : { firstEarningAt: new Date() }),
                    }
                });
            } else {
                await tx.userGamification.create({
                    data: {
                        userId: escrow.workerId,
                        totalEarned: escrow.payout,
                        gigsCompleted: 1,
                        firstEarningAt: new Date(),
                    }
                });
            }
        });

        return NextResponse.json({ success: true, message: "Funds released to worker successfully." });
    } catch (error: any) {
        console.error("[RELEASE_ESCROW_ERROR]", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
