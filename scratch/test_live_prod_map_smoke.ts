import { chromium } from "playwright";

async function verifyLiveProductionMap() {
  console.log("==================================================");
  console.log("LIVE PRODUCTION BROWSER SMOKE TEST (https://www.campusconnectco.in/)");
  console.log("==================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  const hydrationErrors: string[] = [];
  const renderLoopErrors: string[] = [];
  const allConsoleMessages: string[] = [];

  page.on("console", (msg) => {
    const text = msg.text();
    allConsoleMessages.push(`[${msg.type()}] ${text}`);
    if (msg.type() === "error") {
      // Exclude external third-party tile / tracking network noise
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
      if (text.includes("Maximum update depth exceeded") || text.includes("Too many re-renders")) {
        renderLoopErrors.push(text);
      }
    }
  });

  page.on("pageerror", (err) => {
    const text = err.message;
    consoleErrors.push(`[PAGEERROR] ${text}`);
    if (text.includes("Maximum update depth exceeded") || text.includes("Too many re-renders")) {
      renderLoopErrors.push(text);
    }
    if (text.includes("Hydration failed") || text.includes("hydration")) {
      hydrationErrors.push(text);
    }
  });

  console.log("\nNavigating to https://www.campusconnectco.in/ ...");
  const start = Date.now();
  const resp = await page.goto("https://www.campusconnectco.in/", {
    waitUntil: "networkidle",
    timeout: 30000,
  }).catch(async () => {
    return page.goto("https://www.campusconnectco.in/", { waitUntil: "domcontentloaded", timeout: 30000 });
  });
  const duration = Date.now() - start;

  console.log(`HTTP Status: ${resp?.status()} in ${duration}ms`);

  // Wait 4 seconds on page to observe any deferred render cycles or loops
  await page.waitForTimeout(4000);

  // Check map element
  const mapElement = await page.$(".maplibregl-map, [class*='maplibregl']");
  const isMapVisible = !!mapElement;
  console.log(`Map element visible in DOM: ${isMapVisible}`);

  // Check for opportunity cards
  const cardsCount = await page.locator("article").count();
  console.log(`Cards rendered on page: ${cardsCount}`);

  console.log("\n==================================================");
  console.log("OBSERVED RUNTIME EVIDENCE:");
  console.log(`  - Maximum Update Depth / Render Loop Errors: ${renderLoopErrors.length}`);
  console.log(`  - Hydration Errors: ${hydrationErrors.length}`);
  console.log(`  - Uncaught Console Errors: ${consoleErrors.length}`);
  console.log("==================================================");

  if (consoleErrors.length > 0) {
    console.log("Console Errors Detail:", consoleErrors);
  }

  await browser.close();

  return {
    status: resp?.status(),
    duration,
    isMapVisible,
    cardsCount,
    renderLoopErrors,
    hydrationErrors,
    consoleErrors,
  };
}

verifyLiveProductionMap()
  .then((res) => {
    if (res.renderLoopErrors.length === 0 && res.hydrationErrors.length === 0 && res.consoleErrors.length === 0) {
      console.log("\n✅ LIVE PRODUCTION MAP SMOKE TEST PASSED (0 ERRORS)");
      process.exit(0);
    } else {
      console.error("\n❌ LIVE PRODUCTION ENCOUNTERED ERRORS");
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("Test execution crashed:", err);
    process.exit(1);
  });
