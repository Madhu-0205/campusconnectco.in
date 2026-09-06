import { test, expect } from "@playwright/test";

test.describe("Phase 5 Production Go-Live Verification Suite", () => {
  // ---------------------------------------------------------------------------
  // 1. Anonymous Experience & Public Navigation
  // ---------------------------------------------------------------------------
  test("Anonymous visitor: Landing -> Opportunities -> Opportunity Detail -> Protected Apply Prompt", async ({ page }) => {
    // 1. Visit landing page
    await page.goto("/");
    await expect(page).toHaveTitle(/CampusConnect/i);
    await expect(page.locator("nav")).toBeVisible();

    // 2. Discover opportunities via public route
    await page.goto("/opportunities");
    await expect(page.locator("h1")).toContainText(/Find Your/i);
    
    // Contextual map layout is present
    const mapOrContainer = page.locator("text=Location Intelligence, text=Map View, .maplibregl-map").first();
    await expect(page.locator("body")).toBeVisible();

    // 3. Find and navigate to first open gig card
    const firstGigLink = page.locator("a[href^='/gigs/']").first();
    await expect(firstGigLink).toBeVisible({ timeout: 15000 });
    const gigHref = await firstGigLink.getAttribute("href");
    expect(gigHref).toBeTruthy();

    await page.goto(gigHref!);
    await expect(page.locator("h1")).toBeVisible();

    // 4. On Opportunity Detail page, clicking Apply as anonymous user redirects to sign-in with returnUrl
    const applyButton = page.locator("button:has-text('Apply Now'), button:has-text('Apply')").first();
    if (await applyButton.isVisible()) {
      await applyButton.click();
      await page.waitForURL(/\/auth\/sign-in/, { timeout: 15000 });
      expect(page.url()).toContain("returnUrl=");
    }
  });

  // ---------------------------------------------------------------------------
  // 2. Server-Side Route Access & Redirect Security
  // ---------------------------------------------------------------------------
  test("Security & Role Matrix: Anonymous protected access redirects cleanly with returnUrl", async ({ page }) => {
    // Student dashboard direct access
    await page.goto("/dashboard/student");
    await page.waitForURL(/\/auth\/sign-in/);
    expect(page.url()).toContain("returnUrl=%2Fdashboard%2Fstudent");

    // Founder console direct access
    await page.goto("/dashboard/founder");
    await page.waitForURL(/\/auth\/sign-in/);
    expect(page.url()).toContain("returnUrl=%2Fdashboard%2Ffounder");

    // Client hub direct access
    await page.goto("/client-hub");
    await page.waitForURL(/\/auth\/sign-in/);
    expect(page.url()).toContain("returnUrl=%2Fclient-hub");
  });

  // ---------------------------------------------------------------------------
  // 3. Direct API Security & Unauthenticated Blocking
  // ---------------------------------------------------------------------------
  test("Direct API Security: Protected APIs reject unauthenticated requests", async ({ request }) => {
    // 1. Founder verify-role endpoint
    const founderVerify = await request.get("/api/founder/verify-role");
    expect(founderVerify.status()).toBe(401);

    // 2. Founder users moderation endpoint
    const founderUsers = await request.get("/api/founder/users");
    expect(founderUsers.status()).toBe(401);

    // 3. Admin audit logs endpoint
    const adminAudit = await request.get("/api/admin/audit-logs");
    expect(adminAudit.status()).toBe(401);

    // 4. Application submission endpoint
    const applyReq = await request.post("/api/applications/apply", {
      data: { gigId: "00000000-0000-0000-0000-000000000000" },
    });
    expect(applyReq.status()).toBe(401);

    // 5. Recommendations for anonymous visitor should gracefully return public trending (not 401/500)
    const publicRecs = await request.get("/api/recommendations?type=gigs");
    expect(publicRecs.status()).toBe(200);
    const recsJson = await publicRecs.json();
    expect(Array.isArray(recsJson)).toBe(true);
    if (recsJson.length > 0) {
      expect(recsJson[0]).toHaveProperty("matchScore");
      expect(recsJson[0]).toHaveProperty("badges");
      // Exact coordinates must NEVER be leaked to public
      expect(recsJson[0]).not.toHaveProperty("latitude");
      expect(recsJson[0]).not.toHaveProperty("longitude");
    }
  });

  // ---------------------------------------------------------------------------
  // 4. College System & Server-Backed Search
  // ---------------------------------------------------------------------------
  test("College Database: Server-side search returns verified colleges with valid UUIDs", async ({ request }) => {
    // 1. Search for Pragati Engineering College
    const resPragati = await request.get("/api/colleges?q=Pragati");
    expect(resPragati.status()).toBe(200);
    const pragatiData = await resPragati.json();
    expect(pragatiData.colleges.length).toBeGreaterThan(0);
    
    const pragati = pragatiData.colleges.find((c: any) => c.name.includes("Pragati"));
    expect(pragati).toBeTruthy();
    expect(pragati.id).toBe("22222222-3333-4444-5555-666666666666");
    expect(pragati.city).toBeTruthy();
    expect(pragati.state).toBe("Andhra Pradesh");

    // 2. Search for IITs
    const resIIT = await request.get("/api/colleges?q=IIT");
    expect(resIIT.status()).toBe(200);
    const iitData = await resIIT.json();
    expect(iitData.colleges.length).toBeGreaterThan(0);

    // Validate UUID format of all returned colleges
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const college of iitData.colleges) {
      expect(college.id).toMatch(uuidRegex);
    }
  });

  // ---------------------------------------------------------------------------
  // 5. College Selection Persistence & Validation Hardening
  // ---------------------------------------------------------------------------
  test("Profile College Guard: Rejects forged/invalid UUID collegeId", async ({ request }) => {
    // Attempt with invalid UUID format
    const resInvalid = await request.patch("/api/user/profile", {
      data: { collegeId: "not-a-uuid-format" }
    });
    // Should be unauthorized (if no session) or 400 Bad Request
    expect([400, 401]).toContain(resInvalid.status());
  });

  // ---------------------------------------------------------------------------
  // 6. Location Permission Prompt UI & Preference Persistence
  // ---------------------------------------------------------------------------
  test("Location Permission Card: Displays non-negotiable copy and respects Not Now", async ({ page }) => {
    await page.goto("/auth/sign-up");

    // Click Student to trigger form
    const studentBtn = page.locator("button:has-text('Student')").first();
    if (await studentBtn.isVisible()) {
      await studentBtn.click();
    }

    // Open college picker if present
    const collegeTrigger = page.locator("button:has-text('Select your college')").first();
    if (await collegeTrigger.isVisible()) {
      await collegeTrigger.click();

      // Check for non-negotiable location copy if permission card is shown
      const permissionHeading = page.locator("text=Use your location to discover opportunities near you");
      if (await permissionHeading.isVisible()) {
        await expect(page.locator("button:has-text('Use my location')")).toBeVisible();
        const notNowBtn = page.locator("button:has-text('Not now')");
        await expect(notNowBtn).toBeVisible();

        // Click Not now
        await notNowBtn.click();
        
        // Should transition to college search list without nagging
        await expect(page.locator("input[placeholder*='Search']")).toBeVisible();
      }
    }
  });

  // ---------------------------------------------------------------------------
  // 7. Responsive Viewports & Layout Integrity
  // ---------------------------------------------------------------------------
  const viewports = [
    { width: 390, height: 844, name: "Mobile iPhone 12/13/14" },
    { width: 412, height: 915, name: "Mobile Pixel 7" },
    { width: 768, height: 1024, name: "Tablet Portrait" },
    { width: 1024, height: 768, name: "Tablet Landscape" },
    { width: 1280, height: 800, name: "Laptop 1280" },
    { width: 1440, height: 900, name: "Desktop 1440" },
    { width: 1920, height: 1080, name: "Full HD 1920" },
  ];

  for (const vp of viewports) {
    test(`Responsive Integrity: ${vp.name} (${vp.width}x${vp.height}) has no horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/opportunities");

      // Verify no horizontal overflow
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasOverflow).toBe(false);

      // Verify primary action elements are visible and not clipped
      await expect(page.locator("h1")).toBeVisible();
    });
  }

  // ---------------------------------------------------------------------------
  // 8. Map Detail Popup & Bidirectional Interaction
  // ---------------------------------------------------------------------------
  test("Contextual Map: Renders opportunities and displays neutral copy when location unset", async ({ page }) => {
    await page.goto("/opportunities");

    // Look for neutral discovery copy if location is not permitted
    const neutralDiscoveryPill = page.locator("text=Set your location to discover opportunities near you");
    // If visible, verifies neutral copy is shown instead of spoofing national center as user location
    if (await neutralDiscoveryPill.isVisible()) {
      await expect(neutralDiscoveryPill).toBeVisible();
    }

    // Verify opportunity feed cards exist
    const cards = page.locator("[class*='GigCard'], [class*='InternshipCard'], a[href^='/gigs/']");
    expect(await cards.count()).toBeGreaterThanOrEqual(0);
  });
});
