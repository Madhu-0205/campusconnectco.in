import { chromium } from "playwright";

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const artifactDir = "/Users/madhu/.gemini/antigravity-ide/brain/f5c519a4-0239-47d9-9f67-3df2d93d3a6f";

  // 1. Homepage Hero & Bento
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${artifactDir}/final_homepage_hero.png` });

  // Scroll to Bento Features & Categories
  await page.evaluate(() => window.scrollBy(0, 850));
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${artifactDir}/final_homepage_bento_features.png` });

  // Scroll to Categories & Live Opportunity Stream
  await page.evaluate(() => window.scrollBy(0, 900));
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${artifactDir}/final_homepage_categories_and_stream.png` });

  // 2. Open Command Center (⌘K)
  await page.evaluate(() => {
    document.dispatchEvent(new CustomEvent("open-command-center"));
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${artifactDir}/final_command_center_modal.png` });

  // Press ESC to close
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  // 3. Opportunities Discovery Page
  await page.goto("http://localhost:3000/opportunities", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${artifactDir}/final_opportunities_discovery.png` });

  // 4. Opportunities with Filter Applied
  const searchInput = page.locator("input[placeholder*='Search']").first();
  if (await searchInput.isVisible()) {
    await searchInput.fill("Engineering");
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${artifactDir}/final_opportunities_filtered.png` });
  }

  // 5. Mobile Viewport (390px)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${artifactDir}/final_homepage_mobile_390.png` });

  await page.goto("http://localhost:3000/opportunities", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${artifactDir}/final_opportunities_mobile_390.png` });

  await browser.close();
  console.log("All production screenshots captured successfully!");
}

captureScreenshots().catch(console.error);
