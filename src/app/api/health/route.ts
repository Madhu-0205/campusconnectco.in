import { NextResponse } from"next/server";

export const dynamic ="force-dynamic";

export async function GET() {
 // A safe, fast, stateless health check designed specifically for uptime monitors.
 // Does NOT query databases, Redis, or third-party APIs.
 // Does NOT expose environment variables or stack traces.
  const response = NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "v1.0.0-production"
    },
    { status: 200 }
  );

  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}
