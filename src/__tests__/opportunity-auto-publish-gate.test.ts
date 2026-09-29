import { describe, it, expect } from "vitest";
import {
  evaluateOpportunityForAutoPublish,
  type EvaluatedCandidate
} from "@/lib/automation/publisher-decision";
import { CanonicalOpportunity, SourceConfig } from "@/lib/automation/types";

describe("Phase 16D: Deterministic Auto-Publish Decision Engine", () => {
  const mockNow = new Date("2026-09-25T12:00:00.000Z");

  const baseOfficialSource: SourceConfig = {
    source: "official_careers_portal",
    sourceName: "Official University Careers",
    category: "UNIVERSITY",
    discoveryMethod: "structured_api",
    defaultTrust: "OFFICIAL",
    scheduleMinutes: 360,
    endpointUrl: "https://careers.university.edu/api/jobs",
    enabled: true,
    maxItemsPerRun: 20,
    applicationUrlPolicy: "DIRECT",
    policy: {
      directApplicationRequired: true,
      requiresFreshnessEvidence: true,
      allowedOpportunityTypes: ["INTERNSHIP", "JOB"]
    }
  };

  const baseValidCandidate: CanonicalOpportunity = {
    source: "official_careers_portal",
    sourceName: "Official University Careers",
    sourceUrl: "https://careers.university.edu/jobs/se-intern-2026",
    externalId: "univ-job-90210",
    canonicalUrl: "https://jobs.lever.co/acme/f47ac10b-58cc-4372-a567-0e02b2c3d479",
    canonicalHash: "hash_90210_valid",
    applicationUrl: "https://jobs.lever.co/acme/f47ac10b-58cc-4372-a567-0e02b2c3d479",
    title: "Software Engineering Intern - Summer 2026",
    normalizedTitle: "software engineering intern summer 2026",
    company: "Acme Technologies",
    normalizedCompany: "acme",
    description: "Join Acme Technologies for a comprehensive 12-week summer internship working on distributed systems and cloud infrastructure with our core engineering teams.",
    opportunityType: "INTERNSHIP",
    subtypes: ["STUDENT_JOB", "CAMPUS"],
    tags: ["tech", "engineering"],
    location: "Bengaluru, Karnataka, India",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    workMode: "hybrid",
    compensation: 45000,
    currency: "INR",
    skills: "TypeScript, Node.js, PostgreSQL",
    duration: "3 months",
    deadline: new Date("2026-11-30T23:59:59.000Z"),
    startDate: new Date("2026-05-01T00:00:00.000Z"),
    sourceTrust: "OFFICIAL",
    verificationState: "OFFICIAL_SOURCE_CONFIRMED",
    qualityScore: 92,
    spamRiskScore: 0,
    status: "PROCESSING",
    discoveredAt: mockNow,
    lastSeenAt: mockNow
  };

  const mockEmptyPrisma = {
    internship: {
      findFirst: async () => null,
      findUnique: async () => null
    },
    gig: {
      findFirst: async () => null
    }
  };

  // ==========================================================================
  // 1. Baseline Happy Path & Feature Flag Gate
  // ==========================================================================
  it("evaluates a valid official opportunity as publishable when flag is enabled", async () => {
    const res = await evaluateOpportunityForAutoPublish(baseValidCandidate, {
      sourceConfig: baseOfficialSource,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(res.decision).toBe("AUTO_PUBLISH");
    expect(res.publishable).toBe(true);
    expect(res.failureCodes).toHaveLength(0);

    // Verify all 11 gates passed
    expect(res.gates.sourceTrust.passed).toBe(true);
    expect(res.gates.provenance.passed).toBe(true);
    expect(res.gates.authenticity.passed).toBe(true);
    expect(res.gates.contentCompleteness.passed).toBe(true);
    expect(res.gates.applicationDestination.passed).toBe(true);
    expect(res.gates.urlSafety.passed).toBe(true);
    expect(res.gates.duplicateCheck.passed).toBe(true);
    expect(res.gates.scamRisk.passed).toBe(true);
    expect(res.gates.categoryValidity.passed).toBe(true);
    expect(res.gates.freshnessDeadline.passed).toBe(true);
    expect(res.gates.sourcePolicy.passed).toBe(true);
  });

  it("routes to NEEDS_REVIEW when OPPORTUNITY_AUTOPUBLISH_ENABLED is false even if all gates pass", async () => {
    const res = await evaluateOpportunityForAutoPublish(baseValidCandidate, {
      sourceConfig: baseOfficialSource,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: false // Feature flag OFF
    });

    expect(res.decision).toBe("NEEDS_REVIEW");
    expect(res.publishable).toBe(false);
    expect(res.reasons.some((r) => r.includes("OPPORTUNITY_AUTOPUBLISH_ENABLED"))).toBe(true);
    expect(res.gates.sourceTrust.passed).toBe(true);
    expect(res.gates.scamRisk.passed).toBe(true);
  });

  // ==========================================================================
  // 2. REQUIRED TEST MATRIX: PROVENANCE
  // ==========================================================================
  describe("Provenance Matrix", () => {
    it("PROVENANCE: externalId + canonical URL", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        externalId: "genuine_provider_id_7788",
        canonicalUrl: "https://jobs.lever.co/acme/123"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.provenance.passed).toBe(true);
      expect(res.gates.provenance.details?.identitySignal).toBe("EXTERNAL_ID");
      expect(res.gates.provenance.details?.externalId).toBe("genuine_provider_id_7788");
    });

    it("PROVENANCE: externalId only", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        externalId: "ext-only-12345",
        canonicalUrl: "",
        applicationUrl: ""
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.provenance.passed).toBe(true);
      expect(res.gates.provenance.details?.identitySignal).toBe("EXTERNAL_ID");
      expect(res.gates.provenance.details?.externalId).toBe("ext-only-12345");
      // Destination gate will catch missing URL
      expect(res.gates.applicationDestination.passed).toBe(false);
    });

    it("PROVENANCE: canonical URL only", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        externalId: null,
        canonicalUrl: "https://jobs.lever.co/acme/valid-job-link",
        applicationUrl: "https://jobs.lever.co/acme/valid-job-link"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.provenance.passed).toBe(true);
      expect(res.gates.provenance.details?.identitySignal).toBe("CANONICAL_URL");
      expect(res.gates.provenance.details?.externalId).toBeNull();
      expect(candidate.externalId).toBeNull(); // Zero fabrication
    });

    it("PROVENANCE: neither externalId nor canonical URL", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        externalId: null,
        canonicalUrl: "",
        applicationUrl: ""
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.provenance.passed).toBe(false);
      expect(res.gates.provenance.code).toBe("PROVENANCE_MISSING_STABLE_IDENTITY");
      expect(res.decision).toBe("NEEDS_REVIEW");
    });

    it("PROVENANCE: fabricated externalId is rejected", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        externalId: "fabricated_id_9999",
        isFabricatedExternalId: true
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.provenance.passed).toBe(false);
      expect(res.gates.provenance.code).toBe("PROVENANCE_FABRICATED_EXTERNAL_ID");
      expect(res.decision).toBe("NEEDS_REVIEW");
    });

    it("PROVENANCE: deterministic source-specific identity path", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        externalId: null,
        deterministicId: "github_pull_issue_8899"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.provenance.passed).toBe(true);
      expect(res.gates.provenance.code).toBe("PROVENANCE_STABLE_IDENTITY");
      expect(res.gates.provenance.details?.identitySignal).toBe("DETERMINISTIC_SOURCE_ID");
    });

    it("PROVENANCE: unverified canonical URL cannot serve as identity signal", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        externalId: null,
        canonicalUrl: "https://www.indeed.com/jobs?q=intern", // generic search page
        applicationUrl: "https://www.indeed.com/jobs?q=intern"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.provenance.passed).toBe(false);
      expect(res.gates.provenance.code).toBe("PROVENANCE_CANONICAL_URL_UNVERIFIED");
      expect(res.gates.applicationDestination.passed).toBe(false);
    });
  });

  // ==========================================================================
  // 3. REQUIRED TEST MATRIX: TRUST / AUTHENTICITY
  // ==========================================================================
  describe("Trust / Authenticity Matrix", () => {
    it("TRUST/AUTHENTICITY: OFFICIAL + authentic", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        sourceTrust: "OFFICIAL"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.sourceTrust.passed).toBe(true);
      expect(res.gates.authenticity.passed).toBe(true);
      expect(res.decision).toBe("AUTO_PUBLISH");
    });

    it("TRUST/AUTHENTICITY: OFFICIAL + unauthentic (brand impersonation)", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        sourceTrust: "OFFICIAL",
        company: "Google",
        canonicalUrl: "https://google-careers-portal-apply.top/job", // Suspicious deceptive domain
        applicationUrl: "https://google-careers-portal-apply.top/job"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.sourceTrust.passed).toBe(true);
      expect(res.gates.authenticity.passed).toBe(false);
      // Impersonation routes to QUARANTINE
      expect(res.decision).toBe("QUARANTINE");
    });

    it("TRUST/AUTHENTICITY: OFFICIAL + unauthentic (uncorrelated destination claim)", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        sourceTrust: "OFFICIAL",
        company: "Acme Technologies",
        canonicalUrl: "https://random-recruiter-blog.com/jobs/acme-role",
        applicationUrl: "https://random-recruiter-blog.com/jobs/acme-role"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.sourceTrust.passed).toBe(true);
      expect(res.gates.authenticity.passed).toBe(false);
      expect(res.gates.authenticity.code).toBe("AUTHENTICITY_UNCORRELATED_CLAIM");
      expect(res.decision).toBe("NEEDS_REVIEW");
    });

    it("TRUST/AUTHENTICITY: UNKNOWN + authentic", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        source: "unknown_job_board",
        sourceTrust: "UNKNOWN"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.sourceTrust.passed).toBe(false);
      expect(res.gates.sourceTrust.code).toBe("SOURCE_TRUST_UNKNOWN");
      expect(res.gates.authenticity.passed).toBe(true);
      expect(res.decision).toBe("NEEDS_REVIEW");
    });

    it("TRUST/AUTHENTICITY: KNOWN_AGGREGATOR + authentic", async () => {
      const aggregatorSourcePermitted: SourceConfig = {
        ...baseOfficialSource,
        defaultTrust: "KNOWN_AGGREGATOR",
        policy: {
          allowedOpportunityTypes: ["INTERNSHIP", "JOB"],
          directApplicationRequired: false
        }
      };

      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        sourceTrust: "KNOWN_AGGREGATOR"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: aggregatorSourcePermitted,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.sourceTrust.passed).toBe(true);
      expect(res.gates.authenticity.passed).toBe(true);
      expect(res.decision).toBe("AUTO_PUBLISH");
    });

    it("TRUST/AUTHENTICITY: UNTRUSTED + authentic", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        source: "blacklisted_spam_feed",
        sourceTrust: "UNTRUSTED"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.sourceTrust.passed).toBe(false);
      expect(res.gates.sourceTrust.code).toBe("SOURCE_TRUST_UNTRUSTED");
      expect(res.decision).toBe("QUARANTINE");
    });
  });

  // ==========================================================================
  // 4. REQUIRED TEST MATRIX: DESTINATION
  // ==========================================================================
  describe("Destination Matrix", () => {
    it("DESTINATION: specific corporate application", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        canonicalUrl: "https://acme.com/careers/internships/software-engineer",
        applicationUrl: "https://acme.com/careers/internships/software-engineer"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.applicationDestination.passed).toBe(true);
      expect(res.gates.applicationDestination.code).toBe("DESTINATION_VERIFIED");
    });

    it("DESTINATION: specific ATS application", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        canonicalUrl: "https://boards.greenhouse.io/stripe/jobs/123456",
        applicationUrl: "https://boards.greenhouse.io/stripe/jobs/123456"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.applicationDestination.passed).toBe(true);
      expect(res.gates.applicationDestination.code).toBe("DESTINATION_VERIFIED");
    });

    it("DESTINATION: specific aggregator listing", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        canonicalUrl: "https://internshala.com/internship/detail/full-stack-development-internship-in-bangalore-at-acme123",
        applicationUrl: "https://internshala.com/internship/detail/full-stack-development-internship-in-bangalore-at-acme123"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.applicationDestination.passed).toBe(true);
      expect(res.gates.applicationDestination.code).toBe("DESTINATION_VERIFIED");
    });

    it("DESTINATION: generic aggregator search", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        canonicalUrl: "https://www.indeed.com/jobs?q=frontend+developer",
        applicationUrl: "https://www.indeed.com/jobs?q=frontend+developer"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.applicationDestination.passed).toBe(false);
      expect(res.gates.applicationDestination.code).toBe("DESTINATION_GENERIC_AGGREGATOR_PAGE");
      expect(res.decision).toBe("NEEDS_REVIEW");
    });

    it("DESTINATION: generic aggregator homepage", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        canonicalUrl: "https://unstop.com/opportunities",
        applicationUrl: "https://unstop.com/opportunities"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.applicationDestination.passed).toBe(false);
      expect(res.gates.applicationDestination.code).toBe("DESTINATION_GENERIC_AGGREGATOR_PAGE");
      expect(res.decision).toBe("NEEDS_REVIEW");
    });

    it("DESTINATION: shortener", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        canonicalUrl: "https://bit.ly/secret-job",
        applicationUrl: "https://bit.ly/secret-job"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.urlSafety.passed).toBe(false);
      expect(res.gates.urlSafety.code).toBe("URL_UNSAFE_OR_SSRF");
      expect(res.decision).toBe("QUARANTINE");
    });

    it("DESTINATION: unsafe destination", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        canonicalUrl: "http://169.254.169.254/latest/user-data",
        applicationUrl: "http://169.254.169.254/latest/user-data"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.urlSafety.passed).toBe(false);
      expect(res.gates.urlSafety.code).toBe("URL_UNSAFE_OR_SSRF");
      expect(res.decision).toBe("QUARANTINE");
    });

    it("DESTINATION: plain HTTP insecure destination is rejected from auto-publish", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        canonicalUrl: "http://careers.acme.com/jobs/123",
        applicationUrl: "http://careers.acme.com/jobs/123"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource, // policy.allowInsecureHttp is undefined/false
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.applicationDestination.passed).toBe(false);
      expect(res.gates.applicationDestination.code).toBe("DESTINATION_INSECURE_HTTP");
      expect(res.decision).toBe("NEEDS_REVIEW");
    });
  });

  // ==========================================================================
  // 5. REQUIRED TEST MATRIX: LIFECYCLE
  // ==========================================================================
  describe("Lifecycle Matrix", () => {
    it("LIFECYCLE: future deadline", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        deadline: new Date("2026-12-31T23:59:59.000Z")
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.freshnessDeadline.passed).toBe(true);
      expect(res.gates.freshnessDeadline.code).toBe("DEADLINE_ACTIVE");
    });

    it("LIFECYCLE: today deadline (active until end of day)", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        deadline: new Date("2026-09-25T23:59:59.000Z") // 12 hours ahead of mockNow (12:00:00)
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.freshnessDeadline.passed).toBe(true);
      expect(res.gates.freshnessDeadline.code).toBe("DEADLINE_ACTIVE");
    });

    it("LIFECYCLE: expired deadline", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        deadline: new Date("2026-09-24T00:00:00.000Z") // 1.5 days in the past
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.freshnessDeadline.passed).toBe(false);
      expect(res.gates.freshnessDeadline.code).toBe("DEADLINE_EXPIRED");
      expect(res.decision).toBe("REJECT");
    });

    it("LIFECYCLE: null deadline preserves null without fabricating date", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        deadline: null
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.freshnessDeadline.passed).toBe(true);
      expect(res.gates.freshnessDeadline.code).toBe("DEADLINE_NONE_PROVIDED");
      expect(candidate.deadline).toBeNull();
    });
  });

  // ==========================================================================
  // 6. REQUIRED TEST MATRIX: DUPLICATES
  // ==========================================================================
  describe("Duplicates Matrix", () => {
    it("DUPLICATES: same externalId in active Internship", async () => {
      const prismaWithMatch = {
        internship: {
          findFirst: async ({ where }: any) => {
            if (where.externalId === baseValidCandidate.externalId) {
              return { id: "active-uuid-1", externalId: baseValidCandidate.externalId };
            }
            return null;
          }
        }
      };

      const res = await evaluateOpportunityForAutoPublish(baseValidCandidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: prismaWithMatch,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.duplicateCheck.passed).toBe(false);
      expect(res.gates.duplicateCheck.code).toBe("DUPLICATE_FOUND");
      expect(res.decision).toBe("NEEDS_REVIEW");
    });

    it("DUPLICATES: same canonical URL in active Internship", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        externalId: null
      };

      const prismaWithMatch = {
        internship: {
          findFirst: async ({ where }: any) => {
            if (where.applicationLink === candidate.canonicalUrl) {
              return { id: "active-uuid-2", applicationLink: candidate.canonicalUrl };
            }
            return null;
          }
        }
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: prismaWithMatch,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.duplicateCheck.passed).toBe(false);
      expect(res.gates.duplicateCheck.code).toBe("DUPLICATE_FOUND");
    });

    it("DUPLICATES: same company and title in active Internship", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        externalId: null,
        canonicalUrl: "https://jobs.lever.co/acme/diff-link-456"
      };

      const prismaWithMatch = {
        internship: {
          findFirst: async ({ where }: any) => {
            if (where.title === candidate.title && where.company === candidate.company) {
              return { id: "active-uuid-3", title: candidate.title, company: candidate.company };
            }
            return null;
          }
        }
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: prismaWithMatch,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.duplicateCheck.passed).toBe(false);
      expect(res.gates.duplicateCheck.code).toBe("DUPLICATE_FOUND");
    });

    it("DUPLICATES: deleted existing record does NOT trigger duplicate", async () => {
      // Database has record, but with deletedAt or status: "DELETED", so findFirst returns null
      const prismaWithDeleted = {
        internship: {
          findFirst: async ({ where }: any) => {
            // Where requires deletedAt: null and status: { notIn: ["DELETED", "REJECTED"] }
            if (where.deletedAt === null && !where.status?.notIn?.includes("DELETED")) {
              return { id: "deleted-uuid", externalId: baseValidCandidate.externalId };
            }
            return null; // Simulating no active record matches
          }
        }
      };

      const res = await evaluateOpportunityForAutoPublish(baseValidCandidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: prismaWithDeleted,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.duplicateCheck.passed).toBe(true);
      expect(res.gates.duplicateCheck.code).toBe("DUPLICATE_NONE");
    });

    it("DUPLICATES: rejected existing record does NOT trigger duplicate", async () => {
      const prismaWithRejected = {
        internship: {
          findFirst: async () => null // Filter where status not in ["DELETED", "REJECTED"] returns null
        }
      };

      const res = await evaluateOpportunityForAutoPublish(baseValidCandidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: prismaWithRejected,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.duplicateCheck.passed).toBe(true);
      expect(res.gates.duplicateCheck.code).toBe("DUPLICATE_NONE");
    });

    it("DUPLICATES: different active opportunity passes cleanly", async () => {
      const prismaWithDifferent = {
        internship: {
          findFirst: async () => null
        },
        gig: {
          findFirst: async () => null
        }
      };

      const res = await evaluateOpportunityForAutoPublish(baseValidCandidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: prismaWithDifferent,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.duplicateCheck.passed).toBe(true);
      expect(res.gates.duplicateCheck.code).toBe("DUPLICATE_NONE");
    });

    it("DUPLICATES: active Gig collision in student marketplace flags duplicate", async () => {
      const prismaWithGig = {
        internship: {
          findFirst: async () => null
        },
        gig: {
          findFirst: async () => ({ id: "gig-marketplace-uuid" })
        }
      };

      const res = await evaluateOpportunityForAutoPublish(baseValidCandidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: prismaWithGig,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.duplicateCheck.passed).toBe(false);
      expect(res.gates.duplicateCheck.code).toBe("DUPLICATE_FOUND");
    });
  });

  // ==========================================================================
  // 7. REQUIRED TEST MATRIX: SECURITY / SSRF
  // ==========================================================================
  describe("Security Matrix", () => {
    it("SECURITY: localhost is blocked", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        canonicalUrl: "http://localhost:3000/api/apply",
        applicationUrl: "http://localhost:3000/api/apply"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.urlSafety.passed).toBe(false);
      expect(res.gates.urlSafety.code).toBe("URL_UNSAFE_OR_SSRF");
      expect(res.decision).toBe("QUARANTINE");
    });

    it("SECURITY: 127.0.0.1 is blocked", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        canonicalUrl: "http://127.0.0.1/apply",
        applicationUrl: "http://127.0.0.1/apply"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.urlSafety.passed).toBe(false);
      expect(res.gates.urlSafety.code).toBe("URL_UNSAFE_OR_SSRF");
      expect(res.decision).toBe("QUARANTINE");
    });

    it("SECURITY: RFC1918 ranges are blocked", async () => {
      const ips = ["10.0.0.1", "172.16.0.1", "192.168.1.1"];

      for (const ip of ips) {
        const candidate: EvaluatedCandidate = {
          ...baseValidCandidate,
          canonicalUrl: `http://${ip}/careers/apply`,
          applicationUrl: `http://${ip}/careers/apply`
        };

        const res = await evaluateOpportunityForAutoPublish(candidate, {
          sourceConfig: baseOfficialSource,
          now: mockNow,
          prismaClient: mockEmptyPrisma,
          isAutoPublishEnabledOverride: true
        });

        expect(res.gates.urlSafety.passed).toBe(false);
        expect(res.gates.urlSafety.code).toBe("URL_UNSAFE_OR_SSRF");
        expect(res.decision).toBe("QUARANTINE");
      }
    });

    it("SECURITY: link-local IP is blocked", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        canonicalUrl: "http://169.254.1.1/apply",
        applicationUrl: "http://169.254.1.1/apply"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.urlSafety.passed).toBe(false);
      expect(res.gates.urlSafety.code).toBe("URL_UNSAFE_OR_SSRF");
      expect(res.decision).toBe("QUARANTINE");
    });

    it("SECURITY: cloud metadata IP is blocked", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        canonicalUrl: "http://169.254.169.254/latest/meta-data/",
        applicationUrl: "http://169.254.169.254/latest/meta-data/"
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.urlSafety.passed).toBe(false);
      expect(res.gates.urlSafety.code).toBe("URL_UNSAFE_OR_SSRF");
      expect(res.decision).toBe("QUARANTINE");
    });

    it("SECURITY: dangerous URL schemes are blocked", async () => {
      const dangerousSchemes = [
        "javascript:alert(1)",
        "file:///etc/passwd",
        "data:text/html,<script>alert(1)</script>"
      ];

      for (const schemeUrl of dangerousSchemes) {
        const candidate: EvaluatedCandidate = {
          ...baseValidCandidate,
          canonicalUrl: schemeUrl,
          applicationUrl: schemeUrl
        };

        const res = await evaluateOpportunityForAutoPublish(candidate, {
          sourceConfig: baseOfficialSource,
          now: mockNow,
          prismaClient: mockEmptyPrisma,
          isAutoPublishEnabledOverride: true
        });

        expect(res.gates.urlSafety.passed).toBe(false);
        expect(res.gates.urlSafety.code).toBe("URL_UNSAFE_OR_SSRF");
        expect(res.decision).toBe("QUARANTINE");
      }
    });
  });

  // ==========================================================================
  // 8. SCAM SCORE AUTHORITY & PRECEDENCE HIERARCHY
  // ==========================================================================
  describe("Scam Score Authority & Precedence Hierarchy", () => {
    it("SCAM: deterministic scam patterns trigger QUARANTINE regardless of other gate results", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        title: "Short", // Gate 4 content completeness would fail
        source: "unknown_src", // Gate 1 would fail
        description: "Candidates must pay registration fee of Rs 500 to secure interview slot."
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.scamRisk.passed).toBe(false);
      // Precedence 1: QUARANTINE takes absolute priority over REJECT or NEEDS_REVIEW
      expect(res.decision).toBe("QUARANTINE");
    });

    it("SCAM: telemetry records spamRiskScore without acting as opaque standalone authority", async () => {
      const res = await evaluateOpportunityForAutoPublish(baseValidCandidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.telemetry.spamRiskScore).toBe(0);
      expect(res.telemetry.qualityScore).toBeGreaterThan(80);
      expect(res.gates.scamRisk.passed).toBe(true);
    });

    it("PERSISTENCE BOUNDARY: unsupported opportunity types cannot auto-publish", async () => {
      const candidate: EvaluatedCandidate = {
        ...baseValidCandidate,
        opportunityType: "GIG" // Not supported in external Internship pipeline
      };

      const res = await evaluateOpportunityForAutoPublish(candidate, {
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockEmptyPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.gates.categoryValidity.passed).toBe(false);
      expect(res.gates.categoryValidity.code).toBe("CATEGORY_UNSUPPORTED_FOR_AUTO_PUBLISH");
      expect(res.decision).toBe("NEEDS_REVIEW");
    });
  });
});
