/**
 * Lifecycle Revalidation & Outage Resilience Engine
 * CampusConnectCo — Phase 16D (Phase 3)
 *
 * Implements continuous, idempotent lifecycle revalidation for published opportunities:
 * - Deadline expiration enforcement
 * - Application URL reachability & confirmed removal detection
 * - HTTP response classification (404/410 vs 5xx vs 403/bot challenge vs 200–399)
 * - Outage resilience: bounded consecutive failure tracking via PlatformSetting
 * - Terminal-state protection: never revives EXPIRED, CLOSED, REJECTED, DELETED, or soft-deleted records
 * - Public visibility enforcement: terminal records are excluded from public discovery
 *
 * Strict Compliance:
 * - ZERO prisma/schema.prisma modifications
 * - ZERO database migrations
 * - ZERO rawPrisma as any
 * - ZERO Playwright / browser overhead (lightweight HTTP probing)
 */

import defaultPrisma from "@/lib/prisma";
import { validateSafeUrl } from "./normalizer";
import { isOpportunityExpired } from "@/lib/opportunities/lifecycle";

export type UrlClassification =
  | "CONFIRMED_REMOVAL"   // 404, 410, or page contains affirmative removal markers
  | "TEMPORARY_OUTAGE"    // 500, 502, 503, 504, network timeout, connection drop
  | "SOURCE_UNAVAILABLE"  // 403, bot challenge / CAPTCHA / WAF mitigation
  | "REACHABLE_ACTIVE"    // 200–399 without removal markers
  | "INVALID_URL";        // SSRF blocked, unsafe protocol, or malformed

export type RevalidationAction =
  | "STATUS_CHANGED"
  | "OUTAGE_INCREMENTED"
  | "OUTAGE_CLEARED"
  | "TERMINAL_PRESERVED"
  | "NO_ACTION";

export interface RevalidationFailureMetadata {
  consecutiveFailures: number;
  firstFailedAt: string;
  lastFailedAt: string;
  lastStatusCode?: number;
  lastReason: string;
}

export interface OpportunityRevalidationResult {
  opportunityId: string;
  previousStatus: string;
  currentStatus: string;
  actionTaken: RevalidationAction;
  reason: string;
  urlClassification?: UrlClassification;
  statusCode?: number;
  consecutiveFailures?: number;
  deadlineExpired?: boolean;
}

export interface RevalidationPrismaDelegate {
  internship: {
    findUnique: (args: { where: { id: string } }) => Promise<{
      id: string;
      title: string;
      company: string;
      status: string;
      deadline: Date | null;
      applicationLink: string | null;
      deletedAt: Date | null;
      source?: string | null;
    } | null>;
    findMany?: (args?: any) => Promise<any[]>;
    update: (args: {
      where: { id: string };
      data: {
        status?: string;
        updatedAt?: Date;
      };
    }) => Promise<any>;
  };
  platformSetting: {
    findUnique: (args: { where: { key: string } }) => Promise<{
      key: string;
      value: string;
      updatedAt?: Date;
    } | null>;
    upsert: (args: {
      where: { key: string };
      update: { value: string; updatedAt?: Date };
      create: { key: string; value: string; updatedAt?: Date };
    }) => Promise<any>;
    deleteMany: (args: { where: { key: string } }) => Promise<{ count: number }>;
  };
}

export interface RevalidationOptions {
  prisma?: RevalidationPrismaDelegate;
  fetchFn?: (url: string, init?: RequestInit) => Promise<Response>;
  now?: Date;
  maxConsecutiveFailures?: number; // default: 3
  timeoutMs?: number; // default: 8000
  autoExpireEnabledOverride?: boolean;
  revalidationEnabledOverride?: boolean;
}

export function isAutoExpireEnabled(options?: RevalidationOptions): boolean {
  if (options?.autoExpireEnabledOverride !== undefined) {
    return options.autoExpireEnabledOverride;
  }
  return process.env.OPPORTUNITY_AUTO_EXPIRE_ENABLED === "true";
}

export function isRevalidationEnabled(options?: RevalidationOptions): boolean {
  if (options?.revalidationEnabledOverride !== undefined) {
    return options.revalidationEnabledOverride;
  }
  return process.env.OPPORTUNITY_REVALIDATION_ENABLED === "true";
}

export interface BatchRevalidationSummary {
  totalProcessed: number;
  expired: number;
  closed: number;
  temporaryOutages: number;
  sourceUnavailable: number;
  activeAndHealthy: number;
  terminalUnchanged: number;
  results: OpportunityRevalidationResult[];
}

/**
 * Terminal statuses that must NEVER be revived back to OPEN.
 */
export const TERMINAL_STATUSES = new Set([
  "EXPIRED",
  "CLOSED",
  "REJECTED",
  "DELETED",
  "INACTIVE"
]);

/**
 * Text markers indicating affirmative removal/closure within 200-399 HTML responses.
 */
const REMOVAL_INDICATORS = [
  "position has been filled",
  "this position is filled",
  "job has been filled",
  "job is no longer available",
  "this job is no longer available",
  "posting has expired",
  "this posting has expired",
  "applications are closed",
  "applications are no longer being accepted",
  "no longer accepting applications",
  "requisition has been closed",
  "this job listing has expired",
  "job not found",
  "posting has been removed",
  "this opportunity is no longer active",
  "opening has been closed"
];

/**
 * Indicators of bot challenge or WAF mitigation within response headers or body.
 */
const BOT_CHALLENGE_INDICATORS = [
  "cf-turnstile",
  "cf-browser-verification",
  "challenge-platform",
  "just a moment...",
  "datadome",
  "captcha-delivery",
  "security check to access",
  "please complete the security check"
];

/**
 * Builds the platformSetting storage key for consecutive failure tracking.
 */
export function getFailureTrackingKey(opportunityId: string): string {
  return `revalidation:failure:${opportunityId}`;
}

/**
 * Classifies an HTTP probe response or network failure.
 */
export function classifyUrlResponse(
  response: Response | null,
  error?: unknown,
  bodyText: string = ""
): { classification: UrlClassification; statusCode?: number; reason: string } {
  // 1. Network failure or timeout
  if (error || !response) {
    const errorMsg = error instanceof Error ? error.message : "Network request failed";
    return {
      classification: "TEMPORARY_OUTAGE",
      reason: `Network error or timeout: ${errorMsg}`
    };
  }

  const status = response.status;

  // 2. Confirmed Removal: 404 Not Found or 410 Gone
  if (status === 404 || status === 410) {
    return {
      classification: "CONFIRMED_REMOVAL",
      statusCode: status,
      reason: `Confirmed removal via HTTP ${status}`
    };
  }

  // 3. Source Unavailable / Bot Challenge: 403 Forbidden or WAF challenge
  const cfMitigated = response.headers.get("cf-mitigated");
  const isCfChallenge = cfMitigated === "challenge";
  const lowerBody = bodyText.toLowerCase();
  const hasBotChallengeBody = BOT_CHALLENGE_INDICATORS.some((ind) => lowerBody.includes(ind));

  if (status === 403 || isCfChallenge || (status === 429 && hasBotChallengeBody)) {
    return {
      classification: "SOURCE_UNAVAILABLE",
      statusCode: status,
      reason: `Source protected by bot challenge or returned HTTP ${status} (SOURCE_UNAVAILABLE)`
    };
  }

  // 4. Temporary Outages: 500, 502, 503, 504
  if (status === 500 || status === 502 || status === 503 || status === 504) {
    return {
      classification: "TEMPORARY_OUTAGE",
      statusCode: status,
      reason: `Temporary server outage (HTTP ${status})`
    };
  }

  // 5. Reachable: 200–399
  if (status >= 200 && status < 400) {
    // Check if the body contains affirmative removal markers
    if (lowerBody) {
      for (const phrase of REMOVAL_INDICATORS) {
        if (lowerBody.includes(phrase)) {
          return {
            classification: "CONFIRMED_REMOVAL",
            statusCode: status,
            reason: `Reachable page explicitly confirms removal: "${phrase}"`
          };
        }
      }
    }

    return {
      classification: "REACHABLE_ACTIVE",
      statusCode: status,
      reason: `Application URL is reachable and active (HTTP ${status})`
    };
  }

  // Fallback for unexpected 4xx
  return {
    classification: "TEMPORARY_OUTAGE",
    statusCode: status,
    reason: `Unexpected HTTP status code: ${status}`
  };
}

/**
 * Revalidates a single published opportunity.
 *
 * Implements:
 * 1. Terminal-state protection (never revives EXPIRED, CLOSED, REJECTED, DELETED, or deletedAt != null)
 * 2. Deadline checks (transitions to EXPIRED if deadline < now; never fabricates deadlines)
 * 3. Application URL checks with SSRF protection
 * 4. URL response classification (404/410, 5xx, timeout, 403/bot challenge, 200–399)
 * 5. Outage resilience: bounded consecutive failure tracking via PlatformSetting
 * 6. Idempotency: repeated executions produce identical lifecycle results without redundant writes
 */
export async function revalidateOpportunity(
  opportunityId: string,
  options?: RevalidationOptions
): Promise<OpportunityRevalidationResult> {
  const prisma: RevalidationPrismaDelegate = (options?.prisma as any) || (defaultPrisma as any);
  const now = options?.now || new Date();
  const maxConsecutiveFailures = options?.maxConsecutiveFailures ?? 3;
  const timeoutMs = options?.timeoutMs ?? 8000;
  const fetchFn = options?.fetchFn || globalThis.fetch;

  // 1. Fetch current opportunity record
  const opportunity = await prisma.internship.findUnique({
    where: { id: opportunityId }
  });

  if (!opportunity) {
    return {
      opportunityId,
      previousStatus: "NOT_FOUND",
      currentStatus: "NOT_FOUND",
      actionTaken: "NO_ACTION",
      reason: `Opportunity ${opportunityId} not found in database`
    };
  }

  const previousStatus = opportunity.status || "OPEN";
  const normalizedStatus = previousStatus.toUpperCase();

  // 2. Terminal-State Protection:
  // Never revive EXPIRED, CLOSED, REJECTED, DELETED, or soft-deleted records back to OPEN.
  if (TERMINAL_STATUSES.has(normalizedStatus) || opportunity.deletedAt !== null) {
    return {
      opportunityId,
      previousStatus,
      currentStatus: previousStatus,
      actionTaken: "TERMINAL_PRESERVED",
      reason: `Terminal lifecycle status "${previousStatus}" is protected and will not be revived or modified.`
    };
  }

  const failureKey = getFailureTrackingKey(opportunityId);

  // 3. Deadline Check:
  // If deadline < now: transition to EXPIRED. Never fabricate a deadline.
  if (opportunity.deadline) {
    if (isOpportunityExpired(opportunity.deadline, now)) {
      if (!isAutoExpireEnabled(options)) {
        return {
          opportunityId,
          previousStatus,
          currentStatus: previousStatus,
          actionTaken: "NO_ACTION",
          reason: "[DRY-RUN] Opportunity deadline has passed; status mutation skipped because OPPORTUNITY_AUTO_EXPIRE_ENABLED is false.",
          deadlineExpired: true
        };
      }

      await prisma.internship.update({
        where: { id: opportunityId },
        data: { status: "EXPIRED", updatedAt: now }
      });

      // Clear any prior failure metadata
      try {
        await prisma.platformSetting.deleteMany({ where: { key: failureKey } });
      } catch {}

      return {
        opportunityId,
        previousStatus,
        currentStatus: "EXPIRED",
        actionTaken: "STATUS_CHANGED",
        reason: "Opportunity deadline has passed; transitioned to EXPIRED.",
        deadlineExpired: true
      };
    }
  }

  // 4. Application URL Check & SSRF Protection
  const targetUrl = opportunity.applicationLink?.trim();

  if (!targetUrl) {
    // No application URL present — cannot probe HTTP; remains OPEN
    return {
      opportunityId,
      previousStatus,
      currentStatus: previousStatus,
      actionTaken: "NO_ACTION",
      reason: "No application link provided; record remains active."
    };
  }

  const urlValidation = validateSafeUrl(targetUrl);
  if (!urlValidation.valid) {
    return {
      opportunityId,
      previousStatus,
      currentStatus: previousStatus,
      actionTaken: "NO_ACTION",
      urlClassification: "INVALID_URL",
      reason: `Invalid or unsafe destination URL: ${urlValidation.error}`
    };
  }

  // 5. Probe the URL with timeout and User-Agent
  let response: Response | null = null;
  let fetchError: unknown = null;
  let bodyText = "";

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    response = await fetchFn(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "CampusConnectCo-OpportunityRevalidator/1.0 (+https://campusconnectco.in)"
      }
    });

    clearTimeout(timer);

    // Read body text for content inspection if 200–399 or bot challenge detection
    if (response.status < 400 || response.status === 403 || response.status === 429) {
      try {
        bodyText = await response.text();
      } catch {}
    }
  } catch (err) {
    fetchError = err;
  }

  // 6. Classify HTTP Response
  const classificationResult = classifyUrlResponse(response, fetchError, bodyText);
  const { classification, statusCode, reason } = classificationResult;

  // 7. Enforce Lifecycle Transitions based on Classification

  // A. Confirmed Removal (404 / 410 or affirmative removal in body)
  if (classification === "CONFIRMED_REMOVAL") {
    if (!isRevalidationEnabled(options)) {
      return {
        opportunityId,
        previousStatus,
        currentStatus: previousStatus,
        actionTaken: "NO_ACTION",
        urlClassification: classification,
        statusCode,
        reason: `[DRY-RUN] ${reason}; status mutation skipped because OPPORTUNITY_REVALIDATION_ENABLED is false.`
      };
    }

    await prisma.internship.update({
      where: { id: opportunityId },
      data: { status: "CLOSED", updatedAt: now }
    });

    try {
      await prisma.platformSetting.deleteMany({ where: { key: failureKey } });
    } catch {}

    return {
      opportunityId,
      previousStatus,
      currentStatus: "CLOSED",
      actionTaken: "STATUS_CHANGED",
      urlClassification: classification,
      statusCode,
      reason
    };
  }

  // B. Source Unavailable (403 / bot challenge)
  if (classification === "SOURCE_UNAVAILABLE") {
    // A single bot challenge or 403 MUST NOT close or unpublish the opportunity.
    // Preserves status as OPEN.
    return {
      opportunityId,
      previousStatus,
      currentStatus: previousStatus,
      actionTaken: "NO_ACTION",
      urlClassification: classification,
      statusCode,
      reason
    };
  }

  // C. Temporary Outage (500, 502, 503, 504, timeout, network failure)
  if (classification === "TEMPORARY_OUTAGE") {
    // Outage resilience: A single temporary failure MUST NOT unpublish.
    // Bounded consecutive failure tracking via PlatformSetting.
    let existingMetadata: RevalidationFailureMetadata | null = null;

    try {
      const setting = await prisma.platformSetting.findUnique({
        where: { key: failureKey }
      });
      if (setting?.value) {
        existingMetadata = JSON.parse(setting.value);
      }
    } catch {}

    const consecutiveFailures = (existingMetadata?.consecutiveFailures ?? 0) + 1;
    const firstFailedAt = existingMetadata?.firstFailedAt ?? now.toISOString();

    if (consecutiveFailures >= maxConsecutiveFailures) {
      if (!isRevalidationEnabled(options)) {
        return {
          opportunityId,
          previousStatus,
          currentStatus: previousStatus,
          actionTaken: "NO_ACTION",
          urlClassification: classification,
          statusCode,
          consecutiveFailures,
          reason: `[DRY-RUN] Exceeded maximum consecutive temporary outage threshold (${consecutiveFailures}/${maxConsecutiveFailures}); status mutation skipped because OPPORTUNITY_REVALIDATION_ENABLED is false.`
        };
      }

      // Bounded threshold reached: transition to CLOSED
      await prisma.internship.update({
        where: { id: opportunityId },
        data: { status: "CLOSED", updatedAt: now }
      });

      try {
        await prisma.platformSetting.deleteMany({ where: { key: failureKey } });
      } catch {}

      return {
        opportunityId,
        previousStatus,
        currentStatus: "CLOSED",
        actionTaken: "STATUS_CHANGED",
        urlClassification: classification,
        statusCode,
        consecutiveFailures,
        reason: `Exceeded maximum consecutive temporary outage threshold (${consecutiveFailures}/${maxConsecutiveFailures}); transitioned to CLOSED.`
      };
    }

    // Still under threshold: record failure and keep OPEN
    const updatedMetadata: RevalidationFailureMetadata = {
      consecutiveFailures,
      firstFailedAt,
      lastFailedAt: now.toISOString(),
      lastStatusCode: statusCode,
      lastReason: reason
    };

    try {
      await prisma.platformSetting.upsert({
        where: { key: failureKey },
        update: {
          value: JSON.stringify(updatedMetadata),
          updatedAt: now
        },
        create: {
          key: failureKey,
          value: JSON.stringify(updatedMetadata),
          updatedAt: now
        }
      });
    } catch {}

    return {
      opportunityId,
      previousStatus,
      currentStatus: previousStatus,
      actionTaken: "OUTAGE_INCREMENTED",
      urlClassification: classification,
      statusCode,
      consecutiveFailures,
      reason: `Temporary outage recorded (${consecutiveFailures}/${maxConsecutiveFailures} failures); opportunity remains OPEN.`
    };
  }

  // D. Reachable & Active (200–399 without removal markers)
  if (classification === "REACHABLE_ACTIVE") {
    let hadPriorFailure = false;
    try {
      const deleted = await prisma.platformSetting.deleteMany({
        where: { key: failureKey }
      });
      hadPriorFailure = (deleted?.count ?? 0) > 0;
    } catch {}

    return {
      opportunityId,
      previousStatus,
      currentStatus: previousStatus,
      actionTaken: hadPriorFailure ? "OUTAGE_CLEARED" : "NO_ACTION",
      urlClassification: classification,
      statusCode,
      reason
    };
  }

  // Fallback
  return {
    opportunityId,
    previousStatus,
    currentStatus: previousStatus,
    actionTaken: "NO_ACTION",
    urlClassification: classification,
    statusCode,
    reason
  };
}

/**
 * Revalidates all active opportunities in batches.
 */
export async function revalidateActiveOpportunities(
  options?: RevalidationOptions & { batchSize?: number }
): Promise<BatchRevalidationSummary> {
  const prisma: RevalidationPrismaDelegate = (options?.prisma as any) || (defaultPrisma as any);
  const batchSize = options?.batchSize ?? 50;

  let activeRecords: any[] = [];
  if (prisma.internship.findMany) {
    activeRecords = await prisma.internship.findMany({
      where: {
        status: "OPEN",
        deletedAt: null
      },
      take: batchSize
    });
  }

  const results: OpportunityRevalidationResult[] = [];
  let expired = 0;
  let closed = 0;
  let temporaryOutages = 0;
  let sourceUnavailable = 0;
  let activeAndHealthy = 0;
  let terminalUnchanged = 0;

  for (const record of activeRecords) {
    const result = await revalidateOpportunity(record.id, options);
    results.push(result);

    if (result.currentStatus === "EXPIRED" && result.actionTaken === "STATUS_CHANGED") {
      expired++;
    } else if (result.currentStatus === "CLOSED" && result.actionTaken === "STATUS_CHANGED") {
      closed++;
    } else if (result.urlClassification === "TEMPORARY_OUTAGE") {
      temporaryOutages++;
    } else if (result.urlClassification === "SOURCE_UNAVAILABLE") {
      sourceUnavailable++;
    } else if (result.urlClassification === "REACHABLE_ACTIVE") {
      activeAndHealthy++;
    } else if (result.actionTaken === "TERMINAL_PRESERVED") {
      terminalUnchanged++;
    }
  }

  return {
    totalProcessed: results.length,
    expired,
    closed,
    temporaryOutages,
    sourceUnavailable,
    activeAndHealthy,
    terminalUnchanged,
    results
  };
}
