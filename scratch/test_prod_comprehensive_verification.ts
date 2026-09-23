import { chromium } from "playwright";

interface CheckResult {
  name: string;
  passed: boolean;
  details: string;
}

async function main() {
  console.log("================================================================");
  console.log("CAMPUSCONNECTCO — FINAL PRODUCTION RELEASE VERIFICATION AUDIT");
  console.log("Domain: https://www.campusconnectco.in");
  console.log("================================================================");

  const results: CheckResult[] = [];

  // 1. Verify Deployment Status & Aliases
  console.log("\n[CHECK 1] Testing root HTTP & Vercel Headers...");
  const rootRes = await fetch("https://www.campusconnectco.in", {
    headers: { "User-Agent": "ReleaseVerifier/1.0" }
  });
  const vercelId = rootRes.headers.get("x-vercel-id") || "";
  const server = rootRes.headers.get("server") || "";
  const isSin1 = vercelId.includes("sin1");
  console.log(`Root status: ${rootRes.status}`);
  console.log(`x-vercel-id: ${vercelId}`);
  console.log(`Region is sin1: ${isSin1}`);
  results.push({
    name: "Production Serving & sin1 Region",
    passed: rootRes.status === 200 && isSin1,
    details: `Status: ${rootRes.status}, x-vercel-id: ${vercelId}`
  });

  // 2. CSP Audit (Zero Puter domains)
  console.log("\n[CHECK 2] Testing Content-Security-Policy...");
  const csp = rootRes.headers.get("content-security-policy") || "";
  const hasPuterInCsp = csp.includes("puter.com");
  const hasGroqInCsp = csp.includes("api.groq.com");
  console.log(`Puter in CSP: ${hasPuterInCsp}`);
  console.log(`Groq in CSP (should be false - server side only): ${hasGroqInCsp}`);
  results.push({
    name: "CSP Integrity (No Puter, No Client Groq)",
    passed: !hasPuterInCsp && !hasGroqInCsp,
    details: `Puter in CSP: ${hasPuterInCsp}, Groq in CSP: ${hasGroqInCsp}`
  });

  // 3. Payments HTTP 503 Verification
  console.log("\n[CHECK 3] Testing Payments 503 Gates...");
  const paymentEndpoints = [
    { url: "https://www.campusconnectco.in/api/checkout/create-order", method: "POST" },
    { url: "https://www.campusconnectco.in/api/payments/escrow/create-order", method: "POST" },
    { url: "https://www.campusconnectco.in/api/payments/escrow/verify", method: "POST" },
    { url: "https://www.campusconnectco.in/api/payments/escrow/release", method: "POST" }
  ];

  let paymentsAll503 = true;
  for (const ep of paymentEndpoints) {
    try {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true })
      });
      const data = await res.json().catch(() => ({}));
      const is503 = res.status === 503 && data.code === "PAYMENTS_COMING_SOON";
      console.log(`${ep.method} ${ep.url} -> HTTP ${res.status}, code: ${data.code}`);
      if (!is503) {
        paymentsAll503 = false;
      }
    } catch (err: any) {
      console.error(`Error checking ${ep.url}:`, err.message);
      paymentsAll503 = false;
    }
  }
  results.push({
    name: "Payments Disabled (HTTP 503 PAYMENTS_COMING_SOON)",
    passed: paymentsAll503,
    details: `All tested payment endpoints return 503 PAYMENTS_COMING_SOON: ${paymentsAll503}`
  });

  // 4. Prisma & Database Health Check (Public endpoints backed by DB)
  console.log("\n[CHECK 4] Testing Database / Prisma API endpoints...");
  const dbEndpoints = [
    "https://www.campusconnectco.in/api/opportunities",
    "https://www.campusconnectco.in/opportunities",
    "https://www.campusconnectco.in/opportunities?type=internship",
    "https://www.campusconnectco.in/opportunities?type=gig",
    "https://www.campusconnectco.in/internships/bangalore",
    "https://www.campusconnectco.in/browse-gigs"
  ];

  let dbHealthy = true;
  for (const url of dbEndpoints) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "ReleaseVerifier/1.0" }
      });
      console.log(`GET ${url} -> HTTP ${res.status}`);
      if (res.status !== 200) {
        dbHealthy = false;
      }
    } catch (err: any) {
      console.error(`Error querying ${url}:`, err.message);
      dbHealthy = false;
    }
  }
  results.push({
    name: "Prisma Database Health & Public Routes",
    passed: dbHealthy,
    details: `All critical database-backed pages return HTTP 200: ${dbHealthy}`
  });

  // 5. Browser Map P0 and Interaction Audit
  console.log("\n[CHECK 5] Testing Map P0 fix in browser (No infinite render loop)...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    consoleErrors.push(err.message);
  });

  // Test Homepage Map
  console.log("Navigating to https://www.campusconnectco.in...");
  await page.goto("https://www.campusconnectco.in", { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(3000);

  // Test Opportunities Map
  console.log("Navigating to https://www.campusconnectco.in/opportunities...");
  await page.goto("https://www.campusconnectco.in/opportunities", { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(3000);

  // Check for Map elements
  const mapContainer = await page.locator(".leaflet-container, [data-testid='map-container'], #map").count();
  console.log(`Map container elements found: ${mapContainer}`);

  const hasMaxUpdateDepth = consoleErrors.some((e) => e.includes("Maximum update depth exceeded"));
  const hasPrismaClosedInBrowser = consoleErrors.some((e) => e.includes("PrismaClientClosedError"));
  console.log(`Browser console errors count: ${consoleErrors.length}`);
  console.log(`Maximum update depth exceeded: ${hasMaxUpdateDepth}`);
  console.log(`PrismaClientClosedError: ${hasPrismaClosedInBrowser}`);

  results.push({
    name: "Map P0 Stability (Zero infinite render loop)",
    passed: !hasMaxUpdateDepth,
    details: `Maximum update depth exceeded detected: ${hasMaxUpdateDepth}, Console errors: ${consoleErrors.length}`
  });

  await browser.close();

  // Summary
  console.log("\n================================================================");
  console.log("FINAL AUDIT SUMMARY");
  console.log("================================================================");
  let allPassed = true;
  for (const r of results) {
    console.log(`[${r.passed ? "PASS" : "FAIL"}] ${r.name} - ${r.details}`);
    if (!r.passed) allPassed = false;
  }
  console.log("================================================================");
  if (!allPassed) {
    console.error("FAIL: One or more audit checks failed.");
    process.exit(1);
  }
  console.log("ALL POST-DEPLOYMENT CHECKS PASSED!");
}

main().catch((err) => {
  console.error("Verification audit failed:", err);
  process.exit(1);
});
