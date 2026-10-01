/**
 * Always-On Automation Master Scheduler for AI Agents
 *
 * Coordinates recurring, bounded background jobs:
 * 1. Opportunity Monitoring (deadlines, reachability, closure)
 * 2. Opportunity Reverification (evidence refresh, tri-dimensional evaluation)
 * 3. Matching Refresh (student-opportunity scoring)
 */

import { MonitorJobResult, runOpportunityMonitoringJob } from "./jobs/monitor-job";
import { ReverifyJobResult, runOpportunityReverificationJob } from "./jobs/reverify-job";
import { getAgentJobQueue } from "./queue";

export interface AgentAutomationCycleTelemetry {
  runId: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  monitoring: MonitorJobResult;
  reverification: ReverifyJobResult;
  queueStatus: {
    pending: number;
    active: number;
  };
  errors: string[];
}

let isCycleRunning = false;
let cycleStartTime = 0;
const MAX_CYCLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minute stale-lock threshold

export async function runAgentAutomationCycle(options?: {
  maxMonitoringBatch?: number;
  maxReverificationBatch?: number;
}): Promise<AgentAutomationCycleTelemetry> {
  const startTime = Date.now();
  const runId = `cycle-${Date.now()}`;
  const errors: string[] = [];

  // Check for active cycle running to prevent overlapping duplicate runs
  if (isCycleRunning) {
    const elapsed = Date.now() - cycleStartTime;
    if (elapsed < MAX_CYCLE_TIMEOUT_MS) {
      const queue = getAgentJobQueue();
      return {
        runId,
        startedAt: new Date(startTime).toISOString(),
        completedAt: new Date().toISOString(),
        durationMs: 0,
        monitoring: {
          checkedCount: 0,
          expiredCount: 0,
          closedCount: 0,
          unreachableCount: 0,
          unchangedCount: 0,
          errors: []
        },
        reverification: {
          attempted: 0,
          verified: 0,
          unverified: 0,
          disputed: 0,
          errors: []
        },
        queueStatus: queue.getStatus(),
        errors: ["Agent automation cycle already in progress. Skipping overlapping invocation."]
      };
    }
  }

  isCycleRunning = true;
  cycleStartTime = startTime;

  const maxMon = options?.maxMonitoringBatch ?? 15;
  const maxRev = options?.maxReverificationBatch ?? 10;

  let monitoringResult: MonitorJobResult = {
    checkedCount: 0,
    expiredCount: 0,
    closedCount: 0,
    unreachableCount: 0,
    unchangedCount: 0,
    errors: []
  };

  let reverificationResult: ReverifyJobResult = {
    attempted: 0,
    verified: 0,
    unverified: 0,
    disputed: 0,
    errors: []
  };

  try {
    try {
      // 1. Run Opportunity Monitoring Job
      monitoringResult = await runOpportunityMonitoringJob(maxMon);
      if (monitoringResult.errors.length > 0) {
        errors.push(...monitoringResult.errors);
      }
    } catch (err: any) {
      errors.push(`Monitoring job failed: ${err?.message || err}`);
    }

    try {
      // 2. Run Opportunity Reverification Job
      reverificationResult = await runOpportunityReverificationJob(maxRev);
      if (reverificationResult.errors.length > 0) {
        errors.push(...reverificationResult.errors);
      }
    } catch (err: any) {
      errors.push(`Reverification job failed: ${err?.message || err}`);
    }

    const durationMs = Date.now() - startTime;
    const queue = getAgentJobQueue();
    const queueStatus = queue.getStatus();

    return {
      runId,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs,
      monitoring: monitoringResult,
      reverification: reverificationResult,
      queueStatus: {
        pending: queueStatus.pending,
        active: queueStatus.active
      },
      errors
    };
  } finally {
    isCycleRunning = false;
  }
}
