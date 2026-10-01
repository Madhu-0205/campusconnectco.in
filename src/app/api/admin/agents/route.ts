/**
 * Admin Agent Monitoring API Endpoint
 *
 * Provides:
 * - GET: List recent agent execution runs, decisions, and queue metrics (Founder/Admin only)
 * - POST: Manually trigger an agent automation cycle (monitoring & reverification)
 */

import { NextRequest, NextResponse } from "next/server";
import { protectApi } from "@/lib/auth-checks";
import { getRecentAgentRuns } from "@/lib/agents/tools/database";
import { getAgentJobQueue } from "@/lib/agents/automation/queue";
import { runAgentAutomationCycle } from "@/lib/agents/automation/scheduler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await protectApi(["FOUNDER", "ADMIN"]);
    if (auth.errorResponse) return auth.errorResponse;

    const runs = await getRecentAgentRuns(25);
    const queueStatus = getAgentJobQueue().getStatus();

    return NextResponse.json({
      success: true,
      queue: queueStatus,
      runs
    });
  } catch (err: any) {
    console.error("[Admin Agents API] Error:", err?.message || err);
    return NextResponse.json({ error: "Failed to fetch agent metrics" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await protectApi(["FOUNDER", "ADMIN"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const parsedMon = parseInt(searchParams.get("maxMon") || "10", 10);
    const parsedRev = parseInt(searchParams.get("maxRev") || "10", 10);
    const maxMon = Math.min(Math.max(isNaN(parsedMon) ? 10 : parsedMon, 1), 50);
    const maxRev = Math.min(Math.max(isNaN(parsedRev) ? 10 : parsedRev, 1), 30);

    const telemetry = await runAgentAutomationCycle({
      maxMonitoringBatch: maxMon,
      maxReverificationBatch: maxRev
    });

    return NextResponse.json({
      success: true,
      message: "Agent automation cycle executed successfully",
      telemetry
    });
  } catch (err: any) {
    console.error("[Admin Agents API Trigger] Error:", err?.message || err);
    return NextResponse.json({ error: "Failed to execute agent cycle" }, { status: 500 });
  }
}
