import { chromium } from "playwright";
import dotenv from "dotenv";
dotenv.config();

const ARTIFACT_DIR = "/Users/madhu/.gemini/antigravity-ide/brain/82960613-bba0-437a-a465-0f7eb2bd8cc0";
const FOUNDER_EMAIL = "madhuvalurouthu52@gmail.com";
const FOUNDER_PASSWORD = process.env.FOUNDER_PASSWORD || "";

async function main() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Session
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await desktopContext.newPage();

  console.log("Navigating to sign in...");
  await page.goto("http://localhost:3000/auth/sign-in", { waitUntil: "domcontentloaded" });
  await page.fill('input[type="email"]', FOUNDER_EMAIL);
  await page.fill('input[type="password"]', FOUNDER_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 45000, waitUntil: "domcontentloaded" });

  console.log("Navigating to Opportunity Agent console...");
  await page.goto("http://localhost:3000/dashboard/founder/opportunity-agent", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Desktop Main View
  const desktopScreenshot = `${ARTIFACT_DIR}/phase16b_opportunity_agent_desktop.png`;
  await page.screenshot({ path: desktopScreenshot, fullPage: false });
  console.log("Captured desktop screenshot:", desktopScreenshot);

  // Open Provenance Modal
  const inspectBtn = page.locator("button:has-text('Inspect Provenance')").first();
  if (await inspectBtn.isVisible()) {
    await inspectBtn.click();
    await page.waitForTimeout(1000);
    const modalScreenshot = `${ARTIFACT_DIR}/phase16b_provenance_modal_desktop.png`;
    await page.screenshot({ path: modalScreenshot, fullPage: false });
    console.log("Captured provenance modal screenshot:", modalScreenshot);
    // Close modal
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  }

  await desktopContext.close();

  // 2. Mobile Viewport (390 x 844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto("http://localhost:3000/auth/sign-in", { waitUntil: "domcontentloaded" });
  await mobilePage.fill('input[type="email"]', FOUNDER_EMAIL);
  await mobilePage.fill('input[type="password"]', FOUNDER_PASSWORD);
  await mobilePage.click('button[type="submit"]');
  await mobilePage.waitForURL(/\/dashboard/, { timeout: 45000, waitUntil: "domcontentloaded" });

  await mobilePage.goto("http://localhost:3000/dashboard/founder/opportunity-agent", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(2000);

  const mobileScreenshot = `${ARTIFACT_DIR}/phase16b_opportunity_agent_mobile.png`;
  await mobilePage.screenshot({ path: mobileScreenshot, fullPage: false });
  console.log("Captured mobile screenshot:", mobileScreenshot);

  await mobileContext.close();
  await browser.close();
  console.log("All screenshots captured successfully!");
}

main().catch(err => {
  console.error("Screenshot capture error:", err);
  process.exit(1);
});
