import { chromium } from "playwright";

interface RouteCheckResult {
  route: string;
  status: number;
  title: string;
  consoleErrors: string[];
  hydrationErrors: string[];
  pageErrors: string[];
  brokenImages: string[];
  horizontalOverflowDesktop: boolean;
  horizontalOverflowMobile: boolean;
  cardCount?: number;
  duplicateCards?: number;
  details?: string;
}

const ROUTES_TO_AUDIT = [
  "/",
  "/opportunities",
  "/opportunities?type=internship",
  "/opportunities?type=gig",
  "/opportunities?category=engineering",
  "/opportunities?category=design",
  "/opportunities?workMode=remote",
  "/auth/founder",
  "/auth/sign-in",
  "/gigs/ebb4c8e2-b089-41b6-b6bd-30bfe3842b75",
  "/internships/bangalore",
  "/internships/dd37e3e0-d930-4884-8c81-221e409b46bc",
];

async function auditRoutes() {
  console.log("==================================================");
  console.log("STARTING FULL BROWSER & ROUTE VERIFICATION");
  console.log("==================================================");

  const browser = await chromium.launch({ headless: true });
  const results: RouteCheckResult[] = [];

  for (const route of ROUTES_TO_AUDIT) {
    const url = `http://localhost:3000${route}`;
    console.log(`\nAuditing route: ${route} ...`);

    const consoleErrors: string[] = [];
    const hydrationErrors: string[] = [];
    const pageErrors: string[] = [];

    // 1. Desktop Audit (1280x800)
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();

    page.on("console", (msg) => {
      const txt = msg.text();
      if (msg.type() === "error") {
        consoleErrors.push(txt);
      }
      if (txt.toLowerCase().includes("hydration") || txt.toLowerCase().includes("did not match")) {
        hydrationErrors.push(txt);
      }
    });

    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });

    let status = 0;
    try {
      const response = await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
      status = response?.status() ?? 0;
    } catch (err: any) {
      console.error(`Failed to load ${url}:`, err.message);
      status = 500;
    }

    const title = await page.title();

    // Check broken images
    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      return imgs
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.src || img.getAttribute("src") || "unknown");
    });

    // Check desktop overflow
    const horizontalOverflowDesktop = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    // Check cards and duplicate cards
    let cardCount = 0;
    let duplicateCards = 0;
    if (route === "/" || route.startsWith("/opportunities")) {
      const cardTitles = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll("article h3, article [data-card-title]"));
        return headings.map((h) => h.textContent?.trim() || "").filter(Boolean);
      });
      cardCount = cardTitles.length;
      const seen = new Set<string>();
      for (const t of cardTitles) {
        if (seen.has(t)) {
          duplicateCards++;
        } else {
          seen.add(t);
        }
      }
    }

    await context.close();

    // 2. Mobile Audit (390x844)
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const mobilePage = await mobileContext.newPage();
    try {
      await mobilePage.goto(url, { waitUntil: "networkidle", timeout: 15000 });
    } catch (e) {}

    const horizontalOverflowMobile = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    await mobileContext.close();

    results.push({
      route,
      status,
      title,
      consoleErrors,
      hydrationErrors,
      pageErrors,
      brokenImages,
      horizontalOverflowDesktop,
      horizontalOverflowMobile,
      cardCount,
      duplicateCards,
    });
  }

  await browser.close();

  console.log("\n==================================================");
  console.log("ROUTE VERIFICATION SUMMARY RESULTS:");
  console.log("==================================================");
  console.log(JSON.stringify(results, null, 2));
}

auditRoutes().catch(console.error);
