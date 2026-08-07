import { TransactionStatus, EscrowStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";

import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security/sanitization";
import { createClient } from "@/lib/supabase/server";

const RefundSchema = z.object({
  transactionId: z.string().uuid(),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = RefundSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid parameters", details: parseResult.error.format() }, { status: 400 });
    }

    const transactionId = parseResult.data.transactionId;
    const reason = parseResult.data.reason ? sanitizeInput(parseResult.data.reason) : null;

    // Fetch the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Only buyer (client) or admins can initiate refund
    // In a real app, you would also verify admin roles if it's not the buyer.
    if (transaction.buyerId !== user.id) {
      return NextResponse.json({ error: "Unauthorized to refund this transaction" }, { status: 403 });
    }

    // Can only refund PAID or IN_PROGRESS or DISPUTED transactions that haven't been released
    if (
      transaction.status !== TransactionStatus.PAID && 
      transaction.status !== TransactionStatus.IN_PROGRESS &&
      transaction.status !== TransactionStatus.DISPUTED
    ) {
      return NextResponse.json({ error: `Cannot refund transaction in status: ${transaction.status}` }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    const isMock = !keyId || keyId.includes("placeholder");

    // Initiate Razorpay Refund if not mock
    if (!isMock && transaction.paymentId) {
      try {
        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
        // Full refund by default
        await razorpay.payments.refund(transaction.paymentId, {
          notes: { reason: reason || "User requested refund" },
        });
      } catch (rzpError) {
        logger.error("Razorpay Refund Error", rzpError, { transactionId });
        return NextResponse.json({ error: "Failed to process refund with payment provider" }, { status: 502 });
      }
    } else {
      logger.info("Refund API Operating in local mock mode. Bypassing Razorpay.", { transactionId });
    }

    // Process refund in a Prisma transaction block
     
    await prisma.$transaction(async (tx: any) => {
      // Update transaction status
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.REFUNDED,
        },
      });

      // Update escrow status if exists
      const escrow = await tx.escrow.findFirst({
        where: { gigId: transaction.gigId!, clientId: transaction.buyerId },
      });

      if (escrow) {
        await tx.escrow.update({
          where: { id: escrow.id },
          data: {
            status: EscrowStatus.REFUNDED,
          },
        });
      }

      // Update Gig status to OPEN or CANCELLED based on your logic, here we set to OPEN 
      // so it can be picked up again if needed, or you could add a logic to just CANCEL it.
      await tx.gig.update({
        where: { id: transaction.gigId! },
        data: {
          status: "OPEN",
        },
      });

      // Audit Log
      await tx.transactionAudit.create({
        data: {
          transactionId: transaction.id,
          action: "REFUND_PROCESSED",
          previousState: transaction.status,
          newState: TransactionStatus.REFUNDED,
          performedBy: user.id,
          metadata: { reason: reason || "User requested refund" },
        },
      });
    }).catch(txError => {
      logger.error("Refund transaction failed", txError, { transactionId });
      throw txError;
    });

    return NextResponse.json({ success: true, message: "Refund processed successfully" });
  } catch (error) {
    logger.error("Refund API Error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
