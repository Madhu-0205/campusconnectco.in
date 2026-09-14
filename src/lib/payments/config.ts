import { NextResponse } from "next/server";

/**
 * Authoritative payment availability gate for CampusConnectCo.
 * 
 * In this production phase:
 * PAYMENTS_ENABLED = false
 * 
 * - Browser cannot override this setting.
 * - All financial mutation endpoints enforce this server-side.
 * - Returns standard HTTP 503 with PAYMENTS_COMING_SOON semantic.
 */
export const PAYMENTS_ENABLED = false;

export const PAYMENTS_COMING_SOON_PAYLOAD = {
  error: "Payments are coming soon.",
  code: "PAYMENTS_COMING_SOON",
  message: "Payment, milestone, escrow, and settlement features will be available once secure payments are enabled on CampusConnectCo."
};

/**
 * Server-side assertion to guard financial mutation routes.
 * Returns { errorResponse: NextResponse } if payments are disabled,
 * or { errorResponse: null } if payments are enabled.
 */
export function assertPaymentsEnabled(): { errorResponse: NextResponse | null } {
  if (!PAYMENTS_ENABLED) {
    return {
      errorResponse: NextResponse.json(PAYMENTS_COMING_SOON_PAYLOAD, {
        status: 503,
        headers: {
          "Retry-After": "86400",
          "Cache-Control": "no-store"
        }
      })
    };
  }
  return { errorResponse: null };
}
