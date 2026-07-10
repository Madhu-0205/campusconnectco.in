import { TransactionStatus, DisputeStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { sanitizeInput } from "@/lib/security/sanitization";

const DisputeSchema = z.object({
  transactionId: z.string().uuid(),
  reason: z.string().min(5),
  description: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = DisputeSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid parameters", details: parseResult.error.format() }, { status: 400 });
    }

    const transactionId = parseResult.data.transactionId;
    const reason = sanitizeInput(parseResult.data.reason);
    const description = sanitizeInput(parseResult.data.description);

    // Fetch the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Only buyer (client) or seller (student) can initiate a dispute
    if (transaction.buyerId !== user.id && transaction.sellerId !== user.id) {
      return NextResponse.json({ error: "Unauthorized to dispute this transaction" }, { status: 403 });
    }

    // Can only dispute PAID or IN_PROGRESS transactions
    if (
      transaction.status !== TransactionStatus.PAID && 
      transaction.status !== TransactionStatus.IN_PROGRESS
    ) {
      return NextResponse.json({ error: `Cannot dispute transaction in status: ${transaction.status}` }, { status: 400 });
    }

    // Check if dispute already exists
    const existingDispute = await prisma.dispute.findUnique({
      where: { transactionId },
    });

    if (existingDispute) {
      return NextResponse.json({ error: "A dispute already exists for this transaction" }, { status: 409 });
    }

    // Process dispute in a Prisma transaction block
     
    const dispute = await prisma.$transaction(async (tx: any) => {
      // Create Dispute record
      const newDispute = await tx.dispute.create({
        data: {
          transactionId: transaction.id,
          reason,
          description,
          status: DisputeStatus.OPEN,
        },
      });

      // Update transaction status
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.DISPUTED,
        },
      });
      
      // Update gig status to hold it
      if (transaction.gigId) {
        await tx.gig.update({
          where: { id: transaction.gigId },
          data: {
            status: "DISPUTED", // Assuming DISPUTED exists as a valid status, if not we can use another string like HOLD
          }
        });
      }

      // Audit Log
      await tx.transactionAudit.create({
        data: {
          transactionId: transaction.id,
          action: "DISPUTE_OPENED",
          previousState: transaction.status,
          newState: TransactionStatus.DISPUTED,
          performedBy: user.id,
          metadata: { reason, description },
        },
      });

      // Notify the counterparty
      const counterpartyId = transaction.buyerId === user.id ? transaction.sellerId : transaction.buyerId;
      
      await tx.notification.create({
        data: {
          userId: counterpartyId,
          title: "A Dispute Has Been Raised",
          message: `A dispute has been raised regarding your gig transaction. Escrow funds are currently frozen pending review.`,
          type: "SYSTEM",
          link: `/dashboard/disputes/${newDispute.id}`,
        }
      });

      return newDispute;
    });

    return NextResponse.json({ success: true, dispute, message: "Dispute opened successfully. Escrow frozen." });
  } catch (error) {
    console.error("[DISPUTE_API_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
}
