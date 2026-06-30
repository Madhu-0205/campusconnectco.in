import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import Razorpay from "razorpay";
import { z } from "zod";
import { TransactionStatus, EscrowStatus } from "@prisma/client";

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

    const { transactionId, reason } = parseResult.data;

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
        console.error("[Razorpay Refund Error]", rzpError);
        return NextResponse.json({ error: "Failed to process refund with payment provider" }, { status: 502 });
      }
    } else {
      console.warn("[Refund API] Operating in local mock mode. Bypassing Razorpay.");
    }

    // Process refund in a Prisma transaction block
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    });

    return NextResponse.json({ success: true, message: "Refund processed successfully" });
  } catch (error) {
    console.error("[REFUND_API_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
}
