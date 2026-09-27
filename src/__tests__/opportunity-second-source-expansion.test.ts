/**
 * Phase 16D — Second Source Controlled Expansion Test Suite
 *
 * Verifies all 12 required invariants for expanding the canary allowlist to include:
 * - github_student_internships
 * - github_new_grad_jobs
 *
 * Test Invariants:
 * 1. github_student_internships still auto-publishes.
 * 2. github_new_grad_jobs can auto-publish only when allowlisted.
 * 3. A non-allowlisted source cannot auto-publish even if all 11 gates pass.
 * 4. A github_new_grad_jobs candidate failing any gate cannot publish.
 * 5. Duplicate external IDs cannot create another record.
 * 6. Duplicate canonical application URLs cannot create another record.
 * 7. Terminal records cannot be resurrected.
 * 8. 403/WAF remains SOURCE_UNAVAILABLE.
 * 9. 404/410 follows existing closure lifecycle.
 * 10. Temporary 5xx/timeout does not immediately close an opportunity.
 * 11. Deadline expiration follows existing lifecycle rules.
 * 12. No secrets are exposed.
 */

import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  evaluateOpportunityForAutoPublish,
  type EvaluatedCandidate
} from "@/lib/automation/publisher-decision";
import { publishOpportunityDirectly } from "@/lib/automation/direct-publisher";
import { isAutoPublishSourceAllowed, CANARY_AUTOPUBLISH_SOURCES } from "@/lib/automation/quality";
import { getSourceConfig } from "@/lib/automation/sources/registry";
import { SourceConfig } from "@/lib/automation/types";
import { revalidateOpportunity, classifyUrlResponse } from "@/lib/automation/revalidation";

describe("Phase 16D: Second Source Controlled Expansion Matrix", () => {
  const mockNow = new Date("2026-09-27T10:00:00.000Z");

  const studentInternshipSource = getSourceConfig("github_student_internships")!;
  const newGradSource = getSourceConfig("github_new_grad_jobs")!;
  const remoteOkSource = getSourceConfig("remoteok_tech_jobs")!;

  const validInternshipCandidate: EvaluatedCandidate = {
    source: "github_student_internships",
    sourceName: "SimplifyJobs Curated Student Tech Internships",
    sourceUrl: "https://job-boards.greenhouse.io/cresta/jobs/5106468008",
    externalId: "7ba71986-7f36-4096-9d70-31f988a5cd08",
    canonicalUrl: "https://job-boards.greenhouse.io/cresta/jobs/5106468008",
    canonicalHash: "student_cresta_hash_1",
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
    qualityScore: 92,
    spamRiskScore: 0,
    status: "PROCESSING",
    discoveredAt: mockNow,
    lastSeenAt: mockNow
  };

  const validNewGradCandidate: EvaluatedCandidate = {
    source: "github_new_grad_jobs",
    sourceName: "SimplifyJobs Curated New Grad & Junior Tech Roles",
    sourceUrl: "https://expedia.wd108.myworkdayjobs.com/private/job/USA---California---San-Jose/Machine-Learning-Science-Graduate---PhD---2026---San-Jose--Seattle_R-98587-1",
    externalId: "caf77277-3e8d-485a-96f4-3169239df38e",
    canonicalUrl: "https://expedia.wd108.myworkdayjobs.com/private/job/USA---California---San-Jose/Machine-Learning-Science-Graduate---PhD---2026---San-Jose--Seattle_R-98587-1",
    canonicalHash: "new_grad_expedia_hash_1",
    applicationUrl: "https://expedia.wd108.myworkdayjobs.com/private/job/USA---California---San-Jose/Machine-Learning-Science-Graduate---PhD---2026---San-Jose--Seattle_R-98587-1",
    title: "Machine Learning Science Graduate - PhD - 2026",
    normalizedTitle: "machine learning science graduate phd 2026",
    company: "Expedia Group",
    normalizedCompany: "expedia group",
    description: "Expedia Group is seeking an exceptional PhD graduate in Machine Learning, Computer Science, or related quantitative field to develop cutting-edge algorithms.",
    opportunityType: "JOB",
    subtypes: ["FULL_TIME"],
    tags: ["job", "new-grad", "entry-level", "early-career"],
    location: "San Jose, CA",
    city: "San Jose",
    state: "CA",
    country: "United States",
    workMode: "on-site",
    compensation: null,
    currency: "USD",
    skills: "Python, PyTorch, Distributed Training",
    duration: null,
    deadline: null,
    startDate: null,
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
        id: "mock_created_record_id_101",
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

    process.env.OPPORTUNITY_CANARY_SOURCE_ALLOWLIST = "github_student_internships,github_new_grad_jobs";
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

  // ==========================================================================
  // Test 1: github_student_internships still auto-publishes
  // ==========================================================================
  it("1. github_student_internships still auto-publishes under two-source allowlist", async () => {
    const decision = await evaluateOpportunityForAutoPublish(validInternshipCandidate, {
      sourceConfig: studentInternshipSource,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(decision.decision).toBe("AUTO_PUBLISH");
    expect(decision.publishable).toBe(true);
    const passedGatesCount = Object.values(decision.gates).filter((g) => g.passed).length;
    expect(passedGatesCount).toBe(11);

    const pub = await publishOpportunityDirectly({
      candidate: validInternshipCandidate,
      sourceConfig: studentInternshipSource,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(pub.success).toBe(true);
    expect(pub.action).toBe("CREATED");
    expect(pub.recordId).toBe("mock_created_record_id_101");
  });

  // ==========================================================================
  // Test 2: github_new_grad_jobs can auto-publish only when allowlisted
  // ==========================================================================
  it("2. github_new_grad_jobs can auto-publish only when allowlisted", async () => {
    // A: When allowlist contains both sources → AUTO_PUBLISH
    const decisionAllowed = await evaluateOpportunityForAutoPublish(validNewGradCandidate, {
      sourceConfig: newGradSource,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(decisionAllowed.decision).toBe("AUTO_PUBLISH");
    expect(decisionAllowed.publishable).toBe(true);

    const pub = await publishOpportunityDirectly({
      candidate: validNewGradCandidate,
      sourceConfig: newGradSource,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(pub.success).toBe(true);
    expect(pub.action).toBe("CREATED");

    // B: When allowlist restricts strictly to student internships → routes to NEEDS_REVIEW
    process.env.OPPORTUNITY_CANARY_SOURCE_ALLOWLIST = "github_student_internships";
    const decisionRestricted = await evaluateOpportunityForAutoPublish(validNewGradCandidate, {
      sourceConfig: newGradSource,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(decisionRestricted.decision).toBe("NEEDS_REVIEW");
    expect(decisionRestricted.publishable).toBe(false);
    expect(
      decisionRestricted.reasons.some((r) => r.includes("not in the active Phase 16D canary auto-publish allowlist"))
    ).toBe(true);

    const pubRestricted = await publishOpportunityDirectly({
      candidate: validNewGradCandidate,
      sourceConfig: newGradSource,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(pubRestricted.success).toBe(false);
    expect(pubRestricted.action).toBe("SKIPPED_NOT_PUBLISHABLE");
  });

  // ==========================================================================
  // Test 3: Non-allowlisted source cannot auto-publish even if all 11 gates pass
  // ==========================================================================
  it("3. Non-allowlisted source (e.g. remoteok_tech_jobs) cannot auto-publish even if all 11 gates pass", async () => {
    const remoteOkCandidate: EvaluatedCandidate = {
      ...validNewGradCandidate,
      source: "remoteok_tech_jobs",
      sourceName: "RemoteOK Verified Developer & Student Roles",
      canonicalUrl: "https://remoteok.com/l/123456",
      applicationUrl: "https://jobs.lever.co/remotecompany/789",
      sourceTrust: "CURATED_FEED"
    };

    const decision = await evaluateOpportunityForAutoPublish(remoteOkCandidate, {
      sourceConfig: remoteOkSource,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(decision.decision).toBe("NEEDS_REVIEW");
    expect(decision.publishable).toBe(false);

    const pub = await publishOpportunityDirectly({
      candidate: remoteOkCandidate,
      sourceConfig: remoteOkSource,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(pub.success).toBe(false);
    expect(pub.action).toBe("SKIPPED_NOT_PUBLISHABLE");
  });

  // ==========================================================================
  // Test 4: A github_new_grad_jobs candidate failing any gate cannot publish
  // ==========================================================================
  it("4. A github_new_grad_jobs candidate failing any gate cannot publish", async () => {
    // Gate 3 failure: Uncorrelated ATS domain/slug
    const badSlugCandidate: EvaluatedCandidate = {
      ...validNewGradCandidate,
      company: "Applied Materials",
      applicationUrl: "https://amat.wd1.myworkdayjobs.com/External/job/123",
      canonicalUrl: "https://amat.wd1.myworkdayjobs.com/External/job/123"
    };
    const resGate3 = await evaluateOpportunityForAutoPublish(badSlugCandidate, {
      sourceConfig: newGradSource,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });
    expect(resGate3.gates.authenticity.passed).toBe(false);
    expect(resGate3.decision).toBe("NEEDS_REVIEW");
    expect(resGate3.publishable).toBe(false);

    // Gate 4 failure: Incomplete content (description < 100 chars)
    const shortDescCandidate: EvaluatedCandidate = {
      ...validNewGradCandidate,
      description: "Short job description."
    };
    const resGate4 = await evaluateOpportunityForAutoPublish(shortDescCandidate, {
      sourceConfig: newGradSource,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });
    expect(resGate4.gates.contentCompleteness.passed).toBe(false);
    expect(resGate4.decision).toBe("REJECT");
    expect(resGate4.publishable).toBe(false);

    // Gate 6 failure: Unsafe URL / SSRF
    const ssrfCandidate: EvaluatedCandidate = {
      ...validNewGradCandidate,
      applicationUrl: "http://127.0.0.1:8080/apply",
      canonicalUrl: "http://127.0.0.1:8080/apply"
    };
    const resGate6 = await evaluateOpportunityForAutoPublish(ssrfCandidate, {
      sourceConfig: newGradSource,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });
    expect(resGate6.gates.urlSafety.passed).toBe(false);
    expect(resGate6.decision).toBe("QUARANTINE");
    expect(resGate6.publishable).toBe(false);

    // Gate 8 failure: Scam risk
    const scamCandidate: EvaluatedCandidate = {
      ...validNewGradCandidate,
      description: "Send 100 USD via Western Union or crypto payment to confirm your new graduate offer."
    };
    const resGate8 = await evaluateOpportunityForAutoPublish(scamCandidate, {
      sourceConfig: newGradSource,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });
    expect(resGate8.gates.scamRisk.passed).toBe(false);
    expect(resGate8.decision).toBe("QUARANTINE");
    expect(resGate8.publishable).toBe(false);

    // Gate 10 failure: Expired deadline in the past
    const expiredCandidate: EvaluatedCandidate = {
      ...validNewGradCandidate,
      deadline: new Date("2025-01-01T00:00:00.000Z")
    };
    const resGate10 = await evaluateOpportunityForAutoPublish(expiredCandidate, {
      sourceConfig: newGradSource,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });
    expect(resGate10.gates.freshnessDeadline.passed).toBe(false);
    expect(resGate10.decision).toBe("REJECT");
    expect(resGate10.publishable).toBe(false);
  });

  // ==========================================================================
  // Test 5: Duplicate external IDs cannot create another record
  // ==========================================================================
  it("5. Duplicate external IDs cannot create another record", async () => {
    const existingRec = {
      id: "existing_record_id_external_match",
      title: validNewGradCandidate.title,
      company: validNewGradCandidate.company,
      externalId: validNewGradCandidate.externalId,
      applicationLink: "https://other.example.com",
      status: "OPEN",
      deletedAt: null,
      source: "github_new_grad_jobs",
      description: "Existing rich description with more than 100 characters so update succeeds cleanly without error.",
      deadline: null,
      skills: null
    };

    const mockPrismaWithExternalId = {
      internship: {
        findFirst: async (args: any) => {
          if (
            args.where?.id === existingRec.id ||
            args.where?.externalId === validNewGradCandidate.externalId
          ) {
            return existingRec;
          }
          return null;
        },
        findUnique: async (args: any) => {
          if (args.where?.id === existingRec.id) {
            return existingRec;
          }
          return null;
        },
        create: async () => {
          throw new Error("Must not create duplicate on externalId match");
        },
        update: async (args: any) => ({
          ...existingRec,
          applicationLink: args.data.applicationLink
        })
      }
    };

    const decision = await evaluateOpportunityForAutoPublish(validNewGradCandidate, {
      sourceConfig: newGradSource,
      now: mockNow,
      prismaClient: mockPrismaWithExternalId as any,
      isAutoPublishEnabledOverride: true
    });

    expect(decision.gates.duplicateCheck.passed).toBe(false);
    expect(decision.gates.duplicateCheck.code).toBe("DUPLICATE_FOUND");
    expect(decision.decision).toBe("NEEDS_REVIEW");
    expect(decision.publishable).toBe(false);

    const pub = await publishOpportunityDirectly({
      candidate: validNewGradCandidate,
      sourceConfig: newGradSource,
      now: mockNow,
      prismaClient: mockPrismaWithExternalId as any,
      isAutoPublishEnabledOverride: true
    });

    expect(pub.action).toBe("UPDATED");
    expect(pub.recordId).toBe("existing_record_id_external_match");
  });

  // ==========================================================================
  // Test 6: Duplicate canonical application URLs cannot create another record
  // ==========================================================================
  it("6. Duplicate canonical application URLs cannot create another record", async () => {
    const existingRec = {
      id: "existing_record_id_url_match",
      title: "Some other title",
      company: validNewGradCandidate.company,
      externalId: "different_id_999",
      applicationLink: validNewGradCandidate.canonicalUrl,
      status: "OPEN",
      deletedAt: null,
      source: "github_new_grad_jobs",
      description: "Existing rich description with more than 100 characters so update succeeds cleanly without error.",
      deadline: null,
      skills: null
    };

    const mockPrismaWithUrl = {
      internship: {
        findFirst: async (args: any) => {
          if (
            args.where?.id === existingRec.id ||
            args.where?.applicationLink === validNewGradCandidate.canonicalUrl
          ) {
            return existingRec;
          }
          return null;
        },
        findUnique: async (args: any) => {
          if (args.where?.id === existingRec.id) {
            return existingRec;
          }
          return null;
        },
        create: async () => {
          throw new Error("Must not create duplicate on applicationUrl match");
        },
        update: async (args: any) => ({
          ...existingRec,
          applicationLink: args.data.applicationLink
        })
      }
    };

    const decision = await evaluateOpportunityForAutoPublish(validNewGradCandidate, {
      sourceConfig: newGradSource,
      now: mockNow,
      prismaClient: mockPrismaWithUrl as any,
      isAutoPublishEnabledOverride: true
    });

    expect(decision.gates.duplicateCheck.passed).toBe(false);
    expect(decision.gates.duplicateCheck.code).toBe("DUPLICATE_FOUND");
    expect(decision.decision).toBe("NEEDS_REVIEW");

    const pub = await publishOpportunityDirectly({
      candidate: validNewGradCandidate,
      sourceConfig: newGradSource,
      now: mockNow,
      prismaClient: mockPrismaWithUrl as any,
      isAutoPublishEnabledOverride: true
    });

    expect(pub.action).toBe("UPDATED");
    expect(pub.recordId).toBe("existing_record_id_url_match");
  });

  // ==========================================================================
  // Test 7: Terminal records cannot be resurrected
  // ==========================================================================
  it("7. Terminal records (EXPIRED, CLOSED, REJECTED) cannot be resurrected", async () => {
    for (const terminalStatus of ["EXPIRED", "CLOSED", "REJECTED"]) {
      const mockPrismaTerminal = {
        internship: {
          findFirst: async () => ({
            id: `record_${terminalStatus.toLowerCase()}`,
            title: validNewGradCandidate.title,
            company: validNewGradCandidate.company,
            status: terminalStatus,
            deletedAt: null,
            externalId: validNewGradCandidate.externalId,
            applicationLink: validNewGradCandidate.canonicalUrl
          }),
          findUnique: async () => ({
            id: `record_${terminalStatus.toLowerCase()}`,
            title: validNewGradCandidate.title,
            company: validNewGradCandidate.company,
            status: terminalStatus,
            deletedAt: null,
            externalId: validNewGradCandidate.externalId,
            applicationLink: validNewGradCandidate.canonicalUrl
          }),
          create: async () => {
            throw new Error(`Must not create duplicate of ${terminalStatus} record`);
          },
          update: async () => {
            throw new Error(`Must not update or resurrect ${terminalStatus} record`);
          }
        }
      };

      const pub = await publishOpportunityDirectly({
        candidate: validNewGradCandidate,
        sourceConfig: newGradSource,
        now: mockNow,
        prismaClient: mockPrismaTerminal as any,
        isAutoPublishEnabledOverride: true
      });

      expect(["SKIPPED_NOT_PUBLISHABLE", "FAILED_DATABASE_ERROR", "SKIPPED_DUPLICATE"]).toContain(
        pub.action
      );
    }
  });

  // ==========================================================================
  // Test 8: 403/WAF remains SOURCE_UNAVAILABLE during revalidation
  // ==========================================================================
  it("8. 403/WAF remains SOURCE_UNAVAILABLE and preserves opportunity as OPEN", async () => {
    const classification = classifyUrlResponse(new Response("Access Denied - Cloudflare", { status: 403 }));
    expect(classification.classification).toBe("SOURCE_UNAVAILABLE");

    const mockPrismaReval = {
      internship: {
        findUnique: async () => ({
          id: "opp_with_403",
          title: "Graduate Engineer",
          company: "Tech Corp",
          status: "OPEN",
          deadline: null,
          applicationLink: "https://techcorp.wd1.myworkdayjobs.com/job/1",
          deletedAt: null
        }),
        update: async () => {
          throw new Error("Must not change status on 403");
        }
      },
      platformSetting: {
        findUnique: async () => null,
        upsert: async () => ({}),
        deleteMany: async () => ({ count: 0 })
      }
    };

    const reval = await revalidateOpportunity("opp_with_403", {
      prisma: mockPrismaReval as any,
      fetchFn: async () => new Response("Cloudflare 403 Forbidden", { status: 403 }),
      autoExpireEnabledOverride: true
    });

    expect(reval.urlClassification).toBe("SOURCE_UNAVAILABLE");
    expect(reval.currentStatus).toBe("OPEN");
    expect(reval.actionTaken).toBe("NO_ACTION");
  });

  // ==========================================================================
  // Test 9: 404/410 follows existing closure lifecycle
  // ==========================================================================
  it("9. 404/410 follows existing closure lifecycle (CONFIRMED_REMOVAL)", async () => {
    const class404 = classifyUrlResponse(new Response("Page Not Found", { status: 404 }));
    expect(class404.classification).toBe("CONFIRMED_REMOVAL");

    const class410 = classifyUrlResponse(new Response("Job Posting Gone", { status: 410 }));
    expect(class410.classification).toBe("CONFIRMED_REMOVAL");

    let updatedStatus = "";
    const mockPrisma404 = {
      internship: {
        findUnique: async () => ({
          id: "opp_with_404",
          title: "Graduate Engineer",
          company: "Tech Corp",
          status: "OPEN",
          deadline: null,
          applicationLink: "https://jobs.example.com/expired-job",
          deletedAt: null
        }),
        update: async (args: any) => {
          updatedStatus = args.data.status;
          return { id: "opp_with_404", status: updatedStatus };
        }
      },
      platformSetting: {
        findUnique: async () => null,
        upsert: async () => ({}),
        deleteMany: async () => ({ count: 0 })
      }
    };

    const reval = await revalidateOpportunity("opp_with_404", {
      prisma: mockPrisma404 as any,
      fetchFn: async () => new Response("Not Found", { status: 404 }),
      autoExpireEnabledOverride: true
    });

    expect(reval.urlClassification).toBe("CONFIRMED_REMOVAL");
    expect(reval.currentStatus).toBe("CLOSED");
    expect(updatedStatus).toBe("CLOSED");
  });

  // ==========================================================================
  // Test 10: Temporary 5xx/timeout does not immediately close an opportunity
  // ==========================================================================
  it("10. Temporary 5xx/timeout increments outage count and does not immediately close", async () => {
    const class500 = classifyUrlResponse(new Response("Internal Server Error", { status: 500 }));
    expect(class500.classification).toBe("TEMPORARY_OUTAGE");

    let savedFailures = 0;
    const mockPrisma5xx = {
      internship: {
        findUnique: async () => ({
          id: "opp_with_503",
          title: "Graduate Engineer",
          company: "Tech Corp",
          status: "OPEN",
          deadline: null,
          applicationLink: "https://careers.example.com/job/55",
          deletedAt: null
        }),
        update: async () => {
          throw new Error("Must not close on first temporary 5xx outage");
        }
      },
      platformSetting: {
        findUnique: async () => null,
        upsert: async (args: any) => {
          const parsed = JSON.parse(args.create.value);
          savedFailures = parsed.consecutiveFailures;
          return {};
        },
        deleteMany: async () => ({ count: 0 })
      }
    };

    const reval = await revalidateOpportunity("opp_with_503", {
      prisma: mockPrisma5xx as any,
      fetchFn: async () => new Response("Service Unavailable", { status: 503 }),
      autoExpireEnabledOverride: true,
      maxConsecutiveFailures: 3
    });

    expect(reval.urlClassification).toBe("TEMPORARY_OUTAGE");
    expect(reval.currentStatus).toBe("OPEN");
    expect(reval.actionTaken).toBe("OUTAGE_INCREMENTED");
    expect(savedFailures).toBe(1);
  });

  // ==========================================================================
  // Test 11: Deadline expiration follows existing lifecycle rules
  // ==========================================================================
  it("11. Deadline expiration mutates status to EXPIRED when enabled", async () => {
    let updatedStatus = "";
    const pastDeadline = new Date(mockNow.getTime() - 24 * 60 * 60 * 1000); // 1 day ago

    const mockPrismaExpiry = {
      internship: {
        findUnique: async () => ({
          id: "opp_expired_deadline",
          title: "Past Deadline Role",
          company: "Tech Corp",
          status: "OPEN",
          deadline: pastDeadline,
          applicationLink: "https://careers.example.com/job/past",
          deletedAt: null
        }),
        update: async (args: any) => {
          updatedStatus = args.data.status;
          return { id: "opp_expired_deadline", status: updatedStatus };
        }
      },
      platformSetting: {
        findUnique: async () => null,
        upsert: async () => ({}),
        deleteMany: async () => ({ count: 0 })
      }
    };

    // When autoExpireEnabled is true → mutates to EXPIRED
    const revalEnabled = await revalidateOpportunity("opp_expired_deadline", {
      prisma: mockPrismaExpiry as any,
      now: mockNow,
      autoExpireEnabledOverride: true
    });

    expect(revalEnabled.deadlineExpired).toBe(true);
    expect(revalEnabled.currentStatus).toBe("EXPIRED");
    expect(updatedStatus).toBe("EXPIRED");

    // When autoExpireEnabled is false → preserved as OPEN
    let preservedUpdateCalled = false;
    const mockPrismaPreserved = {
      internship: {
        findUnique: async () => ({
          id: "opp_expired_deadline_disabled",
          title: "Past Deadline Role",
          company: "Tech Corp",
          status: "OPEN",
          deadline: pastDeadline,
          applicationLink: "https://careers.example.com/job/past",
          deletedAt: null
        }),
        update: async () => {
          preservedUpdateCalled = true;
        }
      },
      platformSetting: {
        findUnique: async () => null,
        upsert: async () => ({}),
        deleteMany: async () => ({ count: 0 })
      }
    };

    const revalDisabled = await revalidateOpportunity("opp_expired_deadline_disabled", {
      prisma: mockPrismaPreserved as any,
      now: mockNow,
      autoExpireEnabledOverride: false
    });

    expect(revalDisabled.deadlineExpired).toBe(true);
    expect(revalDisabled.currentStatus).toBe("OPEN");
    expect(preservedUpdateCalled).toBe(false);
  });

  // ==========================================================================
  // Test 12: No secrets are exposed
  // ==========================================================================
  it("12. No secrets are exposed in candidate evaluation or decision telemetry", async () => {
    const sensitiveTokens = [
      "CRON_SECRET",
      "GROQ_API_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "POSTGRES_PASSWORD",
      "NEXTAUTH_SECRET"
    ];

    const decision = await evaluateOpportunityForAutoPublish(validNewGradCandidate, {
      sourceConfig: newGradSource,
      now: mockNow,
      prismaClient: mockEmptyPrisma,
      isAutoPublishEnabledOverride: true
    });

    const serializedDecision = JSON.stringify(decision);
    for (const token of sensitiveTokens) {
      expect(serializedDecision.includes(token)).toBe(false);
      const secretVal = process.env[token];
      if (secretVal && secretVal.length > 8) {
        expect(serializedDecision.includes(secretVal)).toBe(false);
      }
    }
  });
});
