# Vercel Production Monitoring Runbook

As a serverless Edge deployment, Vercel obfuscates traditional server metrics (RAM/CPU) but exposes critical Edge runtime telemetry. 

## 1. 5xx Error Rates (Edge & Serverless)
**Threshold:** > 1% of total requests over a 5-minute rolling window.
- **504 Gateway Timeout:** The Node.js Serverless function exceeded the maximum execution time (15s on Hobby, 60s on Pro). Often caused by long-running Prisma DB queries or blocking Razorpay webhook validations.
- **502 Bad Gateway:** The function crashed. Check the Vercel Logs tab for unhandled exceptions or memory limit overflows (1024MB default).

## 2. P75 / P99 Latency
**Threshold:** > 800ms for dynamic routes.
- Utilize the Vercel Analytics dashboard to monitor latency histograms. 
- If P99 spikes but P75 remains stable, investigate Edge function cold starts or database connection pool latency in Supabase.

## 3. Function Invocation & Bandwidth
**Threshold:** Sudden 10x traffic spikes.
- Vercel bills on Edge Function invocations and bandwidth. Ensure `/api/health` monitoring interval (e.g. 1 min) does not artificially inflate the bill beyond acceptable limits (approx. 43,000 invocations/month per monitor).
