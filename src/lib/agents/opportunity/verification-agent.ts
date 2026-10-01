/**
 * Agent 2 — Verification Agent
 *
 * Implements the CampusConnectCo Phase-16D Architectural Invariant:
 * SOURCE TRUST ≠ OPPORTUNITY AUTHENTICITY ≠ APPLICATION DESTINATION VERIFICATION
 *
 * Responsibilities:
 * 1. Evaluate Source Trust (UNKNOWN, LOW, MEDIUM, HIGH)
 * 2. Evaluate Opportunity Authenticity (UNVERIFIED, VERIFIED, DISPUTED)
 * 3. Evaluate Application Destination (UNVERIFIED, VERIFIED, INVALID)
 * 4. Preserves concrete evidence records with hashes and timestamps.
 * 5. Passes decisions through the Verification Policy Gate.
 */

import crypto from "crypto";
import { BaseAgent } from "../core/agent";
import { AgentAIProvider } from "../core/ai-provider";
import {
  AgentApplicationDestination,
  AgentContext,
  AgentMetadata,
  AgentOpportunityAuthenticity,
  AgentSourceTrust,
  SourceEvidenceRecord,
  VerificationDecisionData
} from "../core/types";
import { evaluateAuthenticity } from "@/lib/automation/authenticity";
import { canonicalizeUrl, validateSafeUrl } from "@/lib/automation/normalizer";
import { evaluateVerificationPolicy } from "../policies/verification-policy";

export interface VerificationAgentInput {
  opportunityId?: string;
  title: string;
  company: string;
  sourceUrl?: string;
  sourceName?: string;
  applicationUrl: string;
  description?: string;
}

export class VerificationAgent extends BaseAgent<VerificationAgentInput, VerificationDecisionData> {
  public readonly metadata: AgentMetadata = {
    name: "VerificationAgent",
    type: "VERIFICATION",
    version: "1.0.0",
    description: "Evaluates tri-dimensional verification: Source Trust, Authenticity, and Application Destination with evidence.",
    timeoutMs: 25000
  };

  constructor(aiProvider?: AgentAIProvider) {
    super(aiProvider);
  }

  protected async executeInternal(input: VerificationAgentInput, context: AgentContext): Promise<VerificationDecisionData> {
    const oppId = input.opportunityId || context.entityId;
    const evidenceList: SourceEvidenceRecord[] = [];
    const reasons: string[] = [];
    const destinationRiskFlags: string[] = [];

    // =========================================================================
    // Dimension 1: Source Trust Evaluation
    // =========================================================================
    let sourceTrust: AgentSourceTrust = "UNKNOWN";
    const srcUrl = input.sourceUrl || "";
    const srcName = input.sourceName || "";

    const authenticityEval = evaluateAuthenticity({
      company: input.company,
      applicationUrl: input.applicationUrl,
      sourceUrl: srcUrl,
      sourceName: srcName
    });

    if (authenticityEval.sourceTrust === "OFFICIAL") {
      sourceTrust = "HIGH";
    } else if (authenticityEval.sourceTrust === "TRUSTED" || authenticityEval.sourceTrust === "CURATED_FEED") {
      sourceTrust = "MEDIUM";
    } else if (authenticityEval.sourceTrust === "KNOWN_AGGREGATOR" || authenticityEval.sourceTrust === "COMMUNITY_VERIFIED") {
      sourceTrust = "LOW";
    } else if (authenticityEval.sourceTrust === "UNTRUSTED") {
      sourceTrust = "LOW";
    } else {
      sourceTrust = "UNKNOWN";
    }

    if (srcUrl) {
      const srcHash = crypto.createHash("sha256").update(srcUrl).digest("hex");
      const srcEvidence: SourceEvidenceRecord = {
        opportunityId: oppId,
        sourceUrl: srcUrl,
        evidenceType: "SOURCE_DISCOVERY_CHANNEL",
        contentHash: srcHash,
        observedAt: new Date(),
        metadata: {
          sourceName: srcName,
          channelTrust: authenticityEval.sourceTrust,
          mappedTrust: sourceTrust
        }
      };
      evidenceList.push(srcEvidence);
      this.recordEvidence(srcEvidence);
    }

    // =========================================================================
    // Dimension 2: Application Destination Verification (Safety & Legitimacy)
    // =========================================================================
    let appDestination: AgentApplicationDestination = "UNVERIFIED";
    const urlCheck = validateSafeUrl(input.applicationUrl);

    if (!urlCheck.valid) {
      appDestination = "INVALID";
      destinationRiskFlags.push(urlCheck.error || "Blocked URL scheme or private IP");
    } else {
      const cleanUrl = urlCheck.cleanUrl || input.applicationUrl;
      const { canonicalUrl, hash } = canonicalizeUrl(cleanUrl);

      // Check for known URL shorteners or suspicious chat redirects
      const lower = canonicalUrl.toLowerCase();
      if (
        lower.includes("bit.ly") ||
        lower.includes("tinyurl.com") ||
        lower.includes("t.me") ||
        lower.includes("wa.me")
      ) {
        appDestination = "INVALID";
        destinationRiskFlags.push("Destination uses untrusted shortener or direct messenger link");
      } else {
        appDestination = "VERIFIED";
        const destEvidence: SourceEvidenceRecord = {
          opportunityId: oppId,
          sourceUrl: canonicalUrl,
          evidenceType: "APPLICATION_DESTINATION_CHECK",
          contentHash: hash,
          observedAt: new Date(),
          metadata: {
            validProtocol: true,
            isSsrfSafe: true,
            isCanonical: true
          }
        };
        evidenceList.push(destEvidence);
        this.recordEvidence(destEvidence);
      }
    }

    // =========================================================================
    // Dimension 3: Opportunity Authenticity Evaluation
    // =========================================================================
    let oppAuthenticity: AgentOpportunityAuthenticity = "UNVERIFIED";

    if (authenticityEval.isOfficialAssociation) {
      oppAuthenticity = "VERIFIED";
      reasons.push(authenticityEval.confidenceReason);

      const authEvidence: SourceEvidenceRecord = {
        opportunityId: oppId,
        sourceUrl: input.applicationUrl,
        evidenceType: "OFFICIAL_ORGANIZATION_ASSOCIATION",
        observedAt: new Date(),
        metadata: {
          reason: authenticityEval.confidenceReason
        }
      };
      evidenceList.push(authEvidence);
      this.recordEvidence(authEvidence);
    } else if (authenticityEval.warnings && authenticityEval.warnings.length > 0) {
      if (authenticityEval.warnings.some((w) => w.toLowerCase().includes("impersonation") || w.toLowerCase().includes("untrusted"))) {
        oppAuthenticity = "DISPUTED";
      } else {
        oppAuthenticity = "UNVERIFIED";
      }
      reasons.push(...authenticityEval.warnings);
    } else {
      oppAuthenticity = "UNVERIFIED";
      reasons.push(authenticityEval.confidenceReason || "Aggregated opportunity without direct ATS domain association");
    }

    // Determine overall verified candidate
    const overallVerifiedCandidate =
      oppAuthenticity === "VERIFIED" &&
      appDestination === "VERIFIED" &&
      (sourceTrust === "HIGH" || sourceTrust === "MEDIUM");

    const confidenceScore = overallVerifiedCandidate
      ? 0.95
      : oppAuthenticity === "VERIFIED"
      ? 0.80
      : oppAuthenticity === "DISPUTED"
      ? 0.20
      : 0.50;

    const decisionData: VerificationDecisionData = {
      sourceTrust,
      opportunityAuthenticity: oppAuthenticity,
      applicationDestination: appDestination,
      overallVerified: overallVerifiedCandidate,
      confidenceScore,
      primaryEvidence: evidenceList.map((e) => `${e.evidenceType}: ${e.sourceUrl}`),
      disputeReasons: oppAuthenticity === "DISPUTED" ? reasons : undefined,
      destinationRiskFlags: destinationRiskFlags.length > 0 ? destinationRiskFlags : undefined,
      evidenceRecords: evidenceList
    };

    // Pass through Verification Policy Gate
    const policyResult = evaluateVerificationPolicy(decisionData);
    if (!policyResult.allowed) {
      decisionData.overallVerified = false;
      this.recordDecision({
        agentRunId: context.runId,
        decisionType: "POLICY_GATE_REJECTION",
        decision: "REJECTED_BY_POLICY",
        reason: policyResult.violations.join("; "),
        confidence: 1.0,
        factors: { violations: policyResult.violations }
      });
    }

    // Record authoritative verification decision
    this.recordDecision({
      agentRunId: context.runId,
      decisionType: "TRI_DIMENSIONAL_VERIFICATION",
      decision: `Source: ${sourceTrust} | Auth: ${oppAuthenticity} | Dest: ${appDestination} | Overall: ${decisionData.overallVerified ? "VERIFIED" : "UNVERIFIED"}`,
      reason: `Authenticity evaluated: ${authenticityEval.confidenceReason}. Destination safe: ${appDestination === "VERIFIED"}.`,
      confidence: confidenceScore,
      factors: {
        sourceTrust,
        opportunityAuthenticity: oppAuthenticity,
        applicationDestination: appDestination,
        evidenceCount: evidenceList.length,
        policyPassed: policyResult.allowed
      }
    });

    return decisionData;
  }
}
