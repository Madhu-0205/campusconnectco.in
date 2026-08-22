#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

const TARGET_URL = 'https://www.campusconnectco.in';
const REPORT_PATH = './lh-report.json';

console.log(`🚀 Starting Synthetic Performance Test for ${TARGET_URL}...`);

try {
  // Run Lighthouse CLI in headless mode
  execSync(`npx lighthouse ${TARGET_URL} --output json --output-path ${REPORT_PATH} --chrome-flags="--headless --no-sandbox --disable-gpu" --quiet`);
  
  if (fs.existsSync(REPORT_PATH)) {
    const reportData = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
    
    const performanceScore = Math.round(reportData.categories.performance.score * 100);
    const fcp = (reportData.audits['first-contentful-paint'].numericValue / 1000).toFixed(2);
    const lcp = (reportData.audits['largest-contentful-paint'].numericValue / 1000).toFixed(2);
    const tti = (reportData.audits['interactive'].numericValue / 1000).toFixed(2);
    const cls = reportData.audits['cumulative-layout-shift'].numericValue.toFixed(3);
    const tbt = Math.round(reportData.audits['total-blocking-time'].numericValue);
    
    console.log('\n==================================================');
    console.log(`📊 PERFORMANCE RESULTS (Synthetic Baseline)`);
    console.log('==================================================');
    console.log(`Performance Score: ${performanceScore}/100`);
    console.log(`FCP (First Contentful Paint): ${fcp} s`);
    console.log(`LCP (Largest Contentful Paint): ${lcp} s`);
    console.log(`TTI (Time to Interactive): ${tti} s`);
    console.log(`TBT (Total Blocking Time): ${tbt} ms`);
    console.log(`CLS (Cumulative Layout Shift): ${cls}`);
    
    console.log('\nMetrics parsed successfully. Generating DOCS baseline...');
    
    // Create the markdown document
    const mdContent = `# Performance Baseline

These metrics were collected using Lighthouse Synthetic testing against the production URL.

## Measurements
- **URL Tested:** ${TARGET_URL}
- **Timestamp:** ${new Date().toISOString()}

| Metric | Score/Value | Status |
|--------|-------------|--------|
| Overall Performance | ${performanceScore}/100 | ${performanceScore >= 90 ? '🟢 Good' : performanceScore >= 50 ? '🟡 Needs Improvement' : '🔴 Poor'} |
| FCP (First Contentful Paint) | ${fcp} s | ${fcp <= 1.8 ? '🟢' : '🟡'} |
| LCP (Largest Contentful Paint) | ${lcp} s | ${lcp <= 2.5 ? '🟢' : '🟡'} |
| TTI (Time to Interactive) | ${tti} s | - |
| TBT (Total Blocking Time) | ${tbt} ms | ${tbt <= 200 ? '🟢' : '🟡'} |
| CLS (Cumulative Layout Shift) | ${cls} | ${cls <= 0.1 ? '🟢' : '🟡'} |

## Recommendations
* Review Next.js \`next/image\` usage for LCP elements. Ensure ` + "`" + `priority=true` + "`" + ` is set on above-the-fold hero images.
* Monitor real-user Core Web Vitals (CWV) via Vercel Analytics once traffic stabilizes.
`;
    
    fs.writeFileSync('./docs/PERFORMANCE.md', mdContent);
    console.log('✅ Wrote baseline to docs/PERFORMANCE.md');
    
    // Clean up
    fs.unlinkSync(REPORT_PATH);
  } else {
    console.error('❌ Lighthouse report file was not generated.');
  }

} catch (error) {
  console.error('❌ Error running Lighthouse:', error.message);
}
