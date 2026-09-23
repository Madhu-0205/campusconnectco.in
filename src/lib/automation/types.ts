/**
 * Autonomous Opportunity Discovery & Publishing Engine Types
 * CampusConnectCo — Phase 16
 */

export type OpportunityType =
  | "INTERNSHIP"
  | "JOB"
  | "GIG"
  | "HACKATHON"
  | "FELLOWSHIP"
  | "SCHOLARSHIP"
  | "RESEARCH"
  | "APPRENTICESHIP"
  | "EVENT"
  | "OTHER";

export type OpportunitySubtype =
  | "STUDENT_JOB"
  | "PART_TIME"
  | "FULL_TIME"
  | "FREELANCE"
  | "COMPETITION"
  | "STARTUP"
  | "CAMPUS"
  | "REMOTE"
  | "ON_SITE"
  | "HYBRID";

export type DiscoveryMethod =
  | "agent_reach_web"
  | "agent_reach_rss"
  | "agent_reach_search"
  | "structured_api"
  | "structured_feed"
  | "official_public_page";

export type LifecycleState =
  | "ACTIVE"
  | "CONFIRMED_EXPIRED"
  | "CONFIRMED_INACTIVE"
  | "SOURCE_UNAVAILABLE"
  | "STALE_REQUIRES_RECHECK";

export type SourceTrustLevel =
  | "OFFICIAL"
  | "TRUSTED"
  | "CURATED_FEED"
  | "COMMUNITY_VERIFIED"
  | "KNOWN_AGGREGATOR"
  | "UNKNOWN"
  | "UNTRUSTED";

export type VerificationState =
  | "UNVERIFIED"
  | "SOURCE_CONFIRMED"
  | "OFFICIAL_SOURCE_CONFIRMED"
  | "ADMIN_VERIFIED";

export type OpportunityStatus =
  | "DISCOVERED"
  | "PROCESSING"
  | "NEEDS_REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED"
  | "EXPIRED"
  | "REMOVED";

export type WorkMode = "remote" | "hybrid" | "on-site";

export interface ProvenanceRecord {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  applicationUrl: string;
  discoveredAt: Date;
  lastSeenAt: Date;
  lastVerifiedAt: Date;
  verificationState: VerificationState;
  sourceTrust: SourceTrustLevel;
  qualityScore: number;
}

export interface RawDiscoveredItem {
  source: string;
  sourceName: string;
  sourceUrl: string;
  externalId?: string | null;
  applicationUrl: string;
  title: string;
  company: string;
  description: string;
  opportunityType?: OpportunityType;
  subtypes?: OpportunitySubtype[];
  tags?: string[];
  location?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  workMode?: WorkMode | string | null;
  compensation?: number | null;
  currency?: string | null;
  skills?: string | string[] | null;
  duration?: string | null;
  deadline?: string | Date | null;
  startDate?: string | Date | null;
  metadata?: Record<string, unknown>;
  discoveredAt?: Date;
}

export interface CanonicalOpportunity {
  id?: string;
  source: string;
  sourceName: string;
  sourceUrl: string;
  externalId: string | null;
  canonicalUrl: string;
  canonicalHash: string;
  applicationUrl: string;
  title: string;
  normalizedTitle: string;
  company: string;
  normalizedCompany: string;
  description: string;
  opportunityType: OpportunityType;
  subtypes?: OpportunitySubtype[];
  tags?: string[];
  location: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  workMode: WorkMode;
  compensation: number | null;
  currency: string;
  skills: string | null; // Comma-separated
  duration: string | null;
  deadline: Date | null;
  startDate: Date | null;
  sourceTrust: SourceTrustLevel;
  verificationState: VerificationState;
  qualityScore: number;
  spamRiskScore: number;
  status: OpportunityStatus;
  lifecycleState?: LifecycleState;
  provenance?: ProvenanceRecord[];
  metadata?: Record<string, unknown>;
  discoveredAt: Date;
  lastSeenAt: Date;
  lastVerifiedAt?: Date;
}

export type LocationType = "REMOTE" | "ONSITE" | "HYBRID" | "UNKNOWN";
export type Geography = "INDIA" | "INTERNATIONAL" | "REMOTE_GLOBAL" | "UNKNOWN";

export type RiskFlag =
  | "PAY_TO_APPLY"
  | "REGISTRATION_FEE"
  | "SECURITY_DEPOSIT"
  | "CRYPTO_PAYMENT"
  | "GIFT_CARD_PAYMENT"
  | "WHATSAPP_ONLY"
  | "TELEGRAM_ONLY"
  | "SUSPICIOUS_SHORTENER"
  | "CREDENTIAL_HARVESTING"
  | "BANK_ACCOUNT_REQUEST"
  | "PASSWORD_REQUEST"
  | "DISPOSABLE_EMAIL"
  | "GUARANTEED_INCOME"
  | "DIRECT_SELECTION_CLAIM"
  | "MLM"
  | "NETWORK_MARKETING"
  | "PAY_FOR_TRAINING"
  | "SUSPICIOUS_RECRUITER_DOMAIN";

export interface AuthenticityEvaluation {
  sourceTrust: SourceTrustLevel;
  verificationState: VerificationState;
  isOfficialAssociation: boolean;
  confidenceReason: string;
  warnings: string[];
}

export interface QualityEvaluation {
  qualityScore: number; // 0 to 100
  spamRiskScore: number; // 0 to 100
  isEligibleForAutoPublish: boolean;
  completenessScore: number;
  warnings: string[];
  reasons: string[];
  riskFlags: RiskFlag[];
}

export interface DeduplicationResult {
  isDuplicate: boolean;
  matchTier: number | null; // 1 to 8, or null if no match
  matchedId: string | null;
  matchedType: "STAGING" | "CAMPUSCONNECT_INTERNSHIP" | "CAMPUSCONNECT_GIG" | null;
  confidence: "EXACT" | "CANONICAL" | "HASH" | "METRIC" | "NONE";
  explanation?: string;
}

export interface PublicationResult {
  success: boolean;
  publishedOpportunityId?: string;
  publishedOpportunityType?: "INTERNSHIP" | "GIG" | "STAGED";
  publishedUrl?: string;
  publishedAt?: Date;
  error?: string;
  unconfirmed?: boolean;
}

export interface SourcePolicy {
  attributionRequired?: boolean;
  attributionName?: string;
  directApplicationRequired?: boolean;
  requiresFreshnessEvidence?: boolean;
  maxStalenessMinutes?: number;
  allowedGeographies?: Geography[];
  allowedOpportunityTypes?: OpportunityType[];
  requiresOfficialApplicationUrl?: boolean;
}

export interface SourceConfig {
  source: string;
  sourceName: string;
  category: "CAREERS" | "HACKATHONS" | "UNIVERSITY" | "GITHUB" | "RSS" | "AGGREGATOR" | "EVENTS";
  discoveryMethod: DiscoveryMethod;
  defaultTrust: SourceTrustLevel;
  scheduleHours?: number;
  scheduleMinutes: number;
  endpointUrl: string;
  enabled: boolean;
  maxItemsPerRun: number;
  allowedDomains?: string[];
  applicationUrlPolicy?: "DIRECT" | "EXTERNAL_PORTAL" | "AGGREGATOR_PROXY";
  attributionRequired?: boolean;
  attributionName?: string;
  maxBackoffMinutes?: number;
  policy?: SourcePolicy;
}

export interface AutomationRunMetrics {
  sourcesAttempted: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  itemsDiscovered: number;
  itemsNormalized: number;
  itemsNew: number;
  itemsUpdated: number;
  itemsUnchanged: number;
  duplicatesPrevented: number;
  itemsRejected: number;
  itemsQuarantined: number;
  durationMs: number;
}
