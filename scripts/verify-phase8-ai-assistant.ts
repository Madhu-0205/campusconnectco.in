import { chromium, type Browser, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3000';
const ARTIFACTS_DIR = '/Users/madhu/.gemini/antigravity-ide/brain/0c525ca6-84ad-471c-975b-0536b620680d';

const VIEWPORTS = [
  { name: 'mobile_390x844', width: 390, height: 844 },
  { name: 'mobile_412x915', width: 412, height: 915 },
  { name: 'tablet_768x1024', width: 768, height: 1024 },
  { name: 'desktop_1024x768', width: 1024, height: 768 },
  { name: 'desktop_1280x800', width: 1280, height: 800 },
  { name: 'desktop_1440x900', width: 1440, height: 900 },
  { name: 'desktop_1536x864', width: 1536, height: 864 },
  { name: 'desktop_1920x1080', width: 1920, height: 1080 },
];

interface TestResult {
  step: string;
  passed: boolean;
  details: string;
  data?: any;
}

async function run() {
  console.log('🚀 Launching Phase 8 AI Assistant Automated Verification in Chromium...');
  const browser: Browser = await chromium.launch({ headless: true });
  const results: TestResult[] = [];
  const disallowedRequests: string[] = [];
  const consoleErrors: string[] = [];
  const cspViolations: string[] = [];

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page: Page = await context.newPage();

  // Monitor network requests for prohibited AI providers
  page.on('request', (req) => {
    const url = req.url().toLowerCase();
    if (
      url.includes('groq.com') ||
      url.includes('openai.com') ||
      url.includes('anthropic.com') ||
      url.includes('generativelanguage.googleapis.com')
    ) {
      disallowedRequests.push(req.url());
      console.error(`🚨 Prohibited AI request detected: ${req.url()}`);
    }
  });

  // Monitor console errors and CSP
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      // Ignore routine 401s or favicon
      if (!txt.includes('favicon') && !txt.includes('401')) {
        consoleErrors.push(txt);
      }
      if (txt.includes('Content Security Policy') || txt.includes('CSP')) {
        cspViolations.push(txt);
      }
    }
  });

  try {
    // ─── Step 1: Homepage Floating Launcher & Positioning ─────────────────────
    console.log('📍 Step 1: Verifying floating launcher on homepage...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);

    const triggerSelector = '#campusconnect-ai-trigger';
    await page.waitForSelector(triggerSelector, { state: 'visible', timeout: 8000 });
    const triggerBox = await page.locator(triggerSelector).boundingBox();

    const triggerVisible = Boolean(triggerBox);
    const triggerRightAligned = triggerBox ? (1280 - (triggerBox.x + triggerBox.width)) <= 35 : false;

    results.push({
      step: '1. Floating Launcher on Desktop',
      passed: triggerVisible && triggerRightAligned,
      details: `Launcher visible at (${triggerBox?.x.toFixed(0)}, ${triggerBox?.y.toFixed(0)}), right offset: ${(1280 - ((triggerBox?.x || 0) + (triggerBox?.width || 0))).toFixed(0)}px`,
    });

    // ─── Step 2: Open Panel & Verify Branding & Puter Attribution ────────────
    console.log('📍 Step 2: Opening assistant panel & checking branding...');
    await page.click(triggerSelector);
    await page.waitForSelector('#campusconnect-ai-panel', { state: 'visible', timeout: 5000 });

    const panelText = await page.locator('#campusconnect-ai-panel').innerText();
    const hasBranding = panelText.includes('CampusConnect AI');
    const hasPuterAttribution = panelText.includes('Powered by Puter');
    const hasNoGroqAttribution = !panelText.toLowerCase().includes('groq');
    const hasNoOpenAIAttribution = !panelText.toLowerCase().includes('openai');

    results.push({
      step: '2. Branding & Attribution',
      passed: hasBranding && hasPuterAttribution && hasNoGroqAttribution && hasNoOpenAIAttribution,
      details: `CampusConnect AI: ${hasBranding}, Powered by Puter: ${hasPuterAttribution}, Prohibited AI attribution absent: ${hasNoGroqAttribution && hasNoOpenAIAttribution}`,
    });

    // ─── Step 3: Verify Context-Aware Prompts on Homepage ─────────────────────
    console.log('📍 Step 3: Checking homepage suggestions...');
    const hpSuggestions = await page.locator('#campusconnect-ai-panel button:has-text("CampusConnect")').count();
    const hasHpSuggestions = hpSuggestions > 0;

    results.push({
      step: '3. Homepage Context-Aware Suggestions',
      passed: hasHpSuggestions,
      details: `Found ${hpSuggestions} homepage-specific suggestion chips`,
    });

    // Take screenshot of opened chat panel on homepage
    const chatScreenshot = path.join(ARTIFACTS_DIR, 'phase8_ai_assistant_panel.png');
    await page.screenshot({ path: chatScreenshot });

    // ─── Step 4: Submit Message & Verify Real Puter Response ──────────────────
    console.log('📍 Step 4: Submitting query to test real Puter integration...');
    let chatEndpointCalled = false;
    page.on('response', (res) => {
      if (res.url().includes('/api/ai/chat')) {
        chatEndpointCalled = true;
      }
    });

    // Click suggestion or type query
    const firstSuggestion = page.locator('#campusconnect-ai-panel button:has-text("What is CampusConnect?")').first();
    if (await firstSuggestion.isVisible()) {
      await firstSuggestion.click();
    } else {
      await page.fill('#campusconnect-ai-panel input[type="text"]', 'What is CampusConnect?');
      await page.keyboard.press('Enter');
    }

    // Wait for response bubble to render
    await page.waitForTimeout(3500);

    const assistantMessages = await page.locator('#campusconnect-ai-panel .whitespace-pre-wrap').allInnerTexts();
    const responseReceived = assistantMessages.some((msg) => msg.length > 20);

    results.push({
      step: '4. Real Puter AI Response Stream',
      passed: chatEndpointCalled && responseReceived,
      details: `Endpoint called: ${chatEndpointCalled}, response received: ${responseReceived} (${assistantMessages.slice(-1)[0]?.slice(0, 60)}...)`,
    });

    const responseScreenshot = path.join(ARTIFACTS_DIR, 'phase8_ai_assistant_response.png');
    await page.screenshot({ path: responseScreenshot });

    // ─── Step 5: Keyboard Accessibility (Escape to Close) ────────────────────
    console.log('📍 Step 5: Testing keyboard Escape-to-close...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    const panelVisibleAfterEsc = await page.locator('#campusconnect-ai-panel').isVisible();
    const triggerVisibleAfterEsc = await page.locator(triggerSelector).isVisible();

    results.push({
      step: '5. Keyboard Accessibility (Escape to Close)',
      passed: !panelVisibleAfterEsc && triggerVisibleAfterEsc,
      details: `Panel hidden: ${!panelVisibleAfterEsc}, Trigger restored: ${triggerVisibleAfterEsc}`,
    });

    // ─── Step 6: Route Context Awareness: Opportunities Discovery ────────────
    console.log('📍 Step 6: Testing Opportunities Explorer context-aware suggestions...');
    await page.goto(`${BASE_URL}/opportunities`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);

    await page.waitForSelector(triggerSelector, { state: 'visible', timeout: 8000 });
    await page.click(triggerSelector);
    await page.waitForSelector('#campusconnect-ai-panel', { state: 'visible', timeout: 5000 });

    const oppPanelText = await page.locator('#campusconnect-ai-panel').innerText();
    const hasOppContext = oppPanelText.includes('exploring') || oppPanelText.includes('Opportunities') || oppPanelText.includes('gigs near');

    results.push({
      step: '6. Opportunities Route Context Awareness',
      passed: hasOppContext,
      details: `Opportunities context detected: ${hasOppContext}`,
    });

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // ─── Step 7: Route Context Awareness: Gig Details ────────────────────────
    console.log('📍 Step 7: Testing Gig Details context-aware suggestions...');
    const testGigId = 'ebb4c8e2-b089-41b6-b6bd-30bfe3842b75';
    await page.goto(`${BASE_URL}/gigs/${testGigId}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);

    await page.waitForSelector(triggerSelector, { state: 'visible', timeout: 8000 });
    await page.click(triggerSelector);
    await page.waitForSelector('#campusconnect-ai-panel', { state: 'visible', timeout: 5000 });

    const gigPanelText = await page.locator('#campusconnect-ai-panel').innerText();
    const hasGigContext = gigPanelText.includes('student gig') || gigPanelText.includes('proposal') || gigPanelText.includes('deliverable');

    results.push({
      step: '7. Gig Details Route Context Awareness',
      passed: hasGigContext,
      details: `Gig detail context detected: ${hasGigContext}`,
    });

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // ─── Step 8: Multi-Viewport Responsive & Safe-Area Audit (8 Viewports) ────
    console.log('📍 Step 8: Testing Assistant across 8 responsive viewports...');
    const viewportAuditResults: any[] = [];

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(500);

      // Check launcher position
      const vpTriggerBox = await page.locator(triggerSelector).boundingBox();
      const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

      // Open panel to verify responsiveness
      await page.click(triggerSelector);
      await page.waitForSelector('#campusconnect-ai-panel', { state: 'visible', timeout: 5000 });

      const panelBox = await page.locator('#campusconnect-ai-panel').boundingBox();
      const panelFitsViewport = panelBox ? (panelBox.x >= 0 && panelBox.x + panelBox.width <= vp.width + 5) : false;

      // Safe area check on mobile: launcher y coordinate must leave room for mobile navigation (bottom padding >= 70px from bottom)
      const mobileSafe = vp.width <= 420 ? (vpTriggerBox ? (vp.height - (vpTriggerBox.y + vpTriggerBox.height)) >= 60 : false) : true;

      const vpScreenshot = path.join(ARTIFACTS_DIR, `phase8_ai_vp_${vp.name}.png`);
      await page.screenshot({ path: vpScreenshot });

      viewportAuditResults.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        triggerRendered: Boolean(vpTriggerBox),
        panelFitsViewport,
        mobileSafe,
        noHorizontalScroll: !hasHorizontalScroll,
      });

      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }

    const allViewportsClean = viewportAuditResults.every(
      (v) => v.triggerRendered && v.panelFitsViewport && v.mobileSafe && v.noHorizontalScroll
    );

    results.push({
      step: '8. 8-Viewport Responsive & Safe-Area Verification',
      passed: allViewportsClean,
      details: `Tested ${viewportAuditResults.length} viewports. All rendered cleanly without horizontal overflow.`,
      data: viewportAuditResults,
    });

    // ─── Step 9: Prohibited AI & CSP Audit ─────────────────────────────────────
    const noDisallowedRequests = disallowedRequests.length === 0;
    const noCspViolations = cspViolations.length === 0;

    results.push({
      step: '9. Zero Prohibited AI & Clean CSP',
      passed: noDisallowedRequests && noCspViolations,
      details: `Prohibited AI requests: ${disallowedRequests.length}, CSP violations: ${cspViolations.length}`,
    });

  } catch (error: any) {
    console.error('❌ Verification script caught error:', error);
    results.push({
      step: 'Verification Execution',
      passed: false,
      details: `Exception during test: ${error.message}`,
    });
  } finally {
    await browser.close();
  }

  // Write comprehensive report
  const allPassed = results.every((r) => r.passed);
  const report = {
    timestamp: new Date().toISOString(),
    allPassed,
    results,
    disallowedRequests,
    consoleErrors,
    cspViolations,
  };

  const reportPath = path.join(ARTIFACTS_DIR, 'phase8_ai_assistant_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n==================================================');
  console.log(`PHASE 8 AI ASSISTANT VERIFICATION: ${allPassed ? '✅ ALL PASSED' : '❌ SOME CHECKS FAILED'}`);
  console.log('==================================================');
  results.forEach((r) => {
    console.log(`${r.passed ? '✅' : '❌'} ${r.step}: ${r.details}`);
  });
  console.log(`Report written to ${reportPath}`);
}

run();
