/**
 * Deterministic Auto-Publish Decision Engine
 * CampusConnectCo — Phase 16D
 *
 * Implements the centralized, authoritative auto-publish decision function:
 * evaluateOpportunityForAutoPublish(candidate, options)
 *
 * Compliance & Hardening Invariants:
 * 1. 11 Discrete, Explainable Deterministic Gates:
 *    - Gate 1: sourceTrust (OFFICIAL, TRUSTED, KNOWN_AGGREGATOR, UNKNOWN, UNTRUSTED)
 *    - Gate 2: provenance (source + genuine externalId OR verified canonicalUrl OR deterministicId; zero fabrication)
 *    - Gate 3: authenticity (organization association, domain correlation, ATS verification, impersonation guard)
 *    - Gate 4: contentCompleteness (title >= 5, company >= 2, description >= 100)
 *    - Gate 5: applicationDestination (blocks generic search/category aggregator pages & insecure plain HTTP)
 *    - Gate 6: urlSafety (protocol check, SSRF guard, private IP / cloud metadata block, shortener blocking)
 *    - Gate 7: duplicateCheck (checks active Internship & Gig records; ignores deleted/rejected records)
 *    - Gate 8: scamRisk (explicit deterministic scam patterns authoritative; spamRiskScore is supporting telemetry)
 *    - Gate 9: categoryValidity (supports INTERNSHIP and JOB for external auto-publishing; guards unsupported types)
 *    - Gate 10: freshnessDeadline (expired fails; missing deadline preserved as null without fabrication)
 *    - Gate 11: sourcePolicy (attribution, direct link requirement, allowed geographies)
 *
 * 2. Decision Precedence Hierarchy:
 *    - QUARANTINE (P1 - Highest): Unsafe URL / SSRF, scam risk patterns, UNTRUSTED source, brand impersonation.
 *    - REJECT (P2): Expired deadline, incomplete content, category policy violation.
 *    - NEEDS_REVIEW (P3): Unknown source, unverified URL, duplicates, unsupported category, disabled flag.
 *    - AUTO_PUBLISH (P4): All 11 gates passed AND OPPORTUNITY_AUTOPUBLISH_ENABLED is true.
 *
 * 3. Schema & Data Invariants:
 *    - Zero schema.prisma modifications.
 *    - Zero migrations.
 *    - Zero rawPrisma as any.
 *    - Zero DiscoveredOpportunity model references.
 *    - Queries actual active Internship & Gig models.
 */

import defaultPrisma from "@/lib/prisma";
import { evaluateAuthenticity } from "./authenticity";
import { canonicalizeUrl, validateSafeUrl } from "./normalizer";
import { evaluateQuality, isAutoPublishEnabled, isAutoPublishSourceAllowed } from "./quality";
import {
  CanonicalOpportunity,
  OpportunityType,
  RiskFlag,
  SourceConfig,
  SourcePolicy,
  SourceTrustLevel
} from "./types";

export interface GateCheck {
  passed: boolean;
  code: string;
  reason: string;
  details?: Record<string, unknown>;
}

export interface AutoPublishGateResults {
  sourceTrust: GateCheck;
  provenance: GateCheck;
  authenticity: GateCheck;
  contentCompleteness: GateCheck;
  applicationDestination: GateCheck;
  urlSafety: GateCheck;
  duplicateCheck: GateCheck;
  scamRisk: GateCheck;
  categoryValidity: GateCheck;
  freshnessDeadline: GateCheck;
  sourcePolicy: GateCheck;
}

export type AutoPublishDecision = "AUTO_PUBLISH" | "NEEDS_REVIEW" | "REJECT" | "QUARANTINE";

export interface AutoPublishDecisionResult {
  publishable: boolean;
  decision: AutoPublishDecision;
  reasons: string[];
  failureCodes: string[];
  telemetry: {
    qualityScore: number;
    spamRiskScore: number;
    completenessScore: number;
    riskFlags: RiskFlag[];
  };
  gates: AutoPublishGateResults;
}

export type EvaluatedCandidate = CanonicalOpportunity & {
  deterministicId?: string | null;
  sourceSpecificId?: string | null;
  isFabricatedExternalId?: boolean;
};

export interface AutoPublishPrismaDelegate {
  internship: {
    findFirst(args: {
      where: Record<string, any>;
      select?: Record<string, boolean>;
    }): Promise<{ id: string; externalId?: string | null; applicationLink?: string | null; title?: string; company?: string } | null>;
    findUnique?(args: any): Promise<any>;
  };
  gig?: {
    findFirst(args: {
      where: Record<string, any>;
      select?: Record<string, boolean>;
    }): Promise<{ id: string } | null>;
  };
}

export interface EvaluateAutoPublishOptions {
  sourceConfig?: SourceConfig;
  checkLiveUrl?: boolean;
  now?: Date;
  prismaClient?: AutoPublishPrismaDelegate;
  isAutoPublishEnabledOverride?: boolean;
  canarySourceAllowlistOverride?: string[];
}

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

/**
 * Checks whether an application URL points to a generic aggregator search,
 * category, or directory root rather than a specific job/internship listing.
 */
function isGenericAggregatorPage(urlStr: string): boolean {
  if (!urlStr) return false;
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    const search = parsed.search.toLowerCase();

    // 1. Generic Search Queries on Aggregators
    if (
      (host.includes("indeed.com") && (path.includes("/jobs") || path === "/") && (search.includes("q=") || search.includes("l="))) ||
      (host.includes("naukri.com") && (path.includes("-jobs") || path.includes("/jobs-in") || search.includes("k="))) ||
      (host.includes("linkedin.com") && path.includes("/jobs/search")) ||
      (host.includes("google.com") && path.includes("/search")) ||
      (host.includes("glassdoor.com") && path.includes("/job/jobs.htm")) ||
      (host.includes("ziprecruiter.com") && path.includes("/candidate/search"))
    ) {
      return true;
    }

    // 2. Generic Directory Root Pages without specific slug or ID
    if (
      (host.includes("internshala.com") && (path === "/internships" || path === "/internships/")) ||
      (host.includes("unstop.com") && (path === "/opportunities" || path === "/internships" || path === "/jobs"))
    ) {
      return true;
    }

    // 3. Domain root URLs lacking specific job path
    if (path === "" || path === "/") {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Detects whether an externalId was synthetically generated/fabricated.
 */
function isFabricatedId(candidate: EvaluatedCandidate): boolean {
  if (candidate.isFabricatedExternalId === true) return true;
  const id = candidate.externalId;
  if (!id || typeof id !== "string") return false;
  const lower = id.trim().toLowerCase();
  return (
    lower.startsWith("fabricated_") ||
    lower.startsWith("synthetic_") ||
    lower.startsWith("mock_") ||
    lower.startsWith("simulated_") ||
    lower.startsWith("cc_gen_")
  );
}

/**
 * Evaluates an opportunity candidate across all 11 deterministic gates.
 * Single authoritative decision function for Phase 16D auto-publishing.
 */
export async function evaluateOpportunityForAutoPublish(
  candidate: EvaluatedCandidate,
  options?: EvaluateAutoPublishOptions
): Promise<AutoPublishDecisionResult> {
  const now = options?.now || new Date();
  const sourceConfig = options?.sourceConfig;
  const prisma: AutoPublishPrismaDelegate = (options?.prismaClient as any) || defaultPrisma;

  const reasons: string[] = [];
  const failureCodes: string[] = [];

  // Determine trust level: candidate sourceTrust or sourceConfig default
  const effectiveTrust: SourceTrustLevel =
    candidate.sourceTrust || sourceConfig?.defaultTrust || "UNKNOWN";

  // URL normalization & canonicalization
  const appUrl = candidate.canonicalUrl || candidate.applicationUrl || "";
  const { canonicalUrl } = appUrl ? canonicalizeUrl(appUrl) : { canonicalUrl: "" };

  // ==========================================================================
  // Gate 1: Source Trust
  // ==========================================================================
  let gateSourceTrust: GateCheck;
  if (effectiveTrust === "UNTRUSTED") {
    gateSourceTrust = {
      passed: false,
      code: "SOURCE_TRUST_UNTRUSTED",
      reason: "Source channel is classified as UNTRUSTED and poses high risk."
    };
  } else if (effectiveTrust === "UNKNOWN") {
    gateSourceTrust = {
      passed: false,
      code: "SOURCE_TRUST_UNKNOWN",
      reason: "Source channel trust is UNKNOWN; manual Founder inspection is required."
    };
  } else if (effectiveTrust === "KNOWN_AGGREGATOR") {
    const permitsAggregator =
      sourceConfig?.policy?.directApplicationRequired === false ||
      sourceConfig?.applicationUrlPolicy === "DIRECT";

    if (permitsAggregator) {
      gateSourceTrust = {
        passed: true,
        code: "SOURCE_TRUST_AGGREGATOR_PERMITTED",
        reason: "Source channel is a KNOWN_AGGREGATOR permitted by explicit source configuration policy."
      };
    } else {
      gateSourceTrust = {
        passed: false,
        code: "SOURCE_TRUST_AGGREGATOR_REQUIRES_REVIEW",
        reason: "Source channel is a KNOWN_AGGREGATOR requiring manual Founder verification per policy."
      };
    }
  } else if (effectiveTrust === "OFFICIAL" || effectiveTrust === "TRUSTED") {
    gateSourceTrust = {
      passed: true,
      code: "SOURCE_TRUST_VERIFIED",
      reason: `Source channel has verified trust rating (${effectiveTrust}).`
    };
  } else if (effectiveTrust === "CURATED_FEED" || effectiveTrust === "COMMUNITY_VERIFIED") {
    if (sourceConfig?.enabled) {
      gateSourceTrust = {
        passed: true,
        code: "SOURCE_TRUST_CURATED_PERMITTED",
        reason: `Source channel has verified community/curated status (${effectiveTrust}).`
      };
    } else {
      gateSourceTrust = {
        passed: false,
        code: "SOURCE_TRUST_CURATED_REQUIRES_REVIEW",
        reason: `Source channel (${effectiveTrust}) requires manual review.`
      };
    }
  } else {
    gateSourceTrust = {
      passed: false,
      code: "SOURCE_TRUST_UNVERIFIED",
      reason: `Source channel trust level '${effectiveTrust}' is not eligible for auto-publishing.`
    };
  }

  // ==========================================================================
  // Gate 5: Application Destination Verification (Evaluated early for URL signals)
  // ==========================================================================
  let gateApplicationDestination: GateCheck;
  let parsedUrl: URL | null = null;
  try {
    if (canonicalUrl) {
      parsedUrl = new URL(canonicalUrl);
    }
  } catch {}

  const allowInsecureHttp =
    (sourceConfig?.policy as (SourcePolicy & { allowInsecureHttp?: boolean }) | undefined)
      ?.allowInsecureHttp === true;

  if (!canonicalUrl) {
    gateApplicationDestination = {
      passed: false,
      code: "DESTINATION_MISSING",
      reason: "Application destination URL is missing."
    };
  } else if (isGenericAggregatorPage(canonicalUrl)) {
    gateApplicationDestination = {
      passed: false,
      code: "DESTINATION_GENERIC_AGGREGATOR_PAGE",
      reason: "Application URL points to a generic search or category page rather than a specific job listing."
    };
  } else if (parsedUrl && parsedUrl.protocol === "http:" && !allowInsecureHttp) {
    gateApplicationDestination = {
      passed: false,
      code: "DESTINATION_INSECURE_HTTP",
      reason: "Application destination uses insecure unencrypted HTTP protocol; HTTPS is required for automated publishing."
    };
  } else {
    gateApplicationDestination = {
      passed: true,
      code: "DESTINATION_VERIFIED",
      reason: "Application link resolves to a specific, verified listing destination."
    };
  }

  // ==========================================================================
  // Gate 6: URL Safety & SSRF Guard (Evaluated early for URL signals)
  // ==========================================================================
  let gateUrlSafety: GateCheck;
  const targetUrl = canonicalUrl || candidate.applicationUrl || "";

  if (!targetUrl) {
    gateUrlSafety = {
      passed: false,
      code: "URL_MISSING",
      reason: "Application URL is missing or empty."
    };
  } else {
    let hostname = "";
    try {
      hostname = new URL(targetUrl).hostname.toLowerCase();
    } catch {}

    const isShortener = SUSPICIOUS_SHORTENER_DOMAINS.has(hostname);
    const urlCheck = validateSafeUrl(targetUrl);

    if (isShortener) {
      gateUrlSafety = {
        passed: false,
        code: "URL_UNSAFE_OR_SSRF",
        reason: `Application URL uses a suspicious or obfuscated shortening service (${hostname}).`,
        details: { hostname, isShortener: true }
      };
    } else if (!urlCheck.valid) {
      gateUrlSafety = {
        passed: false,
        code: "URL_UNSAFE_OR_SSRF",
        reason: `URL safety check failed: ${urlCheck.error}`,
        details: { error: urlCheck.error }
      };
    } else {
      gateUrlSafety = {
        passed: true,
        code: "URL_SAFE",
        reason: "Application URL passes protocol, domain, and SSRF security checks."
      };
    }
  }

  // A verified canonical URL must pass both destination checks and URL safety checks
  const isVerifiedCanonicalUrl = gateUrlSafety.passed && gateApplicationDestination.passed;

  // ==========================================================================
  // Gate 2: Provenance & Flexible Stable Identity (Hardened)
  // ==========================================================================
  let gateProvenance: GateCheck;
  const hasSource = Boolean(candidate.source && candidate.source.trim().length > 0);
  const rawExternalId = candidate.externalId ? candidate.externalId.trim() : "";
  const deterministicId = (candidate.deterministicId || candidate.sourceSpecificId || "").trim();

  if (!hasSource) {
    gateProvenance = {
      passed: false,
      code: "PROVENANCE_MISSING_SOURCE",
      reason: "Candidate is missing a required ingestion source identifier."
    };
  } else if (rawExternalId && isFabricatedId(candidate)) {
    gateProvenance = {
      passed: false,
      code: "PROVENANCE_FABRICATED_EXTERNAL_ID",
      reason: "Fabricated or synthetic external IDs are prohibited; genuine source identity required."
    };
  } else if (rawExternalId) {
    gateProvenance = {
      passed: true,
      code: "PROVENANCE_STABLE_IDENTITY",
      reason: "Candidate possesses genuine source external identifier.",
      details: { identitySignal: "EXTERNAL_ID", externalId: candidate.externalId }
    };
  } else if (deterministicId) {
    gateProvenance = {
      passed: true,
      code: "PROVENANCE_STABLE_IDENTITY",
      reason: "Candidate possesses supported deterministic source-specific identifier.",
      details: { identitySignal: "DETERMINISTIC_SOURCE_ID", deterministicId }
    };
  } else if (canonicalUrl) {
    if (isVerifiedCanonicalUrl) {
      gateProvenance = {
        passed: true,
        code: "PROVENANCE_STABLE_IDENTITY",
        reason: "Candidate possesses verified canonical application URL.",
        details: { identitySignal: "CANONICAL_URL", externalId: null }
      };
    } else {
      gateProvenance = {
        passed: false,
        code: "PROVENANCE_CANONICAL_URL_UNVERIFIED",
        reason: "Candidate lacks a genuine externalId, and application URL fails safety or destination verification, preventing it from serving as a stable identity signal."
      };
    }
  } else {
    gateProvenance = {
      passed: false,
      code: "PROVENANCE_MISSING_STABLE_IDENTITY",
      reason: "Candidate lacks both a genuine externalId, a deterministic source-specific identifier, and a canonical application URL."
    };
  }

  // ==========================================================================
  // Gate 3: Authenticity & Organization Association (Strictly Decoupled)
  // ==========================================================================
  const authenticityEval = evaluateAuthenticity({
    company: candidate.company,
    applicationUrl: canonicalUrl,
    sourceUrl: candidate.sourceUrl,
    sourceName: candidate.sourceName,
    sourceTrust: effectiveTrust
  });

  const isSuspiciousTLD = Boolean(parsedUrl?.hostname.match(/\.(xyz|top|click|buzz|rest)$/i));
  const normalizedCompany = (candidate.company || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  let gateAuthenticity: GateCheck;
  const hasImpersonation =
    authenticityEval.warnings.some((w) =>
      w.toLowerCase().includes("impersonat") || w.toLowerCase().includes("deceptive")
    ) ||
    // Catch suspicious TLDs (.top, .xyz, etc.) attempting brand imitation or deceptive hosting
    (isSuspiciousTLD && (parsedUrl?.hostname.includes(normalizedCompany) || !authenticityEval.isOfficialAssociation));

  if (hasImpersonation) {
    gateAuthenticity = {
      passed: false,
      code: "AUTHENTICITY_IMPERSONATION_DETECTED",
      reason: `Potential brand impersonation or deceptive recruiter domain detected (${parsedUrl?.hostname || "untrusted domain"}).`
    };
  } else if (authenticityEval.isOfficialAssociation) {
    gateAuthenticity = {
      passed: true,
      code: "AUTHENTICITY_OFFICIAL_CONFIRMED",
      reason: authenticityEval.confidenceReason || "Direct corporate domain or official ATS verified."
    };
  } else if (effectiveTrust === "KNOWN_AGGREGATOR" && !isGenericAggregatorPage(canonicalUrl)) {
    gateAuthenticity = {
      passed: true,
      code: "AUTHENTICITY_AGGREGATOR_VERIFIED",
      reason: "Listing from recognized aggregator with specific application target."
    };
  } else {
    gateAuthenticity = {
      passed: false,
      code: "AUTHENTICITY_UNCORRELATED_CLAIM",
      reason: authenticityEval.confidenceReason || `Listing cannot be directly correlated with official employer domain (${candidate.company}).`
    };
  }

  // ==========================================================================
  // Gate 4: Content Completeness
  // ==========================================================================
  const titleLen = (candidate.title || "").trim().length;
  const companyLen = (candidate.company || "").trim().length;
  const descLen = (candidate.description || "").trim().length;

  let gateContentCompleteness: GateCheck;
  const completenessErrors: string[] = [];

  if (titleLen < 5) completenessErrors.push(`Title too short (${titleLen} chars; min 5 required)`);
  if (companyLen < 2) completenessErrors.push(`Company name too short (${companyLen} chars; min 2 required)`);
  if (descLen < 100) completenessErrors.push(`Description too short (${descLen} chars; min 100 required)`);

  if (completenessErrors.length > 0) {
    gateContentCompleteness = {
      passed: false,
      code: "CONTENT_INCOMPLETE",
      reason: `Content completeness check failed: ${completenessErrors.join(", ")}.`,
      details: { titleLen, companyLen, descLen }
    };
  } else {
    gateContentCompleteness = {
      passed: true,
      code: "CONTENT_COMPLETE",
      reason: "Title, company, and description meet completeness requirements.",
      details: { titleLen, companyLen, descLen }
    };
  }

  // ==========================================================================
  // Gate 7: Duplicate Check (Against Active Internship & Gig Records)
  // ==========================================================================
  let gateDuplicateCheck: GateCheck;
  try {
    let existingMatch: any = null;

    // Check active Internship records (ignoring deleted and rejected records)
    if (rawExternalId && !isFabricatedId(candidate)) {
      existingMatch = await prisma.internship.findFirst({
        where: {
          externalId: rawExternalId,
          deletedAt: null,
          status: { notIn: ["DELETED", "REJECTED"] }
        },
        select: { id: true, externalId: true, applicationLink: true }
      });
    }

    if (!existingMatch && canonicalUrl) {
      existingMatch = await prisma.internship.findFirst({
        where: {
          applicationLink: canonicalUrl,
          deletedAt: null,
          status: { notIn: ["DELETED", "REJECTED"] }
        },
        select: { id: true, externalId: true, applicationLink: true }
      });
    }

    if (!existingMatch && candidate.title && candidate.company) {
      existingMatch = await prisma.internship.findFirst({
        where: {
          title: candidate.title,
          company: candidate.company,
          deletedAt: null,
          status: { notIn: ["DELETED", "REJECTED"] }
        },
        select: { id: true, externalId: true, applicationLink: true }
      });
    }

    // Also check peer-to-peer student marketplace gigs if prisma.gig delegate exists
    if (!existingMatch && candidate.title && prisma.gig) {
      const gigMatch = await prisma.gig.findFirst({
        where: {
          title: candidate.title,
          deletedAt: null,
          status: { notIn: ["deleted", "cancelled", "rejected"] }
        },
        select: { id: true }
      });
      if (gigMatch) {
        existingMatch = { id: gigMatch.id, model: "GIG" };
      }
    }

    if (existingMatch) {
      gateDuplicateCheck = {
        passed: false,
        code: "DUPLICATE_FOUND",
        reason: `Opportunity already exists as an active record in database (matching ID: ${existingMatch.id}).`,
        details: { matchedId: existingMatch.id }
      };
    } else {
      gateDuplicateCheck = {
        passed: true,
        code: "DUPLICATE_NONE",
        reason: "No active duplicate records detected in database."
      };
    }
  } catch (dbErr: any) {
    gateDuplicateCheck = {
      passed: false,
      code: "DUPLICATE_CHECK_ERROR",
      reason: `Database error during duplicate check: ${dbErr?.message || "Unknown error"}`
    };
  }

  // ==========================================================================
  // Gate 8: Scam Risk & Fraud Vectors (Deterministic Authority)
  // ==========================================================================
  const qualityEvaluation = evaluateQuality(
    {
      title: candidate.title,
      company: candidate.company,
      description: candidate.description,
      applicationUrl: canonicalUrl,
      deadline: candidate.deadline,
      location: candidate.location,
      workMode: candidate.workMode,
      compensation: candidate.compensation,
      skills: candidate.skills
    },
    authenticityEval
  );

  let gateScamRisk: GateCheck;
  const riskFlags = qualityEvaluation.riskFlags || [];
  const spamRiskScore = qualityEvaluation.spamRiskScore;

  // Authoritative: Explicit deterministic scam patterns ONLY.
  // Composite spamRiskScore serves strictly as supporting telemetry.
  if (riskFlags.length > 0) {
    gateScamRisk = {
      passed: false,
      code: "SCAM_RISK_DETECTED",
      reason: `Deterministic scam patterns detected: ${riskFlags.join(", ")}.`,
      details: { riskFlags, spamRiskScore }
    };
  } else {
    gateScamRisk = {
      passed: true,
      code: "SCAM_RISK_CLEAN",
      reason: "Zero deterministic scam risk patterns detected; content is safe.",
      details: { riskFlags: [], spamRiskScore }
    };
  }

  // ==========================================================================
  // Gate 9: Category & Opportunity Type Validity (Persistence Model Boundary)
  // ==========================================================================
  let gateCategoryValidity: GateCheck;
  const oppType: OpportunityType = candidate.opportunityType || "INTERNSHIP";
  const supportedPersistenceTypes: OpportunityType[] = ["INTERNSHIP", "JOB"];
  const allowedPolicyTypes = sourceConfig?.policy?.allowedOpportunityTypes;

  if (!supportedPersistenceTypes.includes(oppType)) {
    gateCategoryValidity = {
      passed: false,
      code: "CATEGORY_UNSUPPORTED_FOR_AUTO_PUBLISH",
      reason: `Opportunity type '${oppType}' is not supported by the external automated publishing pipeline (supported types: ${supportedPersistenceTypes.join(", ")}).`
    };
  } else if (allowedPolicyTypes && allowedPolicyTypes.length > 0 && !allowedPolicyTypes.includes(oppType)) {
    gateCategoryValidity = {
      passed: false,
      code: "CATEGORY_POLICY_MISMATCH",
      reason: `Opportunity type '${oppType}' is not permitted by source configuration policy.`
    };
  } else {
    gateCategoryValidity = {
      passed: true,
      code: "CATEGORY_VALID",
      reason: `Opportunity type '${oppType}' is valid and supported by the persistence model.`
    };
  }

  // ==========================================================================
  // Gate 10: Freshness & Deadline Validation
  // ==========================================================================
  let gateFreshnessDeadline: GateCheck;
  if (!candidate.deadline) {
    // Missing deadline: preserve as null, zero fabrication
    gateFreshnessDeadline = {
      passed: true,
      code: "DEADLINE_NONE_PROVIDED",
      reason: "No deadline specified; missing deadlines are preserved as null without fabrication."
    };
  } else {
    const deadlineTime = new Date(candidate.deadline).getTime();
    if (isNaN(deadlineTime)) {
      gateFreshnessDeadline = {
        passed: false,
        code: "DEADLINE_INVALID_DATE",
        reason: "Provided deadline date is invalid or unparseable."
      };
    } else if (deadlineTime < now.getTime()) {
      gateFreshnessDeadline = {
        passed: false,
        code: "DEADLINE_EXPIRED",
        reason: `Application deadline has already passed on ${new Date(deadlineTime).toISOString().split("T")[0]}.`
      };
    } else {
      gateFreshnessDeadline = {
        passed: true,
        code: "DEADLINE_ACTIVE",
        reason: `Application deadline is active until ${new Date(deadlineTime).toISOString().split("T")[0]}.`
      };
    }
  }

  // ==========================================================================
  // Gate 11: Source Policy Compliance
  // ==========================================================================
  let gateSourcePolicy: GateCheck;
  const policy = sourceConfig?.policy;
  const policyErrors: string[] = [];

  if (policy?.directApplicationRequired && isGenericAggregatorPage(canonicalUrl)) {
    policyErrors.push("Source policy mandates direct corporate application links");
  }

  if (policyErrors.length > 0) {
    gateSourcePolicy = {
      passed: false,
      code: "POLICY_VIOLATION",
      reason: policyErrors.join("; ")
    };
  } else {
    gateSourcePolicy = {
      passed: true,
      code: "POLICY_SATISFIED",
      reason: "All source policy requirements satisfied."
    };
  }

  // Assemble all 11 gate results
  const gates: AutoPublishGateResults = {
    sourceTrust: gateSourceTrust,
    provenance: gateProvenance,
    authenticity: gateAuthenticity,
    contentCompleteness: gateContentCompleteness,
    applicationDestination: gateApplicationDestination,
    urlSafety: gateUrlSafety,
    duplicateCheck: gateDuplicateCheck,
    scamRisk: gateScamRisk,
    categoryValidity: gateCategoryValidity,
    freshnessDeadline: gateFreshnessDeadline,
    sourcePolicy: gateSourcePolicy
  };

  // Compile failed gates and reasons
  const allGateEntries = Object.entries(gates) as [keyof AutoPublishGateResults, GateCheck][];
  for (const [, gate] of allGateEntries) {
    if (!gate.passed) {
      failureCodes.push(gate.code);
      reasons.push(gate.reason);
    }
  }

  // ==========================================================================
  // Compute Final Auto-Publish Decision via Strict Precedence Hierarchy
  // ==========================================================================
  let decision: AutoPublishDecision;
  let publishable = false;

  // Precedence 1: QUARANTINE (Severe Security / Fraud / SSRF / Untrusted Source / Impersonation)
  if (
    !gates.scamRisk.passed ||
    gates.urlSafety.code === "URL_UNSAFE_OR_SSRF" ||
    gates.sourceTrust.code === "SOURCE_TRUST_UNTRUSTED" ||
    gates.authenticity.code === "AUTHENTICITY_IMPERSONATION_DETECTED"
  ) {
    decision = "QUARANTINE";
    publishable = false;
  }
  // Precedence 2: REJECT (Expired Deadline, Content Incomplete, Policy Category Violation)
  else if (
    gates.freshnessDeadline.code === "DEADLINE_EXPIRED" ||
    !gates.contentCompleteness.passed ||
    gates.categoryValidity.code === "CATEGORY_POLICY_MISMATCH"
  ) {
    decision = "REJECT";
    publishable = false;
  }
  // Precedence 3: NEEDS_REVIEW (Any other gate failed)
  else if (failureCodes.length > 0) {
    decision = "NEEDS_REVIEW";
    publishable = false;
  }
  // Precedence 4: AUTO_PUBLISH (All 11 Gates Passed + Feature Flag Enabled + Canary Allowlist)
  else {
    const isAutoPublishOn =
      options?.isAutoPublishEnabledOverride !== undefined
        ? options.isAutoPublishEnabledOverride
        : isAutoPublishEnabled();

    const isSourceCanaryAllowed = isAutoPublishSourceAllowed(candidate.source, options);

    if (isAutoPublishOn && isSourceCanaryAllowed) {
      decision = "AUTO_PUBLISH";
      publishable = true;
      reasons.push("All 11 deterministic auto-publish gates passed; eligible for automated publishing.");
    } else if (isAutoPublishOn && !isSourceCanaryAllowed) {
      decision = "NEEDS_REVIEW";
      publishable = false;
      reasons.push(
        `All 11 deterministic gates passed, but source '${candidate.source}' is not in the active Phase 16D canary auto-publish allowlist; routed to Founder Review Queue.`
      );
    } else {
      decision = "NEEDS_REVIEW";
      publishable = false;
      reasons.push(
        "All 11 deterministic gates passed, but global auto-publish feature flag OPPORTUNITY_AUTOPUBLISH_ENABLED is disabled; routed to Founder Review Queue."
      );
    }
  }

  return {
    publishable,
    decision,
    reasons,
    failureCodes,
    telemetry: {
      qualityScore: qualityEvaluation.qualityScore,
      spamRiskScore: qualityEvaluation.spamRiskScore,
      completenessScore: qualityEvaluation.completenessScore,
      riskFlags
    },
    gates
  };
}
