import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.describe("Phase 6 — CampusConnect Intelligence Layer (Puter.js) Verification", () => {
  // ---------------------------------------------------------------------------
  // 1. Authorization & Tenant Security Matrix
  // ---------------------------------------------------------------------------
  test("Security: Private AI endpoints strictly reject unauthenticated calls with 401", async ({ request }) => {
    // 1. Career Copilot Chat
    const copilotRes = await request.post("/api/ai/copilot/chat", {
      data: { query: "What gigs match my skills?" }
    });
    expect(copilotRes.status()).toBe(401);

    // 2. Smart Match Explanation
    const matchRes = await request.post("/api/ai/match-explanation", {
      data: { gigId: "00000000-0000-0000-0000-000000000000" }
    });
    expect(matchRes.status()).toBe(401);

    // 3. Resume Analyzer
    const resumeRes = await request.post("/api/ai/resume-analyze", {
      data: { resumeText: "React, TypeScript, Node.js developer" }
    });
    expect(resumeRes.status()).toBe(401);

    // 4. Mock Interview Simulator
    const interviewRes = await request.post("/api/ai/mock-interview", {
      data: { action: "generate_question", role: "Frontend Developer" }
    });
    expect(interviewRes.status()).toBe(401);
  });

  // ---------------------------------------------------------------------------
  // 2. Public Opportunity Summary with Puter AI Attribution
  // ---------------------------------------------------------------------------
  test("Public Intelligence: /api/ai/opportunity-summary returns structured breakdown with Puter attribution", async ({ request }) => {
    // Fetch a public opportunity to obtain a valid gig ID
    const oppsRes = await request.get("/api/recommendations?type=gigs");
    expect(oppsRes.status()).toBe(200);
    const opps = await oppsRes.json();
    expect(Array.isArray(opps)).toBe(true);

    if (opps.length > 0) {
      const gigId = opps[0].id;
      const summaryRes = await request.get(`/api/ai/opportunity-summary?gigId=${gigId}`);
      expect(summaryRes.status()).toBe(200);

      const data = await summaryRes.json();
      expect(data).toHaveProperty("whatYouWillDo");
      expect(Array.isArray(data.whatYouWillDo)).toBe(true);
      expect(data).toHaveProperty("skillsNeeded");
      expect(Array.isArray(data.skillsNeeded)).toBe(true);
      expect(data).toHaveProperty("whoThisSuits");
      expect(data).toHaveProperty("preparationTips");
      expect(Array.isArray(data.preparationTips)).toBe(true);
      expect(data.poweredBy).toBe("Puter.js");
    }
  });

  // ---------------------------------------------------------------------------
  // 3. Resilient Error Handling & Input Guards
  // ---------------------------------------------------------------------------
  test("Robustness: Handles missing parameters gracefully without crashing", async ({ request }) => {
    const res = await request.get("/api/ai/opportunity-summary");
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Missing gigId or internshipId");
  });

  // ---------------------------------------------------------------------------
  // 4. Real Browser E2E: Opportunity Detail & Puter AI Summary Card
  // ---------------------------------------------------------------------------
  test("Real Browser: Opportunity Detail displays Puter AI summary card and attribution link", async ({ page }) => {
    await page.goto("/opportunities", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/CampusConnect/i);

    // Locate first gig card and navigate to its detail page
    const firstGig = page.locator("a[href^='/gigs/']").first();
    await expect(firstGig).toBeVisible({ timeout: 20000 });
    const gigHref = await firstGig.getAttribute("href");
    expect(gigHref).toBeTruthy();

    await page.goto(gigHref!, { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });

    // Verify Puter-powered Opportunity Summary section
    const puterSummaryHeader = page.locator("text=AI Opportunity Summary");
    await expect(puterSummaryHeader).toBeVisible({ timeout: 15000 });

    // Verify "Powered by Puter" attribution link with correct href
    const puterLink = page.locator("a[href='https://developer.puter.com']:has-text('Powered by Puter')").first();
    await expect(puterLink).toBeVisible();
    await expect(puterLink).toHaveAttribute("target", "_blank");
    await expect(puterLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  // ---------------------------------------------------------------------------
  // 5. Global Navigation & Footer Puter Attribution
  // ---------------------------------------------------------------------------
  test("Global Attribution: Platform footers include subtle Puter developer link", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const footerPuterLink = page.locator("footer a[href='https://developer.puter.com']").first();
    await expect(footerPuterLink).toBeVisible({ timeout: 15000 });
    const text = await footerPuterLink.textContent();
    expect(text).toContain("Powered by Puter");
  });

  // ---------------------------------------------------------------------------
  // 6. Mobile Viewport Responsive Integrity
  // ---------------------------------------------------------------------------
  test("Mobile Responsiveness (390x844): Opportunity Detail and AI summary scale without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/opportunities", { waitUntil: "domcontentloaded" });

    const firstGig = page.locator("a[href^='/gigs/']").first();
    await expect(firstGig).toBeVisible({ timeout: 20000 });
    const gigHref = await firstGig.getAttribute("href");

    await page.goto(gigHref!, { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });

    // Check that there is no horizontal scroll overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // 2px margin for subpixel rounding

    // Verify AI summary card fits neatly within viewport
    const puterCard = page.locator("text=AI Opportunity Summary").first();
    await expect(puterCard).toBeVisible();
  });

  test("Mobile Responsiveness (412x915): Landing page and footers scale properly", async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const footerLink = page.locator("footer a[href='https://developer.puter.com']").first();
    await expect(footerLink).toBeVisible();
  });
});
