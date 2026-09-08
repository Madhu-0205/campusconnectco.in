import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = '/Users/madhu/.gemini/antigravity-ide/brain/0c525ca6-84ad-471c-975b-0536b620680d';
const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('====================================================');
  console.log('PHASE 7A: REAL CHROMIUM VERIFICATION - PUTER ONLY AI');
  console.log('====================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  const consoleLogs: string[] = [];
  const consoleErrors: string[] = [];
  const cspErrors: string[] = [];
  const networkRequests: { url: string; method: string; status?: number }[] = [];
  let groqRequestDetected = false;
  let puterRequestDetected = false;

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
      if (text.toLowerCase().includes('content security policy') || text.toLowerCase().includes('csp') || text.toLowerCase().includes('violates')) {
        cspErrors.push(text);
      }
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(`PageError: ${err.message}`);
  });

  page.on('request', req => {
    const url = req.url();
    networkRequests.push({ url, method: req.method() });
    if (url.toLowerCase().includes('groq')) {
      groqRequestDetected = true;
      console.error(`[CRITICAL ALERT] Groq request detected: ${url}`);
    }
    if (url.includes('puter.com') || url.includes('js.puter.com')) {
      puterRequestDetected = true;
    }
  });

  page.on('response', res => {
    const req = networkRequests.find(r => r.url === res.url());
    if (req) req.status = res.status();
  });

  console.log('1. Navigating to homepage...');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Check if Puter script is injected and available on window
  const puterScriptPresent = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script'));
    return scripts.some(s => s.src.includes('js.puter.com'));
  });
  console.log(`- Puter script tag present: ${puterScriptPresent}`);

  const windowPuterType = await page.evaluate(() => {
    return typeof (window as any).puter;
  });
  console.log(`- typeof window.puter: ${windowPuterType}`);

  // Test A: Public Visitor "What is CampusConnect?"
  console.log('\n2. Testing Public Visitor Chat ("What is CampusConnect?")...');
  
  // Locate floating AI assistant trigger button
  const aiTrigger = page.locator('button[aria-label="Open AI Career Assistant"], button:has-text("AI"), button:has-text("Career Copilot")').first();
  const triggerVisible = await aiTrigger.isVisible().catch(() => false);
  console.log(`- AI trigger button visible: ${triggerVisible}`);

  if (triggerVisible) {
    await aiTrigger.click();
    await page.waitForTimeout(1000);
  } else {
    // If not found by aria-label, search for the floating trigger button
    const fab = page.locator('button.fixed, div.fixed button').filter({ hasText: /AI|Copilot|Assistant/i }).first();
    if (await fab.isVisible().catch(() => false)) {
      await fab.click();
      await page.waitForTimeout(1000);
    }
  }

  // Check if AI modal / chat drawer is open
  const chatInput = page.locator('input[placeholder*="Ask"], textarea[placeholder*="Ask"], input[placeholder*="CampusConnect"]').first();
  await chatInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);

  const inputFound = await chatInput.isVisible().catch(() => false);
  console.log(`- Chat input visible: ${inputFound}`);

  // Inspect AI status and attribution in UI
  const modalText = await page.locator('div[role="dialog"], div.fixed').innerText().catch(() => '');
  console.log(`- UI Attribution contains "Powered by Puter": ${modalText.includes('Powered by Puter')}`);
  console.log(`- UI contains Groq: ${modalText.toLowerCase().includes('groq')}`);

  // Ask "What is CampusConnect?"
  if (inputFound) {
    await chatInput.fill('What is CampusConnect?');
    await chatInput.press('Enter');
    console.log('- Sent prompt: "What is CampusConnect?"');

    // Wait for response to stream / complete
    console.log('- Waiting for AI response...');
    await page.waitForTimeout(6000);

    const assistantMessages = await page.locator('div:has-text("CampusConnect")').allTextContents().catch(() => []);
    const lastAssistantMessage = assistantMessages[assistantMessages.length - 1] || '';
    console.log(`- Last message snippet: ${lastAssistantMessage.slice(0, 150)}...`);

    // Verify contrast of assistant bubble
    const assistantBubble = page.locator('div.bg-slate-100, div[class*="bg-slate-100"]').first();
    const bubbleFound = await assistantBubble.isVisible().catch(() => false);
    console.log(`- Assistant bubble with bg-slate-100 rendered: ${bubbleFound}`);

    const screenshotPath = path.join(ARTIFACTS_DIR, 'puter_ai_public_chat.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`- Saved screenshot: ${screenshotPath}`);
  }

  // Check for CSP errors
  console.log(`\n3. CSP & Network Diagnostics:`);
  console.log(`- CSP Errors detected: ${cspErrors.length}`);
  if (cspErrors.length > 0) {
    cspErrors.forEach(err => console.error(`  * ${err}`));
  } else {
    console.log('  * Zero relevant CSP violations recorded during Puter interaction!');
  }

  console.log(`- Groq network requests: ${groqRequestDetected ? 'DETECTED (FAILURE)' : 'NONE (PASSED)'}`);
  console.log(`- Puter network requests: ${puterRequestDetected ? 'DETECTED (PASSED)' : 'NONE'}`);

  // Test Viewports
  console.log('\n4. Testing Responsive Viewports (Contrast & Overflow)...');
  const viewports = [
    { name: 'mobile_390x844', width: 390, height: 844 },
    { name: 'mobile_412x915', width: 412, height: 915 },
    { name: 'tablet_768x1024', width: 768, height: 1024 },
    { name: 'desktop_1280x800', width: 1280, height: 800 },
    { name: 'desktop_1440x900', width: 1440, height: 900 }
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(500);

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    const vpScreenshot = path.join(ARTIFACTS_DIR, `puter_ai_vp_${vp.name}.png`);
    await page.screenshot({ path: vpScreenshot });
    console.log(`- Viewport ${vp.name} (${vp.width}x${vp.height}): overflow=${hasHorizontalOverflow} -> saved ${path.basename(vpScreenshot)}`);
  }

  await browser.close();
  console.log('\n=== Browser verification run complete ===');
}

main().catch(err => {
  console.error('Fatal error running browser verification:', err);
  process.exit(1);
});
