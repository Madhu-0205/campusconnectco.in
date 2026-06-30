# CampusConnect SRE & Operations Runbook

This runbook documents operational procedures for handling alerts, managing outages, and executing database tasks.

---

## 🏥 1. System Health Indicators
Probes are located at:
- Liveness: `/api/live` (Checks Next.js server status).
- Readiness: `/api/ready` (Checks Database/Redis connections).
- Subsystems: `/api/health` (Exhaustive checks).

---

## 🚨 2. Playbooks for Common Alerts

### Alert: Database CPU Spike (>85%)
1. **Identify slow queries:** Run the PG stats statement check via the Supabase SQL editor:
   ```sql
   SELECT query, calls, total_exec_time FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 5;
   ```
2. **Action:** Check if table indexes exist for high-frequency filters in `schema.prisma`. Ensure connection pooling limits are active (`connection_limit=5`).

### Alert: High Rate of 429 Too Many Requests
1. **Check logs:** Look for `RATE_LIMIT_TRIGGERED` security audit logs:
   ```bash
   GET /api/admin/audit-logs
   ```
2. **Action:** Verify if a specific IP address is spamming requests. If necessary, configure a block rule in Vercel Firewall.

### Alert: AI Provider Connection Timeouts
1. **Identify the source:** Check if Groq or OpenAI is returning 500s.
2. **Action:** The system will automatically fall back to local embedding vectors. Verify if API keys have expired or reached spending limits.
