import { NextResponse } from "next/server";

import { protectApi } from "@/lib/auth-checks";

/**
 * Lightweight endpoint: returns 200 if caller is FOUNDER, 403 otherwise.
 * Used by the Founder sign-in page to validate role before proceeding to panel.
 */
export async function GET() {
  try {
const { errorResponse } = await protectApi(["ADMIN"]);
if (errorResponse) return errorResponse;
return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("API Error in src/app/api/founder/verify-role/route.ts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
