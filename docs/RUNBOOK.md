# CampusConnect Production Runbook

This runbook serves as the central index for all operational, security, and verification procedures for the CampusConnect production environment.

## 1. Domain & Email Verification
Because CampusConnect uses external email delivery (Resend) requiring provider DNS credentials, the SPF, DKIM, and DMARC verification must be performed manually by an administrator.
- **Runbook:** [Email DNS Configuration & Verification](./EMAIL-DNS.md)
- **Tool:** `node scripts/check-email-dns.js`

## 2. Uptime & Platform Monitoring
Production monitoring is split between application-level synthetic monitoring and platform-level (Vercel) dashboards.
- **Application Health:** [Production Monitoring Guide](./PRODUCTION-MONITORING.md)
- **Vercel Infrastructure:** [Vercel Monitoring Guide](./VERCEL-MONITORING.md)
- **Database (Supabase):** [Supabase Monitoring & Pooling](./SUPABASE-MONITORING.md)

## 3. Error Tracking & Sentry
Client, server, and edge errors are logged securely via `@sentry/nextjs`, ensuring no sensitive auth/cookie tokens leak.
- **Runbook:** [Sentry Verification Guide](./SENTRY-VERIFICATION.md)

## 4. Payment Processing (Razorpay)
The Razorpay checkout webhook is fully tested with cryptographically verified payloads and idempotency guards against race conditions.
- **Runbook:** [Razorpay E2E Webhook Architecture](./RAZORPAY-E2E.md)

## 5. Performance
Baseline performance metrics indicate solid Core Web Vitals, but above-the-fold images should always leverage Next.js `priority`.
- **Runbook:** [Performance Baseline & Strategy](./PERFORMANCE.md)
- **Tool:** `node scripts/performance-test.js`

## 6. End-to-End Verification
To perform a full regression and availability check against the live site, run the production verification tool.
- **Tool:** `npm run verify:prod` (or `node scripts/verify-production.js`)
