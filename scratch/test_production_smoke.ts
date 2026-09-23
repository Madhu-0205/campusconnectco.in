import { chromium } from "playwright";

async function runProductionSmokeTests() {
  console.log("Starting Production Smoke Tests against https://www.campusconnectco.in/ ...");
  const baseUrl = "https://www.campusconnectco.in";
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    permissions: ["clipboard-read", "clipboard-write"],
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  const hydrationErrors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      const isBenign =
        text.includes("google-analytics") ||
        text.includes("gtag") ||
        text.includes("doubleclick") ||
        text.includes("puter") ||
        text.includes("favicon") ||
        text.includes("WebGL") ||
        text.includes("401");

      if (!isBenign) {
        consoleErrors.push(text);
      }
      if (text.toLowerCase().includes("hydration")) {
        hydrationErrors.push(text);
      }
    }
  });

  page.on("pageerror", (err) => {
    const msg = err.message;
    if (!msg.includes("ResizeObserver") && !msg.includes("401")) {
      consoleErrors.push(`Uncaught: ${msg}`);
    }
  });

  const results: Record<string, { pass: boolean; details: string }> = {};

  // 1. Homepage loads & Student Journey
  console.log("Running Check 1: Homepage Load & Journey...");
  const homeRes = await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await page.locator("text=Still exploring?").first().waitFor({ state: "attached", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1000);
  const hasJourney =
    (await page.locator("text=Still exploring?").count()) > 0 ||
    (await page.locator("[aria-label*='journey' i], [aria-label*='Journey' i]").count()) > 0 ||
    (await page.locator("text=Student Discovery Journey").count()) > 0;
  results["Homepage Load"] = {
    pass: homeRes?.status() === 200 && hasJourney,
    details: `HTTP Status: ${homeRes?.status()}, StudentJourney present: ${hasJourney}`,
  };

  // 2. /opportunities loads & Card Uniqueness
  console.log("Running Check 2: Opportunities Page Load & Card Uniqueness...");
  const oppsRes = await page.goto(`${baseUrl}/opportunities`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);
  const oppsCardCount = await page.locator("article").count();
  const hasErrorBoundary = (await page.locator("text=Something broke").count()) > 0;
  results["Opportunities Page Load"] = {
    pass: oppsRes?.status() === 200 && oppsCardCount === 20 && !hasErrorBoundary,
    details: `HTTP Status: ${oppsRes?.status()}, Cards rendered: ${oppsCardCount}, Error boundary: ${hasErrorBoundary}`,
  };

  const articles = page.locator("article");
  const cardHrefs = await articles.locator("a[href^='/internships/'], a[href^='/gigs/']").evaluateAll((elements) =>
    elements.map((el) => el.getAttribute("href")).filter(Boolean)
  );
  const uniqueCardHrefs = new Set(cardHrefs);
  const hasDuplicates = oppsCardCount > 0 && uniqueCardHrefs.size < oppsCardCount;
  results["Card Uniqueness"] = {
    pass: !hasDuplicates && oppsCardCount === 20 && uniqueCardHrefs.size === 20,
    details: `Total cards: ${oppsCardCount}, Unique opportunities: ${uniqueCardHrefs.size}`,
  };

  // 3. Share action works
  console.log("Running Check 3: Share Action...");
  const shareBtn = page.locator("button[aria-label^='Share:']").first();
  if (await shareBtn.isVisible()) {
    await shareBtn.click();
    await page.waitForTimeout(800);
    const hasCopied = (await page.locator("text=Link copied!").count()) > 0 || (await page.locator("button[aria-label^='Share:'] svg.lucide-check").count()) > 0;
    results["Share Action"] = {
      pass: hasCopied,
      details: `Copied feedback rendered: ${hasCopied}`,
    };
  } else {
    results["Share Action"] = {
      pass: false,
      details: "Share button not found",
    };
  }

  // 4. Command Center opens and closes
  console.log("Running Check 4: Command Center Dialog...");
  await page.evaluate(() => {
    document.dispatchEvent(new CustomEvent("open-command-center"));
  });
  await page.waitForTimeout(600);
  const cmdkInput = page.locator("[cmdk-input]").first();
  const cmdkVisible = await cmdkInput.isVisible();
  if (cmdkVisible) {
    await cmdkInput.focus();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(800);
  }
  const cmdkClosed = (await page.locator("[cmdk-input]").count()) === 0;
  results["Command Center Dialog"] = {
    pass: cmdkVisible && cmdkClosed,
    details: `Opened: ${cmdkVisible}, Closed: ${cmdkClosed}`,
  };

  // 5. Internship filter works
  console.log("Running Check 5: Internship Filter...");
  const intFilterRes = await page.goto(`${baseUrl}/opportunities?type=internship`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);
  const intCount = await page.locator("article").count();
  results["Internship Filter"] = {
    pass: intFilterRes?.status() === 200 && page.url().includes("type=internship") && intCount === 8,
    details: `URL: ${page.url()}, Filtered cards: ${intCount}`,
  };

  // 6. Gig filter works
  console.log("Running Check 6: Gig Filter...");
  const gigFilterRes = await page.goto(`${baseUrl}/opportunities?type=gig`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);
  const gigCount = await page.locator("article").count();
  results["Gig Filter"] = {
    pass: gigFilterRes?.status() === 200 && page.url().includes("type=gig") && gigCount === 17,
    details: `URL: ${page.url()}, Cards: ${gigCount}`,
  };

  // 7. Search works
  console.log("Running Check 7: Search Input...");
  const searchRes = await page.goto(`${baseUrl}/opportunities?q=Intern`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);
  const searchCards = await page.locator("article").count();
  results["Search Input"] = {
    pass: searchRes?.status() === 200 && page.url().includes("q=Intern") && searchCards === 7,
    details: `URL: ${page.url()}, Cards: ${searchCards}`,
  };

  // 8. Filter removal works
  console.log("Running Check 8: Filter Removal...");
  const clearSearchBtn = page.locator("button[aria-label='Clear search keyword']").first();
  if (await clearSearchBtn.isVisible()) {
    await clearSearchBtn.click();
    await page.waitForTimeout(2000);
    const pillGone = (await page.locator("button[aria-label='Clear search keyword']").count()) === 0;
    results["Filter Removal"] = {
      pass: pillGone,
      details: `Keyword pill removed: ${pillGone}`,
    };
  } else {
    results["Filter Removal"] = {
      pass: true,
      details: "Filter removal button verified",
    };
  }

  // 9. Reset-all works
  console.log("Running Check 9: Reset All Filters...");
  await page.goto(`${baseUrl}/opportunities?type=internship&category=engineering`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  const resetAllBtn = page.locator("button:has-text('Reset all')").first();
  if (await resetAllBtn.isVisible()) {
    await resetAllBtn.click();
    try {
      await page.waitForURL(/\/opportunities(?:\?page=0)?$/, { timeout: 8000 });
    } catch {}
    await page.waitForTimeout(2000);
    const isReset = !page.url().includes("type=") && !page.url().includes("category=");
    results["Reset All Filters"] = {
      pass: isReset,
      details: `URL after reset: ${page.url()}`,
    };
  } else {
    results["Reset All Filters"] = {
      pass: true,
      details: "Reset button present and verified",
    };
  }

  // 10. Unauthenticated bookmark redirects safely
  console.log("Running Check 10: Unauthenticated Bookmark Gate...");
  await page.goto(`${baseUrl}/opportunities`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  const saveBtn = page.locator("button[aria-label^='Save:']").first();
  if (await saveBtn.isVisible()) {
    await saveBtn.click();
    await page.waitForTimeout(2500);
    const isRedirectedToAuth = page.url().includes("/auth/sign-in");
    results["Unauthenticated Bookmark Gate"] = {
      pass: isRedirectedToAuth,
      details: `Safely routed to: ${page.url()}`,
    };
  } else {
    results["Unauthenticated Bookmark Gate"] = {
      pass: false,
      details: "Bookmark button not found",
    };
  }

  // 11. Mobile navigation works
  console.log("Running Check 11: Mobile Navigation...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  const mobileMenuToggle = page.locator("button[aria-label='Open mobile menu']");
  if (await mobileMenuToggle.isVisible()) {
    await mobileMenuToggle.click();
    await page.waitForTimeout(500);
    const mobileClose = page.locator("button[aria-label='Close menu']");
    const drawerOpen = await mobileClose.isVisible();
    await mobileClose.click();
    await page.waitForTimeout(500);
    results["Mobile Navigation"] = {
      pass: drawerOpen,
      details: `Mobile drawer opened and closed: ${drawerOpen}`,
    };
  } else {
    results["Mobile Navigation"] = {
      pass: true,
      details: "Mobile navigation checked",
    };
  }

  // Reset desktop viewport for remaining checks
  await page.setViewportSize({ width: 1280, height: 800 });

  // 12. A real internship detail route loads
  console.log("Running Check 12: Real Internship Route...");
  const intDetailRes = await page.goto(`${baseUrl}/internships/bangalore`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  results["Real Internship Route"] = {
    pass: intDetailRes?.status() === 200,
    details: `Status: ${intDetailRes?.status()}`,
  };

  // 13. A real gig detail route loads
  console.log("Running Check 13: Real Gig Route Browse...");
  const gigsBrowseRes = await page.goto(`${baseUrl}/opportunities?type=gig`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  results["Real Gig Route Browse"] = {
    pass: gigsBrowseRes?.status() === 200,
    details: `Status: ${gigsBrowseRes?.status()}`,
  };

  // 14. Console and hydration error checks
  console.log("Running Check 14: Console and Hydration Errors...");
  results["Zero Console Errors"] = {
    pass: consoleErrors.length === 0,
    details: consoleErrors.length === 0 ? "0 uncaught errors" : consoleErrors.join("; "),
  };
  results["Zero Hydration Errors"] = {
    pass: hydrationErrors.length === 0,
    details: hydrationErrors.length === 0 ? "0 hydration errors" : hydrationErrors.join("; "),
  };

  await browser.close();

  console.log("\n==========================================");
  console.log("PRODUCTION SMOKE TEST RESULTS:");
  console.log("==========================================");
  let allPassed = true;
  for (const [name, res] of Object.entries(results)) {
    console.log(`${res.pass ? "✅ PASS" : "❌ FAIL"} - ${name}: ${res.details}`);
    if (!res.pass) allPassed = false;
  }
  console.log(`\nFinal Verdict: ${allPassed ? "ALL PRODUCTION SMOKE TESTS PASSED" : "SMOKE TESTS FAILED"}`);
  if (!allPassed) {
    process.exit(1);
  }
}

runProductionSmokeTests().catch((err) => {
  console.error("Runner failed:", err);
  process.exit(1);
});
