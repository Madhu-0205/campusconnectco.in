# Sentry Configuration and Verification

Sentry has been integrated into the `campusconnectco.in` Next.js application using `@sentry/nextjs`.

## Codebase Configuration
The following items are handled programmatically in `sentry.client.config.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts`:
- **DSN Configuration:** Automatically pulls from `SENTRY_DSN` or `NEXT_PUBLIC_SENTRY_DSN`.
- **Environment Tagging:** Explicitly sets the `environment` context to `process.env.NODE_ENV`.
- **Sensitive Data Scrubbing:** `beforeSend` securely strips `authorization` and `cookie` headers from all events.
- **Session Replay (Client):** Masking is enabled for text and media to prevent PII leakage.
- **Source Maps & Releases:** Handled seamlessly by the Sentry webpack plugin configured in `next.config.ts`.

## Manual Verification (EXTERNAL)
Because there are no Sentry CLI credentials available, we cannot query the ingested events. 

To verify Sentry ingestion manually:
1. Ensure the `SENTRY_DSN` and `SENTRY_AUTH_TOKEN` environment variables are correctly populated in Vercel.
2. Trigger the test error endpoint:
   ```bash
   curl -sI https://www.campusconnectco.in/api/test-error
   ```
3. Open the Sentry Dashboard -> CampusConnect Project -> Issues.
4. Verify the event arrived, the environment says `production`, and no `authorization`/`cookie` headers are visible in the payload.
