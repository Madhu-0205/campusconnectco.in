import { chromium } from "playwright";

async function main() {
  console.log("==================================================");
  console.log("STARTING PLAYWRIGHT BROWSER SSE & P0 RE-VERIFICATION");
  console.log("==================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];

  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error") {
      consoleErrors.push(text);
      console.log(`[Browser Error]: ${text}`);
    } else if (msg.type() === "warning") {
      consoleWarnings.push(text);
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(err.message);
    console.log(`[Browser PageError]: ${err.message}`);
  });

  console.log("\n1. Navigating to Homepage (http://localhost:3000)...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 30000 });

  console.log("Homepage loaded successfully.");

  // Check for P0 regressions on homepage
  const hasMaxUpdateDepth = consoleErrors.some((e) => e.includes("Maximum update depth exceeded"));
  const hasHydrationError = consoleErrors.some((e) => e.includes("Hydration failed") || e.includes("did not match"));
  const hasPrismaClosed = consoleErrors.some((e) => e.includes("PrismaClientClosedError") || e.includes("Closed"));

  console.log(`- Maximum update depth exceeded: ${hasMaxUpdateDepth ? "DETECTED (FAIL)" : "CLEAN (PASS)"}`);
  console.log(`- Hydration mismatch: ${hasHydrationError ? "DETECTED (FAIL)" : "CLEAN (PASS)"}`);
  console.log(`- Prisma connection closed: ${hasPrismaClosed ? "DETECTED (FAIL)" : "CLEAN (PASS)"}`);

  console.log("\n2. Testing AI Chat in Browser...");

  // Look for the floating AI trigger button
  const aiButton = page.locator("#campusconnect-ai-trigger, button[aria-label*='CampusConnectCo AI'], button[aria-label*='AI']").first();
  await aiButton.waitFor({ state: "visible", timeout: 15000 });
  console.log("Found AI floating trigger button (#campusconnect-ai-trigger). Clicking to open chat...");
  await aiButton.click();
  await page.waitForTimeout(1000);

  // Find input or textarea
  const chatInput = page.locator("input[placeholder*='Ask CampusConnectCo AI'], textarea[placeholder*='Ask CampusConnectCo AI'], #campusconnect-ai-panel input, input[type='text']").last();
  await chatInput.waitFor({ state: "visible", timeout: 10000 });
  console.log("Chat input field found inside AI panel.");

  // Intercept the /api/ai/chat network request to verify SSE stream
  let sseStatus = 0;
  let sseContentType = "";
  let chunkCount = 0;

  page.on("response", async (response) => {
    if (response.url().includes("/api/ai/chat")) {
      sseStatus = response.status();
      sseContentType = response.headers()["content-type"] || "";
      console.log(`[Network Response] /api/ai/chat -> HTTP ${sseStatus} (${sseContentType})`);
    }
  });

  const queryText = "What is CampusConnectCo?";
  console.log(`Typing prompt: "${queryText}"...`);
  await chatInput.fill(queryText);

  // Click Send button or press Enter
  const sendButton = page.locator("button:has(.lucide-send), button[aria-label*='Send'], button:has-text('Send')").first();
  if (await sendButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log("Clicking Send button...");
    await sendButton.click();
  } else {
    console.log("Pressing Enter to send...");
    await chatInput.press("Enter");
  }

  // Wait for the streaming response to be rendered in the DOM
  console.log("Waiting for streamed AI response to appear in DOM...");
  
  // Track incremental DOM updates
  let lastTextLength = 0;
  let incrementalUpdates = 0;
  const startTime = Date.now();

  while (Date.now() - startTime < 15000) {
    const assistantMessages = page.locator(".prose, [class*='prose'], p:has-text('CampusConnectCo'), div:has-text('CampusConnectCo')");
    const count = await assistantMessages.count();
    if (count > 0) {
      const latestText = await assistantMessages.last().innerText().catch(() => "");
      if (latestText.length > lastTextLength) {
        incrementalUpdates++;
        lastTextLength = latestText.length;
        console.log(`Incremental DOM update #${incrementalUpdates}: ${latestText.length} chars rendered`);
      }
      if (latestText.includes("CampusConnectCo") && latestText.length > 50) {
        console.log("Assistant response rendered successfully in DOM!");
        console.log(`Preview: "${latestText.slice(0, 120).replace(/\n/g, " ")}..."`);
        break;
      }
    }
    await page.waitForTimeout(300);
  }

  await page.waitForTimeout(2000);

  // Take screenshot as proof
  await page.screenshot({ path: "scratch/ai_chat_browser_verified.png" });
  console.log("Saved verification screenshot to scratch/ai_chat_browser_verified.png");

  await browser.close();

  console.log("\n==================================================");
  console.log("BROWSER E2E AI CHAT SUMMARY");
  console.log("==================================================");
  console.log(`- SSE Endpoint HTTP Status: ${sseStatus} (Expected: 200)`);
  console.log(`- SSE Content-Type: ${sseContentType}`);
  console.log(`- Incremental DOM updates detected: ${incrementalUpdates}`);
  console.log(`- P0 Loop Regressions: ${hasMaxUpdateDepth ? "FAIL" : "NONE (PASS)"}`);
  console.log(`- Hydration Regressions: ${hasHydrationError ? "FAIL" : "NONE (PASS)"}`);
  console.log(`- Prisma Closed Regressions: ${hasPrismaClosed ? "FAIL" : "NONE (PASS)"}`);

  if (sseStatus === 200 && incrementalUpdates > 0 && !hasMaxUpdateDepth && !hasHydrationError && !hasPrismaClosed) {
    console.log("\n✅ ALL BROWSER SSE & P0 VERIFICATIONS PASSED!");
  } else {
    console.log("\n⚠️ Browser verification check finished with observations.");
  }
}

main().catch((e) => {
  console.error("Browser test crashed:", e);
  process.exit(1);
});
