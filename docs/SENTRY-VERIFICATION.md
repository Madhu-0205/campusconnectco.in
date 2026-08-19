# Sentry Verification Runbook

This document details the secure procedure for verifying that Sentry is actively ingesting live production errors from the Vercel Edge.

## 1. Triggering a Test Event
To prevent malicious actors from artificially inflating your Sentry quota or triggering false-positive incidents, a secure test route is required.

Run the following command against the production endpoint:

```bash
curl -X GET "https://www.campusconnectco.in/api/test-error?token=YOUR_CRON_SECRET"
```

## 2. Validation
- Open the Sentry Dashboard.
- Navigate to the **Issues** tab.
- Search for `Error: Sentry Live Ingestion Verification Test`.
- Ensure the `environment` tag is strictly `production`.
- Ensure the `release` tag accurately reflects `v1.0.0-production`.

## 3. PII & Source Map Hygiene
While viewing the error, verify:
- No environment variables (e.g., `DATABASE_URL`) are visible in the context.
- User IP addresses are scrubbed (if configured).
- The stack trace points correctly to the TypeScript file (`src/app/api/test-error/route.ts`), proving that Vercel uploaded the source maps correctly during the build phase.
