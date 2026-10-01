/**
 * Publishing Policy Gate
 *
 * Implements deterministic safety and completeness gates before any opportunity
 * can be approved for public discovery or publishing.
 */

import { AgentPolicyResult, OpportunityIntelligenceData, VerificationDecisionData } from "../core/types";

export interface PublishingCandidateInput {
  title: string;
  company: string;
  description: string;
  applicationLink?: string | null;
  intelligence?: OpportunityIntelligenceData | null;
  verification?: VerificationDecisionData | null;
}

const FORBIDDEN_SCAM_KEYWORDS = [
  "pay to apply",
  "registration fee",
  "processing fee",
  "security deposit",
  "send bitcoin",
  "send usdt",
  "whatsapp only",
  "telegram only",
  "earn 50000 daily with no work",
  "guaranteed job after fee"
];

export function evaluatePublishingPolicy(candidate: PublishingCandidateInput): AgentPolicyResult {
  const violations: string[] = [];
  const reasons: string[] = [];

  // Gate 1: Content completeness
  if (!candidate.title || candidate.title.trim().length < 3) {
    violations.push("Title must be at least 3 characters");
  }
  if (!candidate.company || candidate.company.trim().length < 2) {
    violations.push("Company must be at least 2 characters");
  }
  if (!candidate.description || candidate.description.trim().length < 20) {
    violations.push("Description must be at least 20 characters");
  }

  // Gate 2: Application link requirement
  if (!candidate.applicationLink || candidate.applicationLink.trim().length === 0) {
    violations.push("Application link is required for external opportunities");
  } else {
    reasons.push("Application link present");
  }

  // Gate 3: Scam keyword detection
  const fullText = `${candidate.title} ${candidate.company} ${candidate.description}`.toLowerCase();
  for (const scamTerm of FORBIDDEN_SCAM_KEYWORDS) {
    if (fullText.includes(scamTerm)) {
      violations.push(`Scam pattern detected: "${scamTerm}"`);
    }
  }

  // Gate 4: Verification status check (if verification data provided)
  if (candidate.verification) {
    if (candidate.verification.applicationDestination === "INVALID") {
      violations.push("Publishing blocked: Application destination classified as INVALID");
    }
    if (candidate.verification.opportunityAuthenticity === "DISPUTED") {
      violations.push("Publishing blocked: Opportunity authenticity is DISPUTED");
    }
  }

  const allowed = violations.length === 0;
  if (allowed) {
    reasons.push("All publishing policy criteria satisfied");
  }

  return {
    allowed,
    policyName: "PublishingPolicy",
    reasons,
    violations
  };
}
