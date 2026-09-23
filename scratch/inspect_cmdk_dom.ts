import { chromium } from "playwright";

async function inspectDialog() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  // Trigger open-command-center event directly in the page context
  await page.evaluate(() => {
    document.dispatchEvent(new CustomEvent("open-command-center"));
  });
  await page.waitForTimeout(500);

  // Check if cmdk dialog elements are in the DOM
  const cmdkElements = await page.evaluate(() => {
    const dialogs = document.querySelectorAll("[cmdk-dialog], [cmdk-root], [cmdk-input], [cmdk-list]");
    return Array.from(dialogs).map((el) => ({
      tagName: el.tagName,
      attributes: Array.from(el.attributes).map((a) => `${a.name}="${a.value}"`),
      text: el.textContent?.slice(0, 100),
    }));
  });

  console.log("cmdkElements found:", JSON.stringify(cmdkElements, null, 2));

  await browser.close();
}

inspectDialog().catch(console.error);
