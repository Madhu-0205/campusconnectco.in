# CampusConnect Production Monitoring Checklist

This document details how to configure external uptime monitoring for the CampusConnect production deployment. External monitoring guarantees that if the Vercel Edge Network or the Supabase database goes completely offline, the on-call engineers are automatically alerted via PagerDuty/Slack.

## Endpoint Details
**URL**: `https://www.campusconnectco.in/api/health`
**Method**: `GET`
**Expected Response**: `HTTP 200 OK`
**Response Body**: Sanitized health status (e.g. `{"status":"ok"}`). No secrets or internal stack traces are returned.

## Setup Instructions (Better Uptime / Pingdom)
1. Create a new HTTP(s) Monitor.
2. Enter the URL: `https://www.campusconnectco.in/api/health`.
3. Set the polling interval to **1 to 5 minutes**.
4. Set the timeout threshold to **10 seconds**.
5. Set the failure threshold to **2 consecutive failures** (prevents false positives during brief edge network blips).
6. Assign the notification channel (e.g. `#engineering-alerts` on Slack, or the primary PagerDuty rotation).
7. Configure a Recovery Notification so the team knows when the outage has resolved.

> [!WARNING]
> Do NOT hardcode third-party API keys or monitor configurations inside the CampusConnect repository. Monitoring is exclusively an external infrastructure responsibility.
