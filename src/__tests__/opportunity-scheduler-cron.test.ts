import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET } from "@/app/api/cron/opportunity-discovery/route";
import {
  runDueOpportunitySources,
  runOpportunityRevalidation,
  runScheduledPipeline,
  sanitizeSecrets
} from "@/lib/automation/sources/scheduler";
import { runDiscoveryForSource } from "@/lib/automation/sources/discovery-worker";
import { SourceConfig } from "@/lib/automation/types";
import { EvaluatedCandidate } from "@/lib/automation/publisher-decision";
import { publishOpportunityDirectly } from "@/lib/automation/direct-publisher";
import { revalidateOpportunity } from "@/lib/automation/revalidation";
import rawPrisma from "@/lib/prisma";

describe("Phase 16D: Scheduler & Cron Wiring (Phase 4)", { timeout: 30000 }, () => {
  const TEST_CRON_SECRET = "test-cron-secret-1234567890abcdef";
  const TEST_GROQ_KEY = "gsk-test-groq-api-key-987654321";
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.CRON_SECRET = TEST_CRON_SECRET;
    process.env.GROQ_API_KEY = TEST_GROQ_KEY;
    // Strictly preserve disabled flags
    process.env.OPPORTUNITY_AUTOPUBLISH_ENABLED = "false";
    process.env.OPPORTUNITY_AUTO_EXPIRE_ENABLED = "false";
    process.env.OPPORTUNITY_REVALIDATION_ENABLED = "false";

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input: any) => {
      const url = typeof input === "string" ? input : input?.url || "";
      if (url.includes("invalid-non-existent-domain")) {
        throw new Error("fetch failed");
      }
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

  // 1. authenticated cron request succeeds
  it("1. authenticated cron request succeeds", async () => {
    const req = new NextRequest("http://localhost:3000/api/cron/opportunity-discovery?action=discover&source=mohan_careers", {
      method: "POST",
      headers: {
        authorization: `Bearer ${TEST_CRON_SECRET}`
      }
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.message).toContain("Scheduled discover cycle executed successfully");
    expect(json.runId).toBeDefined();
    expect(json.telemetry).toBeDefined();
    expect(json.telemetry.action).toBe("discover");
    expect(json.telemetry.startedAt).toBeDefined();
    expect(json.telemetry.completedAt).toBeDefined();
  });

  // 2. unauthenticated cron request rejected
  it("2. unauthenticated cron request rejected", async () => {
    const postReq = new NextRequest("http://localhost:3000/api/cron/opportunity-discovery", {
      method: "POST"
    });
    const postRes = await POST(postReq);
    expect(postRes.status).toBe(401);
    const postJson = await postRes.json();
    expect(postJson.error).toContain("Unauthorized");

    const getReq = new NextRequest("http://localhost:3000/api/cron/opportunity-discovery", {
      method: "GET"
    });
    const getRes = await GET(getReq);
    expect(getRes.status).toBe(401);
  });

  // 3. invalid CRON_SECRET rejected
  it("3. invalid CRON_SECRET rejected", async () => {
    const req = new NextRequest("http://localhost:3000/api/cron/opportunity-discovery", {
      method: "POST",
      headers: {
        authorization: "Bearer wrong-secret-token"
      }
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toContain("Unauthorized");
  });

  // 4. discovery action executes
  it("4. discovery action executes", async () => {
    const telemetry = await runScheduledPipeline({
      action: "discover",
      sourceSubset: ["mohan_careers"]
    });

    expect(telemetry.action).toBe("discover");
    expect(telemetry.runId).toBeDefined();
    expect(typeof telemetry.sourcesAttempted).toBe("number");
    expect(typeof telemetry.recordsDiscovered).toBe("number");
    expect(typeof telemetry.recordsNormalized).toBe("number");
    expect(telemetry.revalidationChecks).toBe(0); // Discovery only
  });

  // 5. revalidation action executes
  it("5. revalidation action executes", async () => {
    const telemetry = await runScheduledPipeline({
      action: "revalidate",
      batchSize: 2
    });

    expect(telemetry.action).toBe("revalidate");
    expect(telemetry.runId).toBeDefined();
    expect(telemetry.sourcesAttempted).toBe(0); // Revalidation only
    expect(typeof telemetry.revalidationChecks).toBe("number");
    expect(typeof telemetry.expiredCandidates).toBe("number");
    expect(typeof telemetry.confirmedRemovals).toBe("number");
  });

  // 6. disabled autopublish prevents OPEN transition
  it("6. disabled autopublish prevents OPEN transition", async () => {
    process.env.OPPORTUNITY_AUTOPUBLISH_ENABLED = "false";

    const candidate: EvaluatedCandidate = {
      source: "official_source",
      sourceName: "Official Source",
      sourceUrl: "https://careers.google.com/jobs/swe",
      externalId: "swe-intern-test-01",
      canonicalUrl: "https://careers.google.com/jobs/swe-1",
      canonicalHash: "hash_swe_1",
      applicationUrl: "https://careers.google.com/jobs/swe-1",
      title: "Software Engineering Intern 2026",
      normalizedTitle: "software engineering intern 2026",
      company: "Google",
      normalizedCompany: "google",
      description: "Join Google for a 12-week summer internship working on cutting edge systems and infrastructure with distributed computing.",
      opportunityType: "INTERNSHIP",
      sourceTrust: "OFFICIAL",
      verificationState: "OFFICIAL_SOURCE_CONFIRMED",
      qualityScore: 95,
      spamRiskScore: 0,
      status: "PROCESSING",
      discoveredAt: new Date(),
      lastSeenAt: new Date()
    } as EvaluatedCandidate;

    const sourceConfig: SourceConfig = {
      source: "official_source",
      sourceName: "Official Source",
      category: "CAREERS",
      discoveryMethod: "structured_api",
      defaultTrust: "OFFICIAL",
      scheduleMinutes: 360,
      endpointUrl: "https://careers.google.com/api",
      enabled: true,
      maxItemsPerRun: 10
    };

    const pubResult = await publishOpportunityDirectly({
      candidate,
      sourceConfig
    });

    expect(pubResult.success).toBe(false);
    expect(pubResult.action).toBe("SKIPPED_NOT_PUBLISHABLE");
    expect(pubResult.decisionResult.decision).toBe("NEEDS_REVIEW");
    expect((pubResult as any).opportunityId).toBeFalsy();
    expect(pubResult.decisionResult.reasons.some((r) => r.includes("OPPORTUNITY_AUTOPUBLISH_ENABLED"))).toBe(true);
  });

  // 7. disabled auto-expire prevents lifecycle mutation
  it("7. disabled auto-expire prevents lifecycle mutation", async () => {
    process.env.OPPORTUNITY_AUTO_EXPIRE_ENABLED = "false";

    let dbUpdated = false;
    const mockPrisma: any = {
      internship: {
        findUnique: async () => ({
          id: "opp-expire-test",
          title: "Expired Intern",
          company: "Acme",
          status: "OPEN",
          deadline: new Date("2026-01-01T00:00:00.000Z"), // Past deadline
          applicationLink: "https://example.com/apply",
          deletedAt: null
        }),
        update: async () => {
          dbUpdated = true;
        }
      },
      platformSetting: {
        findUnique: async () => null,
        deleteMany: async () => ({ count: 0 })
      }
    };

    const result = await revalidateOpportunity("opp-expire-test", {
      prisma: mockPrisma,
      now: new Date("2026-09-26T12:00:00.000Z")
    });

    expect(result.currentStatus).toBe("OPEN"); // Not mutated in DB
    expect(result.deadlineExpired).toBe(true);
    expect(result.reason).toContain("[DRY-RUN]");
    expect(dbUpdated).toBe(false); // Database update was skipped
  });

  // 8. disabled revalidation prevents lifecycle mutation
  it("8. disabled revalidation prevents lifecycle mutation", async () => {
    process.env.OPPORTUNITY_REVALIDATION_ENABLED = "false";

    let dbUpdated = false;
    const mockPrisma: any = {
      internship: {
        findUnique: async () => ({
          id: "opp-reval-test",
          title: "Closed Intern",
          company: "Acme",
          status: "OPEN",
          deadline: new Date("2026-12-01T00:00:00.000Z"),
          applicationLink: "https://example.com/apply-404",
          deletedAt: null
        }),
        update: async () => {
          dbUpdated = true;
        }
      },
      platformSetting: {
        findUnique: async () => null,
        deleteMany: async () => ({ count: 0 })
      }
    };

    const mockFetch = vi.fn().mockResolvedValue(new Response("Not Found", { status: 404 }));

    const result = await revalidateOpportunity("opp-reval-test", {
      prisma: mockPrisma,
      fetchFn: mockFetch,
      now: new Date("2026-09-26T12:00:00.000Z")
    });

    expect(result.currentStatus).toBe("OPEN"); // Not mutated in DB
    expect(result.urlClassification).toBe("CONFIRMED_REMOVAL");
    expect(result.reason).toContain("[DRY-RUN]");
    expect(dbUpdated).toBe(false); // Database update was skipped
  });

  // 9. repeated cron execution is idempotent
  it("9. repeated cron execution is idempotent", async () => {
    const run1 = await runScheduledPipeline({ action: "discover", sourceSubset: ["mohan_careers"] });
    const run2 = await runScheduledPipeline({ action: "discover", sourceSubset: ["mohan_careers"] });

    expect(run1.runId).not.toBe(run2.runId);
    expect(run1.errors.length).toBe(0);
    expect(run2.errors.length).toBe(0);
  });

  // 10. duplicate discovery does not duplicate records
  it("10. duplicate discovery does not duplicate records", async () => {
    const mockSource: SourceConfig = {
      source: "test_dup_source",
      sourceName: "Test Dup Source",
      category: "CAREERS",
      discoveryMethod: "structured_api",
      defaultTrust: "TRUSTED",
      scheduleMinutes: 360,
      endpointUrl: "https://test.com/api",
      enabled: true,
      maxItemsPerRun: 5
    };

    const rawItems = [
      {
        source: "test_dup_source",
        sourceName: "Test Dup Source",
        sourceUrl: "https://test.com/job/1",
        externalId: "dup-id-001",
        applicationUrl: "https://test.com/apply/1",
        title: "Platform Engineer Intern",
        company: "Test Corp",
        description: "Great platform engineering internship with Kubernetes, Docker, and Go.",
        opportunityType: "INTERNSHIP" as const
      }
    ];

    // Run 1: Item is new
    let isRun2 = false;
    vi.spyOn(rawPrisma.internship as any, "findFirst").mockImplementation(async () => {
      if (isRun2) {
        return {
          id: "existing-dup-id",
          applicationLink: "https://test.com/apply/1",
          externalId: "dup-id-001",
          company: "Test Corp",
          title: "Platform Engineer Intern"
        } as any;
      }
      return null;
    });

    const run1 = await runDiscoveryForSource(mockSource, rawItems);
    expect(run1.itemsProcessed).toBe(1);
    expect(run1.duplicatesPrevented).toBe(0);

    // Run 2: Same item is detected as duplicate via database check
    isRun2 = true;
    const run2 = await runDiscoveryForSource(mockSource, rawItems);
    expect(run2.itemsProcessed).toBe(1);
    expect(run2.duplicatesPrevented).toBe(1);
  });

  // 11. source failure is isolated
  it("11. source failure is isolated", async () => {
    const failingSource: SourceConfig = {
      source: "failing_source",
      sourceName: "Failing Source",
      category: "CAREERS",
      discoveryMethod: "structured_api",
      defaultTrust: "UNKNOWN",
      scheduleMinutes: 10,
      endpointUrl: "https://invalid-non-existent-domain-90210.org/api",
      enabled: true,
      maxItemsPerRun: 5
    };

    const healthySource: SourceConfig = {
      source: "healthy_source",
      sourceName: "Healthy Source",
      category: "CAREERS",
      discoveryMethod: "structured_api",
      defaultTrust: "TRUSTED",
      scheduleMinutes: 10,
      endpointUrl: "https://example.com/api",
      enabled: true,
      maxItemsPerRun: 5
    };

    // Spy on fetch: fail on failing_source, succeed on healthy_source
    const failRes = await runDiscoveryForSource(failingSource);
    expect(failRes.errors.length).toBeGreaterThan(0);

    const healthyItems = [
      {
        source: "healthy_source",
        sourceName: "Healthy Source",
        sourceUrl: "https://example.com/jobs/1",
        externalId: "h-1",
        applicationUrl: "https://example.com/apply/1",
        title: "Backend Engineer Intern",
        company: "Healthy Co",
        description: "Work on cloud backend APIs and databases with Node.js and TypeScript.",
        opportunityType: "INTERNSHIP" as const
      }
    ];

    const healthyRes = await runDiscoveryForSource(healthySource, healthyItems);
    expect(healthyRes.itemsProcessed).toBe(1);
    expect(healthyRes.errors.length).toBe(0);
  });

  // 12. malformed opportunity is isolated
  it("12. malformed opportunity is isolated", async () => {
    const testSource: SourceConfig = {
      source: "test_malformed_source",
      sourceName: "Test Malformed Source",
      category: "CAREERS",
      discoveryMethod: "structured_api",
      defaultTrust: "TRUSTED",
      scheduleMinutes: 10,
      endpointUrl: "https://example.com/api",
      enabled: true,
      maxItemsPerRun: 5
    };

    const mixedItems = [
      {
        source: "test_malformed_source",
        sourceName: "Test Malformed Source",
        sourceUrl: "https://example.com/jobs/bad",
        externalId: "bad-1",
        applicationUrl: "javascript:alert(1)", // Malformed dangerous URL
        title: "Malicious Job",
        company: "Attacker",
        description: "Malicious job description",
        opportunityType: "INTERNSHIP" as const
      },
      {
        source: "test_malformed_source",
        sourceName: "Test Malformed Source",
        sourceUrl: "https://example.com/jobs/good",
        externalId: "good-1",
        applicationUrl: "https://example.com/apply/good",
        title: "Site Reliability Intern",
        company: "Reliable Co",
        description: "Great site reliability engineering role focusing on observability, Prometheus, and Grafana.",
        opportunityType: "INTERNSHIP" as const
      }
    ];

    const res = await runDiscoveryForSource(testSource, mixedItems);
    expect(res.itemsFound).toBe(2);
    expect(res.rejectedCount).toBeGreaterThanOrEqual(1); // Malformed was rejected
    expect(res.itemsProcessed).toBe(2);
  });

  // 13. overlapping invocation does not create duplicates
  it("13. overlapping invocation does not create duplicates", async () => {
    const mockSource: SourceConfig = {
      source: "concurrent_source",
      sourceName: "Concurrent Source",
      category: "CAREERS",
      discoveryMethod: "structured_api",
      defaultTrust: "TRUSTED",
      scheduleMinutes: 360,
      endpointUrl: "https://concurrent.com/api",
      enabled: true,
      maxItemsPerRun: 5
    };

    const rawItems = [
      {
        source: "concurrent_source",
        sourceName: "Concurrent Source",
        sourceUrl: "https://concurrent.com/job/concurrent-1",
        externalId: "concurrent-001",
        applicationUrl: "https://concurrent.com/apply/1",
        title: "Concurrent Systems Intern",
        company: "Parallel Corp",
        description: "Exciting concurrency internship working on multi-threaded distributed state machines.",
        opportunityType: "INTERNSHIP" as const
      }
    ];

    // Simulate overlapping invocation
    let callCount = 0;
    vi.spyOn(rawPrisma.internship as any, "findFirst").mockImplementation(async () => {
      callCount++;
      if (callCount > 1) {
        return {
          id: "concurrent-existing-id",
          applicationLink: "https://concurrent.com/apply/1",
          externalId: "concurrent-001",
          company: "Parallel Corp",
          title: "Concurrent Systems Intern"
        } as any;
      }
      return null;
    });

    const [resA, resB] = await Promise.all([
      runDiscoveryForSource(mockSource, rawItems),
      runDiscoveryForSource(mockSource, rawItems)
    ]);

    expect(resA.itemsProcessed).toBe(1);
    expect(resB.itemsProcessed).toBe(1);
    expect(resA.duplicatesPrevented + resB.duplicatesPrevented).toBeGreaterThanOrEqual(1);
  });

  // 14. CRON_SECRET never appears in logs
  it("14. CRON_SECRET never appears in logs", () => {
    const secretMessage = `Error connecting with token Bearer ${TEST_CRON_SECRET}`;
    const sanitized = sanitizeSecrets(secretMessage);

    expect(sanitized).not.toContain(TEST_CRON_SECRET);
    expect(sanitized).toContain("[REDACTED_SECRET]");
  });

  // 15. GROQ_API_KEY never appears in logs
  it("15. GROQ_API_KEY never appears in logs", () => {
    const secretMessage = `AI Adapter failed with key: ${TEST_GROQ_KEY}`;
    const sanitized = sanitizeSecrets(secretMessage);

    expect(sanitized).not.toContain(TEST_GROQ_KEY);
    expect(sanitized).toContain("[REDACTED_SECRET]");
  });

  // 16. Real Registered Source Dry Run (Mohan Careers & Devfolio)
  it("16. real registered source dry run executes with zero production mutation", async () => {
    // A. Real Mohan Careers post fixture
    const mohanConfig: SourceConfig = {
      source: "mohan_careers",
      sourceName: "Mohan Careers",
      category: "CAREERS",
      discoveryMethod: "structured_api",
      defaultTrust: "UNKNOWN",
      scheduleMinutes: 360,
      endpointUrl: "https://mohancareers.com/wp-json/wp/v2/posts",
      enabled: true,
      maxItemsPerRun: 2,
      policy: {
        requiresFreshnessEvidence: true,
        allowedOpportunityTypes: ["JOB", "INTERNSHIP"]
      }
    };

    const mohanRealPost = [
      {
        source: "mohan_careers",
        sourceName: "Mohan Careers",
        sourceUrl: "https://mohancareers.com/deloitte-recruitment-2026",
        externalId: "mohan-deloitte-5076",
        applicationUrl: "https://southasiacareers.deloitte.com/job/Bengaluru-Analyst-Site-Reliability/58895344/",
        title: "Analyst - Site Reliability Engineering",
        company: "Deloitte",
        description: "Deloitte is hiring freshers for Site Reliability Engineering analyst position in Bengaluru. Apply online through official portal.",
        opportunityType: "JOB" as const,
        location: "Bengaluru, Karnataka, India",
        workMode: "hybrid"
      }
    ];

    const discoveryRes = await runDiscoveryForSource(mohanConfig, mohanRealPost);

    expect(discoveryRes.source).toBe("mohan_careers");
    expect(discoveryRes.itemsProcessed).toBe(1);
    // Since OPPORTUNITY_AUTOPUBLISH_ENABLED is false, candidate was evaluated through all gates
    // and routed safely to NEEDS_REVIEW
    expect(discoveryRes.reviewCount).toBe(1);
    expect(discoveryRes.publishedCount).toBe(0);

    // B. Revalidation dry run
    const revalRes = await runOpportunityRevalidation({
      batchSize: 5,
      fetchFn: async () => new Response("OK", { status: 200 })
    });

    expect(revalRes).toBeDefined();
    expect(typeof revalRes.totalProcessed).toBe("number");
  });
});
