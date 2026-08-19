# Supabase Database Monitoring

The primary bottleneck for Next.js Serverless architectures is PostgreSQL database connections.

## 1. Connection Pool (PgBouncer) Saturation
**Threshold:** Active connections > 80% of pool limit.
- **Symptom:** Next.js throws `PrismaClientInitializationError` or timeout errors.
- **Resolution:** Supabase uses PgBouncer on port 6543 natively. Ensure `DATABASE_URL` uses the pooler connection string with `?pgbouncer=true`. Monitor the "Active Connections" chart in Supabase under Database Health.

## 2. Compute (CPU & Memory)
**Threshold:** > 75% sustained CPU.
- **Symptom:** Database response latency skyrockets, causing Vercel 504s.
- **Resolution:** This is usually caused by unoptimized queries (Missing Indexes). Check the Supabase "Query Performance" tab to find slow queries (e.g. filtering Gigs by unindexed strings).

## 3. Storage
**Threshold:** > 85% of allocated disk size.
- Ensure the database auto-scales or triggers a PagerDuty alert before 95%, as a full disk will corrupt the database and cause an unrecoverable crash requiring a PITR restore.
