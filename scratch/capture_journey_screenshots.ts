import { chromium } from "playwright";
import path from "path";

const ARTIFACT_DIR = "/Users/madhu/.gemini/antigravity-ide/brain/f5c519a4-0239-47d9-9f67-3df2d93d3a6f";

async function capture() {
  console.log("Launching Chromium for visual evidence capture...");
  const browser = await chromium.launch({ headless: true });

  // Desktop Viewport
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  const journeySection = page.locator('section[aria-label="Student onboarding journey"]');
  await journeySection.waitFor();
  await journeySection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Step 1
  await journeySection.screenshot({ path: path.join(ARTIFACT_DIR, "step1_discovery_radar.png") });
  console.log("Captured step 1 screenshot");

  // Step 2
  await journeySection.locator('button[aria-label="Next step"]').click();
  await page.waitForTimeout(500);
  await journeySection.screenshot({ path: path.join(ARTIFACT_DIR, "step2_all_in_one_hub.png") });
  console.log("Captured step 2 screenshot");

  // Step 3
  await journeySection.locator('button[aria-label="Next step"]').click();
  await page.waitForTimeout(500);
  await journeySection.screenshot({ path: path.join(ARTIFACT_DIR, "step3_skill_match.png") });
  console.log("Captured step 3 screenshot");

  // Step 4
  await journeySection.locator('button[aria-label="Next step"]').click();
  await page.waitForTimeout(500);
  await journeySection.screenshot({ path: path.join(ARTIFACT_DIR, "step4_zero_fluff.png") });
  console.log("Captured step 4 screenshot");

  // Step 5
  await journeySection.locator('button[aria-label="Next step"]').click();
  await page.waitForTimeout(500);
  await journeySection.screenshot({ path: path.join(ARTIFACT_DIR, "step5_launch_opportunities.png") });
  console.log("Captured step 5 screenshot");

  // Skip & Revisit Pill
  await journeySection.locator('button[aria-label="Skip onboarding journey"]').click();
  await page.waitForTimeout(500);
  const revisitSection = page.locator('section[aria-label="Student Journey Tour"]');
  await revisitSection.screenshot({ path: path.join(ARTIFACT_DIR, "journey_skipped_revisit_pill.png") });
  console.log("Captured revisit pill screenshot");

  await context.close();

  // Mobile Viewport (iPhone 14 style: 390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  // Clear localStorage so it starts fresh
  await mobilePage.addInitScript(() => {
    localStorage.removeItem("campusconnect_student_journey_dismissed_v1");
  });
  await mobilePage.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  const mobileJourney = mobilePage.locator('section[aria-label="Student onboarding journey"]');
  await mobileJourney.waitFor();
  await mobileJourney.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(500);
  await mobileJourney.screenshot({ path: path.join(ARTIFACT_DIR, "journey_mobile_responsive.png") });
  console.log("Captured mobile screenshot");

  await mobileContext.close();
  await browser.close();
  console.log("ALL SCREENSHOTS CAPTURED SUCCESSFULLY!");
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
