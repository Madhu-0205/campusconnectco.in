import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    errors.push(err.message);
  });

  console.log("Navigating to https://www.campusconnectco.in/opportunities ...");
  const response = await page.goto("https://www.campusconnectco.in/opportunities", {
    waitUntil: "networkidle",
    timeout: 30000,
  });

  console.log(`Status: ${response?.status()}`);
  await page.waitForTimeout(2000);

  const bodyText = await page.locator("body").innerText();
  const hasError = bodyText.includes("Something broke") || bodyText.includes("Application error");
  console.log(`Has error boundary text: ${hasError}`);

  const cardCount = await page.locator("article").count();
  console.log(`Article cards count: ${cardCount}`);

  const links = await page.locator("a[href*='/internships/'], a[href*='/gigs/']").count();
  console.log(`Opportunity links count: ${links}`);

  console.log(`Console / Page errors (${errors.length}):`);
  errors.forEach((e) => console.log(`  - ${e}`));

  await browser.close();
}

main().catch(console.error);
