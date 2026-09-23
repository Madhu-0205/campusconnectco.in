/**
 * Production Opportunity Discovery Cron Endpoint
 * CampusConnectCo — Phase 16B
 *
 * Exclusively authenticated via CRON_SECRET bearer token.
 * Rejects browser Founder sessions (separation of concerns).
 * Invokes runDueOpportunitySources() and returns execution metrics.
 */

import { NextRequest, NextResponse } from "next/server";

import { runDueOpportunitySources } from "@/lib/automation/sources/scheduler";
import { safeCompare } from "@/lib/security/crypto";

export const dynamic = "force-dynamic";

function authenticateCron(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  return safeCompare(authHeader, `Bearer ${cronSecret}`);
}

export async function POST(request: NextRequest) {
  if (!authenticateCron(request)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing CRON_SECRET bearer token." },
      {
        status: 401,
        headers: { "Cache-Control": "no-store" }
      }
    );
  }

  try {
    const result = await runDueOpportunitySources();
    return NextResponse.json(
      {
        message: "Continuous discovery cycle executed successfully.",
        runId: result.runId,
        metrics: result.metrics,
        dueSources: result.dueSources,
        skippedSources: result.skippedSources
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" }
      }
    );
  } catch (err: any) {
    console.error("[Cron: Opportunity Discovery] Failed:", err.message);
    return NextResponse.json(
      { error: "Cron execution failed", details: err.message },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" }
      }
    );
  }
}

export async function GET(request: NextRequest) {
  // Support GET for standard Vercel Cron invocation while preserving strict CRON_SECRET auth
  return POST(request);
}
