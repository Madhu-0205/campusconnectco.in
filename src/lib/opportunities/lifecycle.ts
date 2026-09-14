/**
 * Canonical Lifecycle State Machine for CampusConnectCo Opportunities
 *
 * State Transitions:
 * ACTIVE (OPEN/active) -> INACTIVE, COMPLETED, DELETED
 * INACTIVE             -> OPEN (Reactivate), DELETED
 * COMPLETED            -> OPEN (Reactivate if authorized), DELETED
 * DELETED              -> TERMINAL (No transitions allowed)
 */

export const OpportunityStatus = {
  ACTIVE: "OPEN",
  INACTIVE: "INACTIVE",
  COMPLETED: "COMPLETED",
  DELETED: "DELETED",
} as const;

export type OpportunityStatusType =
  | "OPEN"
  | "active"
  | "INACTIVE"
  | "COMPLETED"
  | "DELETED"
  | "PENDING_APPROVAL"
  | "REJECTED";

export const ACTIVE_STATUSES = ["OPEN", "active"] as const;

export const TERMINAL_STATUSES = ["DELETED"] as const;

/**
 * Validates whether a lifecycle transition is permitted by the canonical state machine.
 */
export function isValidLifecycleTransition(
  currentStatus: string,
  targetStatus: string
): { valid: boolean; reason?: string } {
  const current = currentStatus.toUpperCase();
  const target = targetStatus.toUpperCase();

  // DELETED is strictly terminal
  if (current === "DELETED") {
    return { valid: false, reason: "Opportunity has been permanently deleted and cannot change status." };
  }

  if (current === target || (ACTIVE_STATUSES.map(s => s.toUpperCase()).includes(current) && ACTIVE_STATUSES.map(s => s.toUpperCase()).includes(target))) {
    return { valid: true };
  }

  // Transitions from ACTIVE (OPEN/active)
  if (current === "OPEN" || current === "ACTIVE") {
    if (["INACTIVE", "COMPLETED", "DELETED"].includes(target)) {
      return { valid: true };
    }
    return { valid: false, reason: `Cannot transition active opportunity to ${targetStatus}.` };
  }

  // Transitions from INACTIVE
  if (current === "INACTIVE") {
    if (["OPEN", "ACTIVE", "DELETED"].includes(target)) {
      return { valid: true };
    }
    return { valid: false, reason: `Inactive opportunity can only be reactivated to OPEN or Deleted.` };
  }

  // Transitions from COMPLETED
  if (current === "COMPLETED") {
    if (["OPEN", "ACTIVE", "DELETED"].includes(target)) {
      return { valid: true };
    }
    return { valid: false, reason: `Completed opportunity can only be reactivated to OPEN or Deleted.` };
  }

  // Pending approval / moderation transitions
  if (current === "PENDING_APPROVAL") {
    if (["OPEN", "ACTIVE", "REJECTED", "DELETED"].includes(target)) {
      return { valid: true };
    }
  }

  return { valid: false, reason: `Invalid transition from ${currentStatus} to ${targetStatus}.` };
}

/**
 * Determines whether a deadline timestamp has passed.
 */
export function isOpportunityExpired(deadline?: Date | string | null, now: Date = new Date()): boolean {
  if (!deadline) return false;
  const d = typeof deadline === "string" ? new Date(deadline) : deadline;
  return !isNaN(d.getTime()) && d.getTime() < now.getTime();
}

/**
 * Authoritative definition of an active opportunity:
 * 1. Not deleted: deletedAt === null
 * 2. Active status: "OPEN" or "active"
 * 3. Deadline valid: deadline is null OR deadline >= now
 */
export function isOpportunityActive(
  statusOrObj:
    | string
    | null
    | undefined
    | {
        status?: string | null;
        deadline?: Date | string | null;
        deletedAt?: Date | string | null;
      },
  deadline?: Date | string | null,
  deletedAt?: Date | string | null,
  now: Date = new Date()
): boolean {
  if (statusOrObj && typeof statusOrObj === "object" && !(statusOrObj instanceof String)) {
    const obj = statusOrObj as {
      status?: string | null;
      deadline?: Date | string | null;
      deletedAt?: Date | string | null;
    };
    const effectiveNow = deadline instanceof Date ? deadline : now;
    return isOpportunityActive(obj.status, obj.deadline, obj.deletedAt, effectiveNow);
  }

  const status = statusOrObj as string | null | undefined;
  if (!status || deletedAt) return false;
  const s = status.toUpperCase();
  const isActiveStatus = s === "OPEN" || s === "ACTIVE";
  if (!isActiveStatus) return false;
  if (isOpportunityExpired(deadline, now)) return false;
  return true;
}

/**
 * Returns whether an opportunity should be discoverable in public feeds,
 * search, recommendations, sitemap, nearby queries, and MapLibre markers.
 */
export function isPubliclyDiscoverable(
  status: string | null | undefined,
  deletedAt?: Date | string | null,
  deadline?: Date | string | null,
  now: Date = new Date()
): boolean {
  return isOpportunityActive(status, deadline, deletedAt, now);
}

/**
 * Generates authoritative Prisma WHERE filter conditions for active opportunities.
 * Guaranteed consistent across discovery, recommendations, search suggestions, and sitemap.
 */
export function getActiveOpportunityPrismaFilter(now: Date = new Date()) {
  return {
    deletedAt: null,
    OR: [
      { deadline: null },
      { deadline: { gte: now } }
    ]
  };
}
