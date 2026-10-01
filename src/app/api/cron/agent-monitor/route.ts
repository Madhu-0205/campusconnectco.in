/**
 * Always-On Agent Automation Cron Endpoint
 *
 * Runs background monitoring & reverification cycle.
 * Protected strictly via CRON_SECRET bearer token using constant-time comparison.
 */

import { NextRequest, NextResponse } from "next/server";
import { runAgentAutomationCycle } from "@/lib/agents/automation/scheduler";
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
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { searchParams } = new URL(request.url);
  const parsedMon = parseInt(searchParams.get("maxMon") || "15", 10);
  const parsedRev = parseInt(searchParams.get("maxRev") || "10", 10);
  const maxMon = Math.min(Math.max(isNaN(parsedMon) ? 15 : parsedMon, 1), 50);
  const maxRev = Math.min(Math.max(isNaN(parsedRev) ? 10 : parsedRev, 1), 30);

  try {
    const telemetry = await runAgentAutomationCycle({
      maxMonitoringBatch: maxMon,
      maxReverificationBatch: maxRev
    });

    return NextResponse.json(
      {
        message: "Agent automation cycle executed successfully",
        telemetry
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("[Cron: Agent Monitor] Execution failed:", err?.message || err);
    return NextResponse.json(
      { error: "Agent cron execution failed", details: err?.message || String(err) },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
