# Supabase Production Monitoring

CampusConnect uses Supabase for PostgreSQL. Programmatic access to the Supabase CLI is currently not authenticated, requiring manual verification through the Supabase Dashboard.

## Connection Management & Prisma Guardrails
The application is pre-configured with robust connection safeguards:
- **Connection Limit Enforcement**: `DB_CONNECTION_LIMIT` restricts Prisma from exhausting the pgBouncer pool.
- **Timeouts**: Configured for pool timeouts, connect timeouts, and keepalive metrics.
- **Retry Logic**: Transient connection drops (e.g. `P1001`, `P1017`) are automatically retried via exponential backoff in `src/lib/prisma.ts`.
- **Stateless Health Checks**: `/api/health` intentionally bypasses the database to avoid DDOSing the connection pool during high traffic monitoring.

## Manual Verification Steps (Dashboard)

### 1. PITR (Point-in-Time Recovery)
PITR is crucial for recovering from accidental destructive migrations.
**Action:** 
1. Open Supabase Dashboard -> CampusConnect Project -> Database -> Backups.
2. Verify PITR is **Enabled** (Requires Pro plan or higher).

### 2. Daily Backups
If PITR is not an option due to billing constraints, Daily Backups must be verified.
**Action:** 
1. In the Backups tab, verify the schedule and ensure recent backups have completed without errors.

### 3. Resource & Connection Monitoring
**Action:** 
1. Go to the **Reports** tab -> **Database**.
2. Monitor the active **Connections** against the max pool size. If the pool frequently hits maximum limits, consider increasing `DB_CONNECTION_LIMIT` locally or upgrading the instance size in Supabase.
3. Keep an eye on memory and CPU to avoid unexpected OOM kills under load.
