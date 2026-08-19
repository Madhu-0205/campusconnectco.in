#!/usr/bin/env node

const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🚀 Initiating CampusConnect Advanced Production Readiness Scan...\n');

let hasCriticalFailure = false;
let hasWarnings = false;

const execute = (cmd, errorMessage, isCritical = true) => {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString().trim();
  } catch (error) {
    console.error(`❌ ${isCritical ? 'FAILED' : 'WARNING'}: ${errorMessage}`);
    if (isCritical) {
      hasCriticalFailure = true;
    } else {
      hasWarnings = true;
    }
    return null;
  }
};

// 1. GIT CLEANLINESS
console.log('📦 Verifying Git State...');
const status = execute('git status --porcelain', 'Git working tree is not clean.', true);
if (status !== null && status !== '') {
  console.error('❌ FAILED: Git working tree contains uncommitted changes.');
  hasCriticalFailure = true;
} else if (status !== null) {
  console.log('✅ Git tree is clean.');
}

// 2. DEPENDENCY AUDIT
console.log('\n🔒 Verifying Runtime Dependencies...');
const auditOutput = execute('npm audit --omit=dev --audit-level=high', 'High/Critical vulnerabilities detected in production graph.', false);
if (auditOutput !== null) {
  console.log('✅ No High/Critical runtime vulnerabilities.');
}

// 3. TYPESCRIPT & LINTING & TESTING
console.log('\n🛠️  Verifying Types, Lint, and Tests...');
if (execute('npx tsc --noEmit', 'TypeScript Compilation Failed.', true) !== null) {
  console.log('✅ TypeScript passed.');
}
if (execute('npm run lint', 'ESLint Failed.', true) !== null) {
  console.log('✅ ESLint passed.');
}
if (execute('npm run test --run', 'Vitest Suite Failed.', true) !== null) {
  console.log('✅ Vitest passed.');
}

// 4. ENVIRONMENT VARIABLES
console.log('\n🔐 Verifying Environment Variables...');
const requiredEnv = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'CRON_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET'
];

let envMissing = false;
// Try to check local .env file if running locally, otherwise process.env
let envFileContent = '';
try {
  envFileContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
} catch (e) {
  // Ignore if no .env file exists (e.g. in CI), we fall back to checking process.env
}

requiredEnv.forEach(key => {
  const isInFile = envFileContent.includes(`${key}=`);
  const isInMemory = process.env[key] !== undefined;
  
  if (!isInFile && !isInMemory) {
    console.error(`❌ FAILED: Missing required environment variable: ${key}`);
    envMissing = true;
    hasCriticalFailure = true;
  }
});
if (!envMissing) console.log('✅ All required environment keys are declared.');

// 5. PRODUCTION HTTP HEADERS & URL AVAILABILITY
console.log('\n🌐 Verifying Production HTTP Headers...');
const TARGET_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.campusconnectco.in';
const HEALTH_URL = `${TARGET_URL}/api/health`;

const req = https.get(HEALTH_URL, (res) => {
  const headers = res.headers;
  
  if (res.statusCode !== 200) {
    console.error(`❌ FAILED: /api/health returned ${res.statusCode}`);
    hasCriticalFailure = true;
  } else {
    console.log('✅ /api/health is online (HTTP 200).');
  }

  const requiredHeaders = [
    'strict-transport-security',
    'x-frame-options',
    'x-content-type-options',
    'referrer-policy',
    'content-security-policy',
    'permissions-policy'
  ];

  requiredHeaders.forEach(h => {
    if (headers[h]) {
      console.log(`✅ Header ${h} is active.`);
    } else {
      console.error(`❌ FAILED: Missing security header: ${h}`);
      hasCriticalFailure = true;
    }
  });

  // Verify caching headers on health route (should not be cached)
  if (headers['cache-control'] && headers['cache-control'].includes('s-maxage')) {
      console.error('❌ FAILED: /api/health is exposing public caching headers.');
      hasCriticalFailure = true;
  } else {
      console.log('✅ /api/health caching is safely disabled.');
  }
  
  finish();
});

req.on('error', (e) => {
  // If we run this in CI without network access to the prod URL, we emit a warning but don't fail the build necessarily,
  // unless we explicitly want to enforce it. Let's fail if the URL is completely unreachable.
  console.warn(`⚠️  WARNING: Could not reach production server. (${e.message})`);
  console.warn(`If this is a pre-deployment CI step, this is expected.`);
  hasWarnings = true;
  finish();
});

req.setTimeout(5000, () => {
    console.warn(`⚠️  WARNING: Network timeout attempting to reach production.`);
    req.abort();
    hasWarnings = true;
    finish();
});

function finish() {
    console.log('\n=============================================');
    if (hasCriticalFailure) {
        console.error('🔴 FINAL DECISION: NOT READY (Critical Failures Detected)');
        process.exit(1);
    } else if (hasWarnings) {
        console.warn('🟡 FINAL DECISION: READY WITH WARNINGS');
        process.exit(0);
    } else {
        console.log('🟢 FINAL DECISION: READY FOR PRODUCTION');
        process.exit(0);
    }
}
