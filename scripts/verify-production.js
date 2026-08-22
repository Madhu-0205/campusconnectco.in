#!/usr/bin/env node

const https = require('https');

const TARGET_URL = 'https://www.campusconnectco.in';

console.log(`🔍 Starting Production Verification against ${TARGET_URL}\n`);

async function checkEndpoint(path, name) {
  return new Promise((resolve, reject) => {
    const req = https.get(`${TARGET_URL}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });
    
    // Set timeout to 5 seconds
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request Timeout'));
    });
  });
}

async function run() {
  let allPassed = true;

  try {
    // 1. Check Homepage
    console.log(`⏳ Checking Homepage (/) ...`);
    const homeRes = await checkEndpoint('/', 'Homepage');
    if (homeRes.statusCode === 200) {
      console.log(`  ✅ HTTP 200 OK`);
    } else {
      console.log(`  ❌ Failed: HTTP ${homeRes.statusCode}`);
      allPassed = false;
    }

    // 2. Check Security Headers
    console.log(`\n⏳ Checking Security Headers ...`);
    const requiredHeaders = [
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options'
    ];
    let headersPassed = true;
    for (const h of requiredHeaders) {
      if (homeRes.headers[h]) {
        console.log(`  ✅ ${h}: ${homeRes.headers[h]}`);
      } else {
        console.log(`  ❌ Missing: ${h}`);
        headersPassed = false;
      }
    }
    
    // Check for CSP
    if (homeRes.headers['content-security-policy']) {
      console.log(`  ✅ content-security-policy: Present`);
    } else {
      console.warn(`  ⚠️ Warning: content-security-policy missing from edge route (expected if injected via middleware nonce)`);
    }

    if (!headersPassed) allPassed = false;

    // 3. Check Health Endpoint
    console.log(`\n⏳ Checking API Health Endpoint (/api/health) ...`);
    const healthRes = await checkEndpoint('/api/health', 'Health API');
    if (healthRes.statusCode === 200) {
      console.log(`  ✅ HTTP 200 OK`);
      try {
        const json = JSON.parse(healthRes.body);
        if (json.status === 'ok') {
          console.log(`  ✅ Health Status: OK`);
        } else {
          console.log(`  ❌ Health Status: INVALID (${json.status})`);
          allPassed = false;
        }
      } catch (e) {
        console.log(`  ❌ Invalid JSON returned from health endpoint`);
        allPassed = false;
      }
    } else {
      console.log(`  ❌ Failed: HTTP ${healthRes.statusCode}`);
      allPassed = false;
    }

    console.log(`\n=========================================`);
    if (allPassed) {
      console.log(`🎉 PRODUCTION VERIFICATION PASSED`);
      process.exit(0);
    } else {
      console.log(`❌ PRODUCTION VERIFICATION FAILED`);
      process.exit(1);
    }

  } catch (error) {
    console.error(`\n❌ Error during verification: ${error.message}`);
    process.exit(1);
  }
}

run();
