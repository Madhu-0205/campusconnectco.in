import { chromium } from "playwright";
import * as dotenv from "dotenv";
dotenv.config();

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const HUMAN_FOUNDER_EMAIL = "madhuvalurouthu52@gmail.com";
  const HUMAN_FOUNDER_PASSWORD = process.env.FOUNDER_PASSWORD || "";

  console.log("Navigating to sign in...");
  await page.goto("http://localhost:3000/auth/sign-in", { waitUntil: "domcontentloaded" });
  await page.fill('input[type="email"]', HUMAN_FOUNDER_EMAIL);
  await page.fill('input[type="password"]', HUMAN_FOUNDER_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 45000, waitUntil: "domcontentloaded" });

  console.log("Navigating to opportunity agent dashboard...");
  await page.goto("http://localhost:3000/dashboard/founder/opportunity-agent", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const screenshotPath = "/Users/madhu/.gemini/antigravity-ide/brain/82960613-bba0-437a-a465-0f7eb2bd8cc0/phase16_opportunity_agent_dashboard.png";
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log("Captured desktop screenshot:", screenshotPath);

  // Mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  const mobileScreenshotPath = "/Users/madhu/.gemini/antigravity-ide/brain/82960613-bba0-437a-a465-0f7eb2bd8cc0/phase16_opportunity_agent_mobile.png";
  await page.screenshot({ path: mobileScreenshotPath, fullPage: false });
  console.log("Captured mobile screenshot:", mobileScreenshotPath);

  await browser.close();
}

capture().catch(err => {
  console.error("Error capturing screenshot:", err);
  process.exit(1);
});
