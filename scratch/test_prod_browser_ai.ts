import { chromium } from "playwright";

async function main() {
  console.log("==================================================");
  console.log("PRODUCTION REAL BROWSER TEST (Chromium + Live UI)");
  console.log("Target: https://www.campusconnectco.in");
  console.log("==================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  const networkUrls: string[] = [];
  let sseStatus = 0;
  let sseContentType = "";
  let sseHeaders: Record<string, string> = {};

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
      console.log(`[Browser Console Error]: ${msg.text()}`);
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(err.message);
    console.log(`[Browser Page Error]: ${err.message}`);
  });

  page.on("request", (req) => {
    networkUrls.push(req.url());
  });

  page.on("response", (res) => {
    if (res.url().includes("/api/ai/chat")) {
      sseStatus = res.status();
      sseContentType = res.headers()["content-type"] || "";
      sseHeaders = res.headers();
      console.log(`[Network Response] /api/ai/chat HTTP ${sseStatus} (${sseContentType})`);
      console.log(`[x-vercel-id]: ${sseHeaders["x-vercel-id"] || "none"}`);
    }
  });

  console.log("1. Navigating to https://www.campusconnectco.in...");
  const navResponse = await page.goto("https://www.campusconnectco.in", { waitUntil: "networkidle", timeout: 45000 });
  console.log(`Navigation status: ${navResponse?.status()}`);

  // 2. Open AI assistant
  console.log("2. Locating AI assistant trigger button...");
  const trigger = page.locator("#campusconnect-ai-trigger, button[aria-label*='CampusConnectCo AI']").first();
  await trigger.waitFor({ state: "visible", timeout: 15000 });
  await trigger.click();
  console.log("AI assistant opened.");

  // 3. Locate chat input
  const input = page.locator("input[placeholder*='Ask CampusConnectCo AI'], textarea[placeholder*='Ask CampusConnectCo AI'], #campusconnect-ai-panel input").last();
  await input.waitFor({ state: "visible", timeout: 10000 });

  const prompt = "What is CampusConnectCo?";
  console.log(`3. Typing prompt: "${prompt}"...`);
  await input.fill(prompt);

  const sendBtn = page.locator("button:has(.lucide-send), button[aria-label*='Send'], button:has-text('Send')").first();
  if (await sendBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log("Clicking Send button...");
    await sendBtn.click();
  } else {
    console.log("Pressing Enter to send...");
    await input.press("Enter");
  }

  // 4. Track incremental rendering in DOM
  console.log("4. Observing incremental DOM text rendering...");
  let lastLength = 0;
  let finalRenderedText = "";
  let increments = 0;
  const startTime = Date.now();

  const assistantBubble = page.locator("#campusconnect-ai-panel .whitespace-pre-wrap").last();

  while (Date.now() - startTime < 40000) {
    const text = await assistantBubble.innerText().catch(() => "");
    if (text.length > lastLength && !text.includes("Hi! I'm your CampusConnectCo AI assistant")) {
      increments++;
      lastLength = text.length;
      finalRenderedText = text;
      console.log(`   [Render Update #${increments}] ${text.length} chars rendered in DOM`);
    }

    // Stop waiting if we have received significant output and no changes for 3 seconds
    if (increments >= 3 && Date.now() - startTime > 7000) {
      await page.waitForTimeout(3000);
      const latestText = await assistantBubble.innerText().catch(() => "");
      if (latestText.length === lastLength) {
        finalRenderedText = latestText;
        break;
      }
    }
    await page.waitForTimeout(200);
  }

  console.log("\n--- Visible Rendered Text in Production UI ---");
  console.log(finalRenderedText);
  console.log("----------------------------------------------\n");

  // Save screenshot
  await page.screenshot({ path: "scratch/prod_browser_ai_verified.png" });
  console.log("Saved screenshot: scratch/prod_browser_ai_verified.png");

  // Audit results
  const isFallback =
    finalRenderedText.includes("AI assistance is temporarily unavailable") ||
    finalRenderedText.includes("Live Puter AI response is temporarily unavailable");

  const hasPuterScript = networkUrls.some((u) => u.includes("js.puter.com") || u.includes("api.puter.com"));
  const hasGroqExposed = finalRenderedText.includes("gsk_") || networkUrls.some((u) => u.includes("gsk_"));

  console.log("\n=== Production Audit Results ===");
  console.log(`- SSE Status: ${sseStatus} (${sseContentType})`);
  console.log(`- Serverless Region Header: ${sseHeaders["x-vercel-id"] || "N/A"}`);
  console.log(`- Increments observed in DOM: ${increments}`);
  console.log(`- Final text length: ${finalRenderedText.length} chars`);
  console.log(`- Fallback message present: ${isFallback}`);
  console.log(`- Puter scripts requested: ${hasPuterScript}`);
  console.log(`- GROQ_API_KEY exposed in client: ${hasGroqExposed}`);
  console.log(`- Console errors: ${consoleErrors.length}`);

  const hasMaxDepth = consoleErrors.some((e) => e.includes("Maximum update depth"));
  const hasHydration = consoleErrors.some((e) => e.includes("Hydration"));
  const hasPrismaClosed = consoleErrors.some((e) => e.includes("PrismaClientClosedError") || e.includes("Closed"));

  console.log(`- Maximum update depth: ${hasMaxDepth ? "DETECTED (FAIL)" : "CLEAN (PASS)"}`);
  console.log(`- Hydration errors: ${hasHydration ? "DETECTED (FAIL)" : "CLEAN (PASS)"}`);
  console.log(`- Prisma closed errors: ${hasPrismaClosed ? "DETECTED (FAIL)" : "CLEAN (PASS)"}`);

  await browser.close();

  if (sseStatus !== 200 || !sseContentType.includes("text/event-stream")) {
    console.error("FAIL: Production SSE endpoint did not return HTTP 200 text/event-stream");
    process.exit(1);
  }

  if (isFallback) {
    console.error("FAIL: Browser rendered fallback message instead of live Groq AI!");
    process.exit(1);
  }

  if (increments < 2 || finalRenderedText.length < 50) {
    console.error("FAIL: Insufficient incremental rendering in DOM.");
    process.exit(1);
  }

  if (hasGroqExposed) {
    console.error("FAIL: Secret exposed!");
    process.exit(1);
  }

  console.log("\n✅ PRODUCTION BROWSER TEST (LIVE GROQ AI) 100% VERIFIED!");
}

main().catch((err) => {
  console.error("Production browser verification crashed:", err);
  process.exit(1);
});
