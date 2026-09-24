import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { GET } from "../app/api/cron/weekly-report/route";

vi.mock("@/lib/analytics", () => ({
  getFunnelMetrics: vi.fn().mockResolvedValue([
    { step: "signup", count: 10, dropoff: 0 },
    { step: "profile_completion", count: 8, dropoff: 20 },
  ]),
  getRecommendationIntelligence: vi.fn().mockResolvedValue({
    acceptanceRate: 75.5,
    topSkills: [["React", 12], ["Node.js", 8]],
  }),
  getRetentionMetrics: vi.fn().mockResolvedValue({
    activeUsers: 42,
    totalSessions: 120,
    averageSessionsPerUser: 2.85,
  }),
}));

describe("Weekly Report Cron API Authentication", () => {
  const originalSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = "super_secret_cron_token_12345";
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalSecret;
  });

  it("fails closed with 500 when CRON_SECRET is not configured", async () => {
    delete process.env.CRON_SECRET;
    const req = new Request("http://localhost/api/cron/weekly-report", {
      method: "GET",
      headers: { Authorization: "Bearer some_token" },
    });
    const res = await GET(req);
    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).toContain("CRON_SECRET is not configured");
  });

  it("returns 401 when Authorization header is missing", async () => {
    const req = new Request("http://localhost/api/cron/weekly-report", {
      method: "GET",
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
    const text = await res.text();
    expect(text).toBe("Unauthorized");
  });

  it("returns 401 when Authorization header has wrong token", async () => {
    const req = new Request("http://localhost/api/cron/weekly-report", {
      method: "GET",
      headers: { Authorization: "Bearer wrong_secret_token" },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
    const text = await res.text();
    expect(text).toBe("Unauthorized");
  });

  it("returns 200 and HTML response when valid Bearer token is provided", async () => {
    const req = new Request("http://localhost/api/cron/weekly-report", {
      method: "GET",
      headers: { Authorization: "Bearer super_secret_cron_token_12345" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/html");
    const html = await res.text();
    expect(html).toContain("CampusConnectCo Weekly Product Analytics Report");
    expect(html).toContain("Active Users: 42");
    expect(html).toContain("Recommendation Acceptance Rate: 75.5%");
  });
});
