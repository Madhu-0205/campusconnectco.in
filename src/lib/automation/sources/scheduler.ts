/**
 * Continuous Opportunity Discovery Scheduler
 * CampusConnectCo — Phase 16B
 *
 * Implements deterministic scheduling with:
 * - nextEligibleRunAt evaluation per source
 * - Exponential failure backoff
 * - Bounded scheduling jitter
 * - Complete failure isolation
 * - Aggregate run metrics tracking
 */

import crypto from "crypto";

import rawPrisma from "@/lib/prisma";
const prisma = rawPrisma as any;

import { AutomationRunMetrics, SourceConfig } from "../types";
import { DiscoveryRunResult, runDiscoveryForSource } from "./discovery-worker";
import { calculateNextEligibleRun, getAllEnabledSources } from "./registry";

export interface SchedulerExecutionResult {
  runId: string;
  startedAt: Date;
  completedAt: Date;
  dueSources: string[];
  skippedSources: { source: string; nextEligibleRunAt: Date; reason: string }[];
  metrics: AutomationRunMetrics;
  results: DiscoveryRunResult[];
}

/**
 * Executes a continuous discovery cycle across all sources that are due for polling.
 * Decoupled from execution triggers (CRON, CLI, or manual Founder action).
 */
export async function runDueOpportunitySources(
  options?: { forceAll?: boolean; now?: Date }
): Promise<SchedulerExecutionResult> {
  const now = options?.now || new Date();
  const runId = `sched_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const startedAt = new Date();

  const enabledSources = getAllEnabledSources();
  const dueSources: SourceConfig[] = [];
  const skippedSources: { source: string; nextEligibleRunAt: Date; reason: string }[] = [];

  // 1. Fetch current health records for all enabled sources to determine eligibility
  const healthRecords = await prisma.sourceHealth.findMany({
    where: {
      source: { in: enabledSources.map((s) => s.source) }
    }
  });
  const healthMap = new Map<string, typeof healthRecords[0]>();
  for (const h of healthRecords) {
    healthMap.set(h.source, h);
  }

  // 2. Evaluate scheduling decision using nextEligibleRunAt with backoff and jitter
  for (const config of enabledSources) {
    if (options?.forceAll) {
      dueSources.push(config);
      continue;
    }

    const health = healthMap.get(config.source);
    const lastAttempt = health?.lastRun || null;
    const consecutiveFailures = health?.failureCount || 0;

    const nextEligible = calculateNextEligibleRun(config, lastAttempt, consecutiveFailures, now);

    if (!lastAttempt || now.getTime() >= nextEligible.getTime()) {
      dueSources.push(config);
    } else {
      skippedSources.push({
        source: config.source,
        nextEligibleRunAt: nextEligible,
        reason: `Not due until ${nextEligible.toISOString()} (interval: ${config.scheduleMinutes}m, failures: ${consecutiveFailures})`
      });
    }
  }

  // 3. Initialize aggregate AutomationRun log
  await prisma.automationRun.create({
    data: {
      runId,
      source: "scheduler_batch",
      query: JSON.stringify({ dueCount: dueSources.length, skippedCount: skippedSources.length }),
      status: "RUNNING",
      startedAt
    }
  });

  const results: DiscoveryRunResult[] = [];
  const metrics: AutomationRunMetrics = {
    sourcesAttempted: dueSources.length,
    sourcesSucceeded: 0,
    sourcesFailed: 0,
    itemsDiscovered: 0,
    itemsNormalized: 0,
    itemsNew: 0,
    itemsUpdated: 0,
    itemsUnchanged: 0,
    duplicatesPrevented: 0,
    itemsRejected: 0,
    itemsQuarantined: 0,
    durationMs: 0
  };

  // 4. Run each due source inside an isolated try/catch boundary
  for (const sourceConfig of dueSources) {
    try {
      const res = await runDiscoveryForSource(sourceConfig);
      results.push(res);

      if (res.errors.length > 0 && res.itemsProcessed === 0) {
        metrics.sourcesFailed++;
      } else {
        metrics.sourcesSucceeded++;
      }

      metrics.itemsDiscovered += res.itemsFound;
      metrics.itemsNormalized += res.itemsProcessed;
      metrics.itemsNew += res.itemsNew || 0;
      metrics.itemsUpdated += res.itemsUpdated || 0;
      metrics.itemsUnchanged += res.itemsUnchanged || 0;
      metrics.duplicatesPrevented += res.duplicatesPrevented;
      metrics.itemsRejected += res.rejectedCount;
      metrics.itemsQuarantined += res.quarantinedCount || 0;
    } catch (err: any) {
      metrics.sourcesFailed++;
      console.error(`[Scheduler] Critical error running source ${sourceConfig.source}:`, err.message);
    }
  }

  const completedAt = new Date();
  metrics.durationMs = completedAt.getTime() - startedAt.getTime();

  // 5. Complete aggregate AutomationRun record
  await prisma.automationRun.update({
    where: { runId },
    data: {
      status: metrics.sourcesFailed === dueSources.length && dueSources.length > 0 ? "FAILED" : "COMPLETED",
      itemsFound: metrics.itemsDiscovered,
      itemsProcessed: metrics.itemsNormalized,
      itemsPublished: 0,
      duplicates: metrics.duplicatesPrevented,
      rejected: metrics.itemsRejected,
      needsReview: metrics.itemsNew,
      errors: metrics.sourcesFailed > 0 ? `${metrics.sourcesFailed} sources encountered errors` : null,
      durationMs: metrics.durationMs,
      completedAt
    }
  });

  return {
    runId,
    startedAt,
    completedAt,
    dueSources: dueSources.map((s) => s.source),
    skippedSources,
    metrics,
    results
  };
}
