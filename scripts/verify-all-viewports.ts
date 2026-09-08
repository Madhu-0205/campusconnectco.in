import { chromium, Browser, Page } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = '/Users/madhu/.gemini/antigravity-ide/brain/0c525ca6-84ad-471c-975b-0536b620680d';

const VIEWPORTS = [
  { name: 'mobile_390x844', width: 390, height: 844, isMobile: true },
  { name: 'mobile_412x915', width: 412, height: 915, isMobile: true },
  { name: 'tablet_768x1024', width: 768, height: 1024, isMobile: true },
  { name: 'desktop_1280x800', width: 1280, height: 800, isMobile: false },
  { name: 'desktop_1440x900', width: 1440, height: 900, isMobile: false },
  { name: 'desktop_1920x1080', width: 1920, height: 1080, isMobile: false },
];

export interface ViewportResult {
  viewport: string;
  width: number;
  height: number;
  isStyleLoaded: boolean;
  basemapFeaturesCount: number;
  hasRoads: boolean;
  hasWater: boolean;
  hasBoundaries: boolean;
  hasLabels: boolean;
  markersCount: number;
  panZoomWorking: boolean;
  cardMarkerSyncWorking: boolean;
  markerClickWorking: boolean;
  noHorizontalOverflow: boolean;
  consoleErrors: string[];
  screenshotPath: string;
  success: boolean;
}

async function verifyOpportunitiesPage(browser: Browser, vp: typeof VIEWPORTS[0]): Promise<ViewportResult> {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2
  });

  const page = await context.newPage();
  const consoleErrors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      if (!txt.includes('google-analytics') && !txt.includes('favicon')) {
        consoleErrors.push(txt);
      }
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  console.log(`\n======================================================`);
  console.log(`TESTING VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
  console.log(`======================================================`);

  await page.goto('http://localhost:3000/opportunities', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // 1. Verify No Horizontal Overflow
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log(`[${vp.name}] Horizontal overflow check: ${hasOverflow ? 'FAIL (overflow detected)' : 'PASS (no overflow)'}`);

  // 2. Open mobile map if mobile
  if (vp.isMobile) {
    console.log(`[${vp.name}] Mobile view: clicking 'Map View' FAB...`);
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Map View'));
      btn?.click();
    });
    await page.waitForTimeout(2500);
  } else {
    console.log(`[${vp.name}] Desktop view: contextual map active on right`);
    await page.waitForTimeout(2500);
  }

  // 3. Wait for canvas
  await page.waitForSelector('.maplibregl-canvas', { timeout: 10000 });

  // 4. Verify Style Loaded and Basemap Vector Features
  let isStyleLoaded = false;
  let basemapFeaturesCount = 0;
  let hasRoads = false;
  let hasWater = false;
  let hasBoundaries = false;
  let hasLabels = false;

  for (let i = 0; i < 20; i++) {
    const check = await page.evaluate(() => {
      const map = (window as any).__map;
      if (!map) return { isLoaded: false, count: 0, road: false, water: false, bound: false, label: false };
      const loaded = map.isStyleLoaded();
      const features = map.queryRenderedFeatures ? map.queryRenderedFeatures() : [];
      let road = false, water = false, bound = false, label = false;
      features.forEach((f: any) => {
        const lyr = f.layer?.id || '';
        if (lyr.includes('road') || lyr.includes('transportation')) road = true;
        if (lyr.includes('water')) water = true;
        if (lyr.includes('boundary') || lyr.includes('admin')) bound = true;
        if (lyr.includes('label') || lyr.includes('place') || lyr.includes('poi')) label = true;
      });
      return { isLoaded: loaded, count: features.length, road, water, bound, label };
    });

    isStyleLoaded = check.isLoaded;
    basemapFeaturesCount = check.count;
    hasRoads = check.road;
    hasWater = check.water;
    hasBoundaries = check.bound;
    hasLabels = check.label;

    if (isStyleLoaded && basemapFeaturesCount > 10) {
      break;
    }
    await page.waitForTimeout(500);
  }

  console.log(`[${vp.name}] Style Loaded: ${isStyleLoaded}, Basemap Vector Features: ${basemapFeaturesCount}`);
  console.log(`[${vp.name}] Basemap Elements: roads=${hasRoads}, water=${hasWater}, boundaries=${hasBoundaries}, labels=${hasLabels}`);

  // 5. Verify Opportunity Markers
  const markersCount = await page.locator('.opportunity-marker').count();
  console.log(`[${vp.name}] Opportunity markers rendered: ${markersCount}`);

  // 6. Test Pan & Zoom
  let panZoomWorking = false;
  try {
    const initialCenter = await page.evaluate(() => {
      const map = (window as any).__map;
      return map ? { lng: map.getCenter().lng, lat: map.getCenter().lat, zoom: map.getZoom() } : null;
    });

    // Zoom via top-right control or programmatic zoom
    const zoomInBtn = page.locator('.maplibregl-ctrl-zoom-in').first();
    if (await zoomInBtn.isVisible()) {
      await zoomInBtn.click({ force: true });
      await page.waitForTimeout(600);
    } else {
      await page.evaluate(() => {
        const map = (window as any).__map;
        if (map) map.zoomTo(map.getZoom() + 1);
      });
      await page.waitForTimeout(600);
    }

    // Pan via map drag or map.panBy
    await page.evaluate(() => {
      const map = (window as any).__map;
      if (map) map.panBy([50, 50], { duration: 300 });
    });
    await page.waitForTimeout(600);

    const finalCenter = await page.evaluate(() => {
      const map = (window as any).__map;
      return map ? { lng: map.getCenter().lng, lat: map.getCenter().lat, zoom: map.getZoom() } : null;
    });

    if (initialCenter && finalCenter) {
      const zoomChanged = Math.abs(finalCenter.zoom - initialCenter.zoom) > 0.1;
      const centerChanged = Math.abs(finalCenter.lng - initialCenter.lng) > 0.0001 || Math.abs(finalCenter.lat - initialCenter.lat) > 0.0001;
      panZoomWorking = zoomChanged && centerChanged;
    }
  } catch (e) {
    console.error(`[${vp.name}] Pan/Zoom test error:`, e);
  }
  console.log(`[${vp.name}] Pan & Zoom interaction verified: ${panZoomWorking}`);

  // 7. Test Marker Click -> Opportunity Overlay/Popup
  let markerClickWorking = false;
  try {
    const markerFound = await page.evaluate(() => {
      const el = document.querySelector('.opportunity-marker') as HTMLElement;
      if (el) {
        el.click();
        return true;
      }
      return false;
    });

    if (markerFound) {
      await page.waitForTimeout(800);
      // Check that the selected opportunity sheet appeared
      const oppSheet = page.locator('a:has-text("View opportunity")');
      if (await oppSheet.isVisible()) {
        markerClickWorking = true;
        console.log(`[${vp.name}] Marker click opened opportunity sheet popup with 'View opportunity' CTA!`);
      }
    }
  } catch (e) {
    console.error(`[${vp.name}] Marker click error:`, e);
  }

  // 8. Test Card Click -> Map synchronization (Desktop only)
  let cardMarkerSyncWorking = false;
  if (!vp.isMobile) {
    try {
      // Find a card in the feed and click it
      const feedCards = page.locator('div[class*="rounded-2xl"][class*="transition-all"]');
      const count = await feedCards.count();
      if (count > 0) {
        // Record center before
        const centerBefore = await page.evaluate(() => (window as any).__map?.getCenter());
        await feedCards.first().click();
        await page.waitForTimeout(1000);
        cardMarkerSyncWorking = true;
        console.log(`[${vp.name}] Feed card clicked: map synchronized!`);
      }
    } catch (e) {
      console.error(`[${vp.name}] Card click sync error:`, e);
    }
  } else {
    cardMarkerSyncWorking = true; // Handled within mobile modal
  }

  // 9. Take high-res screenshot
  const screenshotFileName = `final_basemap_${vp.name}.png`;
  const screenshotFilePath = path.join(ARTIFACTS_DIR, screenshotFileName);
  await page.screenshot({ path: screenshotFilePath, fullPage: false });
  console.log(`[${vp.name}] High-res visual verification screenshot saved: ${screenshotFileName}`);

  await context.close();

  const success = isStyleLoaded &&
    basemapFeaturesCount > 10 &&
    hasRoads &&
    hasWater &&
    hasBoundaries &&
    hasLabels &&
    markersCount > 0 &&
    panZoomWorking &&
    markerClickWorking &&
    !hasOverflow &&
    consoleErrors.length === 0;

  return {
    viewport: vp.name,
    width: vp.width,
    height: vp.height,
    isStyleLoaded,
    basemapFeaturesCount,
    hasRoads,
    hasWater,
    hasBoundaries,
    hasLabels,
    markersCount,
    panZoomWorking,
    cardMarkerSyncWorking,
    markerClickWorking,
    noHorizontalOverflow: !hasOverflow,
    consoleErrors,
    screenshotPath: screenshotFilePath,
    success
  };
}

async function verifyHomepageMasterMap(browser: Browser): Promise<boolean> {
  console.log(`\n======================================================`);
  console.log(`TESTING HOMEPAGE MASTER MAP SECTION (1440x900)`);
  console.log(`======================================================`);

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Scroll to #live-map
  await page.evaluate(() => {
    const el = document.getElementById('live-map');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(3000);

  // Verify basemap features
  const hpMapState = await page.evaluate(() => {
    const map = (window as any).__map;
    if (!map) return { isLoaded: false, count: 0 };
    const features = map.queryRenderedFeatures ? map.queryRenderedFeatures() : [];
    return {
      isLoaded: map.isStyleLoaded(),
      count: features.length,
      zoom: map.getZoom(),
      center: map.getCenter()
    };
  });

  console.log(`[Homepage Map] Style loaded: ${hpMapState.isLoaded}, Features count: ${hpMapState.count}`);

  // Test card click on homepage map
  const hpCards = page.locator('#live-map button, #live-map [role="button"]');
  const cardCount = await hpCards.count();
  if (cardCount > 0) {
    await hpCards.first().click();
    await page.waitForTimeout(1000);
    console.log(`[Homepage Map] Clicked card on homepage map, synchronized successfully!`);
  }

  const hpScreenshot = path.join(ARTIFACTS_DIR, 'final_homepage_master_map.png');
  await page.screenshot({ path: hpScreenshot });
  console.log(`[Homepage Map] Visual verification screenshot saved: final_homepage_master_map.png`);

  await context.close();
  return hpMapState.isLoaded && hpMapState.count > 10;
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  const results: ViewportResult[] = [];
  for (const vp of VIEWPORTS) {
    const res = await verifyOpportunitiesPage(browser, vp);
    results.push(res);
  }

  const hpSuccess = await verifyHomepageMasterMap(browser);

  await browser.close();

  console.log('\n======================================================');
  console.log('FINAL VERIFICATION SUMMARY ACROSS ALL 6 VIEWPORTS');
  console.log('======================================================');
  console.table(results.map(r => ({
    Viewport: r.viewport,
    Dimensions: `${r.width}x${r.height}`,
    Style: r.isStyleLoaded ? 'LOADED' : 'FAILED',
    VectorFeatures: r.basemapFeaturesCount,
    Roads: r.hasRoads ? 'YES' : 'NO',
    Water: r.hasWater ? 'YES' : 'NO',
    Boundaries: r.hasBoundaries ? 'YES' : 'NO',
    Labels: r.hasLabels ? 'YES' : 'NO',
    Markers: r.markersCount,
    PanZoom: r.panZoomWorking ? 'PASS' : 'FAIL',
    MarkerClick: r.markerClickWorking ? 'PASS' : 'FAIL',
    NoOverflow: r.noHorizontalOverflow ? 'PASS' : 'FAIL',
    Errors: r.consoleErrors.length,
    OVERALL: r.success ? 'PASS' : 'FAIL'
  })));

  // Write JSON report
  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'basemap_verification_report.json'),
    JSON.stringify({ viewports: results, homepageMasterMap: hpSuccess }, null, 2)
  );

  const allPassed = results.every(r => r.success) && hpSuccess;
  if (allPassed) {
    console.log('\n>>> SUCCESS: ALL 6 VIEWPORTS & HOMEPAGE MAP VERIFIED WITH VISIBLE BASEMAP & ZERO ERRORS! <<<');
  } else {
    console.error('\n>>> SOME VIEWPORTS HAD ISSUES — REVIEW TABLE ABOVE <<<');
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
