/**
 * Verification Policy Gate
 *
 * Implements strict rules for verification transitions:
 * 1. AI cannot claim verification without verifiable evidence.
 * 2. Source trust ≠ Opportunity authenticity ≠ Application destination verification.
 * 3. Disputed or invalid destination immediately blocks verified state.
 */

import { AgentPolicyResult, VerificationDecisionData } from "../core/types";

export function evaluateVerificationPolicy(decision: VerificationDecisionData): AgentPolicyResult {
  const violations: string[] = [];
  const reasons: string[] = [];

  // Rule 1: Evidence requirement
  if (!decision.primaryEvidence || decision.primaryEvidence.length === 0) {
    violations.push("Verification claim rejected: No supporting evidence provided");
  } else {
    reasons.push(`Evidence verified: ${decision.primaryEvidence.length} items logged`);
  }

  // Rule 2: Application destination validity
  if (decision.applicationDestination === "INVALID") {
    violations.push("Verification rejected: Application destination failed safety or reachability check");
  } else if (decision.applicationDestination === "UNVERIFIED" && decision.overallVerified) {
    violations.push("Verification rejected: Cannot mark overall verified while application destination is UNVERIFIED");
  } else {
    reasons.push("Application destination verified");
  }

  // Rule 3: Opportunity Authenticity check
  if (decision.opportunityAuthenticity === "DISPUTED") {
    violations.push("Verification rejected: Opportunity authenticity is disputed");
  } else if (decision.opportunityAuthenticity === "UNVERIFIED" && decision.overallVerified) {
    violations.push("Verification rejected: Cannot mark overall verified while authenticity is UNVERIFIED");
  }

  // Rule 4: Source Trust threshold
  if ((decision.sourceTrust === "UNKNOWN" || decision.sourceTrust === "LOW") && decision.overallVerified) {
    violations.push(`Verification rejected: Source trust is ${decision.sourceTrust} (requires MEDIUM or HIGH)`);
  }

  // Rule 5: Confidence threshold
  if (decision.confidenceScore < 0.70 && decision.overallVerified) {
    violations.push(`Verification rejected: Confidence score ${decision.confidenceScore.toFixed(2)} is below minimum 0.70 threshold`);
  }

  const allowed = violations.length === 0;

  return {
    allowed,
    policyName: "VerificationPolicy",
    reasons,
    violations
  };
}
