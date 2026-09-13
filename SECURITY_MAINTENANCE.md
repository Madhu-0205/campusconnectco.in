# CampusConnect — Production Security & Maintenance Guide

This document establishes the mandatory security and maintenance baseline for CampusConnect (`campusconnectco.in`). Every engineer and automated pipeline must adhere to these guidelines to ensure the platform remains **secure, correct, performant, resilient, and maintainable**.

---

## 1. Developer Workflow & Pull Requests (Every Commit / PR)

Before committing code or merging any Pull Request, verify:

```bash
# 1. Type check
npm run type-check

# 2. Lint check
npm run lint

# 3. Automated test suite (all unit, integration, and security tests)
npm test

# 4. Prisma schema validation
npx prisma validate
```

### Pre-Commit Security Checklist:
- [ ] **No Secrets**: Ensure no API keys, private tokens, service-role keys, database URLs, or webhook secrets are present in code or commit diffs.
- [ ] **Environment Files**: Verify `.env`, `.env.local`, and `.env.production` remain untracked in `.gitignore`.
- [ ] **Authorization Review**: If new API endpoints or data queries were introduced, ensure access is scoped to the authenticated user's authoritative database role (`requireRole`) or resource ownership.
- [ ] **No Direct Role Reliance**: Never rely on Supabase JWT user metadata (`user.role` or `user_metadata.role`) for security or payments; always verify authoritative DB status.

---

## 2. Database Schema & Row-Level Security (Every New Table)

When introducing a new database model in `prisma/schema.prisma`:

1. **Foreign Key & Query Indexes**:
   - Add explicit Prisma `@@index` annotations for every foreign key and high-traffic query pattern (e.g., `[userId]`, `[userId, createdAt]`, `[status]`).
2. **RLS Must Be Enabled**:
   - Add table to `prisma/supabase_rls_policies.sql`:
     ```sql
     ALTER TABLE "NewTable" ENABLE ROW LEVEL SECURITY;
     ```
3. **Least-Privilege Policies**:
   - Explicitly separate `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policies.
   - Restrict access to `auth.uid() = "userId"` or participants.
   - **Never use `USING (true)` on private tables** (user data, banking, conversations, payments, transactions).
4. **Column-Level Security**:
   - If sensitive columns exist (banking details, PII, internal tokens), explicitly revoke permissions:
     ```sql
     REVOKE SELECT ("secretCol") ON "NewTable" FROM anon, authenticated;
     ```
5. **Validation**:
   - Run `npx prisma validate` and verify migration locally before deploying to staging/production.

---

## 3. API Route Hardening (Every New API)

Every route handler in `src/app/api/` must enforce:

1. **Authentication**:
   - Use `requireUser()` or `createClient()` with `supabase.auth.getUser()`.
   - Reject unauthenticated requests immediately with `401 Unauthorized`.
2. **Authorization & IDOR Protection**:
   - Check resource ownership: verify `record.userId === user.id` before returning or mutating data.
   - For privileged business actions (escrow funding, payouts), verify business roles:
     ```ts
     const { user, errorResponse } = await requireRole(["CLIENT", "STARTUP", "FOUNDER"]);
     ```
3. **Input Validation**:
   - Parse all request parameters (body, query, URL params) with strict Zod schemas (`safeParse`).
4. **Rate Limiting**:
   - Apply rate limiters in `src/middleware.ts` or route handlers:
     - `authLimiter`: 5 req / min (OTP, login, signup)
     - `paymentLimiter`: 15 req / 5 min (checkout, escrow)
     - `publicFormLimiter`: 10 req / min (contact, referrals)
     - `resumeParseLimiter`: 3 req / day (AI parsing)
     - `aiLimiter`: 20 req / min (copilot, chat)
     - `standardLimiter`: 120 req / min (general API)
5. **Error Sanitization**:
   - Never send error stack traces, internal paths, SQL queries, or provider error messages to the browser.
   - Return `{ error: "Internal Server Error" }` with `500` status.
   - Log detailed diagnostic errors on the server using `logger.error(tag, err)`.

---

## 4. SSRF Defense Guidelines (Every External URL Fetch)

When fetching URLs supplied directly or indirectly by users:

1. **Protocol**: Enforce `https:` strictly. Disallow `http:`, `ftp:`, `file:`, `gopher:`.
2. **Port**: Restrict to standard HTTPS port (`443`) or empty port.
3. **Host Allowlist**: Validate against explicit trusted domains (e.g. configured Supabase Storage, AWS S3).
4. **IP & DNS Resolution**:
   - Block loopback (`127.0.0.0/8`, `::1`).
   - Block cloud metadata (`169.254.169.254`, `169.254.0.0/16`).
   - Block RFC 1918 private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
   - Resolve DNS hostnames via `dns.promises.lookup(hostname, { all: true })` and verify no resolved IP address belongs to private/reserved ranges.
5. **Redirect Defense**:
   - Use `redirect: 'manual'`.
   - Never allow automatic following of redirects.
   - For each redirect, re-validate the target URL against allowlists, ports, and DNS resolution.
   - Limit max redirects to 2.
6. **Time & Size Limits**:
   - Set an explicit `AbortController` timeout (e.g., 10 seconds).
   - Check `Content-Length` header against maximum allowed size (e.g., 10MB).
   - Stream response body and count bytes chunk-by-chunk; abort immediately if threshold is exceeded to prevent memory exhaustion DoS.
7. **Content-Type Validation**:
   - Reject executable or script content types (`text/html`, `application/xhtml+xml`, `text/javascript`).

---

## 5. Payment & Escrow Security Standard

1. **Amount Integrity**:
   - Server-side values (database records) determine transaction amounts, platform fees, and payouts.
   - Never trust client-supplied amounts or currency fields.
2. **State Machine Transitions**:
   - Valid escrow progression:
     ```text
     PENDING ──(Payment Verified)──> LOCKED ──(Completion Confirmed)──> RELEASED
        │                               │
        └──────(Cancelled/Expired)──────┴──────(Disputed)──> REFUNDED
     ```
   - Enforce atomic conditional updates (`where: { id, status: "LOCKED" }`) to prevent double-releases or race conditions.
3. **Webhook Verification & Replay Protection**:
   - Validate Razorpay HMAC-SHA256 signature using constant-time string comparison (`safeCompare`).
   - In production (`process.env.NODE_ENV === 'production'`), reject any request missing valid signatures or configured secrets.
   - Process webhooks idempotently using persistent `Transaction.webhookEventId` deduplication: any replayed webhook with an identical event ID is immediately suppressed without executing database mutations.
   - Enforce atomic status matching (`where: { id, status: "PENDING" }`) inside Prisma transactions to eliminate race conditions from concurrent webhook deliveries.

---

## 6. Supabase Free Backup Strategy & Disaster Recovery Procedures

CampusConnect is intentionally hosted on the **Supabase Free Tier**. Under this tier, managed automatic database backups and Point-in-Time Recovery (PITR) are **not** provided by the Supabase dashboard. To protect customer data and ensure business continuity, an external automated backup pipeline is maintained.

For the comprehensive runbook and secrets setup, see [DATABASE_BACKUP_AND_RESTORE.md](file:///Users/madhu/Desktop/campusconnectco.in-main/docs/DATABASE_BACKUP_AND_RESTORE.md).

### A. Automated Daily Encrypted Off-Site Backup
1. **GitHub Actions Workflow**: `.github/workflows/database-backup.yml`
   - Triggered automatically every day at 02:00 UTC (07:30 IST) and on-demand via `workflow_dispatch`.
   - Uses the official Supabase CLI (`supabase db dump`) with direct connection secrets (`SUPABASE_DB_URL`).
   - Generates three separate logical dumps:
     - `roles.sql`: Cluster roles (excluding Supabase-managed platform roles).
     - `schema.sql`: Public schema DDL, RLS policies, functions, and sequences.
     - `data.sql`: Public data records with session replication role enabled (`replica`).
   - Validates that all dump files exist and are non-empty.
   - Compresses into `.tar.gz` and computes SHA-256 checksum (`.sha256`).
   - Encrypts the archive client-side using **OpenSSL AES-256-CBC with PBKDF2** (100,000 iterations) using `BACKUP_ENCRYPTION_KEY`.
   - Verifies decryption and checksum integrity in a sandbox test prior to upload.
   - Uploads `.tar.gz.enc`, `.sha256`, and `metadata.json` to private Google Drive storage (`CampusConnect Backups/database/daily/YYYY-MM-DD/`) via official Google Drive API v3 (OAuth 2.0 with least-privilege `drive.file` scope).
   - Enforces a 30-day rolling retention policy (automatically pruning expired daily folders).
2. **Recovery Expectations**:
   - **RPO**: ~24 hours (maximum data change loss in catastrophic incident).
   - **RTO**: 1-2 hours (time required to provision an isolated instance, decrypt, and apply data).

### B. Safe Disaster Recovery & Restoration Drill
1. **Isolated Restoration Only**:
   - **CRITICAL**: Never restore directly over the live production database.
   - Restore into a separate staging Supabase project or isolated PostgreSQL instance.
2. **Operator Restore Tool**:
   - Execute guarded script: `scripts/restore-db.sh <backup.tar.gz.enc> <backup.sha256> <TARGET_DB_URL>`.
   - Requires explicit confirmation (`RESTORE_TO_ISOLATED_INSTANCE`) before executing.
   - Decrypts, validates SHA-256 integrity, applies roles, schema, and data, and runs sanity row-count queries.
3. **Application Verification**:
   - Verify row count in `User`, `gigs`, `Escrow`, `Transaction`, and `Notification` tables.
   - Verify foreign-key consistency and RLS policies.
   - Update `DATABASE_URL` and `DIRECT_URL` in Vercel only after end-to-end smoke test passes.

### C. Storage Recovery (Resumes & Assets) — Follow-Up Required
1. **Limitation**: Database logical dumps contain database records only; they **do not contain** files stored in Supabase Storage (`resumes`, `avatars`).
2. **Resumes Bucket**: Student PDF/DOCX resumes are stored in Supabase Storage under `/${userId}/${uuid}.${ext}`.
3. **Follow-Up Requirement**: Implement an out-of-band bucket sync or migration tool for `resumes` before storage volume grows significantly.

### D. Migration Rollback Standard
1. If a database migration fails during deployment:
   - Identify the failing statement in `prisma/migrations/`.
   - Never execute `prisma migrate reset` against production (destructive data wipe).
   - Author a forward-fixing migration or rollback script that preserves existing tables and applies safe schema alterations (`ALTER TABLE ... DROP COLUMN ...` or index removal).

---

## 7. Production Deployment Checklist

Before every production deployment:

- [ ] All automated tests pass: `npm test`
- [ ] TypeScript passes: `npm run type-check`
- [ ] ESLint passes: `npm run lint`
- [ ] Prisma schema is valid: `npx prisma validate`
- [ ] Production build succeeds: `npm run build`
- [ ] Environment variables verified in hosting platform (Vercel / Supabase):
  - `DATABASE_URL` / `DIRECT_URL`
  - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET`
  - `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
  - `CRON_SECRET`
  - `OPPORTUNITIES_AUTO_KEY`
- [ ] Supabase RLS Policies deployed and verified in live database:
  - Run `prisma/supabase_rls_policies.sql` in Supabase SQL Editor.
- [ ] Database migrations deployed to production database:
  - Run `npx prisma migrate deploy`.
- [ ] Verify Sentry error monitoring integration is active and reporting.

---

## 8. Periodic Maintenance Tasks

| Frequency | Task | Procedure |
| :--- | :--- | :--- |
| **Weekly** | Error Log Review | Inspect Sentry and Vercel logs for unhandled 500s or anomalous 429 bursts. |
| **Bi-Weekly** | Dependency Audit | Run `npm audit` and evaluate updates for high/critical advisories. |
| **Monthly** | Database Backup Drill | Test restoring from Supabase automated backups / PITR to a staging database. |
| **Monthly** | Database Performance Review | Inspect slow queries, index hit ratios, and connection pool saturation. |
| **Quarterly** | Secret Rotation | Rotate cron secrets, API service keys, and webhook signing secrets. |
| **Quarterly** | Security & Penetration Audit | Re-run automated penetration test suite (`src/__tests__/security-pen.test.ts`). |

---

## 9. Live Production Launch Gate Verification Records

The following gates were verified against the live production infrastructure:

### A. Live Row-Level Security (RLS) & Column Security Verification
- **Verified Status**: **PASS**
- **RLS Enabled**: Verified across 47 public tables, including `User`, `Escrow`, `Transaction`, `Notification`, `messages`, `applications`, `ResumeAnalysis`, `SavedGig`, and `ModerationEvent`.
- **User Row Isolation**: `user_select_policy` restricts SELECT to `auth.uid() = id`.
- **Sensitive Column Protection**: `REVOKE SELECT ("accNumber", "ifscCode", "bankName", "upiId", "resumeData") ON "User" FROM anon, authenticated;` executed and verified via `information_schema.column_privileges`.

### B. Database Backup & Disaster Recovery Baseline
- **Supabase Plan**: Supabase Free Tier (intentional business decision; no paid PITR or dashboard automated backups).
- **External Automated Backup Safety Net**: Implemented via `.github/workflows/database-backup.yml` (daily 02:00 UTC, OpenSSL AES-256-CBC encrypted, off-site private Google Drive storage).
- **PostgreSQL Engine Archiving Telemetry**: Base image reports `archive_mode = on` with 1,854 WAL segments archived internally; dashboard PITR rollback is not available on the Free tier.
- **Restoration Drill**: Live production restore is strictly prohibited by safety policy (`RESTORE DRILL: NOT EXECUTED ON PRODUCTION — production safety restriction`); verified via local dry-run pipeline test and documented runbook using `scripts/restore-db.sh`.

### C. Live Database Query Plan Validation
- Verified with `EXPLAIN (ANALYZE, BUFFERS)`:
  - `Index Scan using "Notification_userId_createdAt_idx" on "Notification"` (cost: 0.14..2.36, exec time: 0.087ms)
  - `Index Scan using "Follows_followingId_idx" on "Follows"` (cost: 0.14..2.35, exec time: 0.831ms)
  - `Index Scan using "UserSkill_skillId_idx" on "UserSkill"` (cost: 0.14..2.35, exec time: 0.087ms)
  - `Index Scan using "GigSkill_skillId_idx" on "GigSkill"` (cost: 0.14..2.36, exec time: 0.085ms)

### D. Staging Multi-Stage Load Test Metrics
Tested against standalone staging production server (`autocannon`):
- **10 VUs (Warm-up)**: 7.14 req/sec, 107 total requests, p50: 1,223ms, p95: 2,218ms, 0 errors.
- **25 VUs (Sustained Low)**: 14.20 req/sec, 284 total requests, p50: 1,423ms, p95: 4,443ms, 0 errors.
- **50 VUs (Sustained Mid)**: 26.15 req/sec, 523 total requests, p50: 1,642ms, p95: 3,114ms, 0 errors.
- **100 VUs (Peak)**: 15.60 req/sec, 234 total requests, p50: 4,872ms, p95: 8,181ms, 0 errors.
- **200 VUs (Stress)**: Reached concurrency limit of single-process Node instance over WAN connection to Singapore pooler; multi-instance horizontal scaling recommended for >100 VUs.

