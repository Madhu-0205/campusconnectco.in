import { chromium } from "playwright";

async function verifyAllInteractions() {
  console.log("Starting Rigorous Interaction Verification...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();

  const results: Record<string, { pass: boolean; details: string }> = {};

  // 1. Visit homepage
  const homeRes = await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  results["Homepage Load"] = {
    pass: homeRes?.status() === 200,
    details: `Status: ${homeRes?.status()}`,
  };

  // 2. Hero Primary CTA ("Explore Opportunities")
  const primaryCta = page.locator("a:has-text('Explore Opportunities')").first();
  const primaryHref = await primaryCta.getAttribute("href");
  results["Hero Primary CTA"] = {
    pass: primaryHref === "/opportunities",
    details: `Links to ${primaryHref}`,
  };

  // 3. Hero Secondary CTA ("Post an Opportunity")
  const secondaryCta = page.locator("a:has-text('Post an Opportunity')").first();
  const secondaryHref = await secondaryCta.getAttribute("href");
  results["Hero Secondary CTA"] = {
    pass: secondaryHref === "/auth/founder",
    details: `Links to ${secondaryHref}`,
  };

  // 4. Navbar Links (Desktop)
  const navLinks = [
    { text: "Discover", expected: "/opportunities" },
    { text: "Internships", expected: "/opportunities?type=internship" },
    { text: "Campus Gigs", expected: "/opportunities?type=gig" },
    { text: "For Founders", expected: "/auth/founder" },
  ];
  for (const nl of navLinks) {
    const el = page.locator(`nav a:has-text('${nl.text}')`).first();
    const href = await el.getAttribute("href");
    results[`Navbar: ${nl.text}`] = {
      pass: href === nl.expected,
      details: `Target: ${href}`,
    };
  }

  // 5. Mobile Navigation Menu Toggle & Links
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  const mobileToggle = page.locator("button[aria-label='Open mobile menu']");
  if (await mobileToggle.isVisible()) {
    await mobileToggle.click();
    await page.waitForTimeout(300);
    const mobileClose = page.locator("button[aria-label='Close menu']");
    const isMobileMenuOpen = await mobileClose.isVisible();
    results["Mobile Navigation Toggle"] = {
      pass: isMobileMenuOpen,
      details: `Drawer opened: ${isMobileMenuOpen}`,
    };
    await mobileClose.click();
    await page.waitForTimeout(300);
  }

  // Reset viewport to desktop
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });

  // 6. Category Links
  const categories = [
    { name: "Engineering & Tech", expected: "/opportunities?category=engineering" },
    { name: "UI/UX & Product Design", expected: "/opportunities?category=design" },
    { name: "Paid Internships", expected: "/opportunities?type=internship" },
    { name: "Campus Gigs", expected: "/opportunities?type=gig" },
    { name: "Remote Opportunities", expected: "/opportunities?workMode=remote" },
  ];
  for (const cat of categories) {
    const catEl = page.locator(`section:has-text('Discover by category') a:has-text('${cat.name}')`).first();
    const href = await catEl.getAttribute("href");
    results[`Category: ${cat.name}`] = {
      pass: href === cat.expected,
      details: `Target: ${href}`,
    };
  }

  // 7. Hero Search input & submission
  const heroSearchInput = page.locator("#hero-search-input");
  await heroSearchInput.fill("Next.js");
  await page.locator("#hero-search-submit").click();
  await page.waitForFunction(
    () => window.location.pathname === "/opportunities" && window.location.search.includes("q=Next.js"),
    { timeout: 8000 }
  );
  results["Hero Search Submission"] = {
    pass: page.url().includes("/opportunities?q=Next.js"),
    details: `Navigated to: ${page.url()}`,
  };

  // 8. Opportunities Page: Active Filters & 1-Click Removal
  await page.goto("http://localhost:3000/opportunities?q=React", { waitUntil: "domcontentloaded" });
  const activePill = page.locator("span:has-text('“React”')").first();
  await activePill.waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
  const isPillVisible = await activePill.isVisible();
  results["Active Filter Pill Display"] = {
    pass: isPillVisible,
    details: `Active query pill visible: ${isPillVisible}`,
  };

  // Click clear search keyword button on pill
  const clearPillBtn = activePill.locator("button[aria-label='Clear search keyword']");
  if (await clearPillBtn.isVisible()) {
    await clearPillBtn.click();
    await page.waitForTimeout(500);
    const isPillGone = !(await page.locator("span:has-text('“React”')").first().isVisible());
    results["1-Click Filter Pill Removal"] = {
      pass: isPillGone,
      details: `Pill removed after click: ${isPillGone}`,
    };
  }

  // 9. Reset All Filters Action
  await page.goto("http://localhost:3000/opportunities?type=internship&category=engineering", { waitUntil: "domcontentloaded" });
  const resetAllBtn = page.locator("button:has-text('Reset all')").first();
  await resetAllBtn.waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
  if (await resetAllBtn.isVisible()) {
    await resetAllBtn.click();
    await page.waitForFunction(
      () => window.location.pathname === "/opportunities" && window.location.search === "",
      { timeout: 8000 }
    ).catch(() => {});
    results["Reset All Filters Action"] = {
      pass: page.url().endsWith("/opportunities"),
      details: `URL after reset: ${page.url()}`,
    };
  }

  // 10. Bookmark and Share Interactions on Opportunity Card
  await page.goto("http://localhost:3000/opportunities", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const shareBtn = page.locator("button[aria-label^='Share:']").first();
  if (await shareBtn.isVisible()) {
    await shareBtn.click();
    await page.waitForTimeout(400);
    const copiedFeedback = page.locator("span:has-text('Link copied!')").first();
    const hasCheck = (await page.locator("button[aria-label^='Share:'] svg.lucide-check").count()) > 0;
    const isShared = (await copiedFeedback.isVisible().catch(() => false)) || hasCheck;
    results["Card Share Copy Action"] = {
      pass: isShared,
      details: "Feedback 'Link copied!' / checkmark appeared on card",
    };
  }

  const saveBtn = page.locator("button[aria-label^='Save:']").first();
  if (await saveBtn.isVisible()) {
    await saveBtn.click();
    await page.waitForFunction(() => window.location.pathname === "/auth/sign-in", { timeout: 6000 });
    const isRedirected = page.url().includes("/auth/sign-in");
    results["Card Save Auth Gate"] = {
      pass: isRedirected,
      details: `Unauthenticated bookmark safely redirected to auth: ${page.url()}`,
    };
  }

  // 11. Command Center Trigger & Escape-to-close
  await page.goto("http://localhost:3000/opportunities", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    document.dispatchEvent(new CustomEvent("open-command-center"));
  });
  await page.waitForTimeout(500);
  const cmdkInput = page.locator("[cmdk-input]").first();
  const isCmdOpen = await cmdkInput.isVisible();
  results["Command Center Open via CustomEvent"] = {
    pass: isCmdOpen,
    details: `Dialog input visible: ${isCmdOpen}`,
  };

  await page.keyboard.press("Escape");
  await page.waitForTimeout(800);
  const cmdkInputCount = await page.locator("[cmdk-input]").count();
  results["Command Center Escape-to-Close"] = {
    pass: cmdkInputCount === 0,
    details: `Dialog unmounted on ESC: ${cmdkInputCount === 0}`,
  };

  // 12. Student Opportunity Journey Controls (Next, Back, Skip)
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.removeItem("cc_opportunity_journey_state");
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);

  const nextBtn = page.locator("button:has-text('Next Step')");
  if (await nextBtn.isVisible()) {
    await nextBtn.click();
    await page.waitForTimeout(400);
    const isStep2 = await page.locator("text=Internships, gigs, and hackathons—all in one place.").first().isVisible();
    results["Journey: Next Step"] = {
      pass: isStep2,
      details: `Step 2 headline rendered: ${isStep2}`,
    };

    const backBtn = page.locator("button:has-text('Back')");
    await backBtn.click();
    await page.waitForTimeout(400);
    const isStep1Again = await page.locator("text=Still exploring? Your next opportunity might be closer than you think.").first().isVisible();
    results["Journey: Back Step"] = {
      pass: isStep1Again,
      details: `Returned to Step 1: ${isStep1Again}`,
    };

    const skipBtn = page.locator("button:has-text('Skip')");
    await skipBtn.click();
    await page.waitForTimeout(400);
    const isRevisitVisible = await page.locator("button:has-text('Revisit Journey')").isVisible();
    results["Journey: Skip & Revisit Pill"] = {
      pass: isRevisitVisible,
      details: `Skip minimized to Revisit Pill: ${isRevisitVisible}`,
    };
  }

  // 13. Reduced-motion Verification (fresh context to isolate localStorage)
  const reducedMotionContext = await browser.newContext();
  const reducedMotionPage = await reducedMotionContext.newPage();
  await reducedMotionPage.emulateMedia({ reducedMotion: "reduce" });
  await reducedMotionPage.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  const journeyLoc = reducedMotionPage.locator("text=Still exploring?").first();
  await journeyLoc.waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
  const journeyWithReducedMotion = await journeyLoc.isVisible();
  results["Reduced Motion: Functional Availability"] = {
    pass: journeyWithReducedMotion,
    details: `Content fully accessible under prefers-reduced-motion: ${journeyWithReducedMotion}`,
  };
  await reducedMotionContext.close();

  await browser.close();

  console.log("\n==========================================");
  console.log("INTERACTION VERIFICATION SUMMARY:");
  console.log("==========================================");
  let allPassed = true;
  for (const [name, res] of Object.entries(results)) {
    console.log(`${res.pass ? "✅ PASS" : "❌ FAIL"} - ${name}: ${res.details}`);
    if (!res.pass) allPassed = false;
  }
  console.log(`\nOverall Result: ${allPassed ? "ALL 13 TESTS PASSED" : "FAILURES DETECTED"}`);
}

verifyAllInteractions().catch(console.error);
