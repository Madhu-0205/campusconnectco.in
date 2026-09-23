import { chromium } from "playwright";

interface RouteResult {
  route: string;
  status: number | null;
  durationMs: number;
  consoleErrors: string[];
  hydrationErrors: string[];
  prismaClosedErrors: string[];
  renderLoopErrors: string[];
  pass: boolean;
  notes: string;
}

async function runProductionComprehensiveSmoke() {
  console.log("==================================================");
  console.log("STARTING LIVE PRODUCTION DEPLOYMENT SMOKE TEST");
  console.log("Target: https://www.campusconnectco.in/");
  console.log("==================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const routes = [
    "/",
    "/opportunities",
    "/opportunities?type=internship",
    "/opportunities?type=gig",
    "/internships/bangalore",
    "/browse-gigs",
  ];

  const results: RouteResult[] = [];

  for (const route of routes) {
    const page = await context.newPage();
    const consoleErrors: string[] = [];
    const hydrationErrors: string[] = [];
    const prismaClosedErrors: string[] = [];
    const renderLoopErrors: string[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      if (msg.type() === "error") {
        if (text.includes("favicon") || text.includes("google-analytics") || text.includes("basemaps.cartocdn")) {
          return;
        }
        consoleErrors.push(text);
        if (text.includes("Hydration failed") || text.includes("hydration")) {
          hydrationErrors.push(text);
        }
        if (text.includes("Maximum update depth exceeded") || text.includes("Too many re-renders")) {
          renderLoopErrors.push(text);
        }
        if (text.includes("Closed") || text.includes("P2024") || text.includes("Can't reach database server")) {
          prismaClosedErrors.push(text);
        }
      }
    });

    page.on("pageerror", (err) => {
      const text = err.message;
      consoleErrors.push(text);
      if (text.includes("Hydration failed") || text.includes("hydration")) {
        hydrationErrors.push(text);
      }
      if (text.includes("Maximum update depth exceeded") || text.includes("Too many re-renders")) {
        renderLoopErrors.push(text);
      }
      if (text.includes("Closed") || text.includes("P2024") || text.includes("Can't reach database server")) {
        prismaClosedErrors.push(text);
      }
    });

    console.log(`\nTesting Route: ${route}...`);
    const start = Date.now();
    let status: number | null = null;
    let notes = "";

    try {
      const resp = await page.goto(`https://www.campusconnectco.in${route}`, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });
      status = resp?.status() ?? null;
      const durationMs = Date.now() - start;

      // Allow page to settle and hydrate
      await page.waitForTimeout(4000);

      // Route-specific assertions
      if (route.startsWith("/opportunities")) {
        const cardCount = await page.locator("article").count();
        notes = `${cardCount} cards rendered`;
      } else if (route === "/") {
        const heroTitle = await page.locator("h1").first().innerText().catch(() => "");
        notes = `Hero: "${heroTitle.slice(0, 30)}..."`;
      } else {
        notes = `Page rendered OK`;
      }

      const pass =
        status === 200 &&
        hydrationErrors.length === 0 &&
        renderLoopErrors.length === 0 &&
        prismaClosedErrors.length === 0;

      results.push({
        route,
        status,
        durationMs,
        consoleErrors,
        hydrationErrors,
        prismaClosedErrors,
        renderLoopErrors,
        pass,
        notes,
      });

      console.log(`  Status: ${status} in ${durationMs}ms | ${notes}`);
      console.log(`  Errors: Hydration: ${hydrationErrors.length}, Loop: ${renderLoopErrors.length}, DB: ${prismaClosedErrors.length}`);
    } catch (err: any) {
      const durationMs = Date.now() - start;
      console.error(`  Failed on ${route}:`, err.message);
      results.push({
        route,
        status: status || 0,
        durationMs,
        consoleErrors: [...consoleErrors, err.message],
        hydrationErrors,
        prismaClosedErrors,
        renderLoopErrors,
        pass: false,
        notes: `Navigation error: ${err.message}`,
      });
    } finally {
      await page.close();
    }
  }

  // Test Command Center on live production
  console.log("\nTesting Command Center on live production...");
  const cmdPage = await context.newPage();
  let cmdkPass = false;
  let cmdkNotes = "";
  try {
    await cmdPage.goto("https://www.campusconnectco.in/", { waitUntil: "domcontentloaded", timeout: 45000 });
    await cmdPage.waitForTimeout(3000);
    await cmdPage.evaluate(() => {
      document.dispatchEvent(new CustomEvent("open-command-center"));
    });
    await cmdPage.waitForTimeout(800);
    const cmdkInput = cmdPage.locator("[cmdk-input]").first();
    const isVisible = await cmdkInput.isVisible();
    if (isVisible) {
      await cmdkInput.focus();
      await cmdPage.keyboard.press("Escape");
      await cmdPage.waitForTimeout(600);
      const isClosed = (await cmdPage.locator("[cmdk-input]").count()) === 0;
      cmdkPass = isVisible && isClosed;
      cmdkNotes = `Opened: ${isVisible}, Closed: ${isClosed}`;
    } else {
      cmdkNotes = "Modal did not open on open-command-center event";
    }
  } catch (err: any) {
    cmdkNotes = `Error: ${err.message}`;
  } finally {
    await cmdPage.close();
  }

  console.log(`Command Center Test: ${cmdkPass ? "PASS" : "FAIL"} (${cmdkNotes})`);

  // Test Live AI endpoint on live production
  console.log("\nTesting Live AI /api/ai/chat on production...");
  let aiStatus = 0;
  let aiResponseText = "";
  try {
    const aiRes = await fetch("https://www.campusconnectco.in/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        context: { mode: "general" },
      }),
    });
    aiStatus = aiRes.status;
    const reader = aiRes.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        if (chunk.value) {
          aiResponseText += decoder.decode(chunk.value);
        }
      }
    }
  } catch (err: any) {
    aiResponseText = `Fetch error: ${err.message}`;
  }

  console.log(`Live AI HTTP Status: ${aiStatus}`);
  console.log(`Live AI Response (preview): ${aiResponseText.slice(0, 150).replace(/\n/g, " ")}...`);

  await browser.close();

  console.log("\n==================================================");
  console.log("LIVE PRODUCTION SMOKE TEST SUMMARY TABLE:");
  console.log("==================================================");
  console.table(
    results.map((r) => ({
      Route: r.route,
      Status: r.status,
      Duration: `${r.durationMs}ms`,
      Pass: r.pass ? "YES" : "NO",
      Notes: r.notes,
      Errors: r.consoleErrors.length,
    }))
  );

  return { results, cmdkPass, cmdkNotes, aiStatus, aiResponseText };
}

runProductionComprehensiveSmoke()
  .then(() => {
    console.log("\nProduction smoke testing completed.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Runner crashed:", err);
    process.exit(1);
  });
