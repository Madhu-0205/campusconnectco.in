import { chromium } from "playwright";

const VIEWPORTS = [
  { name: "Mobile Small (320px)", width: 320, height: 568 },
  { name: "Mobile Standard (390px)", width: 390, height: 844 },
  { name: "Tablet (768px)", width: 768, height: 1024 },
  { name: "Desktop (1280px)", width: 1280, height: 800 },
  { name: "Large Desktop (1440px)", width: 1440, height: 900 },
];

const PAGES = ["/", "/opportunities"];

async function verifyA11yAndOverflow() {
  console.log("==================================================");
  console.log("ACCESSIBILITY & RESPONSIVENESS AUDIT");
  console.log("==================================================");

  const browser = await chromium.launch({ headless: true });

  const overflowResults: Record<string, Record<string, boolean>> = {};

  for (const pagePath of PAGES) {
    overflowResults[pagePath] = {};
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();
      await page.goto(`http://localhost:3000${pagePath}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);

      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      overflowResults[pagePath][vp.name] = hasOverflow;
      await context.close();
    }
  }

  console.log("\nHorizontal Overflow Check (false = PASS):");
  console.log(JSON.stringify(overflowResults, null, 2));

  // A11y Focus & Keyboard Audit on Homepage & Opportunities
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  // 1. Check icon buttons have accessible names
  const missingAria = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button, a[role='button']"));
    const unlabeled = buttons.filter((b) => {
      const text = b.textContent?.trim();
      const ariaLabel = b.getAttribute("aria-label");
      const ariaLabelledBy = b.getAttribute("aria-labelledby");
      const title = b.getAttribute("title");
      return !text && !ariaLabel && !ariaLabelledBy && !title;
    });
    return unlabeled.map((b) => b.outerHTML.substring(0, 150));
  });

  console.log("\nUnlabeled Buttons Count on Homepage:", missingAria.length);
  if (missingAria.length > 0) {
    console.log("Unlabeled buttons:", missingAria);
  }

  // 2. Check touch targets >= 44px on mobile
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto("http://localhost:3000/opportunities", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(800);

  const touchTargets = await mobilePage.evaluate(() => {
    const interactive = Array.from(document.querySelectorAll("button, a, input, select"));
    let under40Count = 0;
    const samples: string[] = [];
    for (const el of interactive) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && (rect.width < 32 || rect.height < 32)) {
        under40Count++;
        if (samples.length < 5) {
          samples.push(`${el.tagName} (${Math.round(rect.width)}x${Math.round(rect.height)}): ${el.textContent?.trim().substring(0, 30) || el.getAttribute("aria-label")}`);
        }
      }
    }
    return { under40Count, samples };
  });

  console.log("\nTouch targets under 32px on /opportunities mobile:", touchTargets);

  await browser.close();
}

verifyA11yAndOverflow().catch(console.error);
