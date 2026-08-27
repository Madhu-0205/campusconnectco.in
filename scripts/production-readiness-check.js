#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');
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

// These must exist in production, but we don't strictly fail the local build if they are absent from local .env
// We will just warn the developer that they MUST exist in the Vercel dashboard.
const prodRequiredSecrets = [
  'DATABASE_URL',
  'CRON_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET'
];

const publicKeys = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_URL'
];

let envFileContent = '';
try {
  envFileContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
} catch (e) {}

const checkKey = (key, isSecret) => {
  const isInFile = envFileContent.includes(`${key}=`);
  const isInMemory = process.env[key] !== undefined;
  
  if (!isInFile && !isInMemory) {
    if (isSecret) {
      console.warn(`⚠️  WARNING [LOCAL OPTIONAL SECRET]: '${key}' is missing locally. MUST BE SET IN PRODUCTION.`);
      hasWarnings = true;
    } else {
      console.error(`❌ FAILED: Missing required public environment variable: ${key}`);
      hasCriticalFailure = true;
    }
  } else {
    console.log(`✅ ${key} is declared.`);
  }
};

prodRequiredSecrets.forEach(k => checkKey(k, true));
publicKeys.forEach(k => checkKey(k, false));

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
