# First 24-Hour Launch Runbook

The first 24 hours of production traffic carry the highest risk for capacity failures, unhandled Edge cases, and dependency limits.

## 0 - 1 Hours (Hyper-Vigilance)
*   **Vercel:** Open Logs panel. Filter by `Status: 5xx`. Monitor Edge latency histograms.
*   **Supabase:** Open Database Health. Monitor CPU spikes. Monitor PgBouncer connection saturation.
*   **Sentry:** Watch the Issues feed. Triage any `HydrationError` or 401 Unauthorized loops immediately.
*   **Razorpay:** Initiate a final $1 test-mode transaction. Ensure the Webhook hits CampusConnect and resolves HTTP 200.
*   **Uptime:** Verify the external monitor successfully pings `/api/health`.

## 1 - 6 Hours (Trend Analysis)
*   **Traffic Flow:** Ensure College and Internship directories are correctly fetching public data (cache HITs).
*   **Database:** Check Supabase query performance for N+1 issues or slow sequential scans.
*   **Auth:** Monitor the Vercel logs for any spikes in OAuth or Supabase authentication failures.

## 6 - 24 Hours (Baseline Establishment)
*   **CWV:** Review the Vercel Web Analytics tab to establish the P75 baseline for LCP and INP across real user devices.
*   **Payments:** Review the Razorpay dashboard for any Webhook retry loops (indicates CampusConnect is dropping/failing webhooks).
*   **Escalation:** If Supabase CPU sustains > 75%, or Vercel 5xx rate > 2%, immediately escalate to the Senior Platform Engineer.
