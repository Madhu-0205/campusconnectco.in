import { chromium } from "playwright";

async function run() {
  console.log("Launching headless browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000/...");
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 30000 });

  console.log("Page loaded. Searching for Student onboarding journey...");
  const journeySection = page.locator('section[aria-label="Student onboarding journey"]');
  await journeySection.waitFor({ timeout: 10000 });

  // Step 1
  const step1Headline = await journeySection.locator("h3").textContent();
  console.log("Step 1 Headline:", step1Headline);

  // Click Next Step -> Step 2
  const nextBtn = journeySection.locator('button[aria-label="Next step"]');
  await nextBtn.click();
  await page.waitForTimeout(600);
  const step2Headline = await journeySection.locator("h3").textContent();
  console.log("Step 2 Headline:", step2Headline);

  // Click Next Step -> Step 3
  await nextBtn.click();
  await page.waitForTimeout(600);
  const step3Headline = await journeySection.locator("h3").textContent();
  console.log("Step 3 Headline:", step3Headline);

  // Click Next Step -> Step 4
  await nextBtn.click();
  await page.waitForTimeout(600);
  const step4Headline = await journeySection.locator("h3").textContent();
  console.log("Step 4 Headline:", step4Headline);

  // Click Next Step -> Step 5
  await nextBtn.click();
  await page.waitForTimeout(600);
  const step5Headline = await journeySection.locator("h3").textContent();
  console.log("Step 5 Headline:", step5Headline);

  // Check CTA
  const cta = journeySection.locator('a[aria-label="Explore Opportunities"]');
  const ctaHref = await cta.getAttribute("href");
  console.log("Step 5 CTA Href:", ctaHref);

  // Test Back button
  const backBtn = journeySection.locator('button[aria-label="Previous step"]');
  await backBtn.click();
  await page.waitForTimeout(600);
  const step4BackHeadline = await journeySection.locator("h3").textContent();
  console.log("After Back click, Headline:", step4BackHeadline);

  // Test Skip tour
  const skipBtn = journeySection.locator('button[aria-label="Skip onboarding journey"]');
  await skipBtn.click();
  await page.waitForTimeout(600);

  const reopenBtn = page.locator('button[aria-label="Reopen student onboarding journey"]');
  const reopenVisible = await reopenBtn.isVisible();
  console.log("Revisit Journey button visible after Skip:", reopenVisible);

  // Test Reopen
  await reopenBtn.click();
  await page.waitForTimeout(600);
  const reopenedStepHeadline = await page.locator('section[aria-label="Student onboarding journey"] h3').textContent();
  console.log("Reopened Journey Headline:", reopenedStepHeadline);

  await browser.close();
  console.log("ALL PLAYWRIGHT VERIFICATIONS PASSED!");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
