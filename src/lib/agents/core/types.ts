/**
 * Core Types for CampusConnectCo AI Agent System
 *
 * Implements strict separation:
 * SOURCE TRUST ≠ OPPORTUNITY AUTHENTICITY ≠ APPLICATION DESTINATION VERIFICATION
 *
 * Preserves deterministic invariants, auditability, and multi-model flexibility.
 */

export type AgentStatus = "IDLE" | "RUNNING" | "COMPLETED" | "FAILED" | "TIMEOUT";

export type AgentType =
  | "OPPORTUNITY_INTELLIGENCE"
  | "VERIFICATION"
  | "MATCHING"
  | "MONITORING"
  | "ORCHESTRATOR";

/**
 * Three independent dimensions of opportunity verification:
 * Dimension 1: Source Trust (trustworthiness of discovery origin)
 * Dimension 2: Opportunity Authenticity (whether the opportunity actually exists and is genuine)
 * Dimension 3: Application Destination (safety and legitimacy of application target URL)
 */
export type AgentSourceTrust = "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH";
export type AgentOpportunityAuthenticity = "UNVERIFIED" | "VERIFIED" | "DISPUTED";
export type AgentApplicationDestination = "UNVERIFIED" | "VERIFIED" | "INVALID";

export interface AgentMetadata {
  name: string;
  type: AgentType;
  version: string;
  description: string;
  timeoutMs: number;
}

export interface AgentContext {
  runId: string;
  agentType: AgentType;
  entityType: "OPPORTUNITY" | "STUDENT" | "APPLICATION" | "SYSTEM";
  entityId: string;
  startedAt: Date;
  model?: string;
  timeoutMs: number;
  metadata?: Record<string, unknown>;
  traceLogs: Array<{
    timestamp: Date;
    level: "INFO" | "WARN" | "ERROR";
    message: string;
    details?: Record<string, unknown>;
  }>;
}

export interface AgentResult<T = unknown> {
  success: boolean;
  runId: string;
  agentType: AgentType;
  status: AgentStatus;
  data: T | null;
  decisions: AgentDecisionRecord[];
  evidence: SourceEvidenceRecord[];
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
  durationMs: number;
  modelUsed?: string;
}

export interface AgentDecisionRecord {
  id?: string;
  agentRunId?: string;
  decisionType: string;
  decision: string;
  reason: string;
  confidence: number; // 0.0 to 1.0
  factors?: Record<string, unknown>;
  createdAt: Date;
}

export interface SourceEvidenceRecord {
  id?: string;
  opportunityId: string;
  sourceUrl: string;
  evidenceType: string;
  contentHash?: string;
  observedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface AgentRunRecord {
  id: string;
  agentType: string;
  entityType: string;
  entityId: string;
  status: AgentStatus;
  startedAt: Date;
  completedAt?: Date;
  model?: string;
  inputSummary?: string;
  outputSummary?: string;
  error?: string;
}

/**
 * Agent 1: Structured Opportunity Intelligence Payload
 */
export interface OpportunityIntelligenceData {
  title: string;
  organization: string;
  opportunityType: "INTERNSHIP" | "JOB" | "GIG" | "HACKATHON" | "FELLOWSHIP" | "SCHOLARSHIP" | "RESEARCH" | "APPRENTICESHIP" | "EVENT" | "OTHER";
  subtypes: string[];
  skills: string[];
  eligibility: {
    degrees: string[];
    branches: string[];
    graduationYears: number[];
    minGpa: number | null;
    rawText: string | null;
  };
  experienceRequirements: string | null;
  location: {
    city: string | null;
    state: string | null;
    country: string | null;
    isRemote: boolean;
  };
  workMode: "remote" | "hybrid" | "on-site";
  compensation: {
    stipend: number | null;
    currency: string | null;
    interval: "monthly" | "lump-sum" | "weekly" | "hourly" | null;
    isUnpaid: boolean;
    rawText: string | null;
  };
  deadline: string | null; // ISO 8601 string or null if unknown
  duration: string | null;
  applicationRequirements: {
    requiresResume: boolean;
    requiresCoverLetter: boolean;
    requiresPortfolio: boolean;
    requiresGithub: boolean;
    applicationLink: string | null;
    otherRequirements: string[];
  };
  summary: string;
  extractedConfidence: number; // 0.0 to 1.0
}

/**
 * Agent 2: Tri-Dimensional Verification Payload
 */
export interface VerificationDecisionData {
  sourceTrust: AgentSourceTrust;
  opportunityAuthenticity: AgentOpportunityAuthenticity;
  applicationDestination: AgentApplicationDestination;
  overallVerified: boolean;
  confidenceScore: number; // 0.0 to 1.0
  primaryEvidence: string[];
  disputeReasons?: string[];
  destinationRiskFlags?: string[];
  evidenceRecords: SourceEvidenceRecord[];
}

/**
 * Agent 3: Explainable Matching Payload
 */
export interface MatchFactorBreakdown {
  skillScore: number; // 0 - 50
  branchScore: number; // 0 - 20
  workModeScore: number; // 0 - 15
  locationScore: number; // 0 - 10
  experienceScore: number; // 0 - 5
}

export interface MatchDecisionData {
  studentId: string;
  opportunityId: string;
  matchScore: number; // 0 to 100
  isEligible: boolean;
  matchReasons: string[];
  unmetRequirements: string[];
  missingSkills: string[];
  factors: MatchFactorBreakdown;
  summaryExplanation: string;
}

/**
 * Policy Gate Result
 */
export interface AgentPolicyResult {
  allowed: boolean;
  policyName: string;
  reasons: string[];
  violations: string[];
}
