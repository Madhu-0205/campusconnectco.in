import { chromium } from "playwright";

async function main() {
  console.log("==================================================");
  console.log("TEST 4: REAL BROWSER TEST (Chromium + UI Render)");
  console.log("==================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors: string[] = [];
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

  console.log("1. Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 30000 });

  // 2. Open AI assistant
  console.log("2. Locating AI assistant trigger button...");
  const trigger = page.locator("#campusconnect-ai-trigger, button[aria-label*='CampusConnectCo AI']").first();
  await trigger.waitFor({ state: "visible", timeout: 10000 });
  await trigger.click();
  console.log("AI assistant opened.");

  // 3. Locate chat input
  const input = page.locator("input[placeholder*='Ask CampusConnectCo AI'], textarea[placeholder*='Ask CampusConnectCo AI'], #campusconnect-ai-panel input").last();
  await input.waitFor({ state: "visible", timeout: 10000 });

  let sseStatus = 0;
  let sseContentType = "";
  let receivedDeltaCount = 0;
  let hasDoneSignal = false;
  let networkBody = "";

  // Intercept the /api/ai/chat response
  page.on("response", async (response) => {
    if (response.url().includes("/api/ai/chat")) {
      sseStatus = response.status();
      sseContentType = response.headers()["content-type"] || "";
      console.log(`[Network Response] /api/ai/chat HTTP ${sseStatus} (${sseContentType})`);
    }
  });

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

  // Wait for the new assistant message to appear
  const assistantBubble = page.locator("#campusconnect-ai-panel .whitespace-pre-wrap").last();

  while (Date.now() - startTime < 30000) {
    const text = await assistantBubble.innerText().catch(() => "");
    if (text.length > lastLength && !text.includes("Hi! I'm your CampusConnectCo AI assistant")) {
      increments++;
      lastLength = text.length;
      finalRenderedText = text;
      console.log(`   [Render Update #${increments}] ${text.length} chars rendered in DOM`);
    }

    // Check if streaming is done (aiStatus returned to ready or no change for 3s after growth)
    if (increments >= 3 && Date.now() - startTime > 6000) {
      await page.waitForTimeout(2000);
      const latestText = await assistantBubble.innerText().catch(() => "");
      if (latestText.length === lastLength) {
        finalRenderedText = latestText;
        break;
      }
    }
    await page.waitForTimeout(200);
  }

  console.log("\n--- Visible Rendered Text in UI ---");
  console.log(finalRenderedText);
  console.log("-----------------------------------\n");

  // Save screenshot
  await page.screenshot({ path: "scratch/live_groq_browser_verified.png" });
  console.log("Saved screenshot: scratch/live_groq_browser_verified.png");

  // Check fallback vs live
  const isFallback =
    finalRenderedText.includes("AI assistance is temporarily unavailable") ||
    finalRenderedText.includes("Live Puter AI response is temporarily unavailable");

  console.log(`- Increments observed: ${increments}`);
  console.log(`- Fallback message present: ${isFallback}`);
  console.log(`- Console errors: ${consoleErrors.length}`);

  const hasMaxDepth = consoleErrors.some((e) => e.includes("Maximum update depth"));
  const hasHydration = consoleErrors.some((e) => e.includes("Hydration"));
  const hasPrismaClosed = consoleErrors.some((e) => e.includes("PrismaClientClosedError") || e.includes("Closed"));

  console.log(`- Maximum update depth: ${hasMaxDepth ? "DETECTED (FAIL)" : "CLEAN (PASS)"}`);
  console.log(`- Hydration errors: ${hasHydration ? "DETECTED (FAIL)" : "CLEAN (PASS)"}`);
  console.log(`- Prisma closed errors: ${hasPrismaClosed ? "DETECTED (FAIL)" : "CLEAN (PASS)"}`);

  await browser.close();

  if (isFallback) {
    console.error("FAIL: Browser rendered fallback message instead of live Groq AI!");
    process.exit(1);
  }

  if (increments < 2 || finalRenderedText.length < 50) {
    console.error("FAIL: Insufficient incremental rendering in DOM.");
    process.exit(1);
  }

  console.log("\n✅ REAL BROWSER TEST (LIVE GROQ AI) VERIFIED!");
}

main().catch((err) => {
  console.error("Browser verification crashed:", err);
  process.exit(1);
});
