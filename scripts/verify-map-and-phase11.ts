import { chromium } from 'playwright';

interface VerificationResult {
  pageUrl: string;
  viewport: { width: number; height: number };
  mapLoaded: boolean;
  styleLoaded: boolean;
  mapErrors: string[];
  consoleErrors: string[];
  cspViolations: string[];
  pageErrors: string[];
  horizontalOverflow: boolean;
  markersCount: number;
}

async function verifyPage(
  browser: any,
  url: string,
  viewport: { width: number; height: number },
  scrollToSelector?: string
): Promise<VerificationResult> {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();

  const mapErrors: string[] = [];
  const consoleErrors: string[] = [];
  const cspViolations: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (msg: any) => {
    const text = msg.text();
    const type = msg.type();
    if (text.includes('MAPLIBRE_ERROR_EVENT')) {
      mapErrors.push(text);
    } else if (text.toLowerCase().includes('violates the following content security policy')) {
      cspViolations.push(text);
    } else if (type === 'error') {
      // Ignore Google Analytics network aborts if adblocked or headless
      if (!text.includes('google-analytics') && !text.includes('ERR_ABORTED')) {
        consoleErrors.push(text);
      }
    }
  });

  page.on('pageerror', (err: any) => {
    pageErrors.push(err.message);
  });

  console.log(`\nTesting ${url} [${viewport.width}x${viewport.height}]...`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  if (scrollToSelector) {
    await page.evaluate((sel: string) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView();
    }, scrollToSelector);
    await page.waitForTimeout(3000);
  } else {
    await page.waitForTimeout(3000);
  }

  // Check map state
  const mapState = await page.evaluate(() => {
    const map = (window as any).__map;
    if (!map) return { exists: false, isLoaded: false, isStyleLoaded: false };
    return {
      exists: true,
      isLoaded: typeof map.loaded === 'function' ? map.loaded() : false,
      isStyleLoaded: typeof map.isStyleLoaded === 'function' ? map.isStyleLoaded() : false
    };
  });

  // Check markers count
  const markersCount = await page.evaluate(() => {
    return document.querySelectorAll('.maplibregl-marker').length;
  });

  // Check horizontal overflow
  const horizontalOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });

  await context.close();

  return {
    pageUrl: url,
    viewport,
    mapLoaded: mapState.isLoaded,
    styleLoaded: mapState.isStyleLoaded,
    mapErrors,
    consoleErrors,
    cspViolations,
    pageErrors,
    horizontalOverflow,
    markersCount
  };
}

async function runSuite() {
  console.log('=== RUNNING COMPREHENSIVE MAP & PHASE 11 VERIFICATION SUITE ===');
  const browser = await chromium.launch({ headless: true });

  const tests = [
    // 1. Homepage Desktop
    { url: 'http://localhost:3000/', viewport: { width: 1440, height: 900 }, scroll: '.maplibregl-map' },
    // 2. Homepage Mobile
    { url: 'http://localhost:3000/', viewport: { width: 375, height: 812 }, scroll: '.maplibregl-map' },
    // 3. Opportunities Discovery Desktop
    { url: 'http://localhost:3000/opportunities', viewport: { width: 1440, height: 900 } },
    // 4. Opportunities Discovery Mobile
    { url: 'http://localhost:3000/opportunities', viewport: { width: 375, height: 812 } }
  ];

  const results: VerificationResult[] = [];
  for (const t of tests) {
    const res = await verifyPage(browser, t.url, t.viewport, t.scroll);
    results.push(res);
  }

  await browser.close();

  console.log('\n================ VERIFICATION SUMMARY ================');
  let allPass = true;
  for (const r of results) {
    const pass =
      r.mapErrors.length === 0 &&
      r.cspViolations.length === 0 &&
      r.pageErrors.length === 0 &&
      !r.horizontalOverflow;

    if (!pass) allPass = false;

    console.log(`\nURL: ${r.pageUrl} (${r.viewport.width}x${r.viewport.height})`);
    console.log(`  Map Style Loaded: ${r.styleLoaded}`);
    console.log(`  Map Markers Count: ${r.markersCount}`);
    console.log(`  Horizontal Overflow: ${r.horizontalOverflow ? 'FAIL (overflow detected)' : 'PASS (clean)'}`);
    console.log(`  MapLibre Errors (${r.mapErrors.length}): ${r.mapErrors.length === 0 ? 'PASS' : JSON.stringify(r.mapErrors)}`);
    console.log(`  CSP Violations (${r.cspViolations.length}): ${r.cspViolations.length === 0 ? 'PASS' : JSON.stringify(r.cspViolations)}`);
    console.log(`  Uncaught Page Errors (${r.pageErrors.length}): ${r.pageErrors.length === 0 ? 'PASS' : JSON.stringify(r.pageErrors)}`);
  }

  console.log('\n======================================================');
  if (allPass) {
    console.log('✅ ALL AUDIT GATES PASSED: ZERO MAPLIBRE ERRORS, ZERO CSP VIOLATIONS, ZERO OVERFLOWS.');
  } else {
    console.error('❌ VERIFICATION FAILED: Issues detected above.');
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Error running test suite:', err);
  process.exit(1);
});
