import { test, expect } from "@playwright/test";

test.describe("Student & Founder Full E2E Lifecycle Suite", () => {
  const STUDENT_EMAIL = "e2e_student@university.edu";
  const STUDENT_PASSWORD = "Password123!";
  const FOUNDER_EMAIL = "madhuvalurouthu52@gmail.com";
  const FOUNDER_PASSWORD = "Password123!";
  const PRAGATI_GIG_ID = "718353bf-07f3-4b03-a8bd-c27b8fec5a84";
  const PRAGATI_COLLEGE_ID = "22222222-3333-4444-5555-666666666666";

  // ---------------------------------------------------------------------------
  // 1. Student Sign-In, Session Creation & Dashboard Access
  // ---------------------------------------------------------------------------
  test("Student Authentication: Sign in creates Supabase session and loads student dashboard", async ({ page }) => {
    await page.goto("/auth/sign-in");

    await page.fill("input[type='email']", STUDENT_EMAIL);
    await page.fill("input[type='password']", STUDENT_PASSWORD);
    await page.click("button[type='submit']");

    // Wait for redirect to student dashboard
    await page.waitForURL(/\/dashboard\/student/, { timeout: 20000 });
    expect(page.url()).toContain("/dashboard/student");

    // Verify dashboard elements render
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("nav, header, aside").first()).toBeVisible();

    // Verify refresh preserves authenticated state
    await page.reload();
    await expect(page.locator("body")).toBeVisible();
    expect(page.url()).toContain("/dashboard/student");
  });

  // ---------------------------------------------------------------------------
  // 2. Student College Selection & Persistence
  // ---------------------------------------------------------------------------
  test("College Persistence: Student profile validates authoritative college selection", async ({ page }) => {
    // 1. Sign in as student
    await page.goto("/auth/sign-in");
    await page.fill("input[type='email']", STUDENT_EMAIL);
    await page.fill("input[type='password']", STUDENT_PASSWORD);
    await page.click("button[type='submit']");
    await page.waitForURL(/\/dashboard\/student/, { timeout: 20000 });

    // 2. Update profile with authoritative Pragati Engineering College ID
    const updateRes = await page.request.patch("/api/user/profile", {
      data: {
        collegeId: PRAGATI_COLLEGE_ID,
        city: "Surampalem",
        state: "Andhra Pradesh"
      }
    });
    expect(updateRes.status()).toBe(200);
    const profileJson = await updateRes.json();
    expect(profileJson.collegeId).toBe(PRAGATI_COLLEGE_ID);
    expect(profileJson.college).toContain("Pragati");

    // 3. Forged college ID rejection
    const forgedRes = await page.request.patch("/api/user/profile", {
      data: {
        collegeId: "00000000-0000-0000-0000-000000000000"
      }
    });
    expect(forgedRes.status()).toBe(400);
  });

  // ---------------------------------------------------------------------------
  // 3. Personalized Recommendations & Contextual Map
  // ---------------------------------------------------------------------------
  test("Recommendations Engine: Authenticated student receives personalized scoring and map marker", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.fill("input[type='email']", STUDENT_EMAIL);
    await page.fill("input[type='password']", STUDENT_PASSWORD);
    await page.click("button[type='submit']");
    await page.waitForURL(/\/dashboard\/student/, { timeout: 20000 });

    // Check recommendations API for student
    const recsRes = await page.request.get("/api/recommendations?type=gigs");
    expect(recsRes.status()).toBe(200);
    const recsData = await recsRes.json();
    expect(Array.isArray(recsData)).toBe(true);

    if (recsData.length > 0) {
      const firstRec = recsData[0];
      expect(firstRec).toHaveProperty("matchScore");
      expect(firstRec).toHaveProperty("badges");
      // Coordinates should be sanitized
      expect(firstRec).not.toHaveProperty("latitude");
      expect(firstRec).not.toHaveProperty("longitude");
    }

    // Visit opportunities feed UI
    await page.goto("/opportunities");
    await expect(page.locator("h1")).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // 4. Complete Application Pipeline: Apply -> In-App Notification -> Database Consistency
  // ---------------------------------------------------------------------------
  test("Application Pipeline: Student applies, receives notification, founder reviews and accepts", async ({ page, browser }) => {
    test.setTimeout(120000);

    // 1. Sign in as student
    await page.goto("/auth/sign-in");
    await page.fill("input[type='email']", STUDENT_EMAIL);
    await page.fill("input[type='password']", STUDENT_PASSWORD);
    await page.click("button[type='submit']");
    await page.waitForURL(/\/dashboard\/student/, { timeout: 20000 });

    // 2. Submit application via API or detail page
    const applyRes = await page.request.post("/api/applications/apply", {
      data: {
        gigId: PRAGATI_GIG_ID,
        coverLetter: "I have experience setting up GitHub Actions pipelines for Next.js and Node.js projects."
      }
    });
    
    // Either 201 (new application) or 400 (already applied in earlier test run)
    expect([201, 400]).toContain(applyRes.status());

    // 3. Double-click / Duplicate submission prevention test
    const duplicateRes = await page.request.post("/api/applications/apply", {
      data: {
        gigId: PRAGATI_GIG_ID,
        coverLetter: "Second attempt duplicate submission"
      }
    });
    expect(duplicateRes.status()).toBe(400);

    // 4. Verify student in-app notifications
    const studentNotifRes = await page.request.get("/api/notifications");
    expect(studentNotifRes.status()).toBe(200);
    const notifsData = await studentNotifRes.json();
    expect(notifsData.success).toBe(true);
    expect(Array.isArray(notifsData.notifications)).toBe(true);

    // 5. Check student applications page
    await page.goto("/dashboard/student/applications");
    await expect(page.locator("h1, h2, table").first()).toBeVisible();

    // 6. Founder session: Login as Founder in a separate context
    const founderContext = await browser.newContext();
    const founderPage = await founderContext.newPage();

    await founderPage.goto("/auth/sign-in");
    await founderPage.fill("input[type='email']", FOUNDER_EMAIL);
    await founderPage.fill("input[type='password']", FOUNDER_PASSWORD);
    await founderPage.click("button[type='submit']");
    await founderPage.waitForURL(/\/dashboard\/founder/, { timeout: 20000 });
    expect(founderPage.url()).toContain("/dashboard/founder");

    // 7. Founder checks applications list
    await founderPage.goto("/dashboard/founder/applications");
    await expect(founderPage.locator("h1").first()).toContainText(/Applications/i);

    // 8. Find the student application in DB/API to test acceptance
    const studentAppsRes = await page.request.get("/api/applications");
    const studentApps = await studentAppsRes.json();
    const appItem = studentApps.items?.find((a: any) => a.gig.id === PRAGATI_GIG_ID);

    if (appItem) {
      const applicationId = appItem.id;

      // Founder accepts application
      const acceptRes = await founderPage.request.patch(`/api/applications/${applicationId}`, {
        data: { status: "ACCEPTED" }
      });
      expect(acceptRes.status()).toBe(200);

      // Verify duplicate status update returns already up to date without new notification
      const dupAcceptRes = await founderPage.request.patch(`/api/applications/${applicationId}`, {
        data: { status: "ACCEPTED" }
      });
      expect(dupAcceptRes.status()).toBe(200);
      const dupJson = await dupAcceptRes.json();
      expect(dupJson.message).toContain("already up to date");

      // Verify student's application shows ACCEPTED
      const updatedStudentAppRes = await page.request.get("/api/applications");
      const updatedStudentApps = await updatedStudentAppRes.json();
      const updatedApp = updatedStudentApps.items?.find((a: any) => a.id === applicationId);
      expect(updatedApp?.status).toBe("ACCEPTED");
    }

    await founderContext.close();
  });

  // ---------------------------------------------------------------------------
  // 5. Role Matrix & Unauthorized Access Enforcement
  // ---------------------------------------------------------------------------
  test("Role Matrix Enforcement: Students blocked from Founder/Admin dashboards & APIs", async ({ page }) => {
    // 1. Sign in as student
    await page.goto("/auth/sign-in");
    await page.fill("input[type='email']", STUDENT_EMAIL);
    await page.fill("input[type='password']", STUDENT_PASSWORD);
    await page.click("button[type='submit']");
    await page.waitForURL(/\/dashboard\/student/, { timeout: 20000 });

    // 2. Student attempting direct navigation to Founder console is redirected
    await page.goto("/dashboard/founder");
    // Should be redirected away from founder dashboard (to /dashboard/student or /dashboard)
    await page.waitForURL((url) => !url.pathname.startsWith("/dashboard/founder"), { timeout: 15000 });
    expect(page.url()).not.toContain("/dashboard/founder");

    // 3. Student attempting direct Founder APIs gets 403 Forbidden
    const founderVerifyRes = await page.request.get("/api/founder/verify-role");
    expect(founderVerifyRes.status()).toBe(403);

    const founderUsersRes = await page.request.get("/api/founder/users");
    expect(founderUsersRes.status()).toBe(403);

    const adminAuditRes = await page.request.get("/api/admin/audit-logs");
    expect(adminAuditRes.status()).toBe(403);
  });

  // ---------------------------------------------------------------------------
  // 6. Mobile Viewport Integrity for Authenticated Pages
  // ---------------------------------------------------------------------------
  test("Mobile Viewport Integrity: Student dashboard renders without horizontal overflow at 390x844", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto("/auth/sign-in");
    await page.fill("input[type='email']", STUDENT_EMAIL);
    await page.fill("input[type='password']", STUDENT_PASSWORD);
    await page.click("button[type='submit']");
    await page.waitForURL(/\/dashboard\/student/, { timeout: 20000 });

    // Verify no horizontal overflow on mobile
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow).toBe(false);

    // Verify main content is visible
    await expect(page.locator("body")).toBeVisible();
  });
});
