import { NextRequest, NextResponse } from "next/server";

import { verifyUnsubscribeToken } from "@/lib/email/tokens";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing unsubscribe token." },
        { status: 400 }
      );
    }

    const result = verifyUnsubscribeToken(token);

    if (!result.valid || !result.userId) {
      return NextResponse.json(
        { error: result.error || "Invalid or expired token." },
        { status: 400 }
      );
    }

    // Idempotent update of marketing consent
    try {
      await prisma.user.update({
        where: { id: result.userId },
        data: {
          marketingConsent: false,
          marketingConsentAt: null,
        },
      });
      logger.info("[Unsubscribe Success] Marketing consent revoked for user", {
        userId: result.userId,
      });
    } catch {
      // If user row not found, do not expose this fact (anti-enumeration)
      logger.warn("[Unsubscribe] User ID not found in database", {
        userId: result.userId,
      });
    }

    // Generic neutral response to prevent account enumeration
    return NextResponse.json(
      {
        success: true,
        message: "Marketing email preferences have been successfully updated.",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("[Unsubscribe Error] Unexpected error processing unsubscribe request", error);
    return NextResponse.json(
      { error: "Internal server error processing request." },
      { status: 500 }
    );
  }
}
