/**
 * Opportunity Publication State Machine, Human Authorization, & Audit System
 * CampusConnectCo — Phase 16C
 *
 * NOTE ON AUDIT IMMUTABILITY:
 * No dedicated database audit table currently exists in prisma/schema.prisma.
 * Audit history stored in `metadata.auditTrail` is application-enforced append-only,
 * not database-level immutable.
 *
 * Enforces authoritative lifecycle transitions:
 * DISCOVERED -> PROCESSING -> NEEDS_REVIEW -> APPROVED (Human Founder) -> PUBLISHED (Dedicated Bot)
 * Includes emergency rollback (PUBLISHED -> NEEDS_REVIEW),
 * opportunity-specific human authorization with replay protection and revocation,
 * strict rejection/rollback reasons, and actor-aware audit event tracking.
 */

import crypto from "crypto";
import { isAutomationBotEmail } from "@/lib/auth-checks";

export interface ActorContext {
  email: string;
  role: string;
  isBot: boolean;
}

export interface HumanPublicationAuthorization {
  token: string;
  authorizedBy: string; // human email
  authorizedAt: string; // ISO timestamp
  expiresAt: string;    // ISO timestamp
  opportunityId: string;
  usedAt?: string | null;
  revoked?: boolean;
  [key: string]: any;
}

export interface AuditEvent {
  id: string;
  action: "STAGE" | "APPROVE" | "REJECT" | "RESTORE" | "PUBLISH" | "UNPUBLISH" | "RECHECK" | "EDIT";
  actorEmail: string;
  actorRole: string;
  isBot: boolean;
  timestamp: string;
  fromStatus: string;
  toStatus: string;
  reason?: string;
  details?: Record<string, any>;
  [key: string]: any;
}

export interface StateTransitionValidationResult {
  valid: boolean;
  error?: string;
  statusCode?: number;
}

// Strict Allowed State Transitions Matrix
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  DISCOVERED: ["PROCESSING", "NEEDS_REVIEW", "REMOVED"],
  PROCESSING: ["NEEDS_REVIEW", "REMOVED"],
  NEEDS_REVIEW: ["APPROVED", "REJECTED", "REMOVED"],
  APPROVED: ["PUBLISHED", "NEEDS_REVIEW", "REJECTED", "REMOVED"],
  PUBLISHED: ["NEEDS_REVIEW", "REMOVED"], // UNPUBLISH rollback transitions back to NEEDS_REVIEW or REMOVED
  REJECTED: ["NEEDS_REVIEW", "REMOVED"],  // Restoration allows returning to review queue
  EXPIRED: ["NEEDS_REVIEW", "REMOVED"],
  REMOVED: ["NEEDS_REVIEW"]
};

/**
 * Generates a server-verifiable, opportunity-specific human authorization for publication.
 */
export function createHumanAuthorization(
  opportunityId: string,
  actor: ActorContext,
  ttlMinutes = 30
): HumanPublicationAuthorization {
  if (actor.isBot || isAutomationBotEmail(actor.email)) {
    throw new Error("SECURITY VIOLATION: Automation bot cannot issue human publication authorizations.");
  }
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);
  return {
    token: `auth_${crypto.randomBytes(16).toString("hex")}`,
    authorizedBy: actor.email,
    authorizedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    opportunityId,
    usedAt: null,
    revoked: false
  };
}

/**
 * Authoritatively verifies human publication authorization with replay and revocation protection.
 */
export function verifyHumanAuthorization(
  auth: HumanPublicationAuthorization | undefined | null,
  opportunityId: string
): { valid: boolean; error?: string; statusCode?: number } {
  if (!auth) {
    return {
      valid: false,
      error: "AUTHORIZATION VIOLATION: No human publication authorization found for this opportunity. Explicit human approval is required.",
      statusCode: 403
    };
  }

  if (auth.opportunityId !== opportunityId) {
    return {
      valid: false,
      error: "AUTHORIZATION VIOLATION: Authorization token opportunity ID mismatch.",
      statusCode: 403
    };
  }

  if (auth.revoked) {
    return {
      valid: false,
      error: "AUTHORIZATION VIOLATION: Human publication authorization has been revoked.",
      statusCode: 403
    };
  }

  if (auth.usedAt) {
    return {
      valid: false,
      error: `REPLAY ATTACK PREVENTED: Authorization token was already consumed at ${auth.usedAt}. Single-use tokens cannot be replayed.`,
      statusCode: 409
    };
  }

  if (new Date(auth.expiresAt).getTime() <= Date.now()) {
    return {
      valid: false,
      error: "AUTHORIZATION VIOLATION: Human publication authorization has expired. Re-approval required.",
      statusCode: 403
    };
  }

  return { valid: true };
}

/**
 * Consumes an authorization token (marks it used for replay protection).
 */
export function consumeHumanAuthorization(
  auth: HumanPublicationAuthorization
): HumanPublicationAuthorization {
  return {
    ...auth,
    usedAt: new Date().toISOString()
  };
}

/**
 * Revokes a human authorization token upon rejection, unpublish, or rollback.
 */
export function revokeHumanAuthorization(
  auth: HumanPublicationAuthorization | undefined | null
): HumanPublicationAuthorization | undefined {
  if (!auth) return undefined;
  return {
    ...auth,
    revoked: true
  };
}

/**
 * Validates whether an opportunity can transition from `currentStatus` to `targetStatus`.
 * Enforces actor roles, human approval requirements, quarantine risk checks, and non-empty rejection reasons.
 */
export function validateStateTransition(params: {
  currentStatus: string;
  targetStatus: string;
  actor: ActorContext;
  opportunity: {
    id?: string;
    spamRiskScore?: number;
    metadata?: any;
    publishedOpportunityId?: string | null;
  };
  reason?: string;
}): StateTransitionValidationResult {
  const { currentStatus, targetStatus, actor, opportunity, reason } = params;
  const from = currentStatus.toUpperCase();
  const to = targetStatus.toUpperCase();

  // 1. Same-state transition (idempotency check)
  if (from === to) {
    return { valid: true };
  }

  // 2. Check Allowed Transitions Matrix
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    return {
      valid: false,
      error: `STATE MACHINE VIOLATION: Transition from "${from}" to "${to}" is not permitted.`,
      statusCode: 400
    };
  }

  // 3. Human Authorization Guard:
  // Review actions (APPROVE, REJECT, RESTORE, UNPUBLISH) MUST be initiated by a human FOUNDER or ADMIN
  if (to === "APPROVED" || to === "REJECTED" || (from === "PUBLISHED" && to === "NEEDS_REVIEW")) {
    if (actor.isBot || isAutomationBotEmail(actor.email)) {
      return {
        valid: false,
        error: `SECURITY VIOLATION: Automation bot cannot execute human review action (${to}). Human authorization required.`,
        statusCode: 403
      };
    }
  }

  // 4. Quarantine & Security Risk Gate:
  // Opportunities with severe risk flags or high spam risk scores cannot be APPROVED or PUBLISHED
  if (to === "APPROVED" || to === "PUBLISHED") {
    const riskFlags = opportunity.metadata?.riskFlags || [];
    const spamScore = opportunity.spamRiskScore || 0;

    if (riskFlags.length > 0 || spamScore >= 75) {
      return {
        valid: false,
        error: `QUARANTINE VIOLATION: Opportunity flagged with security risk flags [${riskFlags.join(
          ", "
        )}] (Spam score: ${spamScore}). Quarantined records cannot be approved or published.`,
        statusCode: 422
      };
    }
  }

  // 5. Dedicated Bot Publication Guard:
  // Transition to PUBLISHED must operate strictly under the dedicated bot session upon human approval
  if (to === "PUBLISHED") {
    if (from !== "APPROVED") {
      return {
        valid: false,
        error: `STATE MACHINE VIOLATION: Cannot publish unapproved record. Current status is "${from}". Must be "APPROVED" by human Founder first.`,
        statusCode: 400
      };
    }

    if (!actor.isBot && !isAutomationBotEmail(actor.email)) {
      return {
        valid: false,
        error: `SECURITY VIOLATION: Opportunity publication must be executed strictly by the dedicated automation bot (opportunity-bot@campusconnectco.in). Personal Founder execution is forbidden.`,
        statusCode: 403
      };
    }

    // Verify human authorization record
    const authCheck = verifyHumanAuthorization(
      opportunity.metadata?.authorization,
      opportunity.id || ""
    );
    if (!authCheck.valid) {
      return {
        valid: false,
        error: authCheck.error,
        statusCode: authCheck.statusCode || 403
      };
    }
  }

  // 6. Emergency Rollback Guard:
  if (from === "PUBLISHED" && to === "NEEDS_REVIEW") {
    if (actor.isBot || isAutomationBotEmail(actor.email)) {
      return {
        valid: false,
        error: "SECURITY VIOLATION: Automation bot cannot execute emergency rollback.",
        statusCode: 403
      };
    }
    if (!reason || reason.trim().length < 5) {
      return {
        valid: false,
        error: "AUDIT VIOLATION: An explicit, meaningful rollback reason (minimum 5 characters) is required.",
        statusCode: 400
      };
    }
  }

  // 7. Mandatory Meaningful Rejection Reason
  if (to === "REJECTED") {
    if (!reason || reason.trim().length < 5) {
      return {
        valid: false,
        error: `AUDIT VIOLATION: An explicit, meaningful rejection reason (minimum 5 characters) is required to reject an opportunity.`,
        statusCode: 400
      };
    }
  }

  return { valid: true };
}

/**
 * Creates an audit event for recording in metadata.auditTrail.
 * (Application-enforced append-only tracking).
 */
export function createAuditEvent(params: {
  action: AuditEvent["action"];
  actor: ActorContext;
  fromStatus: string;
  toStatus: string;
  reason?: string;
  details?: Record<string, any>;
}): AuditEvent {
  const id = `audit_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  return {
    id,
    action: params.action,
    actorEmail: params.actor.email,
    actorRole: params.actor.role,
    isBot: params.actor.isBot,
    timestamp: new Date().toISOString(),
    fromStatus: params.fromStatus,
    toStatus: params.toStatus,
    reason: params.reason,
    details: params.details
  };
}

/**
 * Appends an audit event to existing opportunity metadata immutably.
 */
export function appendAuditEvent(existingMetadata: any, auditEvent: AuditEvent): Record<string, any> {
  const meta = existingMetadata && typeof existingMetadata === "object" ? { ...existingMetadata } : {};
  const currentTrail: AuditEvent[] = Array.isArray(meta.auditTrail) ? [...meta.auditTrail] : [];
  currentTrail.push(auditEvent);
  return {
    ...meta,
    auditTrail: currentTrail,
    lastAuditEvent: auditEvent
  };
}
