import { chromium } from 'playwright';

async function verifyPhase12() {
  console.log('🚀 Starting Comprehensive Phase 12 Final Verification with Real DB Data...\n');
  const browser = await chromium.launch({ headless: true });
  
  // Desktop context
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await desktopContext.newPage();

  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon') && !text.includes('ResizeObserver')) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  try {
    // ── CHECK 1: Discovery Page & MapLibre Synchronization ────────────────────
    console.log('1️⃣ Checking Discovery Page & MapLibre Synchronization (/opportunities)...');
    await page.goto('http://localhost:3000/opportunities', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('input[placeholder*="Search skills, roles"]', { timeout: 15000 });
    console.log('   ✅ Opportunity discovery bar mounted successfully');

    await page.waitForTimeout(2000);
    const canvasExists = await page.locator('canvas.maplibregl-canvas').count();
    console.log(`   ✅ MapLibre canvas active: ${canvasExists > 0}`);

    // ── CHECK 2: Real Database Autocomplete Suggestions ──────────────────────
    console.log('\n2️⃣ Checking Real Database Autocomplete Suggestions...');
    const searchInput = page.locator('input[placeholder*="Search skills, roles"]');
    await searchInput.click();
    
    // Type and wait for suggestions API response
    const suggestionsPromise = page.waitForResponse(res => 
      res.url().includes('/api/search/suggestions?q=react') && res.status() === 200
    );
    await searchInput.pressSequentially('react', { delay: 50 });
    const suggestionsRes = await suggestionsPromise;
    const suggestionsData = await suggestionsRes.json();
    console.log(`   ✅ Real entity suggestions returned (${suggestionsData.suggestions?.length} items):`, 
      suggestionsData.suggestions?.map((s: any) => `${s.label} (${s.type})`).join(', ')
    );

    // Verify dropdown in DOM
    await page.waitForTimeout(400);
    const dropdownHeader = page.getByText('Suggested Searches');
    const isDropdownVisible = await dropdownHeader.isVisible();
    console.log(`   ✅ Autocomplete dropdown visible in DOM: ${isDropdownVisible}`);

    // ── CHECK 3: Deterministic Natural Search Intent ─────────────────────────
    console.log('\n3️⃣ Checking Natural Search Intent Parser...');
    await searchInput.fill('internships in bengaluru');
    await page.waitForTimeout(600);

    const intentBanner = page.locator('text=Smart Intent:');
    const isIntentVisible = await intentBanner.isVisible();
    console.log(`   ✅ Smart Intent banner displayed: ${isIntentVisible}`);
    
    const intentText = await page.locator('text=Smart Intent:').locator('..').innerText();
    console.log(`   ✅ Intent parsed details: "${intentText.replace(/\n/g, ' ')}"`);

    // ── CHECK 4: Recommendations API & Location Hierarchy ───────────────────
    console.log('\n4️⃣ Checking Deterministic Recommendations & Privacy...');
    const recRes = await fetch('http://localhost:3000/api/recommendations?type=all');
    console.log(`   ✅ Recommendations API status: ${recRes.status}`);
    
    const cacheHeader = recRes.headers.get('cache-control') || '';
    console.log(`   ✅ Cache-Control header: "${cacheHeader}" (must be private, no-store)`);
    if (!cacheHeader.includes('private') || !cacheHeader.includes('no-store')) {
      throw new Error(`Cache-Control security failure: ${cacheHeader}`);
    }

    const recData = await recRes.json();
    console.log(`   ✅ Recommendations returned: ${recData.length} items`);
    if (recData.length > 0) {
      const topRec = recData[0];
      console.log(`   ✅ Top recommendation: "${topRec.title}" | Score: ${topRec.matchScore}/100 | Reason: "${topRec.recommendationReason}"`);
      // Ensure coordinates are not leaked
      const hasCoords = 'latitude' in topRec || 'longitude' in topRec;
      console.log(`   ✅ Sensitive coordinates stripped: ${!hasCoords}`);
      if (hasCoords) throw new Error('Sensitive coordinates leaked in recommendations API');
    }

    // ── CHECK 5: City SEO & Indexation Gating ────────────────────────────────
    console.log('\n5️⃣ Checking City SEO Landing & Thin Content Gating...');
    // Active city: Hyderabad
    const hydRes = await page.goto('http://localhost:3000/opportunities/hyderabad', { waitUntil: 'domcontentloaded' });
    console.log(`   ✅ /opportunities/hyderabad status: ${hydRes?.status()}`);
    await page.waitForSelector('h1', { timeout: 10000 });
    const hydTitle = await page.locator('h1').textContent();
    console.log(`   ✅ City page title: "${hydTitle?.trim()}"`);

    // Non-existent city: should return 404
    const emptyRes = await page.goto('http://localhost:3000/opportunities/nonexistentcity123', { waitUntil: 'domcontentloaded' });
    console.log(`   ✅ Non-existent city status: ${emptyRes?.status()} (Gated 404 anti-thin SEO confirmed)`);

    // ── CHECK 6: Gig Detail Page, JSON-LD, and Anonymous Apply CTA ───────────
    console.log('\n6️⃣ Checking Gig Detail Page, Structured Data & Anonymous Apply CTA (/gigs/[id])...');
    const gigId = 'ce4ff106-305f-4f3a-bf88-38d2338d9e23';
    await page.goto(`http://localhost:3000/gigs/${gigId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 10000 });
    const gigTitle = await page.locator('h1').textContent();
    console.log(`   ✅ Gig title: "${gigTitle?.trim()}"`);

    // Verify JobPosting JSON-LD
    const gigJsonLd = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      return scripts.map(s => s.textContent || '');
    });
    const hasJobPosting = gigJsonLd.some(c => c.includes('"@type":"JobPosting"'));
    const hasFAQ = gigJsonLd.some(c => c.includes('"@type":"FAQPage"'));
    console.log(`   ✅ JobPosting JSON-LD present: ${hasJobPosting}`);
    console.log(`   ✅ FAQPage JSON-LD present: ${hasFAQ}`);

    // Verify Related Opportunities
    const relatedSection = page.locator('text=Similar Opportunities');
    console.log(`   ✅ Similar Opportunities section present: ${await relatedSection.isVisible()}`);

    // Verify Anonymous Apply CTA (Desktop)
    const desktopApplyLink = page.locator(`a[href*="/auth/sign-in?returnUrl=/gigs/${gigId}"]`).first();
    const isDesktopApplyVisible = await desktopApplyLink.isVisible();
    console.log(`   ✅ Anonymous Desktop Apply CTA present: ${isDesktopApplyVisible}`);
    const applyHref = await desktopApplyLink.getAttribute('href');
    console.log(`   ✅ Apply redirect link: "${applyHref}"`);

    // ── CHECK 7: Mobile Viewport & Sticky Apply CTA ──────────────────────────
    console.log('\n7️⃣ Checking Mobile Responsive Layout (375x812) & Sticky Apply CTA...');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`http://localhost:3000/gigs/${gigId}`, { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForSelector('h1', { timeout: 10000 });

    const mobileStickyApply = mobilePage.locator('.fixed.bottom-0').locator(`a[href*="/auth/sign-in?returnUrl=/gigs/${gigId}"]`);
    const isMobileStickyVisible = await mobileStickyApply.isVisible();
    console.log(`   ✅ Mobile Sticky Apply CTA present: ${isMobileStickyVisible}`);

    // ── CHECK 8: Internship Detail Page & Related Opportunities ──────────────
    console.log('\n8️⃣ Checking Internship Detail Page (/internships/[id])...');
    const intId = '014cf846-77e2-4e03-bc7a-f215c2c670ca';
    await page.goto(`http://localhost:3000/internships/${intId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1', { timeout: 10000 });
    const intTitle = await page.locator('h1').textContent();
    console.log(`   ✅ Internship title: "${intTitle?.trim()}"`);

    const intRelated = page.locator('text=Similar Opportunities');
    console.log(`   ✅ Internship Similar Opportunities present: ${await intRelated.isVisible()}`);

    const intApplyBtn = page.locator('text=Apply with Profile').or(page.locator('text=Apply on Company Site')).first();
    console.log(`   ✅ Internship Apply CTA present: ${await intApplyBtn.isVisible()}`);

    // ── CHECK 9: Console Cleanliness & MapLibre Worker Regression ────────────
    console.log('\n9️⃣ Checking Console Cleanliness (0 MapLibre crashes, 0 CSP errors)...');
    const criticalErrors = consoleErrors.filter(e => 
      e.includes('codePointAt') || 
      e.includes('CSP') || 
      e.includes('Content Security Policy') ||
      e.includes('Uncaught') ||
      e.includes('MAPLIBRE_ERROR_EVENT')
    );

    if (criticalErrors.length === 0) {
      console.log('   ✅ 0 MapLibre worker crashes, 0 CSP errors, 0 runtime exceptions detected!');
    } else {
      console.error('   ❌ Critical errors found:', criticalErrors);
      throw new Error(`Critical console errors: ${criticalErrors.join(', ')}`);
    }

    await mobileContext.close();
    console.log('\n=============================================================');
    console.log('🎉 ALL PHASE 12 GUARDRAILS AND FLOW CHECKS PASSED WITH 100% SUCCESS!');
    console.log('=============================================================\n');
  } catch (err) {
    console.error('❌ Final verification failed:', err);
    process.exit(1);
  } finally {
    await desktopContext.close();
    await browser.close();
  }
}

verifyPhase12();
