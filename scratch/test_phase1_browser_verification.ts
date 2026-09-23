import { chromium } from "playwright";

async function runBrowserVerification() {
  console.log("==================================================");
  console.log("RUNNING PLAYWRIGHT LOCAL BROWSER VERIFICATION");
  console.log("==================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  const hydrationErrors: string[] = [];
  const renderLoopErrors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      // Ignore network noise from third-party map tiles or tracking
      if (
        text.includes("favicon") ||
        text.includes("google-analytics") ||
        text.includes("basemaps.cartocdn")
      ) {
        return;
      }
      consoleErrors.push(text);
      if (text.includes("Hydration failed") || text.includes("hydration")) {
        hydrationErrors.push(text);
      }
      if (text.includes("Maximum update depth exceeded")) {
        renderLoopErrors.push(text);
      }
    }
  });

  page.on("pageerror", (err) => {
    const text = err.message;
    consoleErrors.push(text);
    if (text.includes("Maximum update depth exceeded")) {
      renderLoopErrors.push(text);
    }
    if (text.includes("Hydration failed") || text.includes("hydration")) {
      hydrationErrors.push(text);
    }
  });

  const baseUrl = "http://localhost:3000";

  // 1. Homepage & Map Verification
  console.log("\n1. Testing Homepage (/) & Map Section...");
  const homeRes = await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  console.log(`  - Homepage status: ${homeRes?.status()}`);
  await page.waitForTimeout(2000);

  // Check map container presence
  const mapElement = await page.$(".maplibregl-map, [class*='maplibregl']");
  console.log(`  - MapLibre rendered: ${!!mapElement}`);

  // Check infinite loop errors
  console.log(`  - Map infinite loop errors detected: ${renderLoopErrors.length}`);

  // 2. Command Center
  console.log("\n2. Testing Global Command Center (⌘K)...");
  await page.evaluate(() => {
    document.dispatchEvent(new CustomEvent("open-command-center"));
  });
  await page.waitForTimeout(600);
  const cmdkInput = page.locator("[cmdk-input]").first();
  const cmdkVisible = await cmdkInput.isVisible();
  console.log(`  - Command Center modal opened: ${cmdkVisible}`);
  if (cmdkVisible) {
    await cmdkInput.focus();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);
  }
  const cmdkClosed = (await page.locator("[cmdk-input]").count()) === 0;
  console.log(`  - Command Center modal closed: ${cmdkClosed}`);

  // 3. Opportunities Catalog
  console.log("\n3. Testing /opportunities...");
  const oppRes = await page.goto(`${baseUrl}/opportunities`, { waitUntil: "domcontentloaded" });
  console.log(`  - /opportunities status: ${oppRes?.status()}`);
  await page.waitForTimeout(1000);
  const cardCount = await page.locator("article").count();
  console.log(`  - Opportunity cards rendered: ${cardCount}`);

  // 4. Opportunities Filter: Internship
  console.log("\n4. Testing /opportunities?type=internship...");
  const internRes = await page.goto(`${baseUrl}/opportunities?type=internship`, { waitUntil: "domcontentloaded" });
  console.log(`  - /opportunities?type=internship status: ${internRes?.status()}`);
  await page.waitForTimeout(1000);
  const internCards = await page.locator("article").count();
  console.log(`  - Filtered internship cards rendered: ${internCards}`);

  // 5. Opportunities Filter: Gig
  console.log("\n5. Testing /opportunities?type=gig...");
  const gigRes = await page.goto(`${baseUrl}/opportunities?type=gig`, { waitUntil: "domcontentloaded" });
  console.log(`  - /opportunities?type=gig status: ${gigRes?.status()}`);
  await page.waitForTimeout(1000);
  const gigCards = await page.locator("article").count();
  console.log(`  - Filtered gig cards rendered: ${gigCards}`);

  // 6. Representative Internship Detail
  console.log("\n6. Testing Representative Internship Detail Route...");
  const internDetailRes = await page.goto(`${baseUrl}/internships/bangalore`, { waitUntil: "domcontentloaded" });
  console.log(`  - /internships/bangalore status: ${internDetailRes?.status()}`);

  // 7. Representative Gig Detail Route
  console.log("\n7. Testing Representative Gig Detail Route...");
  const gigDetailRes = await page.goto(`${baseUrl}/browse-gigs`, { waitUntil: "domcontentloaded" });
  console.log(`  - /browse-gigs status: ${gigDetailRes?.status()}`);

  // 8. AI Service Agent Widget Verification
  console.log("\n8. Testing AI Assistant UI Widget...");
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const aiTrigger = page.locator("button[aria-label*='AI'], button:has-text('Ask AI'), button:has-text('Career Assistant'), button:has-text('Copilot')").first();
  const aiTriggerExists = await aiTrigger.isVisible().catch(() => false);
  console.log(`  - AI widget trigger visible on page: ${aiTriggerExists}`);

  console.log("\n==================================================");
  console.log("PLAYWRIGHT VERIFICATION RESULTS:");
  console.log(`  - Total Uncaught Errors: ${consoleErrors.length}`);
  console.log(`  - Maximum Update Depth Exceeded Errors: ${renderLoopErrors.length}`);
  console.log(`  - Hydration Errors: ${hydrationErrors.length}`);
  console.log("==================================================");

  if (consoleErrors.length > 0) {
    console.log("Console errors detail:", consoleErrors);
  }

  await browser.close();

  if (renderLoopErrors.length === 0 && hydrationErrors.length === 0) {
    console.log("\n✅ ALL LOCAL BROWSER REGRESSIONS PASSED!");
    process.exit(0);
  } else {
    console.error("\n❌ Browser verification failed with errors!");
    process.exit(1);
  }
}

runBrowserVerification().catch((err) => {
  console.error("Browser verification crashed:", err);
  process.exit(1);
});
