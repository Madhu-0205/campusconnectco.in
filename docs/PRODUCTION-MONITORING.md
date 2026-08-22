# Production Uptime Monitoring Configuration

CampusConnect has a dedicated health endpoint at `https://www.campusconnectco.in/api/health`.

Since we do not have programmatic access to an uptime provider (like Better Uptime, Datadog, or Pingdom), you must configure this manually.

## Configuration Steps

1. **Create a Monitor**
   - **Type:** HTTP(S) GET
   - **URL:** `https://www.campusconnectco.in/api/health`

2. **Thresholds & Requirements**
   - **Check Interval:** `1 minute` (highly recommended for production).
   - **Timeout:** `<= 10 seconds` (The endpoint responds in ~300ms under normal conditions).
   - **Expected Status:** `200 OK`.

3. **Alerting & Escalation**
   - Configure alerts to trigger after `2 consecutive failures` (to avoid flapping alerts).
   - Route alerts to PagerDuty, Slack, or email for the operations team.
   - Configure a recovery notification ("Monitor is UP").

## Incident Runbook
If the monitor alerts:
1. Check Vercel logs to see if it's a platform issue or a database connection exhaustion issue.
2. Manually verify `https://www.campusconnectco.in/api/health`.
3. If database related, check Supabase connection pool usage.
