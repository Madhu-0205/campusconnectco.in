/**
 * Continuous Opportunity Discovery & Lifecycle Scheduler
 * CampusConnectCo — Phase 16D (Phase 4)
 *
 * Implements deterministic scheduling and lifecycle wiring with:
 * - nextEligibleRunAt evaluation per source with backoff and bounded jitter
 * - Complete failure isolation: one source/item failure never halts the pipeline
 * - Phase 16D Direct Publisher pipeline wiring:
 *   SOURCE → COLLECT → NORMALIZE → DEDUPLICATE → AUTO-PUBLISH DECISION → DIRECT PUBLISHER
 * - Continuous Lifecycle Revalidation integration via revalidation.ts
 * - Dry-run safety: when OPPORTUNITY_AUTOPUBLISH_ENABLED, OPPORTUNITY_AUTO_EXPIRE_ENABLED,
 *   or OPPORTUNITY_REVALIDATION_ENABLED are false, database state remains unmutated
 * - Structured run observability & zero secrets logging
 */

import crypto from "crypto";
import prisma from "@/lib/prisma";
const legacyPrisma = prisma as unknown as Record<string, any>;

import { AutomationRunMetrics, SourceConfig } from "../types";
import { DiscoveryRunResult, runDiscoveryForSource } from "./discovery-worker";
import { calculateNextEligibleRun, getAllEnabledSources } from "./registry";
import {
  revalidateActiveOpportunities,
  BatchRevalidationSummary,
  OpportunityRevalidationResult,
  RevalidationOptions
} from "../revalidation";

export interface SchedulerExecutionResult {
  runId: string;
  startedAt: Date;
  completedAt: Date;
  dueSources: string[];
  skippedSources: { source: string; nextEligibleRunAt: Date; reason: string }[];
  deferredSources?: { source: string; nextEligibleRunAt: Date; reason: string }[];
  nextEligibleSource?: string | null;
  boundedWorkBudget?: number;
  metrics: AutomationRunMetrics & {
    publishableCandidates?: number;
    reviewCandidates?: number;
    publishedCandidates?: number;
    sourcesDeferred?: number;
  };
  results: DiscoveryRunResult[];
}

export interface ScheduledRunTelemetry {
  runId: string;
  action: "discover" | "revalidate" | "all";
  startedAt: string;
  completedAt: string;
  durationMs: number;
  sourcesAttempted: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  sourcesDeferred?: number;
  deferredSources?: { source: string; nextEligibleRunAt: string; reason: string }[];
  nextEligibleSource?: string | null;
  recordsDiscovered: number;
  recordsNormalized: number;
  duplicates: number;
  publishableCandidates: number;
  reviewCandidates: number;
  rejectedCandidates: number;
  quarantinedCandidates: number;
  revalidationChecks: number;
  expiredCandidates: number;
  confirmedRemovals: number;
  temporaryOutages: number;
  sourceUnavailableCases: number;
  errors: string[];
  discoveryDetails?: DiscoveryRunResult[];
  revalidationDetails?: OpportunityRevalidationResult[];
}

/**
 * Sanitizes strings against accidental secret leakage in logs or telemetry payloads.
 */
export function sanitizeSecrets(message: string): string {
  if (!message || typeof message !== "string") return "";
  let clean = message;
  const secrets = [
    process.env.CRON_SECRET,
    process.env.GROQ_API_KEY,
    process.env.CAMPUSCONNECT_API_KEY,
    process.env.INTERNAL_API_KEY,
    process.env.RESEND_API_KEY,
    process.env.FOUNDER_PASSWORD,
    process.env.FOUNDER_BOT_PASSWORD
  ].filter(Boolean) as string[];

  for (const s of secrets) {
    if (s.length >= 6) {
      clean = clean.split(s).join("[REDACTED_SECRET]");
    }
  }
  return clean;
}

/**
 * Executes a continuous discovery cycle across all sources that are due for polling.
 * Decoupled from execution triggers (CRON, CLI, or manual Founder action).
 */
export interface RunDueOptions {
  forceAll?: boolean;
  now?: Date;
  sourceSubset?: string[];
  maxSourcesPerInvocation?: number;
  maxDurationMs?: number;
  prisma?: any;
}

/**
 * Executes a continuous discovery cycle across all sources that are due for polling.
 * Decoupled from execution triggers (CRON, CLI, or manual Founder action).
 * Enforces bounded source processing per invocation (default 1 source per invocation).
 */
export async function runDueOpportunitySources(
  options?: RunDueOptions
): Promise<SchedulerExecutionResult> {
  const now = options?.now || new Date();
  const runId = `sched_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const startedAt = new Date();

  let enabledSources = getAllEnabledSources();
  if (options?.sourceSubset && options.sourceSubset.length > 0) {
    enabledSources = enabledSources.filter((s) => options.sourceSubset!.includes(s.source));
  }

  const dueSources: SourceConfig[] = [];
  const skippedSources: { source: string; nextEligibleRunAt: Date; reason: string }[] = [];

  // 1. Fetch health records from PlatformSetting (and fallback to legacy model if present)
  const healthMap = new Map<string, { lastAttempt: Date | null; consecutiveFailures: number; lastSuccess?: string | null }>();
  try {
    if (prisma.platformSetting?.findMany) {
      const settings = await prisma.platformSetting.findMany({
        where: {
          key: { in: enabledSources.map((s) => `opp_source_health:${s.source}`) }
        }
      });
      for (const s of settings) {
        try {
          const parsed = JSON.parse(s.value);
          const sourceId = s.key.replace("opp_source_health:", "");
          healthMap.set(sourceId, {
            lastAttempt: parsed.lastAttempt ? new Date(parsed.lastAttempt) : null,
            consecutiveFailures: parsed.consecutiveFailures || 0,
            lastSuccess: parsed.lastSuccess || null
          });
        } catch {}
      }
    }
  } catch {}

  if (healthMap.size === 0 && legacyPrisma.sourceHealth?.findMany) {
    try {
      const healthRecords = await legacyPrisma.sourceHealth.findMany({
        where: {
          source: { in: enabledSources.map((s) => s.source) }
        }
      });
      for (const h of healthRecords) {
        healthMap.set(h.source, {
          lastAttempt: h.lastRun || null,
          consecutiveFailures: h.failureCount || 0
        });
      }
    } catch {}
  }

  // 2. Evaluate scheduling decision using nextEligibleRunAt with backoff and jitter
  for (const config of enabledSources) {
    if (options?.forceAll) {
      dueSources.push(config);
      continue;
    }

    const health = healthMap.get(config.source);
    const lastAttempt = health?.lastAttempt || null;
    const consecutiveFailures = health?.consecutiveFailures || 0;

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

  // 2b. Fair scheduling: Order due sources by staleness (longest waiting / never-run runs first)
  dueSources.sort((a, b) => {
    const timeA = healthMap.get(a.source)?.lastAttempt?.getTime() || 0;
    const timeB = healthMap.get(b.source)?.lastAttempt?.getTime() || 0;
    return timeA - timeB;
  });

  // 2c. Bounded work budget: Default to 1 source per invocation to guarantee serverless safety
  const defaultBatchSize = process.env.OPPORTUNITY_DISCOVERY_BATCH_SIZE
    ? parseInt(process.env.OPPORTUNITY_DISCOVERY_BATCH_SIZE, 10)
    : 1;

  const maxSources =
    options?.maxSourcesPerInvocation ??
    (options?.sourceSubset && options.sourceSubset.length > 0
      ? options.sourceSubset.length
      : defaultBatchSize);

  const sourcesToRun = dueSources.slice(0, maxSources);
  const deferredSources: { source: string; nextEligibleRunAt: Date; reason: string }[] = dueSources
    .slice(maxSources)
    .map((s) => {
      const h = healthMap.get(s.source);
      const nextEligible = calculateNextEligibleRun(s, h?.lastAttempt || null, h?.consecutiveFailures || 0, now);
      return {
        source: s.source,
        nextEligibleRunAt: nextEligible,
        reason: `Deferred to next scheduled invocation (bounded work budget: ${maxSources} source per invocation)`
      };
    });

  const nextEligibleSource = deferredSources.length > 0 ? deferredSources[0].source : null;

  // 3. Initialize aggregate AutomationRun log if supported
  if (legacyPrisma.automationRun?.create) {
    try {
      await legacyPrisma.automationRun.create({
        data: {
          runId,
          source: "scheduler_batch",
          query: JSON.stringify({
            dueCount: dueSources.length,
            runningCount: sourcesToRun.length,
            deferredCount: deferredSources.length,
            skippedCount: skippedSources.length
          }),
          status: "RUNNING",
          startedAt
        }
      });
    } catch {}
  }

  const results: DiscoveryRunResult[] = [];
  const metrics: AutomationRunMetrics & {
    publishableCandidates?: number;
    reviewCandidates?: number;
    publishedCandidates?: number;
    sourcesDeferred?: number;
  } = {
    sourcesAttempted: 0,
    sourcesSucceeded: 0,
    sourcesFailed: 0,
    sourcesDeferred: deferredSources.length,
    itemsDiscovered: 0,
    itemsNormalized: 0,
    itemsNew: 0,
    itemsUpdated: 0,
    itemsUnchanged: 0,
    duplicatesPrevented: 0,
    itemsRejected: 0,
    itemsQuarantined: 0,
    durationMs: 0,
    publishableCandidates: 0,
    reviewCandidates: 0,
    publishedCandidates: 0
  };

  // 4. Run each bounded due source inside an isolated try/catch boundary
  const maxDurationMs = options?.maxDurationMs ?? 25000;
  for (const sourceConfig of sourcesToRun) {
    // Check execution budget before starting each source
    if (Date.now() - startedAt.getTime() > maxDurationMs) {
      deferredSources.push({
        source: sourceConfig.source,
        nextEligibleRunAt: now,
        reason: `Deferred: invocation duration exceeded safety budget of ${maxDurationMs}ms`
      });
      metrics.sourcesDeferred = deferredSources.length;
      continue;
    }

    metrics.sourcesAttempted++;

    try {
      const res = await runDiscoveryForSource(sourceConfig);
      results.push(res);

      const isSuccess = res.errors.length === 0 || res.itemsProcessed > 0;
      if (!isSuccess && res.itemsProcessed === 0) {
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
      metrics.publishableCandidates = (metrics.publishableCandidates || 0) + (res.publishableCount || 0);
      metrics.reviewCandidates = (metrics.reviewCandidates || 0) + (res.reviewCount || 0);
      metrics.publishedCandidates = (metrics.publishedCandidates || 0) + (res.publishedCount || 0);

      // Persist source health and rotation cursor in PlatformSetting
      try {
        if (prisma.platformSetting?.upsert) {
          const prevHealth = healthMap.get(sourceConfig.source);
          const consecutiveFailures = isSuccess ? 0 : (prevHealth?.consecutiveFailures || 0) + 1;
          await prisma.platformSetting.upsert({
            where: { key: `opp_source_health:${sourceConfig.source}` },
            update: {
              value: JSON.stringify({
                source: sourceConfig.source,
                lastAttempt: now.toISOString(),
                lastSuccess: isSuccess ? now.toISOString() : (prevHealth?.lastSuccess || null),
                consecutiveFailures,
                lastDurationMs: res.durationMs,
                lastStatus: isSuccess ? "SUCCESS" : "FAILED"
              })
            },
            create: {
              key: `opp_source_health:${sourceConfig.source}`,
              value: JSON.stringify({
                source: sourceConfig.source,
                lastAttempt: now.toISOString(),
                lastSuccess: isSuccess ? now.toISOString() : null,
                consecutiveFailures,
                lastDurationMs: res.durationMs,
                lastStatus: isSuccess ? "SUCCESS" : "FAILED"
              })
            }
          });

          await prisma.platformSetting.upsert({
            where: { key: "opp_source_cursor" },
            update: { value: JSON.stringify({ lastSource: sourceConfig.source, updatedAt: now.toISOString() }) },
            create: { key: "opp_source_cursor", value: JSON.stringify({ lastSource: sourceConfig.source, updatedAt: now.toISOString() }) }
          });
        }
      } catch {}
    } catch (err: any) {
      metrics.sourcesFailed++;
      const safeErr = sanitizeSecrets(err?.message || "Unknown error");
      console.error(`[Scheduler] Critical error running source ${sourceConfig.source}: ${safeErr}`);
    }
  }

  const completedAt = new Date();
  metrics.durationMs = completedAt.getTime() - startedAt.getTime();
  metrics.sourcesDeferred = deferredSources.length;

  // 5. Complete aggregate AutomationRun record if supported
  if (legacyPrisma.automationRun?.update) {
    try {
      await legacyPrisma.automationRun.update({
        where: { runId },
        data: {
          status: metrics.sourcesFailed === sourcesToRun.length && sourcesToRun.length > 0 ? "FAILED" : "COMPLETED",
          itemsFound: metrics.itemsDiscovered,
          itemsProcessed: metrics.itemsNormalized,
          itemsPublished: metrics.publishedCandidates || 0,
          duplicates: metrics.duplicatesPrevented,
          rejected: metrics.itemsRejected,
          needsReview: metrics.reviewCandidates || metrics.itemsNew,
          errors: metrics.sourcesFailed > 0 ? `${metrics.sourcesFailed} sources encountered errors` : null,
          durationMs: metrics.durationMs,
          completedAt
        }
      });
    } catch {}
  }

  return {
    runId,
    startedAt,
    completedAt,
    dueSources: sourcesToRun.map((s) => s.source),
    skippedSources,
    deferredSources,
    nextEligibleSource,
    boundedWorkBudget: maxSources,
    metrics,
    results
  };
}

/**
 * Executes a lifecycle revalidation run across active opportunities.
 */
export async function runOpportunityRevalidation(
  options?: RevalidationOptions & { batchSize?: number }
): Promise<BatchRevalidationSummary> {
  return await revalidateActiveOpportunities(options);
}

/**
 * Unified execution coordinator for scheduled pipeline actions.
 * Supports action: 'discover' | 'revalidate' | 'all'.
 */
export async function runScheduledPipeline(options?: {
  action?: "discover" | "revalidate" | "all";
  forceAllSources?: boolean;
  batchSize?: number;
  maxSourcesPerInvocation?: number;
  maxDurationMs?: number;
  now?: Date;
  sourceSubset?: string[];
  revalidationOptions?: RevalidationOptions;
  prisma?: any;
}): Promise<ScheduledRunTelemetry> {
  const action = options?.action || "discover";
  const now = options?.now || new Date();
  const runId = `cron_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const startedAt = new Date();

  let discoveryResult: SchedulerExecutionResult | null = null;
  let revalidationResult: BatchRevalidationSummary | null = null;
  const errors: string[] = [];

  // 1. Run Discovery if requested
  if (action === "discover" || action === "all") {
    try {
      discoveryResult = await runDueOpportunitySources({
        forceAll: options?.forceAllSources,
        now,
        sourceSubset: options?.sourceSubset,
        maxSourcesPerInvocation: options?.maxSourcesPerInvocation,
        maxDurationMs: options?.maxDurationMs,
        prisma: options?.prisma
      });
    } catch (err: any) {
      const safeErr = sanitizeSecrets(err?.message || "Discovery failed");
      errors.push(`Discovery cycle failed: ${safeErr}`);
    }
  }

  // 2. Run Revalidation if requested
  if (action === "revalidate" || action === "all") {
    try {
      revalidationResult = await runOpportunityRevalidation({
        now,
        batchSize: options?.batchSize,
        prisma: options?.prisma,
        ...options?.revalidationOptions
      });
    } catch (err: any) {
      const safeErr = sanitizeSecrets(err?.message || "Revalidation failed");
      errors.push(`Revalidation cycle failed: ${safeErr}`);
    }
  }

  const completedAt = new Date();
  const durationMs = completedAt.getTime() - startedAt.getTime();

  // 3. Assemble complete structured telemetry
  const telemetry: ScheduledRunTelemetry = {
    runId,
    action,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    durationMs,
    sourcesAttempted: discoveryResult?.metrics.sourcesAttempted ?? 0,
    sourcesSucceeded: discoveryResult?.metrics.sourcesSucceeded ?? 0,
    sourcesFailed: discoveryResult?.metrics.sourcesFailed ?? 0,
    sourcesDeferred: discoveryResult?.metrics.sourcesDeferred ?? (discoveryResult?.deferredSources?.length ?? 0),
    deferredSources: discoveryResult?.deferredSources?.map((d) => ({
      source: d.source,
      nextEligibleRunAt: d.nextEligibleRunAt.toISOString(),
      reason: d.reason
    })),
    nextEligibleSource: discoveryResult?.nextEligibleSource ?? null,
    recordsDiscovered: discoveryResult?.metrics.itemsDiscovered ?? 0,
    recordsNormalized: discoveryResult?.metrics.itemsNormalized ?? 0,
    duplicates: discoveryResult?.metrics.duplicatesPrevented ?? 0,
    publishableCandidates: discoveryResult?.metrics.publishableCandidates ?? 0,
    reviewCandidates: discoveryResult?.metrics.reviewCandidates ?? (discoveryResult?.metrics.itemsNew ?? 0),
    rejectedCandidates: discoveryResult?.metrics.itemsRejected ?? 0,
    quarantinedCandidates: discoveryResult?.metrics.itemsQuarantined ?? 0,
    revalidationChecks: revalidationResult?.totalProcessed ?? 0,
    expiredCandidates: revalidationResult?.expired ?? 0,
    confirmedRemovals: revalidationResult?.closed ?? 0,
    temporaryOutages: revalidationResult?.temporaryOutages ?? 0,
    sourceUnavailableCases: revalidationResult?.sourceUnavailable ?? 0,
    errors,
    discoveryDetails: discoveryResult?.results,
    revalidationDetails: revalidationResult?.results
  };

  return telemetry;
}
