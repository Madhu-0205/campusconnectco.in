# Vercel Production Monitoring

Because CampusConnect uses Vercel for hosting, the primary layer of operational monitoring exists in the Vercel Dashboard.
(Programmatic access via Vercel CLI was not authenticated during this audit).

## Manual Verification & Monitoring Steps

### 1. Deployment State
- Navigate to the **Vercel Dashboard -> CampusConnect -> Deployments**.
- Verify that the `Production` deployment corresponds exactly to the `main` branch HEAD commit.
- Ensure the deployment URL maps to `https://www.campusconnectco.in`.

### 2. Runtime Logs
- Open the **Logs** tab in Vercel.
- Filter by `Environment: Production`.
- Monitor for any `5xx` errors, unhandled rejections, or memory exhaustion (`Function execution took X ms and timed out`).

### 3. Serverless Function Metrics
- Go to the **Functions** tab.
- Monitor execution times for:
  - `/api/checkout/webhook`
  - `/api/ai/*` (These are likely the heaviest).
- Look for frequent timeouts (Vercel hobby limits to 10s, Pro to 15s-300s depending on config).

### 4. Environment Variables
- Go to **Settings -> Environment Variables**.
- Verify `NODE_ENV=production`.
- Verify no secrets (like `RAZORPAY_KEY_SECRET`) are mistakenly committed or printed in logs.
