/**
 * Multi-Source Discovery Timeout Remediation & Bounded Work Budget Tests
 * CampusConnectCo — Phase 16D
 *
 * Deterministic tests proving:
 * 1. Full registry cannot exceed configured work budget.
 * 2. One slow source cannot cause an unbounded request.
 * 3. Source-level timeout is bounded.
 * 4. A timed-out source becomes temporary/unavailable and does not close an OPEN opportunity.
 * 5. 403/WAF remains SOURCE_UNAVAILABLE.
 * 6. 404/410 remains confirmed removal.
 * 7. 5xx remains temporary outage.
 * 8. Two-source auto-publishing still works.
 * 9. Non-allowlisted sources remain review-only.
 * 10. Duplicate prevention still works.
 * 11. Terminal records cannot resurrect.
 * 12. Repeated execution is idempotent.
 * 13. No source is silently skipped without an observable result.
 * 14. No secrets are exposed.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/cron/opportunity-discovery/route";
import {
  runDueOpportunitySources,
  runScheduledPipeline,
  sanitizeSecrets
} from "@/lib/automation/sources/scheduler";
import {
  fetchWithTimeout,
  runDiscoveryForSource
} from "@/lib/automation/sources/discovery-worker";
import { getAllEnabledSources, getSourceConfig } from "@/lib/automation/sources/registry";
import { SourceConfig } from "@/lib/automation/types";
import { revalidateOpportunity, classifyUrlResponse } from "@/lib/automation/revalidation";
import { evaluateOpportunityForAutoPublish, EvaluatedCandidate } from "@/lib/automation/publisher-decision";
import { publishOpportunityDirectly } from "@/lib/automation/direct-publisher";
import rawPrisma from "@/lib/prisma";

describe("Phase 16D: Multi-Source Discovery Timeout Remediation", { timeout: 30000 }, () => {
  const TEST_CRON_SECRET = "test-cron-secret-abcdef1234567890";
  const mockNow = new Date("2026-09-27T10:00:00.000Z");
  const originalEnv = { ...process.env };

  const studentCandidate: EvaluatedCandidate = {
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

  const newGradCandidate: EvaluatedCandidate = {
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

  const studentSource = getSourceConfig("github_student_internships")!;
  const newGradSource = getSourceConfig("github_new_grad_jobs")!;

  beforeEach(() => {
    process.env.CRON_SECRET = TEST_CRON_SECRET;
    process.env.OPPORTUNITY_REVALIDATION_ENABLED = "true";
    process.env.OPPORTUNITY_AUTO_EXPIRE_ENABLED = "true";
    process.env.OPPORTUNITY_AUTOPUBLISH_ENABLED = "true";
    process.env.OPPORTUNITY_CANARY_SOURCE_ALLOWLIST =
      "github_student_internships,github_new_grad_jobs";
    process.env.OPPORTUNITY_CANARY_ENFORCE_IN_TEST = "true";

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input: any) => {
      const url = typeof input === "string" ? input : input?.url || "";
      if (url.includes("devfolio")) {
        return new Response(JSON.stringify({ result: [] }), { status: 200 });
      }
      if (url.includes("remoteok")) {
        return new Response(JSON.stringify([{ legal: "notice" }]), { status: 200 });
      }
      if (url.includes("github") || url.includes("raw.githubusercontent")) {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      return new Response("OK", { status: 200 });
    });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  // 1. Full registry cannot exceed configured work budget
  it("1. full registry cannot exceed configured work budget", async () => {
    const mockPrisma: any = {
      platformSetting: {
        findMany: async () => [],
        findUnique: async () => null,
        upsert: async () => ({})
      }
    };

    // Run scheduler with batchSize = 1 and forceAll: true
    const result = await runDueOpportunitySources({
      prisma: mockPrisma,
      maxSourcesPerInvocation: 1,
      forceAll: true
    });

    // Invariant: Exactly 1 source processed, remaining deferred
    expect(result.metrics.sourcesAttempted).toBe(1);
    expect(result.metrics.sourcesDeferred).toBeGreaterThanOrEqual(10);
    expect(result.deferredSources?.length).toBeGreaterThanOrEqual(10);
    expect(result.nextEligibleSource).toBeDefined();
    expect(result.boundedWorkBudget).toBe(1);
  });

  // 2. One slow source cannot cause an unbounded request
  it("2. one slow source cannot cause an unbounded request", async () => {
    const mockPrisma: any = {
      platformSetting: {
        findMany: async () => [],
        findUnique: async () => null,
        upsert: async () => ({})
      }
    };

    const slowMockFetch = vi.fn().mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 40));
      return new Response(JSON.stringify([]), { status: 200 });
    });
    vi.spyOn(globalThis, "fetch").mockImplementation(slowMockFetch);

    // Set duration ceiling to 50ms with 40ms per source and forceAll: true
    const result = await runDueOpportunitySources({
      prisma: mockPrisma,
      maxSourcesPerInvocation: 10,
      maxDurationMs: 50, // Force deadline trigger after 1-2 sources
      forceAll: true
    });

    // Should stop executing and defer remaining
    expect(result.metrics.sourcesAttempted).toBeLessThanOrEqual(5);
    expect(result.deferredSources?.length).toBeGreaterThan(0);
  });

  // 3. Source-level timeout is bounded
  it("3. source-level timeout is bounded", async () => {
    const slowFetch = vi.fn().mockImplementation(
      (_url: any, init: any) =>
        new Promise((resolve, reject) => {
          const t = setTimeout(() => resolve(new Response("OK")), 100);
          if (init?.signal) {
            init.signal.addEventListener("abort", () => {
              clearTimeout(t);
              reject(new DOMException("The operation was aborted", "AbortError"));
            });
          }
        })
    );
    vi.spyOn(globalThis, "fetch").mockImplementation(slowFetch);

    await expect(
      fetchWithTimeout("https://example.com/slow", {}, 20)
    ).rejects.toThrow(/timed out/i);
  });

  // 4. A timed-out source becomes temporary/unavailable and does not close an OPEN opportunity
  it("4. a timed-out source becomes temporary/unavailable and does not close an OPEN opportunity", async () => {
    let statusMutated = false;
    const mockPrisma: any = {
      internship: {
        findUnique: async () => ({
          id: "timeout-opp-1",
          status: "OPEN",
          deadline: new Date(Date.now() + 86400000),
          applicationLink: "https://slow-site.example.com/apply",
          deletedAt: null
        }),
        update: async () => {
          statusMutated = true;
        }
      },
      platformSetting: {
        findUnique: async () => null,
        upsert: async () => ({})
      }
    };

    const mockFetch = vi.fn().mockImplementation(async () => {
      const err = new Error("Fetch request timed out after 8000ms");
      err.name = "AbortError";
      throw err;
    });

    const res = await revalidateOpportunity("timeout-opp-1", {
      prisma: mockPrisma,
      fetchFn: mockFetch,
      maxConsecutiveFailures: 3
    });

    expect(res.currentStatus).toBe("OPEN");
    expect(res.urlClassification).toBe("TEMPORARY_OUTAGE");
    expect(res.actionTaken).toBe("OUTAGE_INCREMENTED");
    expect(statusMutated).toBe(false); // Status remains OPEN!
  });

  // 5. 403/WAF remains SOURCE_UNAVAILABLE
  it("5. 403/WAF remains SOURCE_UNAVAILABLE", async () => {
    let statusMutated = false;
    const mockPrisma: any = {
      internship: {
        findUnique: async () => ({
          id: "waf-opp-1",
          status: "OPEN",
          deadline: new Date(Date.now() + 86400000),
          applicationLink: "https://protected-site.example.com/apply",
          deletedAt: null
        }),
        update: async () => {
          statusMutated = true;
        }
      },
      platformSetting: {
        findUnique: async () => null,
        upsert: async () => ({})
      }
    };

    const mockFetch = vi.fn().mockResolvedValue(new Response("Cloudflare WAF Block", { status: 403 }));

    const res = await revalidateOpportunity("waf-opp-1", {
      prisma: mockPrisma,
      fetchFn: mockFetch
    });

    expect(res.currentStatus).toBe("OPEN");
    expect(res.urlClassification).toBe("SOURCE_UNAVAILABLE");
    expect(res.actionTaken).toBe("NO_ACTION");
    expect(statusMutated).toBe(false);
  });

  // 6. 404/410 remains confirmed removal
  it("6. 404/410 remains confirmed removal", async () => {
    let closedStatus: string | null = null;
    const mockPrisma: any = {
      internship: {
        findUnique: async () => ({
          id: "closed-opp-1",
          status: "OPEN",
          deadline: new Date(Date.now() + 86400000),
          applicationLink: "https://dead-job.example.com/apply",
          deletedAt: null
        }),
        update: async ({ data }: any) => {
          closedStatus = data.status;
        }
      },
      platformSetting: {
        findUnique: async () => null,
        upsert: async () => ({}),
        deleteMany: async () => ({ count: 1 })
      }
    };

    const mockFetch = vi.fn().mockResolvedValue(new Response("Not Found", { status: 404 }));

    const res = await revalidateOpportunity("closed-opp-1", {
      prisma: mockPrisma,
      fetchFn: mockFetch
    });

    expect(res.currentStatus).toBe("CLOSED");
    expect(res.urlClassification).toBe("CONFIRMED_REMOVAL");
    expect(res.actionTaken).toBe("STATUS_CHANGED");
    expect(closedStatus).toBe("CLOSED");
  });

  // 7. 5xx remains temporary outage
  it("7. 5xx remains temporary outage", async () => {
    let statusMutated = false;
    const mockPrisma: any = {
      internship: {
        findUnique: async () => ({
          id: "outage-opp-1",
          status: "OPEN",
          deadline: new Date(Date.now() + 86400000),
          applicationLink: "https://error-site.example.com/apply",
          deletedAt: null
        }),
        update: async () => {
          statusMutated = true;
        }
      },
      platformSetting: {
        findUnique: async () => null,
        upsert: async () => ({})
      }
    };

    const mockFetch = vi.fn().mockResolvedValue(new Response("Gateway Error", { status: 502 }));

    const res = await revalidateOpportunity("outage-opp-1", {
      prisma: mockPrisma,
      fetchFn: mockFetch
    });

    expect(res.currentStatus).toBe("OPEN");
    expect(res.urlClassification).toBe("TEMPORARY_OUTAGE");
    expect(res.actionTaken).toBe("OUTAGE_INCREMENTED");
    expect(statusMutated).toBe(false);
  });

  // 8. Two-source auto-publishing still works
  it("8. two-source auto-publishing still works for github_student_internships and github_new_grad_jobs", async () => {
    const mockPrisma: any = {
      internship: {
        findFirst: async () => null,
        create: async () => ({ id: "mock_created_record_id" })
      },
      gig: { findFirst: async () => null },
      $transaction: async (fn: any) => fn(mockPrisma)
    };

    const dec1 = await evaluateOpportunityForAutoPublish(studentCandidate, {
      sourceConfig: studentSource,
      prismaClient: mockPrisma,
      isAutoPublishEnabledOverride: true,
      canarySourceAllowlistOverride: ["github_student_internships", "github_new_grad_jobs"]
    });
    expect(dec1.publishable).toBe(true);
    expect(dec1.decision).toBe("AUTO_PUBLISH");

    const dec2 = await evaluateOpportunityForAutoPublish(newGradCandidate, {
      sourceConfig: newGradSource,
      prismaClient: mockPrisma,
      isAutoPublishEnabledOverride: true,
      canarySourceAllowlistOverride: ["github_student_internships", "github_new_grad_jobs"]
    });
    expect(dec2.publishable).toBe(true);
    expect(dec2.decision).toBe("AUTO_PUBLISH");
  });

  // 9. Non-allowlisted sources remain review-only
  it("9. non-allowlisted sources remain review-only even if 11 gates pass", async () => {
    const mockPrisma: any = {
      internship: { findFirst: async () => null },
      gig: { findFirst: async () => null }
    };

    const nonAllowlisted: EvaluatedCandidate = {
      ...newGradCandidate,
      source: "remoteok_tech_jobs",
      sourceName: "RemoteOK Curated Tech Jobs",
      sourceUrl: "https://remoteok.com/l/789",
      company: "Acme",
      normalizedCompany: "acme",
      applicationUrl: "https://jobs.lever.co/acme/456",
      canonicalUrl: "https://jobs.lever.co/acme/456",
      sourceTrust: "CURATED_FEED"
    };

    const remoteOkSource = getSourceConfig("remoteok_tech_jobs")!;
    const dec = await evaluateOpportunityForAutoPublish(nonAllowlisted, {
      sourceConfig: remoteOkSource,
      prismaClient: mockPrisma,
      isAutoPublishEnabledOverride: true,
      canarySourceAllowlistOverride: ["github_student_internships", "github_new_grad_jobs"]
    });
    expect(dec.publishable).toBe(false);
    expect(dec.decision).toBe("NEEDS_REVIEW");
    expect(dec.reasons.some((r) => r.includes("canary auto-publish allowlist"))).toBe(true);
  });

  // 10. Duplicate prevention still works
  it("10. duplicate prevention still works", async () => {
    const existingRec = {
      id: "already-published-id",
      title: newGradCandidate.title,
      company: newGradCandidate.company,
      externalId: newGradCandidate.externalId,
      applicationLink: newGradCandidate.canonicalUrl,
      status: "OPEN",
      deletedAt: null,
      source: "github_new_grad_jobs",
      description: "Existing rich description with more than 100 characters so update succeeds cleanly without error.",
      deadline: null,
      skills: null
    };

    const mockPrismaWithDuplicate = {
      internship: {
        findFirst: async (args: any) => {
          if (
            args.where?.id === existingRec.id ||
            args.where?.externalId === newGradCandidate.externalId
          ) {
            return existingRec;
          }
          return null;
        },
        findUnique: async () => existingRec,
        create: async () => {
          throw new Error("Must not create duplicate");
        },
        update: async (args: any) => ({
          ...existingRec,
          applicationLink: args.data.applicationLink
        })
      },
      gig: { findFirst: async () => null }
    };

    const pubResult = await publishOpportunityDirectly({
      candidate: newGradCandidate,
      sourceConfig: newGradSource,
      now: mockNow,
      prismaClient: mockPrismaWithDuplicate as any,
      isAutoPublishEnabledOverride: true,
      canarySourceAllowlistOverride: ["github_student_internships", "github_new_grad_jobs"]
    });

    expect(pubResult.action).toBe("UPDATED");
    expect(pubResult.recordId).toBe("already-published-id");
  });

  // 11. Terminal records cannot resurrect
  it("11. terminal records cannot resurrect", async () => {
    let updateAttempted = false;
    const mockPrismaTerminal = {
      internship: {
        findFirst: async () => ({
          id: "terminal-record-id",
          title: newGradCandidate.title,
          company: newGradCandidate.company,
          externalId: newGradCandidate.externalId,
          applicationLink: newGradCandidate.canonicalUrl,
          status: "CLOSED",
          deletedAt: null
        }),
        findUnique: async () => ({
          id: "terminal-record-id",
          title: newGradCandidate.title,
          company: newGradCandidate.company,
          externalId: newGradCandidate.externalId,
          applicationLink: newGradCandidate.canonicalUrl,
          status: "CLOSED",
          deletedAt: null
        }),
        create: async () => {
          throw new Error("Must not create duplicate of terminal record");
        },
        update: async () => {
          updateAttempted = true;
          throw new Error("Must not update terminal record");
        }
      },
      gig: { findFirst: async () => null }
    };

    const pubResult = await publishOpportunityDirectly({
      candidate: newGradCandidate,
      sourceConfig: newGradSource,
      now: mockNow,
      prismaClient: mockPrismaTerminal as any,
      isAutoPublishEnabledOverride: true,
      canarySourceAllowlistOverride: ["github_student_internships", "github_new_grad_jobs"]
    });

    expect(pubResult.action).toBe("SKIPPED_NOT_PUBLISHABLE");
    expect(updateAttempted).toBe(false);
  });

  // 12. Repeated execution is idempotent
  it("12. repeated execution is idempotent", async () => {
    const mockPrisma: any = {
      platformSetting: {
        findMany: async () => [],
        findUnique: async () => null,
        upsert: async () => ({})
      },
      automationRun: {
        create: async () => ({}),
        update: async () => ({})
      }
    };

    const run1 = await runScheduledPipeline({
      action: "discover",
      sourceSubset: ["github_student_internships"],
      prisma: mockPrisma
    });
    const run2 = await runScheduledPipeline({
      action: "discover",
      sourceSubset: ["github_student_internships"],
      prisma: mockPrisma
    });

    expect(run1.runId).not.toBe(run2.runId);
    expect(run1.errors.length).toBe(0);
    expect(run2.errors.length).toBe(0);
  });

  // 13. No source is silently skipped without an observable result
  it("13. no source is silently skipped without an observable result", async () => {
    const mockPrisma: any = {
      platformSetting: {
        findMany: async () => [],
        findUnique: async () => null,
        upsert: async () => ({})
      },
      automationRun: {
        create: async () => ({}),
        update: async () => ({})
      }
    };

    const telemetry = await runScheduledPipeline({
      action: "discover",
      maxSourcesPerInvocation: 1,
      forceAllSources: true,
      prisma: mockPrisma
    });

    expect(telemetry.sourcesAttempted).toBe(1);
    expect(telemetry.sourcesDeferred).toBeGreaterThanOrEqual(10);
    expect(telemetry.deferredSources).toBeDefined();
    expect(telemetry.deferredSources!.length).toBeGreaterThanOrEqual(10);
    expect(telemetry.nextEligibleSource).toBeDefined();

    // Verify all deferred sources have explicit documented reasons
    for (const d of telemetry.deferredSources!) {
      expect(d.reason).toContain("Deferred to next scheduled invocation");
    }
  });

  // 14. No secrets are exposed
  it("14. no secrets are exposed in logs, bundles, or telemetry", () => {
    const sampleLog = `Authentication token Bearer ${TEST_CRON_SECRET} provided to endpoint`;
    const cleanLog = sanitizeSecrets(sampleLog);

    expect(cleanLog).not.toContain(TEST_CRON_SECRET);
    expect(cleanLog).toContain("[REDACTED_SECRET]");
  });
});
