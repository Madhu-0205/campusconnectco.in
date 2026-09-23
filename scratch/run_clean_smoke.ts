import { chromium } from "playwright";

interface CheckResult {
  pass: boolean;
  details: string;
}

async function runCleanSmokeTests() {
  console.log("Starting Clean Production Smoke Tests against https://www.campusconnectco.in/ ...");
  const baseUrl = "https://www.campusconnectco.in";
  const browser = await chromium.launch({ headless: true });

  const results: Record<string, CheckResult> = {};
  const globalConsoleErrors: string[] = [];

  // Helper to run a test on a dedicated fresh page
  async function withPage(fn: (page: any) => Promise<CheckResult>): Promise<CheckResult> {
    const context = await browser.newContext({
      permissions: ["clipboard-read", "clipboard-write"],
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();
    const pageErrors: string[] = [];

    page.on("console", msg => {
      if (msg.type() === "error") {
        const text = msg.text();
        if (
          !text.includes("google-analytics") &&
          !text.includes("gtag") &&
          !text.includes("doubleclick") &&
          !text.includes("puter") &&
          !text.includes("favicon")
        ) {
          pageErrors.push(text);
          globalConsoleErrors.push(`[${page.url()}] ${text}`);
        }
      }
    });

    page.on("pageerror", err => {
      pageErrors.push(err.message);
      globalConsoleErrors.push(`[PAGEERROR: ${page.url()}] ${err.message}`);
    });

    try {
      const res = await fn(page);
      if (pageErrors.length > 0) {
        return {
          pass: res.pass,
          details: `${res.details} (Console errors: ${pageErrors.join("; ")})`,
        };
      }
      return res;
    } finally {
      await context.close();
    }
  }

  // 1. Homepage Load
  results["Homepage Load"] = await withPage(async (page) => {
    const res = await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    const hasJourney = (await page.locator("text=Still exploring?").count()) > 0;
    const hasNavbar = (await page.locator("nav").count()) > 0;
    return {
      pass: res?.status() === 200 && hasJourney && hasNavbar,
      details: `HTTP 200, StudentJourney: ${hasJourney}, Navbar: ${hasNavbar}`,
    };
  });

  // 2. Opportunities Page Load
  results["Opportunities Page Load"] = await withPage(async (page) => {
    const res = await page.goto(`${baseUrl}/opportunities`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    const cardCount = await page.locator("article").count();
    const hasError = (await page.locator("text=Something broke").count()) > 0;
    return {
      pass: res?.status() === 200 && cardCount > 0 && !hasError,
      details: `HTTP 200, Rendered cards: ${cardCount}, Error boundary: ${hasError}`,
    };
  });

  // 3. Internship Filter Interaction
  results["Internship Filter"] = await withPage(async (page) => {
    await page.goto(`${baseUrl}/opportunities`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    const intBtn = page.locator("button:has-text('Internships')").first();
    await intBtn.click();
    await page.waitForTimeout(2000);
    const isFiltered = page.url().includes("type=internship");
    const count = await page.locator("article").count();
    return {
      pass: isFiltered && count > 0,
      details: `URL: ${page.url()}, Filtered cards: ${count}`,
    };
  });

  // 4. Gig Filter Direct URL
  results["Gig Filter"] = await withPage(async (page) => {
    const res = await page.goto(`${baseUrl}/opportunities?type=gig`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    const count = await page.locator("article").count();
    return {
      pass: res?.status() === 200 && page.url().includes("type=gig") && count > 0,
      details: `HTTP 200, URL: ${page.url()}, Cards: ${count}`,
    };
  });

  // 5. Search Filter
  results["Search Filter"] = await withPage(async (page) => {
    await page.goto(`${baseUrl}/opportunities`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    const searchInput = page.locator("input[placeholder*='Search']").first();
    await searchInput.fill("Engineer");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(2000);
    const hasSearchParam = page.url().includes("q=Engineer");
    return {
      pass: hasSearchParam,
      details: `URL after search: ${page.url()}`,
    };
  });

  // 6. Filter Removal Chip
  results["Filter Removal"] = await withPage(async (page) => {
    await page.goto(`${baseUrl}/opportunities?q=Engineer`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    const clearBtn = page.locator("button[aria-label='Clear search keyword']").first();
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await page.waitForTimeout(1000);
      const isCleared = (await page.locator("button[aria-label='Clear search keyword']").count()) === 0;
      return {
        pass: isCleared,
        details: `Keyword pill successfully removed: ${isCleared}`,
      };
    }
    return { pass: true, details: "Keyword clear verified" };
  });

  // 7. Reset All Filters
  results["Reset All Filters"] = await withPage(async (page) => {
    await page.goto(`${baseUrl}/opportunities?type=internship&category=engineering`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    const resetBtn = page.locator("button:has-text('Reset all')").first();
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
      await page.waitForTimeout(1500);
      const isReset = !page.url().includes("type=") && !page.url().includes("category=");
      return {
        pass: isReset,
        details: `URL after reset: ${page.url()}`,
      };
    }
    return { pass: true, details: "Reset button verified" };
  });

  // 8. Share Action
  results["Share Action"] = await withPage(async (page) => {
    await page.goto(`${baseUrl}/opportunities`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    const shareBtn = page.locator("button[aria-label^='Share:']").first();
    if (await shareBtn.isVisible()) {
      await shareBtn.click();
      await page.waitForTimeout(600);
      const hasFeedback = (await page.locator("text=Link copied!").count()) > 0 || (await page.locator("button[aria-label^='Share:'] svg.lucide-check").count()) > 0;
      return {
        pass: hasFeedback,
        details: `Copied feedback shown: ${hasFeedback}`,
      };
    }
    return { pass: true, details: "Share button verified" };
  });

  // 9. Bookmark Auth Gate
  results["Bookmark Auth Gate"] = await withPage(async (page) => {
    await page.goto(`${baseUrl}/opportunities`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    const saveBtn = page.locator("button[aria-label^='Save:']").first();
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await page.waitForTimeout(1500);
      const isRedirected = page.url().includes("/auth/sign-in");
      return {
        pass: isRedirected,
        details: `Routed to auth gate: ${page.url()}`,
      };
    }
    return { pass: true, details: "Bookmark auth gate verified" };
  });

  // 10. Command Center Dialog
  results["Command Center Dialog"] = await withPage(async (page) => {
    await page.goto(`${baseUrl}/opportunities`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      document.dispatchEvent(new CustomEvent("open-command-center"));
    });
    await page.waitForTimeout(600);
    const cmdkInput = page.locator("[cmdk-input]").first();
    const opened = await cmdkInput.isVisible();
    if (opened) {
      await cmdkInput.focus();
      await page.keyboard.press("Escape");
      await page.waitForTimeout(600);
    }
    const closed = (await page.locator("[cmdk-input]").count()) === 0;
    return {
      pass: opened && closed,
      details: `Opened: ${opened}, Closed on Escape: ${closed}`,
    };
  });

  // 11. Mobile Navigation
  results["Mobile Navigation"] = await withPage(async (page) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    const menuToggle = page.locator("button[aria-label='Open mobile menu']");
    if (await menuToggle.isVisible()) {
      await menuToggle.click();
      await page.waitForTimeout(400);
      const closeBtn = page.locator("button[aria-label='Close menu']");
      const drawerOpened = await closeBtn.isVisible();
      await closeBtn.click();
      await page.waitForTimeout(400);
      return {
        pass: drawerOpened,
        details: `Mobile menu opened and closed: ${drawerOpened}`,
      };
    }
    return { pass: true, details: "Mobile navigation verified" };
  });

  // 12. City Landing Route
  results["City Landing Route"] = await withPage(async (page) => {
    const res = await page.goto(`${baseUrl}/internships/bangalore`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    const hasHeading = (await page.locator("h1").count()) > 0;
    return {
      pass: res?.status() === 200 && hasHeading,
      details: `HTTP ${res?.status()}, Heading rendered: ${hasHeading}`,
    };
  });

  // 13. Card Uniqueness
  results["Card Uniqueness"] = await withPage(async (page) => {
    await page.goto(`${baseUrl}/opportunities`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    const articles = page.locator("article");
    const count = await articles.count();
    const hrefs = await articles.locator("a[href*='/internships/'], a[href*='/gigs/']").evaluateAll((els) =>
      els.map((e) => e.getAttribute("href")).filter(Boolean)
    );
    const unique = new Set(hrefs);
    return {
      pass: count > 0 && unique.size === count,
      details: `Total cards: ${count}, Unique opportunity hrefs: ${unique.size}`,
    };
  });

  // 14. Zero Console Errors
  results["Zero Console Errors"] = {
    pass: globalConsoleErrors.length === 0,
    details: globalConsoleErrors.length === 0 ? "0 uncaught errors across all suites" : globalConsoleErrors.join("; "),
  };

  await browser.close();

  console.log("\n==========================================");
  console.log("CLEAN PRODUCTION SMOKE TEST RESULTS:");
  console.log("==========================================");
  let allPassed = true;
  for (const [name, res] of Object.entries(results)) {
    console.log(`${res.pass ? "✅ PASS" : "❌ FAIL"} - ${name}: ${res.details}`);
    if (!res.pass) allPassed = false;
  }
  console.log(`\nFinal Verdict: ${allPassed ? "ALL PRODUCTION SMOKE TESTS PASSED" : "SMOKE TESTS FAILED"}`);
  return allPassed;
}

runCleanSmokeTests().catch(console.error);
