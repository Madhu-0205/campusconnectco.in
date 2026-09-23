import { chromium } from "playwright";

const VIEWPORTS = [
  { name: "mobile_small_320", width: 320, height: 640 },
  { name: "mobile_standard_390", width: 390, height: 844 },
  { name: "tablet_768", width: 768, height: 1024 },
  { name: "desktop_1024", width: 1024, height: 768 },
  { name: "desktop_1280", width: 1280, height: 800 },
  { name: "desktop_1440", width: 1440, height: 900 },
];

async function runValidation() {
  console.log("Starting Browser UX/UI Validation...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  const artifactDir = "/Users/madhu/.gemini/antigravity-ide/brain/f5c519a4-0239-47d9-9f67-3df2d93d3a6f";

  // 1. Validate Homepage across viewports & check horizontal overflow
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const overflow = await page.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const winWidth = window.innerWidth;
      return {
        hasOverflow: docWidth > winWidth,
        docWidth,
        winWidth,
      };
    });

    console.log(`Viewport ${vp.name} (${vp.width}x${vp.height}): overflow=${overflow.hasOverflow} (doc: ${overflow.docWidth}, win: ${overflow.winWidth})`);

    if (vp.name === "desktop_1280" || vp.name === "mobile_standard_390") {
      await page.screenshot({
        path: `${artifactDir}/homepage_${vp.name}.png`,
        fullPage: false,
      });
    }
  }

  // 2. Validate Canonical Discovery Page /opportunities
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/opportunities", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const discoveryOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log("Opportunities discovery overflow:", discoveryOverflow);

  await page.screenshot({
    path: `${artifactDir}/discovery_desktop_1280.png`,
    fullPage: false,
  });

  // 3. Validate Command Center (⌘K)
  await page.keyboard.press("Meta+k");
  await page.waitForTimeout(500);
  const isCommandOpen = await page.locator("[label='Global Command Menu']").isVisible();
  console.log("Command Center ⌘K opened:", isCommandOpen);

  await page.screenshot({
    path: `${artifactDir}/command_center_modal.png`,
  });

  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // 4. Validate Filter Interaction on /opportunities
  const searchInput = page.locator("input[placeholder*='Search']").first();
  if (await searchInput.isVisible()) {
    await searchInput.fill("React");
    await page.waitForTimeout(500);
  }

  await page.screenshot({
    path: `${artifactDir}/discovery_filtered_state.png`,
  });

  // 5. Check Console Errors for critical hydration or runtime exceptions
  const criticalErrors = consoleErrors.filter(
    (err) =>
      err.includes("Hydration") ||
      err.includes("react-dom") ||
      err.includes("Uncaught") ||
      err.includes("ChunkLoadError")
  );

  console.log("Total console errors:", consoleErrors.length);
  console.log("Critical errors:", criticalErrors.length);

  await browser.close();
  console.log("Browser UX/UI Validation complete!");
}

runValidation().catch((err) => {
  console.error("Validation failed:", err);
  process.exit(1);
});
