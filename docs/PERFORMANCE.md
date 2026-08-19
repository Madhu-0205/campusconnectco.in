# CampusConnect Web Performance & Core Web Vitals (CWV)

This document establishes the performance SLAs and measurement strategies for the production deployment. Do NOT run Lighthouse on local development builds, as the Webpack overhead makes the metrics invalid.

## Target Thresholds (Mobile 3G & Desktop)
- **TTFB (Time to First Byte):** < 800ms
- **LCP (Largest Contentful Paint):** < 2.5s
- **CLS (Cumulative Layout Shift):** < 0.1
- **INP (Interaction to Next Paint):** < 200ms

## Measurement Strategy
1. **Lab Data (Synthetic):** 
   - Open Chrome Incognito.
   - Run Lighthouse against `https://www.campusconnectco.in/`.
   - Run Lighthouse against a dynamic route (e.g. `/colleges/test-college-123`).
2. **Field Data (Real User Monitoring):**
   - Vercel Web Analytics aggregates INP, CLS, and LCP from real end-user devices. 
   - Wait 48 hours post-launch to establish a baseline.

## Optimization Guidelines
- **Images:** Always use Next.js `<Image />` component. Prioritize `priority={true}` on LCP hero images.
- **Caching:** Only use `unstable_cache` on public static content (like College directories). Never cache authenticated routes, as this compromises PII and IDOR boundaries.
