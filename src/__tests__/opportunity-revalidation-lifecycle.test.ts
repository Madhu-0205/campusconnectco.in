import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import {
  revalidateOpportunity,
  revalidateActiveOpportunities,
  classifyUrlResponse,
  getFailureTrackingKey,
  type RevalidationPrismaDelegate
} from "@/lib/automation/revalidation";
import {
  isOpportunityActive,
  isPubliclyDiscoverable,
  getActiveOpportunityPrismaFilter
} from "@/lib/opportunities/lifecycle";

describe("Phase 16D: Lifecycle Revalidation & Outage Resilience Engine (Phase 3)", () => {
  beforeAll(() => {
    process.env.OPPORTUNITY_AUTO_EXPIRE_ENABLED = "true";
    process.env.OPPORTUNITY_REVALIDATION_ENABLED = "true";
  });

  afterAll(() => {
    delete process.env.OPPORTUNITY_AUTO_EXPIRE_ENABLED;
    delete process.env.OPPORTUNITY_REVALIDATION_ENABLED;
  });

  const mockNow = new Date("2026-09-26T12:00:00.000Z");

  /**
   * In-memory mock store for Internship and PlatformSetting
   */
  function createMockPrisma(
    initialInternships: any[] = [],
    initialSettings: Record<string, string> = {}
  ) {
    const internships = [...initialInternships];
    const settings = { ...initialSettings };

    const delegate: RevalidationPrismaDelegate & {
      _getInternships: () => any[];
      _getSettings: () => Record<string, string>;
    } = {
      internship: {
        findUnique: async ({ where }: { where: { id: string } }) => {
          return internships.find((item) => item.id === where.id) || null;
        },
        findMany: async ({ where }: any = {}) => {
          return internships.filter((item) => {
            if (where?.status && item.status !== where.status) return false;
            if (where?.deletedAt === null && item.deletedAt !== null) return false;
            return true;
          });
        },
        update: async ({ where, data }: { where: { id: string }; data: any }) => {
          const idx = internships.findIndex((item) => item.id === where.id);
          if (idx === -1) throw new Error("Not found");
          internships[idx] = { ...internships[idx], ...data };
          return internships[idx];
        }
      },
      platformSetting: {
        findUnique: async ({ where }: { where: { key: string } }) => {
          if (settings[where.key] !== undefined) {
            return {
              key: where.key,
              value: settings[where.key],
              updatedAt: mockNow
            };
          }
          return null;
        },
        upsert: async ({ where, update, create }: any) => {
          const val = settings[where.key] !== undefined ? update.value : create.value;
          settings[where.key] = val;
          return { key: where.key, value: val, updatedAt: mockNow };
        },
        deleteMany: async ({ where }: { where: { key: string } }) => {
          let count = 0;
          if (settings[where.key] !== undefined) {
            delete settings[where.key];
            count = 1;
          }
          return { count };
        }
      },
      _getInternships: () => internships,
      _getSettings: () => settings
    };

    return delegate;
  }

  // 1. active deadline + healthy URL → remains OPEN
  it("active deadline + healthy URL -> remains OPEN", async () => {
    const prisma = createMockPrisma([
      {
        id: "opp-active-1",
        title: "Frontend Intern",
        company: "Vercel",
        status: "OPEN",
        deadline: new Date("2026-12-01T00:00:00.000Z"),
        applicationLink: "https://careers.vercel.com/jobs/frontend-intern",
        deletedAt: null
      }
    ]);

    const mockFetch = vi.fn().mockResolvedValue(
      new Response("<html>Apply for Frontend Intern role at Vercel</html>", {
        status: 200,
        headers: { "Content-Type": "text/html" }
      })
    );

    const result = await revalidateOpportunity("opp-active-1", {
      prisma,
      fetchFn: mockFetch,
      now: mockNow
    });

    expect(result.currentStatus).toBe("OPEN");
    expect(result.actionTaken).toBe("NO_ACTION");
    expect(result.urlClassification).toBe("REACHABLE_ACTIVE");

    const record = await prisma.internship.findUnique({ where: { id: "opp-active-1" } });
    expect(record?.status).toBe("OPEN");
  });

  // 2. expired deadline → EXPIRED
  it("expired deadline -> EXPIRED", async () => {
    const prisma = createMockPrisma([
      {
        id: "opp-expired-1",
        title: "Backend Intern",
        company: "Stripe",
        status: "OPEN",
        deadline: new Date("2026-08-01T00:00:00.000Z"), // Past deadline relative to mockNow (2026-09-26)
        applicationLink: "https://stripe.com/jobs/intern",
        deletedAt: null
      }
    ]);

    const mockFetch = vi.fn();

    const result = await revalidateOpportunity("opp-expired-1", {
      prisma,
      fetchFn: mockFetch,
      now: mockNow
    });

    expect(result.currentStatus).toBe("EXPIRED");
    expect(result.actionTaken).toBe("STATUS_CHANGED");
    expect(result.deadlineExpired).toBe(true);
    expect(mockFetch).not.toHaveBeenCalled(); // Fast-path: expired deadline short-circuits network calls

    const record = await prisma.internship.findUnique({ where: { id: "opp-expired-1" } });
    expect(record?.status).toBe("EXPIRED");
  });

  // 3. 404 → CLOSED
  it("404 -> CLOSED", async () => {
    const prisma = createMockPrisma([
      {
        id: "opp-404-1",
        title: "ML Intern",
        company: "OpenAI",
        status: "OPEN",
        deadline: new Date("2026-11-01T00:00:00.000Z"),
        applicationLink: "https://openai.com/careers/ml-intern",
        deletedAt: null
      }
    ]);

    const mockFetch = vi.fn().mockResolvedValue(
      new Response("Not Found", { status: 404 })
    );

    const result = await revalidateOpportunity("opp-404-1", {
      prisma,
      fetchFn: mockFetch,
      now: mockNow
    });

    expect(result.currentStatus).toBe("CLOSED");
    expect(result.actionTaken).toBe("STATUS_CHANGED");
    expect(result.urlClassification).toBe("CONFIRMED_REMOVAL");
    expect(result.statusCode).toBe(404);

    const record = await prisma.internship.findUnique({ where: { id: "opp-404-1" } });
    expect(record?.status).toBe("CLOSED");
  });

  // 4. 410 → CLOSED
  it("410 -> CLOSED", async () => {
    const prisma = createMockPrisma([
      {
        id: "opp-410-1",
        title: "Cloud Intern",
        company: "AWS",
        status: "OPEN",
        deadline: null, // Null deadline remains null without fabrication
        applicationLink: "https://amazon.jobs/cloud-intern",
        deletedAt: null
      }
    ]);

    const mockFetch = vi.fn().mockResolvedValue(
      new Response("Gone", { status: 410 })
    );

    const result = await revalidateOpportunity("opp-410-1", {
      prisma,
      fetchFn: mockFetch,
      now: mockNow
    });

    expect(result.currentStatus).toBe("CLOSED");
    expect(result.actionTaken).toBe("STATUS_CHANGED");
    expect(result.urlClassification).toBe("CONFIRMED_REMOVAL");
    expect(result.statusCode).toBe(410);

    const record = await prisma.internship.findUnique({ where: { id: "opp-410-1" } });
    expect(record?.status).toBe("CLOSED");
    expect(record?.deadline).toBeNull(); // Verifies deadline was not fabricated
  });

  // 5. 500 → remains OPEN
  it("500 -> remains OPEN", async () => {
    const prisma = createMockPrisma([
      {
        id: "opp-500-1",
        title: "Security Intern",
        company: "Cloudflare",
        status: "OPEN",
        deadline: new Date("2026-12-01T00:00:00.000Z"),
        applicationLink: "https://cloudflare.com/careers/sec-intern",
        deletedAt: null
      }
    ]);

    const mockFetch = vi.fn().mockResolvedValue(
      new Response("Internal Server Error", { status: 500 })
    );

    const result = await revalidateOpportunity("opp-500-1", {
      prisma,
      fetchFn: mockFetch,
      now: mockNow
    });

    expect(result.currentStatus).toBe("OPEN");
    expect(result.actionTaken).toBe("OUTAGE_INCREMENTED");
    expect(result.urlClassification).toBe("TEMPORARY_OUTAGE");
    expect(result.statusCode).toBe(500);
    expect(result.consecutiveFailures).toBe(1);

    const record = await prisma.internship.findUnique({ where: { id: "opp-500-1" } });
    expect(record?.status).toBe("OPEN");

    // Check persistence in PlatformSetting
    const settingKey = getFailureTrackingKey("opp-500-1");
    const setting = await prisma.platformSetting.findUnique({ where: { key: settingKey } });
    expect(setting).toBeDefined();
    const parsed = JSON.parse(setting!.value);
    expect(parsed.consecutiveFailures).toBe(1);
    expect(parsed.lastStatusCode).toBe(500);
  });

  // 6. 503 → remains OPEN
  it("503 -> remains OPEN", async () => {
    const prisma = createMockPrisma([
      {
        id: "opp-503-1",
        title: "DevOps Intern",
        company: "GitLab",
        status: "OPEN",
        deadline: new Date("2026-12-01T00:00:00.000Z"),
        applicationLink: "https://gitlab.com/careers/devops",
        deletedAt: null
      }
    ]);

    const mockFetch = vi.fn().mockResolvedValue(
      new Response("Service Unavailable", { status: 503 })
    );

    const result = await revalidateOpportunity("opp-503-1", {
      prisma,
      fetchFn: mockFetch,
      now: mockNow
    });

    expect(result.currentStatus).toBe("OPEN");
    expect(result.actionTaken).toBe("OUTAGE_INCREMENTED");
    expect(result.urlClassification).toBe("TEMPORARY_OUTAGE");
    expect(result.statusCode).toBe(503);
    expect(result.consecutiveFailures).toBe(1);

    const record = await prisma.internship.findUnique({ where: { id: "opp-503-1" } });
    expect(record?.status).toBe("OPEN");
  });

  // 7. timeout → remains OPEN
  it("timeout -> remains OPEN", async () => {
    const prisma = createMockPrisma([
      {
        id: "opp-timeout-1",
        title: "Systems Intern",
        company: "Microsoft",
        status: "OPEN",
        deadline: new Date("2026-12-01T00:00:00.000Z"),
        applicationLink: "https://careers.microsoft.com/intern",
        deletedAt: null
      }
    ]);

    const mockFetch = vi.fn().mockRejectedValue(
      new Error("The operation was aborted due to timeout")
    );

    const result = await revalidateOpportunity("opp-timeout-1", {
      prisma,
      fetchFn: mockFetch,
      now: mockNow
    });

    expect(result.currentStatus).toBe("OPEN");
    expect(result.actionTaken).toBe("OUTAGE_INCREMENTED");
    expect(result.urlClassification).toBe("TEMPORARY_OUTAGE");
    expect(result.consecutiveFailures).toBe(1);

    const record = await prisma.internship.findUnique({ where: { id: "opp-timeout-1" } });
    expect(record?.status).toBe("OPEN");
  });

  // 8. 403 / bot challenge → SOURCE_UNAVAILABLE
  it("403 / bot challenge -> SOURCE_UNAVAILABLE (remains OPEN)", async () => {
    const prisma = createMockPrisma([
      {
        id: "opp-403-1",
        title: "Data Science Intern",
        company: "Bloomberg",
        status: "OPEN",
        deadline: new Date("2026-12-01T00:00:00.000Z"),
        applicationLink: "https://bloomberg.com/careers/data",
        deletedAt: null
      }
    ]);

    // 403 with Cloudflare challenge
    const mockFetch = vi.fn().mockResolvedValue(
      new Response("<html><head><title>Just a moment...</title></head><body>cf-turnstile security check</body></html>", {
        status: 403,
        headers: { "cf-mitigated": "challenge" }
      })
    );

    const result = await revalidateOpportunity("opp-403-1", {
      prisma,
      fetchFn: mockFetch,
      now: mockNow
    });

    expect(result.currentStatus).toBe("OPEN");
    expect(result.actionTaken).toBe("NO_ACTION");
    expect(result.urlClassification).toBe("SOURCE_UNAVAILABLE");
    expect(result.statusCode).toBe(403);

    const record = await prisma.internship.findUnique({ where: { id: "opp-403-1" } });
    expect(record?.status).toBe("OPEN"); // Bot challenge NEVER unpublishes
  });

  // 9. repeated failures → correct terminal transition
  it("repeated failures -> correct terminal transition to CLOSED", async () => {
    const settingKey = getFailureTrackingKey("opp-repeated-fail");
    const initialFailures = {
      consecutiveFailures: 2,
      firstFailedAt: "2026-09-24T12:00:00.000Z",
      lastFailedAt: "2026-09-25T12:00:00.000Z",
      lastStatusCode: 503,
      lastReason: "HTTP 503"
    };

    const prisma = createMockPrisma(
      [
        {
          id: "opp-repeated-fail",
          title: "Hardware Intern",
          company: "NVIDIA",
          status: "OPEN",
          deadline: new Date("2026-12-01T00:00:00.000Z"),
          applicationLink: "https://nvidia.com/jobs/hw",
          deletedAt: null
        }
      ],
      {
        [settingKey]: JSON.stringify(initialFailures)
      }
    );

    // 3rd consecutive temporary outage (exceeds default threshold of 3)
    const mockFetch = vi.fn().mockResolvedValue(
      new Response("Service Unavailable", { status: 503 })
    );

    const result = await revalidateOpportunity("opp-repeated-fail", {
      prisma,
      fetchFn: mockFetch,
      now: mockNow,
      maxConsecutiveFailures: 3
    });

    expect(result.currentStatus).toBe("CLOSED");
    expect(result.actionTaken).toBe("STATUS_CHANGED");
    expect(result.consecutiveFailures).toBe(3);

    const record = await prisma.internship.findUnique({ where: { id: "opp-repeated-fail" } });
    expect(record?.status).toBe("CLOSED");

    // Failure tracking record cleaned up upon terminal transition
    const setting = await prisma.platformSetting.findUnique({ where: { key: settingKey } });
    expect(setting).toBeNull();
  });

  // 10. terminal record never resurrected
  it("terminal record never resurrected (EXPIRED, CLOSED, DELETED, REJECTED)", async () => {
    const terminalStatuses = ["EXPIRED", "CLOSED", "REJECTED", "DELETED"];

    for (const status of terminalStatuses) {
      const oppId = `opp-terminal-${status.toLowerCase()}`;
      const prisma = createMockPrisma([
        {
          id: oppId,
          title: "Product Intern",
          company: "Atlassian",
          status,
          deadline: new Date("2026-12-01T00:00:00.000Z"),
          applicationLink: "https://atlassian.com/careers/pm",
          deletedAt: null
        }
      ]);

      // Mock a perfectly healthy HTTP 200 response
      const mockFetch = vi.fn().mockResolvedValue(
        new Response("<html>Active Job Listing</html>", { status: 200 })
      );

      const result = await revalidateOpportunity(oppId, {
        prisma,
        fetchFn: mockFetch,
        now: mockNow
      });

      expect(result.currentStatus).toBe(status);
      expect(result.actionTaken).toBe("TERMINAL_PRESERVED");
      expect(mockFetch).not.toHaveBeenCalled(); // Does not make network calls for terminal records

      const record = await prisma.internship.findUnique({ where: { id: oppId } });
      expect(record?.status).toBe(status); // Never revived to OPEN
    }

    // Also verify soft-deleted record (deletedAt != null)
    const softDeletedPrisma = createMockPrisma([
      {
        id: "opp-soft-deleted",
        title: "Finance Intern",
        company: "Goldman Sachs",
        status: "OPEN",
        deadline: new Date("2026-12-01T00:00:00.000Z"),
        applicationLink: "https://gs.com/careers/finance",
        deletedAt: new Date("2026-09-01T00:00:00.000Z")
      }
    ]);

    const mockFetch2 = vi.fn().mockResolvedValue(
      new Response("<html>Active</html>", { status: 200 })
    );

    const softResult = await revalidateOpportunity("opp-soft-deleted", {
      prisma: softDeletedPrisma,
      fetchFn: mockFetch2,
      now: mockNow
    });

    expect(softResult.actionTaken).toBe("TERMINAL_PRESERVED");
    const softRecord = await softDeletedPrisma.internship.findUnique({
      where: { id: "opp-soft-deleted" }
    });
    expect(softRecord?.status).toBe("OPEN"); // not updated
    expect(softRecord?.deletedAt).not.toBeNull();
  });

  // 11. repeated revalidation is idempotent
  it("repeated revalidation is idempotent", async () => {
    const prisma = createMockPrisma([
      {
        id: "opp-idempotent-1",
        title: "QA Intern",
        company: "Adobe",
        status: "OPEN",
        deadline: new Date("2026-12-01T00:00:00.000Z"),
        applicationLink: "https://adobe.com/careers/qa",
        deletedAt: null
      }
    ]);

    const mockFetch = vi.fn().mockResolvedValue(
      new Response("<html>Apply for QA role</html>", { status: 200 })
    );

    // Run 1
    const run1 = await revalidateOpportunity("opp-idempotent-1", {
      prisma,
      fetchFn: mockFetch,
      now: mockNow
    });
    expect(run1.currentStatus).toBe("OPEN");
    expect(run1.actionTaken).toBe("NO_ACTION");

    // Run 2
    const run2 = await revalidateOpportunity("opp-idempotent-1", {
      prisma,
      fetchFn: mockFetch,
      now: mockNow
    });
    expect(run2.currentStatus).toBe("OPEN");
    expect(run2.actionTaken).toBe("NO_ACTION");

    const record = await prisma.internship.findUnique({ where: { id: "opp-idempotent-1" } });
    expect(record?.status).toBe("OPEN");
  });

  // 12. expired/closed records excluded from public discovery
  it("expired/closed records excluded from public discovery", async () => {
    // A. EXPIRED status
    const expiredOpp = {
      status: "EXPIRED",
      deadline: new Date("2026-08-01T00:00:00.000Z"),
      deletedAt: null
    };

    expect(isOpportunityActive(expiredOpp, expiredOpp.deadline, expiredOpp.deletedAt, mockNow)).toBe(false);
    expect(isPubliclyDiscoverable("EXPIRED", null, expiredOpp.deadline, mockNow)).toBe(false);

    // B. CLOSED status
    const closedOpp = {
      status: "CLOSED",
      deadline: new Date("2026-12-01T00:00:00.000Z"),
      deletedAt: null
    };

    expect(isOpportunityActive(closedOpp, closedOpp.deadline, closedOpp.deletedAt, mockNow)).toBe(false);
    expect(isPubliclyDiscoverable("CLOSED", null, closedOpp.deadline, mockNow)).toBe(false);

    // C. Prisma filter condition verification
    const filter = getActiveOpportunityPrismaFilter(mockNow);
    expect(filter.deletedAt).toBeNull();
    expect(filter.OR).toBeDefined();

    // Verify active status definition requires status === "OPEN" or "active"
    expect(isOpportunityActive("OPEN", new Date("2026-12-01T00:00:00.000Z"), null, mockNow)).toBe(true);
    expect(isOpportunityActive("EXPIRED", new Date("2026-12-01T00:00:00.000Z"), null, mockNow)).toBe(false);
    expect(isOpportunityActive("CLOSED", new Date("2026-12-01T00:00:00.000Z"), null, mockNow)).toBe(false);
    expect(isOpportunityActive("REJECTED", new Date("2026-12-01T00:00:00.000Z"), null, mockNow)).toBe(false);
    expect(isOpportunityActive("DELETED", new Date("2026-12-01T00:00:00.000Z"), null, mockNow)).toBe(false);
  });

  // Additional 1: Reachable 200 with explicit closure text -> CLOSED
  it("200 response with explicit closure content -> CONFIRMED_REMOVAL -> CLOSED", async () => {
    const prisma = createMockPrisma([
      {
        id: "opp-200-closed",
        title: "Design Intern",
        company: "Figma",
        status: "OPEN",
        deadline: new Date("2026-12-01T00:00:00.000Z"),
        applicationLink: "https://figma.com/careers/design",
        deletedAt: null
      }
    ]);

    const mockFetch = vi.fn().mockResolvedValue(
      new Response("<html><body>Thank you for your interest. This position has been filled.</body></html>", {
        status: 200
      })
    );

    const result = await revalidateOpportunity("opp-200-closed", {
      prisma,
      fetchFn: mockFetch,
      now: mockNow
    });

    expect(result.currentStatus).toBe("CLOSED");
    expect(result.actionTaken).toBe("STATUS_CHANGED");
    expect(result.urlClassification).toBe("CONFIRMED_REMOVAL");

    const record = await prisma.internship.findUnique({ where: { id: "opp-200-closed" } });
    expect(record?.status).toBe("CLOSED");
  });

  // Additional 2: Healthy response clears prior outage record from PlatformSetting
  it("healthy URL clears prior temporary outage record from PlatformSetting", async () => {
    const settingKey = getFailureTrackingKey("opp-prior-outage");
    const priorFailure = {
      consecutiveFailures: 1,
      firstFailedAt: "2026-09-25T12:00:00.000Z",
      lastFailedAt: "2026-09-25T12:00:00.000Z",
      lastStatusCode: 500,
      lastReason: "Internal Server Error"
    };

    const prisma = createMockPrisma(
      [
        {
          id: "opp-prior-outage",
          title: "SWE Intern",
          company: "Google",
          status: "OPEN",
          deadline: new Date("2026-12-01T00:00:00.000Z"),
          applicationLink: "https://careers.google.com/jobs/swe-intern",
          deletedAt: null
        }
      ],
      {
        [settingKey]: JSON.stringify(priorFailure)
      }
    );

    const mockFetch = vi.fn().mockResolvedValue(
      new Response("<html>Careers Page Active</html>", { status: 200 })
    );

    const result = await revalidateOpportunity("opp-prior-outage", {
      prisma,
      fetchFn: mockFetch,
      now: mockNow
    });

    expect(result.currentStatus).toBe("OPEN");
    expect(result.actionTaken).toBe("OUTAGE_CLEARED");

    const setting = await prisma.platformSetting.findUnique({ where: { key: settingKey } });
    expect(setting).toBeNull(); // Verifies prior outage metadata was cleared
  });

  // Additional 3: Batch revalidation runner
  it("batch runner revalidates multiple opportunities correctly", async () => {
    const prisma = createMockPrisma([
      {
        id: "batch-1",
        title: "Active Intern",
        company: "Apple",
        status: "OPEN",
        deadline: new Date("2026-12-01T00:00:00.000Z"),
        applicationLink: "https://apple.com/jobs/active",
        deletedAt: null
      },
      {
        id: "batch-2",
        title: "Expired Intern",
        company: "Meta",
        status: "OPEN",
        deadline: new Date("2026-08-01T00:00:00.000Z"),
        applicationLink: "https://meta.com/jobs/expired",
        deletedAt: null
      },
      {
        id: "batch-3",
        title: "404 Intern",
        company: "Netflix",
        status: "OPEN",
        deadline: new Date("2026-12-01T00:00:00.000Z"),
        applicationLink: "https://netflix.com/jobs/404",
        deletedAt: null
      }
    ]);

    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("active")) {
        return Promise.resolve(new Response("Active", { status: 200 }));
      }
      if (url.includes("404")) {
        return Promise.resolve(new Response("Not Found", { status: 404 }));
      }
      return Promise.resolve(new Response("OK", { status: 200 }));
    });

    const summary = await revalidateActiveOpportunities({
      prisma,
      fetchFn: mockFetch,
      now: mockNow
    });

    expect(summary.totalProcessed).toBe(3);
    expect(summary.expired).toBe(1);
    expect(summary.closed).toBe(1);
    expect(summary.activeAndHealthy).toBe(1);
  });
});
