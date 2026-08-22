#!/usr/bin/env node

const dns = require('dns').promises;

const DOMAIN = 'campusconnectco.in';
// Hardcoding common DKIM selectors to check if any exist
const COMMON_SELECTORS = ['resend', 'google', 'sendgrid', 'default', 'mandrill', 'mail', 's1', 's2'];

const checkDNS = async () => {
  let hasErrors = false;
  let hasWarnings = false;

  console.log(`\n==================================================`);
  console.log(`📧 CAMPUSCONNECT EMAIL DNS SECURITY VERIFICATION`);
  console.log(`==================================================\n`);

  // 1. SPF Check
  console.log(`[1/3] Checking SPF for ${DOMAIN}...`);
  try {
    const txtRecords = await dns.resolveTxt(DOMAIN);
    const spfRecords = txtRecords.filter(record => record.join('').startsWith('v=spf1'));
    
    if (spfRecords.length === 0) {
      console.error(`❌ FAILED: No SPF (v=spf1) record found on ${DOMAIN}`);
      hasErrors = true;
    } else if (spfRecords.length > 1) {
      console.error(`❌ FAILED: Multiple SPF records found. This violates RFC 7208 and will cause delivery failures.`);
      spfRecords.forEach(r => console.error(`   - ${r.join('')}`));
      hasErrors = true;
    } else {
      const spf = spfRecords[0].join('');
      console.log(`✅ SPF Record found: ${spf}`);
      
      // Basic syntax validation
      if (!spf.includes('~all') && !spf.includes('-all') && !spf.includes('?all')) {
         console.warn(`⚠️  WARNING: SPF record does not have a valid termination mechanism (~all or -all).`);
         hasWarnings = true;
      }
    }
  } catch (e) {
    if (e.code === 'ENOTFOUND' || e.code === 'ENODATA') {
      console.error(`❌ FAILED: No TXT records exist for ${DOMAIN}`);
    } else {
      console.error(`❌ FAILED: Could not resolve TXT records for ${DOMAIN}. (${e.message})`);
    }
    hasErrors = true;
  }

  // 2. DMARC Check
  console.log(`\n[2/3] Checking DMARC for _dmarc.${DOMAIN}...`);
  try {
    const txtRecords = await dns.resolveTxt(`_dmarc.${DOMAIN}`);
    const dmarcRecord = txtRecords.find(record => record.join('').startsWith('v=DMARC1'));
    if (dmarcRecord) {
      const dmarc = dmarcRecord.join('');
      console.log(`✅ DMARC Record found: ${dmarc}`);
      
      // Policy reporting
      const policyMatch = dmarc.match(/p=(none|quarantine|reject)/);
      if (policyMatch) {
        const policy = policyMatch[1];
        console.log(`ℹ️  DMARC Policy: ${policy.toUpperCase()}`);
        if (policy === 'none') {
          console.warn(`⚠️  WARNING: DMARC policy is 'none' (Monitoring mode). Consider upgrading to quarantine/reject.`);
          hasWarnings = true;
        }
      } else {
        console.error(`❌ FAILED: DMARC record is missing a valid 'p=' policy tag.`);
        hasErrors = true;
      }

      // RUA/RUF reporting
      const ruaMatch = dmarc.match(/rua=([^;]+)/);
      const rufMatch = dmarc.match(/ruf=([^;]+)/);
      if (ruaMatch) console.log(`ℹ️  Aggregate Reports (rua): ${ruaMatch[1]}`);
      if (rufMatch) console.log(`ℹ️  Forensic Reports (ruf): ${rufMatch[1]}`);

    } else {
      console.error(`❌ FAILED: No DMARC (v=DMARC1) record found on _dmarc.${DOMAIN}`);
      hasErrors = true;
    }
  } catch (e) {
    if (e.code === 'ENOTFOUND' || e.code === 'ENODATA') {
      console.error(`❌ FAILED: No TXT records exist for _dmarc.${DOMAIN}`);
    } else {
      console.error(`❌ FAILED: Could not resolve DMARC. (${e.message})`);
    }
    hasErrors = true;
  }

  // 3. DKIM Check
  console.log(`\n[3/3] Checking DKIM configuration...`);
  let foundDkim = false;
  
  for (const selector of COMMON_SELECTORS) {
    try {
      const txt = await dns.resolveTxt(`${selector}._domainkey.${DOMAIN}`);
      console.log(`✅ DKIM Record found using selector '${selector}'`);
      console.log(`   - ${txt[0].join('').substring(0, 50)}...`);
      foundDkim = true;
      break;
    } catch (e) {
      // ignore
    }
  }

  if (!foundDkim) {
    console.warn(`⚠️  WARNING: Could not automatically detect DKIM using common selectors (resend, google, sendgrid, etc.).`);
    console.warn(`If you have configured DKIM with a custom selector, verify it manually: dig TXT <selector>._domainkey.${DOMAIN}`);
    hasWarnings = true;
  }

  console.log('\n==================================================');
  if (hasErrors) {
    console.error('🚨 [FAIL] EMAIL DNS VERIFICATION FAILED.');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('🟡 [WARN] EMAIL DNS VERIFICATION PASSED WITH WARNINGS.');
    process.exit(0);
  } else {
    console.log('🟢 [PASS] EMAIL DNS VERIFICATION PASSED.');
    process.exit(0);
  }
};

checkDNS();
