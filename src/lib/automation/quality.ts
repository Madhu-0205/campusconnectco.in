/**
 * Deterministic Opportunity Quality Scoring & Auto-Publish Evaluator
 * CampusConnectCo — Phase 16
 *
 * Implements strict separation:
 * SOURCE TRUST ≠ VERIFICATION ≠ QUALITY
 *
 * A high quality score must NEVER automatically make an opportunity official.
 * A trusted aggregator is NEVER equivalent to official source confirmation.
 * Auto-publishing is feature-gated (OPPORTUNITY_AUTOPUBLISH_ENABLED) and strictly requires:
 * 1. verificationState === OFFICIAL_SOURCE_CONFIRMED
 * 2. qualityScore >= 75
 * 3. valid application URL
 * 4. opportunity is currently active
 * 5. no critical warnings
 * 6. deduplication passed
 * 7. source is healthy
 * 8. organization association is established
 *
 * TRUSTED but not officially confirmed:
 * → Founder Review Queue (NEEDS_REVIEW).
 *
 * UNKNOWN / UNVERIFIED:
 * → Review or Reject depending on risk.
 */

import { AuthenticityEvaluation, QualityEvaluation, RiskFlag, SourceTrustLevel, LifecycleState, OpportunityStatus } from "./types";

const SUSPICIOUS_SHORTENER_DOMAINS = new Set([
  "bit.ly",
  "tinyurl.com",
  "rb.gy",
  "shorturl.at",
  "cutt.ly",
  "is.gd",
  "t.co",
  "ow.ly",
  "buff.ly"
]);

const DISPOSABLE_EMAIL_DOMAINS = [
  "tempmail.com",
  "guerrillamail.com",
  "mailinator.com",
  "10minutemail.com",
  "throwawaymail.com",
  "yopmail.com"
];

/**
 * Checks whether global auto-publishing is enabled via environment gate.
 * Always defaults to false for controlled rollout.
 */
export function isAutoPublishEnabled(): boolean {
  return process.env.OPPORTUNITY_AUTOPUBLISH_ENABLED === "true";
}

/**
 * Computes deterministic quality score (0 to 100) and extracts explicit risk flags.
 */
export function evaluateQuality(
  candidate: {
    title: string;
    company: string;
    description: string;
    applicationUrl: string;
    location?: string | null;
    workMode?: string | null;
    deadline?: Date | null;
    compensation?: number | null;
    skills?: string | null;
  },
  authenticity: AuthenticityEvaluation,
  options?: {
    isDuplicate?: boolean;
    hasPromptInjectionFlag?: boolean;
    hasSsrfFlag?: boolean;
    isSourceHealthy?: boolean;
    sourceTrust?: SourceTrustLevel;
    lifecycleState?: LifecycleState;
  }
): QualityEvaluation {
  const warnings: string[] = [...authenticity.warnings];
  const reasons: string[] = [];
  const riskFlags: RiskFlag[] = [];

  let score = 50; // Base score
  let completeness = 0;
  let spamRisk = 0;

  const fullContent = `${candidate.title} ${candidate.description} ${candidate.company}`.toLowerCase();
  let appUrlHost = "";
  try {
    appUrlHost = new URL(candidate.applicationUrl).hostname.toLowerCase();
  } catch {}

  // --------------------------------------------------------------------------
  // 1. Deterministic Suspicious Opportunity & Scam Detection (18 Risk Flags)
  // --------------------------------------------------------------------------
  if (/\b(pay\s+to\s+apply|application\s+fee|fee\s+required\s+to\s+apply)\b/i.test(fullContent)) {
    riskFlags.push("PAY_TO_APPLY");
  }
  if (/\b(registration\s+fee|registration\s+charges?)\b/i.test(fullContent)) {
    riskFlags.push("REGISTRATION_FEE");
  }
  if (/\b(security\s+deposit|refundable\s+deposit)\b/i.test(fullContent)) {
    riskFlags.push("SECURITY_DEPOSIT");
  }
  if (/\b(bitcoin|usdt|ethereum|crypto(currency)?|binance|metamask)\b/i.test(fullContent)) {
    riskFlags.push("CRYPTO_PAYMENT");
  }
  if (/\b(gift\s+cards?|amazon\s+gift\s+card|apple\s+gift\s+card)\b/i.test(fullContent)) {
    riskFlags.push("GIFT_CARD_PAYMENT");
  }
  if (
    /(?:whatsapp\s*:|\b(?:contact\s+(?:us\s+)?(?:on|via)\s+whatsapp|apply\s+via\s+whatsapp|whatsapp\s+only|whatsapp\s+us\s+at)\b|wa\.me\/)/i.test(fullContent) ||
    candidate.applicationUrl.includes("wa.me")
  ) {
    riskFlags.push("WHATSAPP_ONLY");
  }
  if (
    /(?:telegram\s*:|\b(?:contact\s+(?:us\s+)?(?:on|via)\s+telegram|apply\s+via\s+telegram|telegram\s+only|telegram\s+channel)\b|t\.me\/)/i.test(fullContent) ||
    candidate.applicationUrl.includes("t.me/")
  ) {
    riskFlags.push("TELEGRAM_ONLY");
  }
  if (SUSPICIOUS_SHORTENER_DOMAINS.has(appUrlHost)) {
    riskFlags.push("SUSPICIOUS_SHORTENER");
  }
  if (/\b(enter\s+your\s+password|login\s+to\s+your\s+bank|send\s+your\s+otp)\b/i.test(fullContent)) {
    riskFlags.push("CREDENTIAL_HARVESTING");
  }
  if (/\b(bank\s+account\s+number|account\s+number\s+and\s+ifsc|routing\s+number|debit\s+card\s+details)\b/i.test(fullContent)) {
    riskFlags.push("BANK_ACCOUNT_REQUEST");
  }
  if (/\b(your\s+email\s+password|account\s+password|master\s+password)\b/i.test(fullContent)) {
    riskFlags.push("PASSWORD_REQUEST");
  }
  if (DISPOSABLE_EMAIL_DOMAINS.some((d) => fullContent.includes(d))) {
    riskFlags.push("DISPOSABLE_EMAIL");
  }
  if (/\b(guaranteed\s+(?:income|\$|₹|\d+|salary|earnings|return)|earn\s+₹?\d+\s+daily\s+guaranteed|100%\s+guaranteed\s+job|no\s+risk\s+income)\b/i.test(fullContent)) {
    riskFlags.push("GUARANTEED_INCOME");
  }
  if (/\b(direct\s+selection|immediate\s+hiring\s+no\s+interview|no\s+interview\s+(?:required|needed))\b/i.test(fullContent)) {
    riskFlags.push("DIRECT_SELECTION_CLAIM");
  }
  if (/\b(multi[- ]level\s+(?:marketing|recruitment)|mlm|downline|upline)\b/i.test(fullContent)) {
    riskFlags.push("MLM");
  }
  if (/\b(network\s+marketing|refer\s+\d+\s+friends\s+to\s+earn)\b/i.test(fullContent)) {
    riskFlags.push("NETWORK_MARKETING");
  }
  if (/\b(pay\s+for\s+training|training\s+fee|purchase\s+(?:our\s+)?.*training|pay\s+₹?\d+\s+for\s+training)\b/i.test(fullContent)) {
    riskFlags.push("PAY_FOR_TRAINING");
  }
  if (appUrlHost.endsWith(".xyz") || appUrlHost.endsWith(".top") || appUrlHost.endsWith(".click") || appUrlHost.endsWith(".buzz")) {
    if (!authenticity.isOfficialAssociation) {
      riskFlags.push("SUSPICIOUS_RECRUITER_DOMAIN");
    }
  }

  // If any critical risk flags detected, immediately zero quality and maximize risk
  if (riskFlags.length > 0) {
    spamRisk = 100;
    score = 0;
    warnings.push(`Suspicious scam vector detected: ${riskFlags.join(", ")}. Immediate quarantine.`);
    return {
      qualityScore: 0,
      spamRiskScore: 100,
      isEligibleForAutoPublish: false,
      completenessScore: 0,
      warnings,
      reasons: [],
      riskFlags
    };
  }

  // --------------------------------------------------------------------------
  // 2. Completeness Evaluation
  // --------------------------------------------------------------------------
  if (candidate.title && candidate.title.length >= 5) completeness += 10;
  if (candidate.company && candidate.company.length >= 2) completeness += 10;

  // Application URL
  const hasValidAppUrl = Boolean(
    candidate.applicationUrl &&
    (candidate.applicationUrl.startsWith("http://") || candidate.applicationUrl.startsWith("https://")) &&
    !candidate.applicationUrl.includes("localhost") &&
    !candidate.applicationUrl.includes("127.0.0.1")
  );

  if (hasValidAppUrl) {
    completeness += 15;
    score += 10;
  } else {
    warnings.push("Missing or invalid application URL.");
    score -= 25;
  }

  // Description length & detail
  const descLen = (candidate.description || "").length;
  if (descLen >= 300) {
    completeness += 25;
    score += 10;
    reasons.push("Comprehensive, detailed job description provided.");
  } else if (descLen >= 100) {
    completeness += 15;
    score += 5;
  } else if (descLen < 60) {
    warnings.push("Description is very brief or incomplete.");
    score -= 25;
  }

  // Deadline validity
  let isDeadlineActive = true;
  if (candidate.deadline) {
    const now = new Date();
    if (candidate.deadline.getTime() > now.getTime()) {
      completeness += 15;
      score += 10;
      reasons.push("Explicit active future deadline provided.");
    } else {
      isDeadlineActive = false;
      warnings.push("Deadline timestamp has already expired.");
      score -= 35;
    }
  }

  // Location / Work mode
  if (candidate.location || (candidate.workMode && candidate.workMode !== "all")) {
    completeness += 10;
    score += 10;
  }

  // Compensation
  if (candidate.compensation && candidate.compensation > 0) {
    completeness += 10;
    score += 10;
    reasons.push(`Explicit compensation specified (₹${candidate.compensation}).`);
  }

  // Skills
  if (candidate.skills && candidate.skills.length > 0) {
    completeness += 5;
    score += 5;
  }

  // ALL CAPS penalty
  const upperCount = (candidate.title.match(/[A-Z]/g) || []).length;
  if (candidate.title.length > 10 && upperCount / candidate.title.length > 0.6) {
    spamRisk += 20;
    score -= 15;
    warnings.push("Excessive ALL CAPS formatting in title.");
  }

  // Security flags
  if (options?.hasPromptInjectionFlag) {
    spamRisk = 100;
    score = 0;
    warnings.push("Prompt-injection instructions were detected in untrusted content.");
  }
  if (options?.hasSsrfFlag) {
    spamRisk = 100;
    score = 0;
    warnings.push("Destination URL resolved to a restricted internal network address.");
  }
  if (options?.isDuplicate) {
    warnings.push("Opportunity identified as a duplicate of an existing record.");
  }

  // Bound score [0, 100]
  score = Math.max(0, Math.min(100, Math.round(score)));
  spamRisk = Math.max(0, Math.min(100, Math.round(spamRisk)));

  // --------------------------------------------------------------------------
  // 3. Strict Auto-Publish Eligibility Check (Phase 16 Rules)
  // --------------------------------------------------------------------------
  const isGlobalAutoPublishOn = isAutoPublishEnabled();
  const hasCriticalWarning = warnings.some(
    (w) =>
      w.includes("scam") ||
      w.includes("restricted") ||
      w.includes("Prompt-injection") ||
      w.includes("already expired")
  );

  const effectiveTrust = options?.sourceTrust ?? (authenticity as any).sourceTrust ?? "UNKNOWN";
  const effectiveLifecycle = options?.lifecycleState ?? "ACTIVE";

  const isEligibleForAutoPublish =
    isGlobalAutoPublishOn &&
    riskFlags.length === 0 &&
    !options?.isDuplicate &&
    !options?.hasPromptInjectionFlag &&
    !options?.hasSsrfFlag &&
    options?.isSourceHealthy !== false &&
    effectiveLifecycle === "ACTIVE" &&
    (effectiveTrust === "OFFICIAL" || effectiveTrust === "TRUSTED") &&
    isDeadlineActive &&
    hasValidAppUrl &&
    score >= 75 &&
    spamRisk < 20 &&
    authenticity.verificationState === "OFFICIAL_SOURCE_CONFIRMED" &&
    authenticity.isOfficialAssociation === true &&
    !hasCriticalWarning;

  return {
    qualityScore: score,
    spamRiskScore: spamRisk,
    isEligibleForAutoPublish,
    completenessScore: completeness,
    warnings,
    reasons,
    riskFlags
  };
}

/**
 * Determines the routing status for an evaluated opportunity:
 * - REJECTED: Spam risk >= 60, risk flags, or security flags
 * - APPROVED: Strictly eligible for auto-publishing (disabled in Phase 16B)
 * - NEEDS_REVIEW: Trusted or unknown sources requiring Founder inspection
 */
export function determineOpportunityRouting(
  quality: QualityEvaluation,
  authenticity: AuthenticityEvaluation,
  isDuplicate?: boolean
): OpportunityStatus {
  if (isDuplicate) return "REJECTED";
  if (quality.riskFlags && quality.riskFlags.length > 0) return "REJECTED";
  if (quality.spamRiskScore >= 60) return "REJECTED";
  if (quality.qualityScore < 30) return "REJECTED";

  // Auto-publish eligible is only possible if all strict criteria met + env gate on
  if (quality.isEligibleForAutoPublish) {
    return "APPROVED";
  }

  // All other valid opportunities route to Founder Review Queue
  return "NEEDS_REVIEW";
}

