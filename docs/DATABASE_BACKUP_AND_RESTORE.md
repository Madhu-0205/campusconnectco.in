# CampusConnect — Database Backup & Disaster Recovery Runbook
**Target Infrastructure**: Supabase Free Tier (PostgreSQL)  
**Off-Site Backup Destination**: Private Google Drive (Temporary Early-Stage Architecture)  
**Classification**: Production Disaster Recovery Procedure  
**Last Updated**: September 2026

---

## 1. Executive Summary & Architecture

CampusConnect operates intentionally on the **Supabase Free Tier**. Under this plan:
* **No Managed Automatic Backups**: Supabase Free does **not** include automated daily dashboard snapshots or Point-in-Time Recovery (PITR).
* **Self-Managed Safety Net**: To ensure business continuity and guard against catastrophic data loss or accidental deletion, CampusConnect maintains an external, automated, encrypted, off-site database backup pipeline powered by GitHub Actions.
* **Temporary Destination**: We utilize an existing private **5 TB Google Drive** storage as a zero-cost, temporary off-site disaster-recovery destination until user and transaction volume justifies upgrading to paid managed infrastructure (Supabase Pro + PITR + dedicated object storage).

### Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Free PostgreSQL                │
│                 (Direct Connection via Secret)              │
└──────────────────────────────┬──────────────────────────────┘
                               │
            Daily at 02:00 UTC │ (GitHub Actions Runner)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Supabase CLI Dumps:                                      │
│    - roles.sql   (supautils-safe cluster roles)             │
│    - schema.sql  (public schema DDL, RLS, functions)        │
│    - data.sql    (public table rows via replica session)    │
│ 2. Integrity Verification (non-empty validation)            │
│ 3. tar.gz compression + SHA-256 Checksum Calculation         │
│ 4. Client-Side Encryption: OpenSSL AES-256-CBC (PBKDF2)     │
│ 5. Immediate Runner Sanitization (scrub plaintext SQL)      │
│ 6. Decryption Loopback Test (ensures backup can be read)    │
│ 7. Generate safe metadata.json (zero secrets)               │
└──────────────────────────────┬──────────────────────────────┘
                               │
            Google Drive API   │ (OAuth 2.0: scope drive.file)
            Resumable Upload   │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Private Google Drive Storage                │
│                                                             │
│   CampusConnect Backups/ (Root Folder ID)                   │
│   └── database/                                             │
│       └── daily/                                            │
│           └── YYYY-MM-DD/                                   │
│               ├── campusconnect_backup_*.tar.gz.enc         │
│               ├── campusconnect_backup_*.tar.gz.sha256      │
│               └── metadata.json                             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  30-Day Retention Policy                    │
│     (Automated pruning of YYYY-MM-DD folders >30 days)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Schedule, RPO & RTO Expectations

| Metric | Specification | Operational Reality |
| :--- | :--- | :--- |
| **Backup Schedule** | Daily at 02:00 UTC (07:30 IST) | Low-traffic window to minimize connection pool contention. |
| **Manual Trigger** | Supported via `workflow_dispatch` | Operators can trigger ad-hoc backups before migrations. |
| **Recovery Point Objective (RPO)** | **~24 Hours** | In the worst-case disaster (e.g. database corruption at 01:59 UTC), up to 24 hours of transactions and messages could be lost. **Zero data loss and PITR are NOT provided on Supabase Free.** |
| **Recovery Time Objective (RTO)** | **1 to 2 Hours** | Time required to download the backup from Google Drive, decrypt, apply schema/data to an isolated recovery instance, and verify application integrity. |

---

## 3. Cryptographic & Security Model

1. **Client-Side Encryption Standard**:
   - Algorithm: **AES-256-CBC** with dynamic salt.
   - Key Derivation Function: **PBKDF2** with **100,000 hash iterations** (`-pbkdf2 -iter 100000`).
   - Tool: OpenSSL (standard, audited, universally accessible on Linux and macOS).
2. **Key Storage & Management**:
   - The encryption passphrase is stored strictly in GitHub Secrets as `BACKUP_ENCRYPTION_KEY`.
   - The key is **NEVER** committed to Git, printed in workflow logs, or stored in Google Drive alongside backups.
   - Recommended passphrase generation:
     ```bash
     openssl rand -base64 32
     ```
3. **Workspace Sanitization**:
   - Plaintext `.sql` dumps and unencrypted `.tar.gz` archives are scrubbed from the runner filesystem immediately after encryption.
   - Even if subsequent steps fail, a trap handler (`if: always()`) purges the scratch directory.

---

## 4. Google Drive Authentication & Least Privilege

The backup pipeline uses Google's official Drive API v3 with OAuth 2.0 and the **narrowest possible scope**:

> **`https://www.googleapis.com/auth/drive.file`**

### Security Guarantees:
- **Zero Access to Personal Files**: The backup workflow CANNOT read, search, list, or delete your personal Google Drive documents, sheets, photos, or files.
- **Strict Scope Isolation**: The workflow ONLY has access to files and folders that the backup application itself creates, or files placed within the designated backup folder.
- **Zero Access to Other Google Services**: No access to Gmail, Google Contacts, Google Calendar, or other Google APIs.

---

## 5. Required GitHub Secrets Configuration

Configure the following secrets in **GitHub Repository → Settings → Secrets and variables → Actions**:

| Secret Name | Status | Source / Description |
| :--- | :--- | :--- |
| `DIRECT_URL` | **Already Configured** | Supabase direct database connection string (port 5432, unpooled). The workflow automatically reuses the existing `DIRECT_URL` (or `DATABASE_URL`) secret. |
| `BACKUP_ENCRYPTION_KEY` | **Action Required** | A 32-byte high-entropy passphrase used for AES-256-CBC encryption. Generate locally with: `openssl rand -base64 32`. Keep a secure copy in your team password manager. |
| `GOOGLE_DRIVE_CLIENT_ID` | **Action Required** | OAuth 2.0 Client ID from Google Cloud Console. |
| `GOOGLE_DRIVE_CLIENT_SECRET` | **Action Required** | OAuth 2.0 Client Secret from Google Cloud Console. |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | **Action Required** | One-time OAuth refresh token generated via `node scripts/google-drive-auth-helper.js`. |
| `GOOGLE_DRIVE_FOLDER_ID` | *Optional (Auto-Discovered)* | The ID of the private folder in your Google Drive named `CampusConnect Backups`. The backup script automatically discovers or creates this folder under `drive.file` (Verified App Root ID: `1HOEunwOXA_g9ROLEwS0-NY0qeIPrcpni`). |

> [!NOTE]
> If Google Drive secrets are not yet configured, the workflow will validate, compress, encrypt, and verify the backup locally on the runner, but will warn that the upload step requires one-time Google Drive secret setup.

---

## 6. One-Time Manual Setup Guide (Google Drive & OAuth)

Follow these 4 simple steps to connect your private Google Drive:

### Step A: Google Cloud Console Setup (2 Minutes)
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `campusconnect-backups` (or select an existing project).
3. In the left sidebar, navigate to **APIs & Services → Library**.
4. Search for **Google Drive API** and click **Enable**.

### Step B: Configure OAuth Consent Screen
1. In the left sidebar, go to **APIs & Services → OAuth consent screen**.
2. Select **External** (or **Internal** if using Google Workspace) and click **Create**.
3. Enter App name: `CampusConnect Backup Automation`, and provide your user support email.
4. Click **Save and Continue** until you reach the **Scopes** page.
5. Click **Add or Remove Scopes**, search for `drive.file` (`.../auth/drive.file`), select it, and click **Update**.
6. If using **External** user type: On the **Test users** page, click **Add Users** and add your own Google email address. Click **Save and Continue**.

### Step C: Create OAuth 2.0 Credentials
1. Go to **APIs & Services → Credentials**.
2. Click **Create Credentials → OAuth client ID**.
3. Select Application type: **Desktop app** (or **Web application** with redirect URI `http://localhost:8085`).
4. Enter Name: `CampusConnect Backup CLI`.
5. Click **Create**. Copy your **Client ID** and **Client Secret**.

### Step D: Create Backup Folder & Generate Refresh Token
1. Open your Google Drive in a web browser.
2. Create a new private folder named `CampusConnect Backups`.
3. Open the folder and copy the **Folder ID** from your browser address bar:
   `https://drive.google.com/drive/folders/`**`1a2b3c4d5e6f7g8h9...`** (the bold part is your `GOOGLE_DRIVE_FOLDER_ID`).
4. Run the local interactive helper on your terminal:
   ```bash
   node scripts/google-drive-auth-helper.js
   ```
5. Enter your Client ID and Client Secret, click the browser authorization link to log into your Google account, and copy the printed `GOOGLE_DRIVE_REFRESH_TOKEN`.
6. Add all four secrets to GitHub Actions repository secrets.

---

## 7. Retention Policy

* **Daily Retention**: Backups are retained in Google Drive for **30 days**.
* **Pruning Mechanism**:
  1. The backup job inspects subfolders inside `CampusConnect Backups/database/daily/`.
  2. It targets only subfolders strictly matching the `YYYY-MM-DD` date pattern.
  3. Folders older than 30 days are safely moved to Trash via the Google Drive API (`PATCH /files/{id} { trashed: true }`).
  4. **Strict Isolation**: The retention cleaner never touches or scans any file or folder outside `CampusConnect Backups/database/daily/`.

---

## 8. Safe Database Restore Procedure (Runbook)

> [!CAUTION]
> **CRITICAL PRODUCTION SAFETY RULE:**
> **NEVER RESTORE A BACKUP DIRECTLY OVER THE LIVE PRODUCTION DATABASE.**
> A backup restore replaces existing tables and data. Always restore into an **isolated recovery instance or staging Supabase project** first to verify data integrity before initiating any production traffic cutover.

### Step-by-Step Restoration Workflow

#### Step 1: Provision an Isolated Target
Create a fresh project in Supabase (or a local Docker PostgreSQL container) to serve as the recovery target. Obtain its connection string:
```text
RECOVERY_DB_URL="postgresql://postgres:<PASSWORD>@<RECOVERY_HOST>:5432/postgres"
```

#### Step 2: Download the Encrypted Backup from Google Drive
1. Open your Google Drive in the web browser.
2. Navigate to `CampusConnect Backups → database → daily → [Target Date]`.
3. Download:
   - `campusconnect_backup_YYYYMMDD_HHMMSSZ.tar.gz.enc`
   - `campusconnect_backup_YYYYMMDD_HHMMSSZ.tar.gz.sha256`
   - `metadata.json` (optional, for audit review)
4. Place the downloaded files into your local directory.

#### Step 3: Run the Safe Restore Script
The repository provides a guarded restore script with an interactive safety check:
```bash
export BACKUP_ENCRYPTION_KEY="your-secret-encryption-passphrase"

./scripts/restore-db.sh \
  campusconnect_backup_20260913_020000Z.tar.gz.enc \
  campusconnect_backup_20260913_020000Z.tar.gz.sha256 \
  "$RECOVERY_DB_URL"
```

The script will:
1. Require you to explicitly type `RESTORE_TO_ISOLATED_INSTANCE` to confirm the target is safe.
2. Decrypt the archive in a temporary directory (`/tmp/cc-restore-XXXXXX`).
3. Verify the decrypted SHA-256 hash against `campusconnect_backup_*.tar.gz.sha256`.
4. Unpack `roles.sql`, `schema.sql`, and `data.sql`.
5. Apply cluster roles (skipping managed platform roles).
6. Apply the public schema structure.
7. Apply table data with session replication role enabled (`SET session_replication_role = replica;`).
8. Execute a sanity check query reporting row counts for `User`, `gigs`, `Transaction`, and `Notification`.
9. Scrub all plaintext files on exit.

#### Step 4: Verification & Smoke Testing
On the recovered database:
1. Verify Prisma schema alignment:
   ```bash
   DATABASE_URL="$RECOVERY_DB_URL" npx prisma migrate status
   ```
2. Verify Row-Level Security (RLS):
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
   ```
3. Verify key foreign-key relationships and balances in `Escrow` and `Transaction`.
4. Point a staging deployment at `$RECOVERY_DB_URL` and run automated smoke tests.

---

## 9. Storage Disaster Recovery — Follow-Up Required

> [!WARNING]
> **DATABASE BACKUP DOES NOT EQUAL STORAGE-OBJECT BACKUP**
> The PostgreSQL database backup contains application records and metadata (e.g. paths in `resumeData` or attachment URLs), but **DOES NOT CONTAIN** the binary files uploaded by users into Supabase Storage buckets.

### Supabase Storage Audit:
* **Buckets Identified**:
  - `resumes` (Private bucket storing student resumes/CVs under `/${userId}/${uuid}.${ext}`).
  - `avatars` (Public bucket referenced for user profile pictures).
* **Current Status**:
  - Live query against `storage.objects` confirmed **0 active files** currently stored.
  - An automated storage bucket replication is **NOT YET IMPLEMENTED** to prevent unnecessary costs while user uploads remain early-stage.

---

## 10. Authentication & Project-Level Configuration Limitations

A PostgreSQL logical restore recovers the `public` schema. It does **NOT** automatically reproduce Supabase platform-level settings. In a catastrophic recovery event (e.g. creating a new Supabase project), the following must be manually configured:

1. **Authentication Configuration**:
   - Google OAuth / GitHub OAuth Client IDs and Secrets.
   - Redirect URLs and Site URL (`https://campusconnectco.in`).
   - Email provider / SMTP credentials (Resend / AWS SES).
   - JWT secret and token lifetimes.
2. **Supabase Auth Users**:
   - `auth.users` contains password hashes and OAuth identity mappings. If migrating to a new Supabase project, user accounts must be exported/imported using the Supabase CLI (`supabase db dump --schema auth`) or Supabase Management API.
3. **Environment Secrets**:
   - Ensure all secrets (`SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_*`, `UPSTASH_*`) are re-linked in Vercel.

---

## 11. Operational Upgrade Triggers (When to Upgrade from Free)

CampusConnect should remain on this temporary Google Drive + Supabase Free setup while early-stage. The engineering team should initiate a migration to **Supabase Pro ($25/month) + Point-in-Time Recovery (PITR) + Dedicated Object Storage** when any of the following operational triggers are met:

1. **RPO Tolerance Decreases**: Business requires recovery point objective tighter than 24 hours (e.g., losing even 1 hour of gig transactions or escrow payments becomes unacceptable).
2. **Database Volume Growth**: Database disk usage approaches the 500 MB Free tier limit.
3. **Bandwidth / Egress Growth**: Egress approaches the 5 GB Free tier monthly limit.
4. **Storage Growth**: File uploads in `resumes` bucket approach the 1 GB Free tier limit.
5. **Operational Automation**: The team requires managed daily snapshots and point-in-time point-and-click rollback directly in the Supabase Dashboard.
6. **Backup Architecture Evolution**: Upgrading to continuous WAL archiving or S3-compatible cloud object storage when dedicated infrastructure budget is allocated.

---

## 12. Incident Recovery Checklist

In the event of a production data incident:

- [ ] **1. Freeze Ingress**: Temporarily enable maintenance mode or pause the Vercel production deployment to prevent further state corruption.
- [ ] **2. Identify Root Cause**: Determine if the issue is data corruption, accidental deletion, or a faulty migration.
- [ ] **3. Locate Latest Valid Backup**: In Google Drive, open `CampusConnect Backups/database/daily/` and select the most recent valid date folder.
- [ ] **4. Download Backup**: Download `.tar.gz.enc` and `.sha256`.
- [ ] **5. Provision Isolated Target**: Spin up a recovery Supabase project or staging database.
- [ ] **6. Run Restore Script**: Execute `./scripts/restore-db.sh` against the recovery target.
- [ ] **7. Verify Integrity**: Run row count and relation validation queries on the recovered database.
- [ ] **8. Smoke Test**: Connect staging environment and verify key user flows (login, view gigs, check transaction records).
- [ ] **9. Cut Over Production**:
  - Update `DATABASE_URL` and `DIRECT_URL` in Vercel to point to the validated recovered database.
  - Redeploy Vercel application.
- [ ] **10. Unpause Traffic & Monitor**: Monitor Sentry error streams and database connection telemetry for 60 minutes.
