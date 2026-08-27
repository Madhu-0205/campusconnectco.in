import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth-checks";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";


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
            where: { gigId, clientId: user.id, status: "LOCKED" },
            include: {
                worker: { select: { name: true, email: true } },
                gig: { select: { title: true } }
            }
        });

        if (!escrow) {
            return NextResponse.json({ error: "Escrow not found or not in LOCKED state" }, { status: 404 });
        }

        // Ideally here we would use Razorpay Route or Transfers API to transfer money to the worker.
        // For development/MVP without KYC constraints, we mark the DB state as RELEASED.
        // E.g. await razorpay.transfers.create({ account: workerAccount, amount: escrow.payout * 100, currency: "INR" });

        await prisma.$transaction(async (tx: any) => {
            // 1. Release Escrow Atomically
            const updateResult = await tx.escrow.updateMany({
                where: { id: escrow.id, status: "LOCKED" },
                data: { status: "RELEASED" }
            });

            if (updateResult.count === 0) {
                throw new Error("Escrow is no longer in LOCKED state");
            }

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
                        totalEarned: { increment: escrow.payout },
                        gigsCompleted: { increment: 1 },
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
        }).catch(txError => {
            logger.error("Escrow release transaction failed", txError, { gigId, clientId: user.id });
            throw txError;
        });

        // Fire-and-forget email notification
        if (escrow.worker?.email) {
            import("@/lib/email/resend").then(async ({ sendTransactionalEmail }) => {
                const { PaymentStatusEmail } = await import("@/lib/email/templates/PaymentStatusEmail");
                await sendTransactionalEmail({
                    to: escrow.worker.email!,
                    subject: `Payment Released: ${escrow.gig.title}`,
                    react: PaymentStatusEmail({
                        recipientName: escrow.worker.name || "Freelancer",
                        gigTitle: escrow.gig.title,
                        amount: Number(escrow.payout),
                        status: "RELEASED"
                    }) as any
                });
            }).catch(console.error);
        }

        return NextResponse.json({ success: true, message: "Funds released to worker successfully." });
    } catch (error: any) {
        logger.error("Release Escrow Error", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
