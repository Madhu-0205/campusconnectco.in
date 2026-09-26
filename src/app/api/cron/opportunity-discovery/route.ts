/**
 * Production Opportunity Discovery & Lifecycle Cron Endpoint
 * CampusConnectCo — Phase 16D (Phase 4)
 *
 * Exclusively authenticated via CRON_SECRET bearer token.
 * Rejects browser Founder sessions (separation of concerns).
 * Supports explicit actions:
 * - ?action=discover (default: discovery across due sources)
 * - ?action=revalidate (lifecycle revalidation across active opportunities)
 * - ?action=all (both discovery and revalidation)
 * Returns comprehensive, structured run telemetry without secret leakage.
 */

import { NextRequest, NextResponse } from "next/server";
import { runScheduledPipeline, sanitizeSecrets } from "@/lib/automation/sources/scheduler";
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

  const { searchParams } = new URL(request.url);
  const actionParam = searchParams.get("action")?.toLowerCase();
  const sourceParam = searchParams.get("source");
  const sourceSubset = sourceParam ? sourceParam.split(",").map((s) => s.trim()) : undefined;
  const action: "discover" | "revalidate" | "all" =
    actionParam === "revalidate" ? "revalidate" : actionParam === "all" ? "all" : "discover";

  try {
    const telemetry = await runScheduledPipeline({ action, sourceSubset });

    return NextResponse.json(
      {
        message: `Scheduled ${action} cycle executed successfully.`,
        runId: telemetry.runId,
        action: telemetry.action,
        telemetry
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" }
      }
    );
  } catch (err: any) {
    const rawError = err instanceof Error ? err.message : "Cron execution failed";
    const cleanError = sanitizeSecrets(rawError);
    console.error("[Cron: Opportunity Discovery] Failed:", cleanError);

    return NextResponse.json(
      { error: "Cron execution failed", details: cleanError },
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
