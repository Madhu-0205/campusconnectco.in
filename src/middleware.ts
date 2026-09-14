import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import {
  authLimiter,
  generalApiLimiter,
  aiLimiter,
  resumeParseLimiter,
  searchLimiter,
  uploadLimiter,
  paymentLimiter,
  publicFormLimiter,
  type RateLimitResult,
} from '@/lib/rate-limit';
import { validateEnv } from '@/lib/security/env-validator';
import { updateSession } from '@/lib/supabase/middleware';

function buildRateLimitResponse(message: string, result: RateLimitResult): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: message }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.reset),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.reset),
      },
    }
  );
}

export async function proxy(request: NextRequest) {
  validateEnv(true);
  const path = request.nextUrl.pathname;

  // Generate Request ID and Correlation ID for observability
  const requestId = crypto.randomUUID();
  const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();

  // Inject into request headers
  request.headers.set('x-request-id', requestId);
  request.headers.set('x-correlation-id', correlationId);

  const ip = (request as any).ip || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

  const isDev = process.env.NODE_ENV === 'development';
  const shouldRateLimit = process.env.DISABLE_RATE_LIMIT !== 'true';
  let activeRateLimitInfo: RateLimitResult | null = null;

  if (shouldRateLimit) {
    // 1. Payment & Escrow routes (high risk)
    const isPaymentRoute = path.startsWith('/api/checkout') || path.startsWith('/api/payments');
    if (isPaymentRoute && path !== '/api/checkout/webhook') {
      const result = await paymentLimiter.checkWithInfo(ip);
      activeRateLimitInfo = result;
      if (!result.ok) {
        console.warn(`[SECURITY_AUDIT] ${JSON.stringify({
          timestamp: new Date().toISOString(),
          event: "RATE_LIMIT_TRIGGERED",
          ipAddress: ip,
          requestId,
          correlationId,
          metadata: { path, context: "payment-limiter" }
        })}`);
        return buildRateLimitResponse('Too many payment operations. Please wait before trying again.', result);
      }
    }

    // 2. Public form submission (anti-spam)
    if (path === '/api/colleges/submit') {
      const result = await publicFormLimiter.checkWithInfo(ip);
      activeRateLimitInfo = result;
      if (!result.ok) {
        return buildRateLimitResponse('Too many submissions. Please try again later.', result);
      }
    }

    // 3. Authentication endpoints (strict limit on auth actions)
    const isAuthAction =
      path.startsWith('/auth/callback') ||
      path.startsWith('/api/user/profile') ||
      path.startsWith('/api/founder/verify-role') ||
      (path.startsWith('/auth') && request.method === 'POST');

    if (isAuthAction) {
      const result = await authLimiter.checkWithInfo(ip);
      activeRateLimitInfo = result;
      if (!result.ok) {
        console.warn(`[SECURITY_AUDIT] ${JSON.stringify({
          timestamp: new Date().toISOString(),
          event: "RATE_LIMIT_TRIGGERED",
          ipAddress: ip,
          requestId,
          correlationId,
          metadata: { path, context: "auth-limiter" }
        })}`);
        return buildRateLimitResponse('Too many authentication attempts. Please try again later.', result);
      }
    }

    // 4. Heavy file parsers
    if (path === '/api/ai/parse-resume' || path === '/api/ai/parse-file') {
      const result = await resumeParseLimiter.checkWithInfo(ip);
      activeRateLimitInfo = result;
      if (!result.ok) {
        console.warn(`[SECURITY_AUDIT] ${JSON.stringify({
          timestamp: new Date().toISOString(),
          event: "RATE_LIMIT_TRIGGERED",
          ipAddress: ip,
          requestId,
          correlationId,
          metadata: { path, context: "resume-parser-limiter" }
        })}`);
        return buildRateLimitResponse('Daily file upload limit reached. Please try again tomorrow.', result);
      }
    }

    // 5. Costly AI endpoints
    if (path.startsWith('/api/ai') && path !== '/api/ai/parse-resume' && path !== '/api/ai/parse-file') {
      const result = await aiLimiter.checkWithInfo(ip);
      activeRateLimitInfo = result;
      if (!result.ok) {
        console.warn(`[SECURITY_AUDIT] ${JSON.stringify({
          timestamp: new Date().toISOString(),
          event: "RATE_LIMIT_TRIGGERED",
          ipAddress: ip,
          requestId,
          correlationId,
          metadata: { path, context: "ai-limiter" }
        })}`);
        return buildRateLimitResponse('Too many AI requests. Please try again later.', result);
      }
    }

    // 6. Search and college browsing
    if (path.startsWith('/api/search') || (path.startsWith('/api/colleges') && path !== '/api/colleges/submit')) {
      const result = await searchLimiter.checkWithInfo(ip);
      activeRateLimitInfo = result;
      if (!result.ok) {
        console.warn(`[SECURITY_AUDIT] ${JSON.stringify({
          timestamp: new Date().toISOString(),
          event: "RATE_LIMIT_TRIGGERED",
          ipAddress: ip,
          requestId,
          correlationId,
          metadata: { path, context: "search-limiter" }
        })}`);
        return buildRateLimitResponse('Too many search requests. Please try again later.', result);
      }
    }

    // 7. File uploads & application submissions
    if (path.startsWith('/api/applications/apply') || path.startsWith('/api/internal/import-internship') || path === '/api/upload') {
      const result = await uploadLimiter.checkWithInfo(ip);
      activeRateLimitInfo = result;
      if (!result.ok) {
        console.warn(`[SECURITY_AUDIT] ${JSON.stringify({
          timestamp: new Date().toISOString(),
          event: "RATE_LIMIT_TRIGGERED",
          ipAddress: ip,
          requestId,
          correlationId,
          metadata: { path, context: "upload-limiter" }
        })}`);
        return buildRateLimitResponse('Too many file uploads or operations. Please try again later.', result);
      }
    }

    // 8. General API routes
    const isSpecializedApi =
      isPaymentRoute ||
      path === '/api/colleges/submit' ||
      isAuthAction ||
      path.startsWith('/api/ai') ||
      path.startsWith('/api/search') ||
      path.startsWith('/api/applications/apply') ||
      path.startsWith('/api/internal/import-internship') ||
      path === '/api/upload' ||
      path.startsWith('/api/colleges');

    if (path.startsWith('/api') && path !== '/api/health' && path !== '/api/ready' && path !== '/api/live' && !isSpecializedApi) {
      const result = await generalApiLimiter.checkWithInfo(ip);
      activeRateLimitInfo = result;
      if (!result.ok) {
        return buildRateLimitResponse('Too many requests. Please try again later.', result);
      }
    }
  }

 // 1. Generate a secure cryptographic nonce
 const nonce = btoa(crypto.randomUUID());

 // 2. Set the x-nonce in request headers so Server Components can read it
 request.headers.set('x-nonce', nonce);

 // Run the Supabase session handler with the modified request headers
 const response = await updateSession(request);

 // 3. Construct Content-Security-Policy (CSP)
 const cspElements = [
"default-src 'none'",
"manifest-src 'self'",
 `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: https://js.puter.com https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://accounts.google.com https://apis.google.com ${isDev ?"'unsafe-eval'" :""}`,
"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
"img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://i.pravatar.cc https://ui-avatars.com https://avatars.githubusercontent.com https://lh3.googleusercontent.com https://*.amazonaws.com https://images.unsplash.com https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com https://www.googletagmanager.com https://www.google-analytics.com",
 `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.supabase.in https://*.puter.com wss://*.puter.com https://api.puter.com wss://api.puter.com https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://va.vercel-scripts.com https://vitals.vercel-insights.com https://accounts.google.com https://oauth2.googleapis.com https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com https://api.pwnedpasswords.com${isDev ?" ws://localhost:* ws://127.0.0.1:*" :""}`,
"font-src 'self' https://fonts.gstatic.com data:",
"frame-src 'self' https://checkout.razorpay.com https://accounts.google.com https://puter.com https://*.puter.com",
"object-src 'none'",
"base-uri 'none'",
"form-action 'self'",
"worker-src 'self' blob:"
 ];

 if (!isDev) {
 cspElements.push("upgrade-insecure-requests");
 }

 const csp = cspElements.join('; ');

 // 4. Apply Security Headers to Response
 response.headers.set('Content-Security-Policy', csp);
 if (!isDev) {
 response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
 }
 response.headers.set('X-Content-Type-Options', 'nosniff');
 response.headers.set('X-Frame-Options', 'DENY');
 response.headers.set('X-XSS-Protection', '1; mode=block');
 response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
 response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
 response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
 response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

 // Also forward the x-nonce in response headers so we can verify it
 response.headers.set('x-nonce', nonce);
 response.headers.set('x-request-id', requestId);
 response.headers.set('x-correlation-id', correlationId);

  // Attach rate limit telemetry headers if available
  if (activeRateLimitInfo) {
    response.headers.set('X-RateLimit-Limit', String(activeRateLimitInfo.limit));
    response.headers.set('X-RateLimit-Remaining', String(activeRateLimitInfo.remaining));
    response.headers.set('X-RateLimit-Reset', String(activeRateLimitInfo.reset));
  }

 return response;
}

export const config = {
 matcher: [
  /*
   * Match all request paths except for public assets and metadata files.
   * This avoids redirecting browser metadata and PWA resources to /auth/sign-in.
   */
   '/((?!_next/.*|maplibre/.*|favicon.ico|favicon.svg|apple-touch-icon.png|site.webmanifest|manifest.webmanifest|robots.txt|sitemap.xml|sitemap-index.xml|opensearch.xml|sw.js|images/.*|icons/.*|fonts/.*|logos/.*|assets/.*|static/.*|.*\\.(?:mjs|js|svg|png|jpg|jpeg|gif|webp|ico|json|xml|txt|webmanifest)$).*)',
  ],
};

export default proxy;
