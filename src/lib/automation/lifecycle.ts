/**
 * Safe Lifecycle & Expiration Engine
 * CampusConnectCo — Phase 16
 *
 * Implements strict separation:
 * - CONFIRMED_EXPIRED: deadline explicitly passed (deadline < now)
 * - CONFIRMED_INACTIVE: source explicitly confirmed listing removed/closed
 * - SOURCE_UNAVAILABLE: source temporarily unreachable or errored (no status change to opportunity)
 * - STALE_REQUIRES_RECHECK: not observed recently (>14d) but unconfirmed dead; stays active in review queue
 *
 * NEVER expires an opportunity merely because Agent-Reach/Jina/RSS temporarily failed or lastSeenAt < cutoff.
 */

import { LifecycleState, OpportunityStatus } from "./types";

export interface LifecycleEvaluationInput {
  status: OpportunityStatus;
  deadline?: Date | string | null;
  lastSeenAt: Date | string;
  lastVerifiedAt?: Date | string;
  sourceExplicitlyRemoved?: boolean;
  sourceTemporarilyUnavailable?: boolean;
  maxStalenessDays?: number;
  now?: Date;
}

export interface LifecycleEvaluationResult {
  lifecycleState: LifecycleState;
  newStatus: OpportunityStatus;
  statusChanged: boolean;
  reason: string;
}

const STALE_UNOBSERVED_DAYS = 14;

export function evaluateLifecycle(input: LifecycleEvaluationInput): LifecycleEvaluationResult {
  const now = input.now ? new Date(input.now) : new Date();
  const deadline = input.deadline ? new Date(input.deadline) : null;
  const lastSeen = new Date(input.lastSeenAt);
  const staleLimitDays = input.maxStalenessDays || STALE_UNOBSERVED_DAYS;

  // 1. Deadline passed -> CONFIRMED_EXPIRED
  if (deadline && !isNaN(deadline.getTime()) && deadline.getTime() <= now.getTime()) {
    return {
      lifecycleState: "CONFIRMED_EXPIRED",
      newStatus: "EXPIRED",
      statusChanged: input.status !== "EXPIRED",
      reason: `Application deadline passed on ${deadline.toISOString().split("T")[0]}.`,
    };
  }

  // 2. Source explicitly reports listing removed/closed -> CONFIRMED_INACTIVE
  if (input.sourceExplicitlyRemoved) {
    return {
      lifecycleState: "CONFIRMED_INACTIVE",
      newStatus: "REMOVED",
      statusChanged: input.status !== "REMOVED",
      reason: "Source feed/page explicitly confirmed that the listing is closed or removed.",
    };
  }

  // 3. Source temporarily unavailable / errored -> SOURCE_UNAVAILABLE (no status change!)
  if (input.sourceTemporarilyUnavailable) {
    return {
      lifecycleState: "SOURCE_UNAVAILABLE",
      newStatus: input.status, // Preserve existing status
      statusChanged: false,
      reason: "Discovery source is temporarily unavailable or returned an error; preserving current status.",
    };
  }

  // 4. Stale item without deadline unobserved for > staleLimitDays -> STALE_REQUIRES_RECHECK (stays active!)
  const daysSinceLastSeen = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceLastSeen > staleLimitDays) {
    return {
      lifecycleState: "STALE_REQUIRES_RECHECK",
      newStatus: input.status, // NEVER expire merely because unobserved
      statusChanged: false,
      reason: `Listing has not been re-observed in ${Math.floor(daysSinceLastSeen)} days; flagged for re-check without expiring.`,
    };
  }

  // 5. Active and healthy
  return {
    lifecycleState: "ACTIVE",
    newStatus: input.status,
    statusChanged: false,
    reason: "Listing is currently active and within valid observation window.",
  };
}
