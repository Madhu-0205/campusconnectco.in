import { test, expect } from "@playwright/test";
import rawPrisma from "../src/lib/prisma";
const prisma = rawPrisma as any;
import { checkAgentReachStatus } from "../src/lib/automation/sources/agent-reach-adapter";
import { runDiscoveryForSource } from "../src/lib/automation/sources/discovery-worker";
import { isAutomationBotEmail, assertNotAutomationBot } from "../src/lib/auth-checks";

test.describe("Phase 16: CampusConnectCo Real Opportunity Supply Engine", () => {
  const BOT_EMAIL = "opportunity-bot@campusconnectco.in";
  const BOT_PASSWORD = process.env.FOUNDER_BOT_PASSWORD || "";
  const HUMAN_FOUNDER_EMAIL = "madhuvalurouthu52@gmail.com";
  const HUMAN_FOUNDER_PASSWORD = process.env.FOUNDER_PASSWORD || "";

  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000); // 2 minutes for real network & DB cycles
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  /**
   * Secure Bot Sign-In Helper:
   * Logs into CampusConnectCo using the dedicated automation bot account.
   * Authoritatively asserts that the server-side session belongs to opportunity-bot@campusconnectco.in.
   */
  async function ensureBotAccess(page: any) {
    if (!BOT_PASSWORD) {
      throw new Error("FOUNDER_BOT_PASSWORD environment variable is missing for bot E2E tests.");
    }

    await page.context().clearCookies();
    await page.goto("/auth/sign-in", { waitUntil: "domcontentloaded" });
    await page.fill('input[type="email"]', BOT_EMAIL);
    await page.fill('input[type="password"]', BOT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 45000, waitUntil: "domcontentloaded" });

    // Server-Side Identity Assertion: Fail closed if session does not belong to the bot
    const identityRes = await page.request.get("/api/automation/identity");
    expect(identityRes.status()).toBe(200);
    const identity = await identityRes.json();

    expect(identity.authenticated).toBe(true);
    expect(identity.isBot).toBe(true);
    expect(identity.email).toBe(BOT_EMAIL);
  }

  /**
   * Human Founder Sign-In Helper for Review Queue UI:
   */
  async function ensureHumanFounderAccess(page: any) {
    if (!HUMAN_FOUNDER_PASSWORD) {
      throw new Error("FOUNDER_PASSWORD environment variable is missing for founder E2E tests.");
    }

    await page.context().clearCookies();
    await page.goto("/auth/sign-in", { waitUntil: "domcontentloaded" });
    await page.fill('input[type="email"]', HUMAN_FOUNDER_EMAIL);
    await page.fill('input[type="password"]', HUMAN_FOUNDER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 45000, waitUntil: "domcontentloaded" });
  }

  // ---------------------------------------------------------------------------
  // 1. Real Agent-Reach Environment Verification
  // ---------------------------------------------------------------------------
  test("Agent-Reach: Verified local installation, version, and active channels", async () => {
    const status = await checkAgentReachStatus();
    expect(status.isAvailable).toBe(true);
    expect(status.version).toBe("1.5.0");
    expect(status.pythonPath).toContain(".agent-reach-venv");
  });

  // ---------------------------------------------------------------------------
  // 2A. Devfolio Hackathons API Discovery & Canonical Taxonomy
  // ---------------------------------------------------------------------------
  test("Pipeline: Devfolio API hackathons discovery and canonical taxonomy verification", async () => {
    // Clear any previous test run records to ensure fresh classification is tested
    await prisma.discoveredOpportunity.deleteMany({ where: { source: "devfolio_hackathons" } });

    const devfolioRun = await runDiscoveryForSource("devfolio_hackathons");
    expect(devfolioRun.errors).toHaveLength(0);
    expect(devfolioRun.itemsProcessed).toBeGreaterThan(0);

    // Verify hackathons staged with canonical HACKATHON type and COMPETITION subtype
    const stagedHackathons = await prisma.discoveredOpportunity.findMany({
      where: { source: "devfolio_hackathons" },
      take: 5
    });
    expect(stagedHackathons.length).toBeGreaterThan(0);
    for (const h of stagedHackathons) {
      expect(h.opportunityType).toBe("HACKATHON");
      const meta = h.metadata as any;
      expect(meta?.subtypes).toContain("COMPETITION");
      expect(meta?.lifecycleState).toBeDefined();
    }
  });

  // ---------------------------------------------------------------------------
  // 2B. Agent-Reach RSS Discovery & Deduplication Idempotency
  // ---------------------------------------------------------------------------
  test("Pipeline: Agent-Reach RSS discovery and deduplication idempotency", async () => {
    // Live discovery via Agent-Reach RSS channel
    const rssRun = await runDiscoveryForSource("agent_reach_remote_opportunities");
    expect(rssRun.itemsFound).toBeGreaterThan(0);

    // Repeat discovery to verify 8-tier deduplication idempotency
    const repeatRun = await runDiscoveryForSource("agent_reach_remote_opportunities");
    expect(repeatRun.duplicatesPrevented).toBeGreaterThan(0);
    expect(repeatRun.itemsStaged).toBe(0); // Zero duplicate records created
  });

  // ---------------------------------------------------------------------------
  // 3. Review Queue Rendering with Category & Confidence Tabs
  // ---------------------------------------------------------------------------
  test("Dashboard: Human Founder can access Supply Engine and filter by category", async ({ page }) => {
    await ensureHumanFounderAccess(page);

    await page.goto("/dashboard/founder/opportunity-agent", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: /(Real Opportunity Supply Engine|Opportunity Discovery)/i })).toBeVisible();
    await expect(page.locator("text=Verified Source Registry")).toBeVisible();

    // Verify category filter tabs
    await expect(page.getByRole("button", { name: /Hackathons/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Internships/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Jobs/i })).toBeVisible();

    // Click Hackathons tab
    await page.getByRole("button", { name: /Hackathons/i }).click();
    await page.waitForTimeout(1000);

    // Verify Confidence filter pills
    await expect(page.locator("text=Confidence:")).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // 3B. Freshness Filtering, Source Health & Provenance Inspection
  // ---------------------------------------------------------------------------
  test("Dashboard: Freshness pills, Source Health failure tracking & Provenance inspection modal", async ({ page }) => {
    await ensureHumanFounderAccess(page);

    await page.goto("/dashboard/founder/opportunity-agent", { waitUntil: "domcontentloaded" });

    // 1. Verify 10 canonical category tabs are rendered
    await expect(page.getByRole("button", { name: /All Categories/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Internships/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Jobs/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Hackathons/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Gigs/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Fellowships/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Scholarships/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Research/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Apprenticeships/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Events/i })).toBeVisible();

    // 2. Verify Freshness pills
    await expect(page.getByRole("button", { name: /All Freshness/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Current \/ Active/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Needs Recheck/i })).toBeVisible();

    // 3. Verify Source Health table structure
    await expect(page.locator("text=Verified Source Registry (Phase 16B)")).toBeVisible();
    await expect(page.locator("th:has-text('Failures')")).toBeVisible();
    await expect(page.locator("button:has-text('Sync / Recheck')").first()).toBeVisible();

    // 4. Test newly covered category filters
    const fellowshipTab = page.getByRole("button", { name: /Fellowships/i });
    if (await fellowshipTab.isVisible()) {
      await fellowshipTab.click();
      await page.waitForTimeout(500);
      await expect(page.locator("body")).toBeVisible();
    }

    const scholarshipTab = page.getByRole("button", { name: /Scholarships/i });
    if (await scholarshipTab.isVisible()) {
      await scholarshipTab.click();
      await page.waitForTimeout(500);
      await expect(page.locator("body")).toBeVisible();
    }

    const apprenticeshipTab = page.getByRole("button", { name: /Apprenticeships/i });
    if (await apprenticeshipTab.isVisible()) {
      await apprenticeshipTab.click();
      await page.waitForTimeout(500);
      await expect(page.locator("body")).toBeVisible();
    }

    const eventTab = page.getByRole("button", { name: /Events/i });
    if (await eventTab.isVisible()) {
      await eventTab.click();
      await page.waitForTimeout(500);
      await expect(page.locator("body")).toBeVisible();
    }

    const researchTab = page.getByRole("button", { name: /Research/i });
    if (await researchTab.isVisible()) {
      await researchTab.click();
      await page.waitForTimeout(500);
      await expect(page.locator("body")).toBeVisible();
    }

    // Return to All Categories
    await page.getByRole("button", { name: /All Categories/i }).click();
    await page.waitForTimeout(500);

    // 5. Click 'Inspect Provenance' on first opportunity card if available
    const inspectBtn = page.locator("button:has-text('Inspect Provenance')").first();
    if (await inspectBtn.isVisible()) {
      await inspectBtn.click();
      await expect(page.locator("text=Original Source")).toBeVisible();
      await expect(page.locator("text=Source Trust")).toBeVisible();
      await expect(page.locator("text=Verification State")).toBeVisible();
      await expect(page.locator("text=Quality Score")).toBeVisible();
      await expect(page.locator("text=Lifecycle State")).toBeVisible();

      // Close modal
      await page.click("button:has-text('Close')");
    }
  });

  // ---------------------------------------------------------------------------
  // 3C. Opportunity Recheck Action
  // ---------------------------------------------------------------------------
  test("Recheck: Founder can trigger on-demand live opportunity recheck", async ({ page }) => {
    await ensureHumanFounderAccess(page);

    await page.goto("/dashboard/founder/opportunity-agent", { waitUntil: "domcontentloaded" });

    const recheckBtn = page.locator('[data-testid="opportunity-recheck-btn"]').first();
    await expect(recheckBtn).toBeVisible({ timeout: 45000 });

    const responsePromise = page.waitForResponse(
      res => res.url().includes("/api/founder/opportunity-agent") && res.request().method() === "POST",
      { timeout: 25000 }
    );
    await recheckBtn.click();
    const res = await responsePromise;
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.message).toContain("Opportunity rechecked successfully");
    expect(json.lifecycleState).toBeDefined();
    expect(json.lastVerifiedAt).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // 4. Dedicated Bot Founder Form UI Posting & Full Downstream Proof
  // ---------------------------------------------------------------------------
  test("Publishing: Dedicated Bot publishes opportunity via Founder UI with DB & search confirmation", async ({ page }) => {
    // 1. Authenticate strictly as the dedicated automation bot
    await ensureBotAccess(page);

    // 2. Navigate to Founder Internships UI management
    await page.goto("/dashboard/founder/internships", { waitUntil: "domcontentloaded" });

    // 3. Open New Internship Form
    const newBtn = page.locator('[data-testid="founder-new-internship-btn"]').first();
    await expect(newBtn).toBeVisible({ timeout: 15000 });
    await newBtn.click();

    // 4. Fill form with real verified opportunity candidate
    const testUnique = Date.now();
    const testTitle = `Distributed Systems Research Intern ${testUnique}`;
    const testCompany = `AgentReach Corp ${testUnique}`;
    const testLocation = "Bengaluru, Karnataka (Hybrid)";
    const testDesc = "Autonomous systems and distributed streaming infrastructure internship discovered via Agent-Reach.";
    const testSkills = "TypeScript, Distributed Systems, Python, Kafka";
    const testLink = "https://campusconnectco.in/careers/agent-reach-intern";
    const titleField = page.locator('[data-testid="founder-internship-title"]');
    await expect(titleField).toBeVisible({ timeout: 15000 });
    await titleField.fill(testTitle);
    await page.fill('[data-testid="founder-internship-company"]', testCompany);
    await page.fill('[data-testid="founder-internship-location"]', testLocation);
    await page.fill('[data-testid="founder-internship-description"]', testDesc);
    await page.fill('[data-testid="founder-internship-skills"]', testSkills);
    await page.fill('[data-testid="founder-internship-duration"]', "6 months");
    await page.fill('[data-testid="founder-internship-stipend"]', "85000");
    await page.fill('[data-testid="founder-internship-link"]', testLink);

    // 5. Submit form and intercept API response
    const responsePromise = page.waitForResponse(
      res => res.url().includes("/api/founder/internships") && res.request().method() === "POST",
      { timeout: 20000 }
    );

    await page.click('[data-testid="founder-internship-save-btn"]');
    const apiRes = await responsePromise;
    expect([200, 201]).toContain(apiRes.status());
    const json = await apiRes.json();
    const createdId = json.internship?.id || json.id;
    expect(createdId).toBeDefined();

    // 6. Authoritative Database Confirmation
    const dbRecord = await prisma.internship.findUnique({
      where: { id: createdId }
    });
    expect(dbRecord).not.toBeNull();
    expect([testTitle, "Distributed Systems Research Intern"]).toContain(dbRecord?.title);
    expect([testCompany, "AgentReach Corp"]).toContain(dbRecord?.company);
    expect(dbRecord?.applicationLink).toBe(testLink);
    expect(dbRecord?.deletedAt).toBeNull();

    // 7. Downstream Search & Map API Confirmation
    const searchRes = await page.request.get(`/api/opportunities?q=${encodeURIComponent("AgentReach")}`);
    expect(searchRes.status()).toBe(200);
    const searchJson = await searchRes.json();
    expect(searchJson.opportunities).toBeDefined();
    const match = searchJson.opportunities.find((o: any) => o.id === createdId || o.company?.includes("AgentReach"));
    expect(match).toBeDefined();

    // 8. Public Detail Page & SEO Metadata Confirmation
    await page.goto(`/internships/${createdId}`, { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toContainText("Distributed Systems Research Intern");
    await expect(page.locator("body")).toContainText("AgentReach");

    // Clean up test pilot record to maintain clean test database
    await prisma.internship.delete({
      where: { id: createdId }
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Security RBAC: Dedicated Bot Access Boundaries
  // ---------------------------------------------------------------------------
  test("Security: Dedicated Bot RBAC permissions boundary", async ({ playwright }) => {
    // 1. Verify unauthenticated requests to founder endpoints are rejected with 401
    const unauthContext = await playwright.request.newContext();
    const escrowRes = await unauthContext.get("/api/founder/escrow");
    expect(escrowRes.status()).toBe(401);

    const usersRes = await unauthContext.get("/api/founder/users");
    expect(usersRes.status()).toBe(401);

    const settingsRes = await unauthContext.get("/api/founder/settings");
    expect(settingsRes.status()).toBe(401);

    // 2. Verify Bot email identification
    expect(isAutomationBotEmail(BOT_EMAIL)).toBe(true);
    expect(isAutomationBotEmail(HUMAN_FOUNDER_EMAIL)).toBe(false);

    // 3. Verify assertNotAutomationBot returns 403 for the bot account
    const botGuardResponse = assertNotAutomationBot({ email: BOT_EMAIL });
    expect(botGuardResponse).not.toBeNull();
    expect(botGuardResponse?.status).toBe(403);

    const founderGuardResponse = assertNotAutomationBot({ email: HUMAN_FOUNDER_EMAIL });
    expect(founderGuardResponse).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // 6. Mobile Viewport Responsiveness
  // ---------------------------------------------------------------------------
  test("Responsive: Supply Engine console renders cleanly on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await ensureHumanFounderAccess(page);

    await page.goto("/dashboard/founder/opportunity-agent", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: /(Real Opportunity Supply Engine|Opportunity Discovery)/i })).toBeVisible();
    await expect(page.locator("body")).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // 7. Production Cron Endpoint Security & CRON_SECRET Enforcement
  // ---------------------------------------------------------------------------
  test("Security: /api/cron/opportunity-discovery strictly enforces CRON_SECRET Bearer token", async ({ playwright }) => {
    const context = await playwright.request.newContext();

    // 1. Unauthenticated request -> 401
    const resNoAuth = await context.post("/api/cron/opportunity-discovery");
    expect(resNoAuth.status()).toBe(401);

    // 2. Query parameter token attempt -> 401 (query params forbidden)
    const resQueryToken = await context.post(`/api/cron/opportunity-discovery?token=${process.env.CRON_SECRET || "dummy"}`);
    expect(resQueryToken.status()).toBe(401);

    // 3. Invalid Bearer token -> 401
    const resInvalidBearer = await context.post("/api/cron/opportunity-discovery", {
      headers: { Authorization: "Bearer invalid_secret_123" }
    });
    expect(resInvalidBearer.status()).toBe(401);

    // 4. Valid Bearer token -> 200 with Cache-Control: no-store
    if (process.env.CRON_SECRET) {
      const resValid = await context.post("/api/cron/opportunity-discovery", {
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` }
      });
      expect(resValid.status()).toBe(200);
      expect(resValid.headers()["cache-control"]).toContain("no-store");
      const json = await resValid.json();
      expect(json.message).toContain("Opportunity discovery cron run completed");
    }
  });
});
