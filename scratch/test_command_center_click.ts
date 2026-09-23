import { chromium } from "playwright";

async function testCommandCenter() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  // Click the search button in the navbar
  const searchBtn = page.locator("button[aria-label='Open search command center']");
  console.log("Search button visible:", await searchBtn.isVisible());
  if (await searchBtn.isVisible()) {
    await searchBtn.click();
    await page.waitForTimeout(600);
    const dialog = page.locator("[label='Global Command Menu']");
    console.log("Dialog visible after clicking navbar search button:", await dialog.isVisible());

    const artifactDir = "/Users/madhu/.gemini/antigravity-ide/brain/f5c519a4-0239-47d9-9f67-3df2d93d3a6f";
    await page.screenshot({ path: `${artifactDir}/command_center_dialog_opened.png` });
  }

  await browser.close();
}

testCommandCenter().catch(console.error);
