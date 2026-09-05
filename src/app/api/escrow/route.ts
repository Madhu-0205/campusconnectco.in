import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const EscrowActionSchema = z.object({
  gigId: z.string().uuid("Invalid gig ID format"),
  action: z.enum(["RELEASE", "CONFIRM_COMPLETION", "DISPUTE"]),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parseResult = EscrowActionSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { gigId, action } = parseResult.data;

    // Fetch the gig
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
    });

    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    // Determine user relationship to the gig: poster (client) or accepted applicant (student worker)
    const isOwner = gig.posted_by === user.id;

    const acceptedApplication = await prisma.application.findFirst({
      where: {
        gigId,
        applicantId: user.id,
        status: "ACCEPTED",
      },
    });

    const isWorker = !!acceptedApplication;

    if (!isOwner && !isWorker) {
      return NextResponse.json(
        { error: "Forbidden: You are not a participant in this gig" },
        { status: 403 }
      );
    }

    if (action === "RELEASE" || action === "CONFIRM_COMPLETION") {
      const result = await prisma.$transaction(async (tx: any) => {
        const updateData: Record<string, any> = {};

        if (isWorker) {
          updateData.studentConfirmed = true;
          // If the owner has already confirmed, mark gig as COMPLETED
          if (gig.ownerConfirmed) {
            updateData.status = "COMPLETED";
            updateData.completedAt = new Date();
          }
        } else if (isOwner) {
          updateData.ownerConfirmed = true;
          // If the student has already confirmed, mark gig as COMPLETED
          if (gig.studentConfirmed) {
            updateData.status = "COMPLETED";
            updateData.completedAt = new Date();
          }
        }

        const updatedGig = await tx.gig.update({
          where: { id: gigId },
          data: updateData,
        });

        // If completed, update the accepted application to COMPLETED if not already
        if (updatedGig.status === "COMPLETED") {
          await tx.application.updateMany({
            where: { gigId, status: "ACCEPTED" },
            data: { status: "COMPLETED" },
          });
        }

        return updatedGig;
      });

      logger.info(`Escrow completion confirmation processed`, {
        gigId,
        userId: user.id,
        role: isWorker ? "WORKER" : "OWNER",
        status: result.status,
      });

      return NextResponse.json({
        success: true,
        gig: {
          id: result.id,
          status: result.status,
          studentConfirmed: result.studentConfirmed,
          ownerConfirmed: result.ownerConfirmed,
        },
      });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error: any) {
    logger.error("Error in /api/escrow handler:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
