# Performance Baseline

These metrics represent a baseline of the production CampusConnect application.

## Measurements
- **URL Tested:** https://www.campusconnectco.in
- **Timestamp:** 2026-08-19

| Metric | Score/Value | Status |
|--------|-------------|--------|
| Overall Performance | 85/100 | 🟡 Needs Improvement |
| FCP (First Contentful Paint) | 1.2 s | 🟢 |
| LCP (Largest Contentful Paint) | 3.1 s | 🟡 |
| TTI (Time to Interactive) | 2.5 s | 🟢 |
| TBT (Total Blocking Time) | 150 ms | 🟢 |
| CLS (Cumulative Layout Shift) | 0.05 | 🟢 |

## Recommendations
* Review Next.js `next/image` usage for LCP elements. Ensure `priority=true` is set on above-the-fold hero images.
* Monitor real-user Core Web Vitals (CWV) via Vercel Analytics once traffic stabilizes.
