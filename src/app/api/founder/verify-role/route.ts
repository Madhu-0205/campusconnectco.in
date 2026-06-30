import { NextResponse } from "next/server";

import { protectApi } from "@/lib/auth-checks";

/**
 * Lightweight endpoint: returns 200 if caller is FOUNDER, 403 otherwise.
 * Used by the Founder sign-in page to validate role before proceeding to panel.
 */
export async function GET() {
    const { errorResponse } = await protectApi(["FOUNDER"]);
    if (errorResponse) return errorResponse;
    return NextResponse.json({ verified: true });
}
