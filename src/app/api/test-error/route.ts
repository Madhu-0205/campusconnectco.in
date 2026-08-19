import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  // Securely gate this route so it cannot be abused by the public
  // to spam our Sentry quota.
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Intentionally throw an error to test Sentry ingestion
  throw new Error("Sentry Live Ingestion Verification Test");
}
