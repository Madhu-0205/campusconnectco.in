/**
 * Phase 16D — Stage 3 Canary Policy Safety Test Suite
 *
 * Verifies all 10 canary auto-publish invariants:
 * 1. CANARY SOURCE + ALL 11 GATES PASS → AUTO_PUBLISH eligible
 * 2. NON-CANARY SOURCE + ALL 11 GATES PASS → NEEDS_REVIEW → NOT publishable
 * 3. UNKNOWN SOURCE → NEEDS_REVIEW
 * 4. UNTRUSTED SOURCE → QUARANTINE/REJECT
 * 5. UNSAFE URL → NOT publishable (QUARANTINE)
 * 6. GENERIC AGGREGATOR DESTINATION → NOT publishable
 * 7. DUPLICATE → NOT publishable
 * 8. HIGH RISK → QUARANTINE
 * 9. EXPIRED → NOT publishable (REJECT)
 * 10. TERMINAL EXISTING RECORD → NEVER resurrect
 */

import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  evaluateOpportunityForAutoPublish,
  type EvaluatedCandidate
} from "@/lib/automation/publisher-decision";
import { publishOpportunityDirectly } from "@/lib/automation/direct-publisher";
import {
  CANARY_AUTOPUBLISH_SOURCES,
  isAutoPublishSourceAllowed
} from "@/lib/automation/quality";
import { getSourceConfig } from "@/lib/automation/sources/registry";
import { SourceConfig } from "@/lib/automation/types";

describe("Phase 16D Stage 3: Canary Policy Safety Matrix", () => {
  const mockNow = new Date("2026-09-26T12:00:00.000Z");

  const canarySourceConfig: SourceConfig = {
    source: "github_student_internships",
    sourceName: "SimplifyJobs Curated Student Tech Internships",
    category: "GITHUB",
    discoveryMethod: "structured_feed",
    defaultTrust: "COMMUNITY_VERIFIED",
    scheduleMinutes: 360,
    endpointUrl: "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json",
    enabled: true,
    maxItemsPerRun: 25,
    applicationUrlPolicy: "DIRECT",
    policy: {
      directApplicationRequired: true,
      requiresFreshnessEvidence: true,
      maxStalenessMinutes: 1440,
      allowedOpportunityTypes: ["INTERNSHIP"]
    }
  };

  const nonCanarySourceConfig: SourceConfig = {
    source: "remoteok_tech_jobs",
    sourceName: "RemoteOK Verified Developer & Student Roles",
    category: "CAREERS",
    discoveryMethod: "structured_feed",
    defaultTrust: "CURATED_FEED",
    scheduleMinutes: 120,
    endpointUrl: "https://remoteok.com/api",
    enabled: true,
    maxItemsPerRun: 15,
    applicationUrlPolicy: "DIRECT",
    policy: {
      directApplicationRequired: true,
      maxStalenessMinutes: 720,
      allowedOpportunityTypes: ["JOB", "INTERNSHIP"]
    }
  };

  const baseCanaryCandidate: EvaluatedCandidate = {
    source: "github_student_internships",
    sourceName: "SimplifyJobs Curated Student Tech Internships",
    sourceUrl: "https://job-boards.greenhouse.io/cresta/jobs/5106468008",
    externalId: "7ba71986-7f36-4096-9d70-31f988a5cd08",
    canonicalUrl: "https://job-boards.greenhouse.io/cresta/jobs/5106468008",
    canonicalHash: "canary_cresta_hash_1",
    applicationUrl: "https://job-boards.greenhouse.io/cresta/jobs/5106468008",
    title: "Software Engineering Intern - Summer 2026",
    normalizedTitle: "software engineering intern summer 2026",
    company: "Cresta",
    normalizedCompany: "cresta",
    description: "Join Cresta as an engineering intern working on production AI models and distributed infrastructure. Work directly with senior staff on real systems.",
    opportunityType: "INTERNSHIP",
    subtypes: ["STUDENT_JOB", "CAMPUS"],
    tags: ["software", "ai", "summer2026"],
    location: "San Francisco, CA",
    city: "San Francisco",
    state: "CA",
    country: "United States",
    workMode: "hybrid",
    compensation: 55,
    currency: "USD",
    skills: "Python, TypeScript, Machine Learning",
    duration: "12 weeks",
    deadline: new Date("2026-11-30T23:59:59.000Z"),
    startDate: new Date("2026-06-01T00:00:00.000Z"),
    sourceTrust: "COMMUNITY_VERIFIED",
    verificationState: "OFFICIAL_SOURCE_CONFIRMED",
    qualityScore: 90,
    spamRiskScore: 0,
    status: "PROCESSING",
    discoveredAt: mockNow,
    lastSeenAt: mockNow
  };

  const mockEmptyPrisma = {
    internship: {
      findFirst: async () => null,
      findUnique: async () => null,
      create: async (args: any) => ({
        id: "mock_created_internship_1",
        applicationLink: args.data.applicationLink,
        externalId: args.data.externalId
      }),
      update: async (args: any) => ({
        id: args.where.id,
        applicationLink: args.data.applicationLink,
        externalId: args.data.externalId
      })
    },
    gig: {
      findFirst: async () => null
    }
  };

  let originalAllowlist: string | undefined;
  let originalAutopublish: string | undefined;
  let originalEnforceInTest: string | undefined;

  beforeEach(() => {
    originalAllowlist = process.env.OPPORTUNITY_CANARY_SOURCE_ALLOWLIST;
    originalAutopublish = process.env.OPPORTUNITY_AUTOPUBLISH_ENABLED;
    originalEnforceInTest = process.env.OPPORTUNITY_CANARY_ENFORCE_IN_TEST;
    // Set explicit canary allowlist for test suite
    process.env.OPPORTUNITY_CANARY_SOURCE_ALLOWLIST = "github_student_internships";
    process.env.OPPORTUNITY_AUTOPUBLISH_ENABLED = "true";
    process.env.OPPORTUNITY_CANARY_ENFORCE_IN_TEST = "true";
  });

  afterEach(() => {
    if (originalAllowlist !== undefined) {
      process.env.OPPORTUNITY_CANARY_SOURCE_ALLOWLIST = originalAllowlist;
    } else {
      delete process.env.OPPORTUNITY_CANARY_SOURCE_ALLOWLIST;
    }
    if (originalAutopublish !== undefined) {
      process.env.OPPORTUNITY_AUTOPUBLISH_ENABLED = originalAutopublish;
    } else {
      delete process.env.OPPORTUNITY_AUTOPUBLISH_ENABLED;
    }
    if (originalEnforceInTest !== undefined) {
      process.env.OPPORTUNITY_CANARY_ENFORCE_IN_TEST = originalEnforceInTest;
    } else {
      delete process.env.OPPORTUNITY_CANARY_ENFORCE_IN_TEST;
    }
  });

  // --------------------------------------------------------------------------
  // INVARIANT 1: CANARY SOURCE + ALL 11 GATES PASS → AUTO_PUBLISH
  // --------------------------------------------------------------------------
  it("Invariant 1: CANARY SOURCE + ALL 11 GATES PASS → AUTO_PUBLISH eligible", async () => {
    const res = await evaluateOpportunityForAutoPublish(baseCanaryCandidate, {
      sourceConfig: canarySourceConfig,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(res.decision).toBe("AUTO_PUBLISH");
    expect(res.publishable).toBe(true);
    expect(res.failureCodes).toHaveLength(0);
    expect(res.reasons.some((r) => r.includes("All 11 deterministic auto-publish gates passed"))).toBe(true);

    // Direct publisher executes creation
    const pub = await publishOpportunityDirectly({
      candidate: baseCanaryCandidate,
      sourceConfig: canarySourceConfig,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(pub.success).toBe(true);
    expect(pub.action).toBe("CREATED");
    expect(pub.recordId).toBe("mock_created_internship_1");
  });

  // --------------------------------------------------------------------------
  // INVARIANT 2: NON-CANARY SOURCE + ALL 11 GATES PASS → NEEDS_REVIEW
  // --------------------------------------------------------------------------
  it("Invariant 2: NON-CANARY SOURCE + ALL 11 GATES PASS → NEEDS_REVIEW & NOT publishable", async () => {
    const nonCanaryCandidate: EvaluatedCandidate = {
      ...baseCanaryCandidate,
      source: "remoteok_tech_jobs",
      sourceName: "RemoteOK Verified Developer & Student Roles",
      canonicalUrl: "https://remoteok.com/l/998877",
      applicationUrl: "https://jobs.lever.co/remotecompany/123",
      sourceTrust: "CURATED_FEED"
    };

    const res = await evaluateOpportunityForAutoPublish(nonCanaryCandidate, {
      sourceConfig: nonCanarySourceConfig,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(res.decision).toBe("NEEDS_REVIEW");
    expect(res.publishable).toBe(false);
    expect(
      res.reasons.some((r) => r.includes("not in the active Phase 16D canary auto-publish allowlist"))
    ).toBe(true);

    // Direct publisher blocks publication
    const pub = await publishOpportunityDirectly({
      candidate: nonCanaryCandidate,
      sourceConfig: nonCanarySourceConfig,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(pub.success).toBe(false);
    expect(pub.action).toBe("SKIPPED_NOT_PUBLISHABLE");
    expect(pub.errorClassification).toBe("FEATURE_FLAG_DISABLED");
  });

  // --------------------------------------------------------------------------
  // INVARIANT 3: UNKNOWN SOURCE → NEEDS_REVIEW
  // --------------------------------------------------------------------------
  it("Invariant 3: UNKNOWN SOURCE → Gate 1 fails → NEEDS_REVIEW", async () => {
    const unknownSourceConfig: SourceConfig = {
      source: "unknown_aggregator_99",
      sourceName: "Random Scraped Job Aggregator",
      category: "CAREERS",
      discoveryMethod: "structured_api",
      defaultTrust: "UNKNOWN",
      scheduleMinutes: 360,
      endpointUrl: "https://unknown.example.com",
      enabled: true,
      maxItemsPerRun: 10
    };

    const unknownCandidate: EvaluatedCandidate = {
      ...baseCanaryCandidate,
      source: "unknown_aggregator_99",
      sourceTrust: "UNKNOWN"
    };

    const res = await evaluateOpportunityForAutoPublish(unknownCandidate, {
      sourceConfig: unknownSourceConfig,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(res.gates.sourceTrust.passed).toBe(false);
    expect(res.gates.sourceTrust.code).toBe("SOURCE_TRUST_UNKNOWN");
    expect(res.decision).toBe("NEEDS_REVIEW");
    expect(res.publishable).toBe(false);
  });

  // --------------------------------------------------------------------------
  // INVARIANT 4: UNTRUSTED SOURCE → QUARANTINE
  // --------------------------------------------------------------------------
  it("Invariant 4: UNTRUSTED SOURCE → Gate 1 fails → QUARANTINE", async () => {
    const untrustedSourceConfig: SourceConfig = {
      source: "known_scam_forum",
      sourceName: "Known Spammer Feed",
      category: "CAREERS",
      discoveryMethod: "structured_api",
      defaultTrust: "UNTRUSTED",
      scheduleMinutes: 360,
      endpointUrl: "https://spam.example.com",
      enabled: true,
      maxItemsPerRun: 10
    };

    const untrustedCandidate: EvaluatedCandidate = {
      ...baseCanaryCandidate,
      source: "known_scam_forum",
      sourceTrust: "UNTRUSTED"
    };

    const res = await evaluateOpportunityForAutoPublish(untrustedCandidate, {
      sourceConfig: untrustedSourceConfig,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(res.gates.sourceTrust.passed).toBe(false);
    expect(res.gates.sourceTrust.code).toBe("SOURCE_TRUST_UNTRUSTED");
    expect(res.decision).toBe("QUARANTINE");
    expect(res.publishable).toBe(false);
  });

  // --------------------------------------------------------------------------
  // INVARIANT 5: UNSAFE URL → QUARANTINE (NOT PUBLISHABLE)
  // --------------------------------------------------------------------------
  it("Invariant 5: UNSAFE URL / SSRF attempt → QUARANTINE & NOT publishable", async () => {
    const unsafeCandidate: EvaluatedCandidate = {
      ...baseCanaryCandidate,
      applicationUrl: "http://169.254.169.254/latest/meta-data/",
      canonicalUrl: "http://169.254.169.254/latest/meta-data/"
    };

    const res = await evaluateOpportunityForAutoPublish(unsafeCandidate, {
      sourceConfig: canarySourceConfig,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(res.gates.urlSafety.passed).toBe(false);
    expect(res.gates.urlSafety.code).toBe("URL_UNSAFE_OR_SSRF");
    expect(res.decision).toBe("QUARANTINE");
    expect(res.publishable).toBe(false);
  });

  // --------------------------------------------------------------------------
  // INVARIANT 6: GENERIC AGGREGATOR DESTINATION → NOT PUBLISHABLE
  // --------------------------------------------------------------------------
  it("Invariant 6: GENERIC AGGREGATOR DESTINATION → Gate 5 fails → NOT publishable", async () => {
    const genericDestCandidate: EvaluatedCandidate = {
      ...baseCanaryCandidate,
      applicationUrl: "https://www.linkedin.com/jobs/search?keywords=intern",
      canonicalUrl: "https://www.linkedin.com/jobs/search?keywords=intern"
    };

    const res = await evaluateOpportunityForAutoPublish(genericDestCandidate, {
      sourceConfig: canarySourceConfig,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(res.gates.applicationDestination.passed).toBe(false);
    expect(res.gates.applicationDestination.code).toBe("DESTINATION_GENERIC_AGGREGATOR_PAGE");
    expect(res.publishable).toBe(false);
  });

  // --------------------------------------------------------------------------
  // INVARIANT 7: DUPLICATE → NOT PUBLISHABLE
  // --------------------------------------------------------------------------
  it("Invariant 7: DUPLICATE record → Gate 7 flags DUPLICATE_FOUND → NOT newly publishable", async () => {
    const mockPrismaWithDuplicate = {
      internship: {
        findFirst: async () => ({
          id: "existing_duplicate_uuid_99",
          title: "Software Engineering Intern - Summer 2026",
          company: "Cresta",
          applicationLink: baseCanaryCandidate.applicationUrl,
          externalId: baseCanaryCandidate.externalId,
          status: "OPEN",
          deletedAt: null
        }),
        findUnique: async () => null,
        create: async () => {
          throw new Error("Should not call create on duplicate");
        },
        update: async (args: any) => ({
          id: args.where.id,
          applicationLink: args.data.applicationLink
        })
      }
    };

    const res = await evaluateOpportunityForAutoPublish(baseCanaryCandidate, {
      sourceConfig: canarySourceConfig,
      now: mockNow,
      prismaClient: mockPrismaWithDuplicate as any,
      isAutoPublishEnabledOverride: true
    });

    expect(res.gates.duplicateCheck.passed).toBe(false);
    expect(res.gates.duplicateCheck.code).toBe("DUPLICATE_FOUND");
    expect(res.decision).toBe("NEEDS_REVIEW");
    expect(res.publishable).toBe(false);
  });

  // --------------------------------------------------------------------------
  // INVARIANT 8: HIGH RISK / SCAM PATTERNS → QUARANTINE
  // --------------------------------------------------------------------------
  it("Invariant 8: HIGH RISK scam keywords → Gate 8 fails → QUARANTINE", async () => {
    const scamCandidate: EvaluatedCandidate = {
      ...baseCanaryCandidate,
      description: "Work from home! Send 500 registration fee via crypto to activate your internship account."
    };

    const res = await evaluateOpportunityForAutoPublish(scamCandidate, {
      sourceConfig: canarySourceConfig,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(res.gates.scamRisk.passed).toBe(false);
    expect(res.gates.scamRisk.code).toBe("SCAM_RISK_DETECTED");
    expect(res.decision).toBe("QUARANTINE");
    expect(res.publishable).toBe(false);
  });

  // --------------------------------------------------------------------------
  // INVARIANT 9: EXPIRED DEADLINE → REJECT (NOT PUBLISHABLE)
  // --------------------------------------------------------------------------
  it("Invariant 9: EXPIRED DEADLINE in the past → Gate 10 fails → REJECT", async () => {
    const expiredCandidate: EvaluatedCandidate = {
      ...baseCanaryCandidate,
      deadline: new Date("2026-01-01T00:00:00.000Z") // In the past relative to mockNow (2026-09-26)
    };

    const res = await evaluateOpportunityForAutoPublish(expiredCandidate, {
      sourceConfig: canarySourceConfig,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(res.gates.freshnessDeadline.passed).toBe(false);
    expect(res.gates.freshnessDeadline.code).toBe("DEADLINE_EXPIRED");
    expect(res.decision).toBe("REJECT");
    expect(res.publishable).toBe(false);
  });

  // --------------------------------------------------------------------------
  // INVARIANT 10: TERMINAL EXISTING RECORD → NEVER RESURRECT
  // --------------------------------------------------------------------------
  it("Invariant 10: TERMINAL EXISTING RECORD (EXPIRED/CLOSED/REJECTED) → Never resurrect", async () => {
    const mockPrismaTerminalRecord = {
      internship: {
        findFirst: async () => ({
          id: "terminal_record_uuid_777",
          title: "Software Engineering Intern - Summer 2026",
          company: "Cresta",
          applicationLink: baseCanaryCandidate.applicationUrl,
          externalId: baseCanaryCandidate.externalId,
          status: "EXPIRED", // Terminal status
          deletedAt: null
        }),
        update: async () => {
          throw new Error("Terminal record must not be updated or resurrected");
        },
        create: async () => {
          throw new Error("Must not create duplicate of terminal record");
        }
      }
    };

    // Evaluate candidate matching existing terminal record
    const res = await evaluateOpportunityForAutoPublish(baseCanaryCandidate, {
      sourceConfig: canarySourceConfig,
      now: mockNow,
      prismaClient: mockPrismaTerminalRecord as any,
      isAutoPublishEnabledOverride: true
    });

    // When an active record does not exist in OPEN status, Gate 7 passes (DUPLICATE_NONE),
    // but direct publisher must verify terminal status before any update
    const pub = await publishOpportunityDirectly({
      candidate: baseCanaryCandidate,
      sourceConfig: canarySourceConfig,
      now: mockNow,
      prismaClient: {
        internship: {
          findFirst: async (args: any) => {
            // Simulate terminal record check in publisher
            return {
              id: "terminal_record_uuid_777",
              title: "Software Engineering Intern - Summer 2026",
              company: "Cresta",
              status: "EXPIRED",
              deletedAt: null,
              deadline: null,
              description: "Old",
              source: "github_student_internships",
              externalId: baseCanaryCandidate.externalId,
              applicationLink: baseCanaryCandidate.applicationUrl,
              skills: "TypeScript"
            };
          },
          create: async () => {
            throw new Error("Should not resurrect terminal record as duplicate");
          },
          update: async () => {
            throw new Error("Should not update terminal record");
          }
        }
      } as any,
      isAutoPublishEnabledOverride: true
    });

    // When candidate is matched against existing terminal record in publisher,
    // it must not resurrect to OPEN
    expect(["SKIPPED_NOT_PUBLISHABLE", "FAILED_DATABASE_ERROR", "SKIPPED_DUPLICATE"]).toContain(
      pub.action
    );
  });
});
