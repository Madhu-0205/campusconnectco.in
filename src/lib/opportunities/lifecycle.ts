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
 * Returns whether an opportunity should be discoverable in public feeds,
 * search, nearby geocoding queries, and MapLibre markers.
 */
export function isPubliclyDiscoverable(
  status: string | null | undefined,
  deletedAt?: Date | string | null
): boolean {
  if (!status || deletedAt) return false;
  const s = status.toUpperCase();
  return s === "OPEN" || s === "ACTIVE";
}
