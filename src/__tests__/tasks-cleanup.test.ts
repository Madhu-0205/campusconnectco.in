import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import prisma from "@/lib/prisma";

import { GET } from "../app/api/tasks/cleanup/route";

vi.mock("@/lib/prisma", () => ({
  default: {
    gig: {
      count: vi.fn(),
      deleteMany: vi.fn(),
    },
    post: {
      count: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

describe("Tasks Cleanup API Hardening", () => {
  const originalSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = "strong_test_cron_secret_67890";
    vi.clearAllMocks();
    vi.mocked(prisma.gig.count).mockResolvedValue(5);
    vi.mocked(prisma.post.count).mockResolvedValue(3);
    vi.mocked(prisma.gig.deleteMany).mockResolvedValue({ count: 0 });
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalSecret;
  });

  it("fails closed with 500 when CRON_SECRET is not configured", async () => {
    delete process.env.CRON_SECRET;
    const req = new Request("http://localhost/api/tasks/cleanup", {
      method: "GET",
      headers: { Authorization: "Bearer strong_test_cron_secret_67890" },
    });
    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("CRON_SECRET is not configured");
  });

  it("returns 401 when Authorization header is missing", async () => {
    const req = new Request("http://localhost/api/tasks/cleanup", {
      method: "GET",
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized cron agent");
  });

  it("returns 401 when ?secret=correct_secret is supplied in query string", async () => {
    const req = new Request(
      "http://localhost/api/tasks/cleanup?secret=strong_test_cron_secret_67890",
      {
        method: "GET",
      }
    );
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized cron agent");
  });

  it("returns 401 when Authorization bearer token is incorrect", async () => {
    const req = new Request("http://localhost/api/tasks/cleanup", {
      method: "GET",
      headers: { Authorization: "Bearer wrong_token_attempt" },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized cron agent");
  });

  it("returns 200 with valid bearer token and NEVER deletes COMPLETED gigs", async () => {
    const req = new Request("http://localhost/api/tasks/cleanup", {
      method: "GET",
      headers: { Authorization: "Bearer strong_test_cron_secret_67890" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.preservedRecords.completedGigs).toBe(5);
    expect(body.preservedRecords.completedPosts).toBe(3);

    // Verify that deleteMany was NEVER called on status: "COMPLETED"
    const calls = vi.mocked(prisma.gig.deleteMany).mock.calls;
    for (const [args] of calls) {
      if (args && args.where) {
        expect(args.where.status).not.toBe("COMPLETED");
      }
    }
  });
});
