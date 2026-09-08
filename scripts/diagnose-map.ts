import { chromium } from 'playwright';

async function main() {
  console.log('--- Diagnosing MapLibre Basemap Rendering ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();
  
  const networkLogs: any[] = [];
  const consoleLogs: { type: string; text: string }[] = [];

  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
    console.log(`[BROWSER ${msg.type().toUpperCase()}]`, msg.text());
  });

  page.on('pageerror', err => {
    console.error('[BROWSER PAGE ERROR]', err.message);
  });

  page.on('request', req => {
    const u = req.url();
    if (u.includes('carto') || u.includes('.mvt') || u.includes('.pbf') || u.includes('sprite') || u.includes('blob:')) {
      networkLogs.push({ event: 'REQ', url: u, resourceType: req.resourceType() });
    }
  });

  page.on('response', res => {
    const u = res.url();
    if (u.includes('carto') || u.includes('.mvt') || u.includes('.pbf') || u.includes('sprite') || u.includes('blob:')) {
      networkLogs.push({ event: 'RES', url: u, status: res.status(), contentType: res.headers()['content-type'] });
    }
  });

  page.on('requestfailed', req => {
    console.error('[FAILED REQUEST]', req.url(), req.failure()?.errorText);
    networkLogs.push({ event: 'FAIL', url: req.url(), error: req.failure()?.errorText });
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Scroll to map
  await page.evaluate(() => {
    const el = document.getElementById('live-map') || document.querySelector('.maplibregl-map');
    if (el) el.scrollIntoView();
  });

  await page.waitForTimeout(4000);

  // Map state inspection
  const mapState = await page.evaluate(() => {
    const map = (window as any).__map;
    if (!map) return { error: 'window.__map not found' };

    const style = map.getStyle();
    const renderedFeatures = map.queryRenderedFeatures();
    const source = map.getSource('carto');

    return {
      isLoaded: map.loaded(),
      isStyleLoaded: map.isStyleLoaded(),
      zoom: map.getZoom(),
      center: map.getCenter(),
      styleSources: Object.keys(style?.sources || {}),
      sourceDetails: source ? {
        type: source.type,
        loaded: source.loaded(),
        tiles: (source as any).tiles,
        minzoom: (source as any).minzoom,
        maxzoom: (source as any).maxzoom,
        scheme: (source as any).scheme
      } : null,
      glyphs: style?.glyphs,
      sprite: style?.sprite,
      styleLayersCount: style?.layers?.length || 0,
      renderedFeaturesCount: renderedFeatures.length,
      tilePyramid: (source as any)?._tilePyramid ? Object.keys((source as any)._tilePyramid._tiles) : null
    };
  });

  console.log('\n--- MAP STATE EVALUATION ---');
  console.log(JSON.stringify(mapState, null, 2));

  console.log('\n--- NETWORK REQUESTS SUMMARY ---');
  const grouped: Record<string, number> = {};
  networkLogs.forEach(n => {
    const key = `${n.event} ${n.status || ''} ${n.url.split('?')[0].substring(0, 70)}`;
    grouped[key] = (grouped[key] || 0) + 1;
  });
  console.log(JSON.stringify(grouped, null, 2));

  await page.screenshot({ path: 'diagnose_map_screenshot.png' });
  await browser.close();
}

main().catch(console.error);
