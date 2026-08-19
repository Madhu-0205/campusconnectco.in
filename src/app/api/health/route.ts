import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // A safe, fast, stateless health check designed specifically for uptime monitors.
  // Does NOT query databases, Redis, or third-party APIs.
  // Does NOT expose environment variables or stack traces.
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "v1.0.0-production"
    },
    { status: 200 }
  );
}
