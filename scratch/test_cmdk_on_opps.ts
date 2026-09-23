import { chromium } from "playwright";

async function testOnOpportunities() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  await page.goto("http://localhost:3000/opportunities", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Check if CommandCenter is in the DOM
  const hasCommandCenter = await page.evaluate(() => {
    return document.querySelector("[cmdk-input], [cmdk-dialog], [cmdk-root]") !== null;
  });
  console.log("Has CommandCenter before open:", hasCommandCenter);

  // Dispatch open event
  await page.evaluate(() => {
    document.dispatchEvent(new CustomEvent("open-command-center"));
  });
  await page.waitForTimeout(600);

  const hasDialogAfter = await page.evaluate(() => {
    const d = document.querySelector("[cmdk-dialog]");
    return d !== null && window.getComputedStyle(d).display !== "none";
  });
  console.log("Has visible cmdk-dialog after event:", hasDialogAfter);

  await browser.close();
}

testOnOpportunities().catch(console.error);
