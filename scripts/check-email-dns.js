#!/usr/bin/env node

const dns = require('dns').promises;

console.log('📧 Starting CampusConnect Email DNS Verification...\n');

const DOMAIN = 'campusconnectco.in';

// These selectors are specific to the email provider used (e.g. resend, sendgrid, google)
// We check for generic DKIM presence if no specific selector is provided.
const checkDNS = async () => {
  let hasErrors = false;

  // 1. SPF Check
  console.log(`🔍 Checking SPF for ${DOMAIN}...`);
  try {
    const txtRecords = await dns.resolveTxt(DOMAIN);
    const spfRecord = txtRecords.find(record => record.join('').startsWith('v=spf1'));
    if (spfRecord) {
      console.log(`✅ SPF Record found: ${spfRecord.join('')}`);
    } else {
      console.error(`❌ FAILED: No SPF (v=spf1) record found on ${DOMAIN}`);
      hasErrors = true;
    }
  } catch (e) {
    console.error(`❌ FAILED: Could not resolve TXT records for ${DOMAIN}. (${e.message})`);
    hasErrors = true;
  }

  // 2. DMARC Check
  console.log(`\n🔍 Checking DMARC for _dmarc.${DOMAIN}...`);
  try {
    const txtRecords = await dns.resolveTxt(`_dmarc.${DOMAIN}`);
    const dmarcRecord = txtRecords.find(record => record.join('').startsWith('v=DMARC1'));
    if (dmarcRecord) {
      console.log(`✅ DMARC Record found: ${dmarcRecord.join('')}`);
      if (dmarcRecord.join('').includes('p=none')) {
        console.warn(`⚠️  WARNING: DMARC policy is p=none (Monitoring mode). Consider upgrading to p=quarantine for production security.`);
      }
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
  console.log(`\n🔍 DKIM Check Warning...`);
  console.log(`⚠️  DKIM verification requires the specific <selector>._domainkey provided by your email host (e.g. resend._domainkey.${DOMAIN}).`);
  console.log(`To verify DKIM manually, run: dig TXT <your-selector>._domainkey.${DOMAIN}`);

  console.log('\n==================================================');
  if (hasErrors) {
    console.error('🚨 EMAIL DNS VERIFICATION FAILED.');
    console.error('Please configure the required DNS TXT records in your registrar dashboard.');
    process.exit(1);
  } else {
    console.log('✅ EMAIL DNS (SPF/DMARC) VERIFICATION PASSED.');
    console.log('Don\'t forget to manually verify your DKIM selector!');
    process.exit(0);
  }
};

checkDNS();
