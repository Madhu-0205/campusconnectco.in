import { NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { generalApiLimiter } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/security/sanitization";

export const dynamic = "force-dynamic";

const ReportSchema = z.object({
  entityId: z.string().min(1, "Entity ID is required").max(128),
  entityType: z.enum(["gig", "internship", "user", "comment", "review"]),
  reason: z.string().min(2, "Reason is required").max(100).trim(),
  details: z.string().max(500, "Details cannot exceed 500 characters").optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    if (!(await generalApiLimiter.check(ip))) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parseResult = ReportSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { entityId, entityType, reason } = parseResult.data;
    const cleanReason = sanitizeInput(reason);
    const cleanDetails = parseResult.data.details ? sanitizeInput(parseResult.data.details) : "";

    // Deduplication check: if entity was already flagged within the last 24 hours, acknowledge without duplicating
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingReport = await prisma.moderationEvent.findFirst({
      where: {
        entityId,
        entityType,
        action: "FLAG",
        createdAt: { gte: twentyFourHoursAgo },
      },
    });

    if (existingReport) {
      return NextResponse.json({
        success: true,
        message: "Thank you. A report for this listing has already been recorded and is currently under review.",
      });
    }

    const formattedReason = `User report: ${cleanReason}${cleanDetails ? ` - ${cleanDetails}` : ""}`.slice(0, 500);

    // Save to existing ModerationEvent system while strictly preserving reporter privacy
    await prisma.moderationEvent.create({
      data: {
        entityId,
        entityType,
        action: "FLAG",
        reason: formattedReason,
        riskScore: 0.7,
      },
    });

    logger.info("Report logged in moderation system", { entityId, entityType });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you. Your report has been submitted to the moderation team for review.",
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Error submitting report", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
