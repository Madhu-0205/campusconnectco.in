import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  page.on("console", msg => console.log(`[CONSOLE ${msg.type()}]:`, msg.text()));
  page.on("pageerror", err => console.log("[PAGEERROR]:", err));

  console.log("Navigating to /opportunities ...");
  await page.goto("https://www.campusconnectco.in/opportunities", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // List all buttons
  const buttons = await page.locator("button").allInnerTexts();
  console.log("Found buttons:", buttons.map(b => b.trim()).filter(Boolean));

  // Find Internship button
  const intBtn = page.locator("button", { hasText: /^Internships/ }).first();
  console.log("Internship button count:", await intBtn.count());

  if (await intBtn.count() > 0) {
    console.log("Clicking Internship button...");
    await intBtn.click();
    await page.waitForTimeout(2000);
    console.log("URL after click:", page.url());
  }

  // Check articles count
  const articles = await page.locator("article").count();
  console.log("Articles rendered:", articles);

  await browser.close();
}

main().catch(console.error);
