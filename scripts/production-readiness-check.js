#!/usr/bin/env node

const { execSync } = require('child_process');
const https = require('https');

console.log('🚀 Initiating CampusConnect Production Readiness Scan...\n');

const execute = (cmd, errorMessage) => {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString().trim();
  } catch (error) {
    console.error(`❌ FAILED: ${errorMessage}`);
    console.error(error.message);
    process.exit(1);
  }
};

// 1. GIT CLEANLINESS
console.log('📦 Verifying Git State...');
const status = execute('git status --porcelain', 'Git working tree is not clean.');
if (status) {
  console.error('❌ FAILED: Git working tree contains uncommitted changes.');
  process.exit(1);
}
console.log('✅ Git tree is clean.\n');

// 2. DEPENDENCY AUDIT
console.log('🔒 Verifying Runtime Dependencies...');
try {
  execSync('npm audit --omit=dev --audit-level=high', { stdio: 'pipe' });
  console.log('✅ No High/Critical runtime vulnerabilities.\n');
} catch (e) {
  console.warn('⚠️  WARNING: High/Critical vulnerabilities detected in production graph.');
  console.warn('Review `npm audit --omit=dev` and ensure none apply to the Vercel Edge Runtime.\n');
}

// 3. TYPESCRIPT & LINTING
console.log('🛠️  Verifying TypeScript & ESLint...');
execute('npx tsc --noEmit', 'TypeScript Compilation Failed.');
execute('npm run lint', 'ESLint Failed.');
console.log('✅ Typecheck & Linting passed.\n');

// 4. HTTP HEALTH & SECURITY HEADERS
console.log('🌐 Verifying Production HTTP Headers...');
const req = https.get('https://www.campusconnectco.in/api/health', (res) => {
  const headers = res.headers;
  
  if (res.statusCode !== 200) {
    console.error(`❌ FAILED: /api/health returned ${res.statusCode}`);
  } else {
    console.log('✅ /api/health is online (HTTP 200).');
  }

  const requiredHeaders = [
    'strict-transport-security',
    'x-frame-options',
    'x-content-type-options'
  ];

  requiredHeaders.forEach(h => {
    if (headers[h]) {
      console.log(`✅ Header ${h} is active.`);
    } else {
      console.error(`❌ FAILED: Missing security header: ${h}`);
    }
  });
  
  console.log('\n=============================================');
  console.log('🚨 MANUAL / EXTERNAL VERIFICATION REQUIRED 🚨');
  console.log('=============================================');
  console.log('The following must be verified in external dashboards:');
  console.log('1. Supabase PITR & Automated Backups (Supabase Dashboard)');
  console.log('2. Email SPF/DKIM/DMARC (DNS Provider Dashboard)');
  console.log('3. Sentry Live Ingestion (Sentry Dashboard)');
  console.log('4. Razorpay Webhook Delivery (Razorpay Dashboard)');
  console.log('5. External Uptime Monitor (Pingdom/Better Uptime)');
  console.log('\n🏁 Operational Readiness Scan Complete.');
});

req.on('error', (e) => {
  console.error(`❌ FAILED: Could not reach production server. ${e.message}`);
});
