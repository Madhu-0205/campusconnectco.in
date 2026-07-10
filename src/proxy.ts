import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { authLimiter, generalApiLimiter, aiLimiter, resumeParseLimiter, searchLimiter, uploadLimiter } from '@/lib/rate-limit';
import { validateEnv } from '@/lib/security/env-validator';
import { updateSession } from '@/lib/supabase/middleware';

validateEnv(true);

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Generate Request ID and Correlation ID for observability
    const requestId = crypto.randomUUID();
    const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();

    // Inject into request headers
    request.headers.set('x-request-id', requestId);
    request.headers.set('x-correlation-id', correlationId);

    const ip = (request as any).ip || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // Apply strict rate limiting to authentication routes/endpoints
    const isAuthRoute = path.startsWith('/auth') || path.startsWith('/api/user/profile') || path.startsWith('/api/founder/verify-role');
    if (isAuthRoute) {
        const ok = await authLimiter.check(ip);
        if (!ok) {
            console.warn(`[SECURITY_AUDIT] ${JSON.stringify({
                timestamp: new Date().toISOString(),
                event: "RATE_LIMIT_TRIGGERED",
                ipAddress: ip,
                requestId,
                correlationId,
                metadata: { path, context: "auth-limiter" }
            })}`);

            return new NextResponse(
                JSON.stringify({ error: 'Too many authentication attempts. Please try again later.' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    // Apply strict rate limiting to file parser endpoints (heavy resources)
    if (path === '/api/ai/parse-resume' || path === '/api/ai/parse-file') {
        const ok = await resumeParseLimiter.check(ip);
        if (!ok) {
            console.warn(`[SECURITY_AUDIT] ${JSON.stringify({
                timestamp: new Date().toISOString(),
                event: "RATE_LIMIT_TRIGGERED",
                ipAddress: ip,
                requestId,
                correlationId,
                metadata: { path, context: "resume-parser-limiter" }
            })}`);

            return new NextResponse(
                JSON.stringify({ error: 'Daily file upload limit reached. Please try again tomorrow.' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    // Apply strict rate limiting to AI endpoints (costly resources)
    if (path.startsWith('/api/ai') && path !== '/api/ai/parse-resume' && path !== '/api/ai/parse-file') {
        const ok = await aiLimiter.check(ip);
        if (!ok) {
            console.warn(`[SECURITY_AUDIT] ${JSON.stringify({
                timestamp: new Date().toISOString(),
                event: "RATE_LIMIT_TRIGGERED",
                ipAddress: ip,
                requestId,
                correlationId,
                metadata: { path, context: "ai-limiter" }
            })}`);

            return new NextResponse(
                JSON.stringify({ error: 'Too many AI requests. Please try again later.' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    // Apply strict rate limiting to search endpoints (scraping protection)
    if (path.startsWith('/api/search')) {
        const ok = await searchLimiter.check(ip);
        if (!ok) {
            console.warn(`[SECURITY_AUDIT] ${JSON.stringify({
                timestamp: new Date().toISOString(),
                event: "RATE_LIMIT_TRIGGERED",
                ipAddress: ip,
                requestId,
                correlationId,
                metadata: { path, context: "search-limiter" }
            })}`);

            return new NextResponse(
                JSON.stringify({ error: 'Too many search requests. Please try again later.' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    // Apply strict rate limiting to file uploads/applications (abuse prevention)
    if (path.startsWith('/api/applications/apply') || path.startsWith('/api/internal/import-internship')) {
        const ok = await uploadLimiter.check(ip);
        if (!ok) {
            console.warn(`[SECURITY_AUDIT] ${JSON.stringify({
                timestamp: new Date().toISOString(),
                event: "RATE_LIMIT_TRIGGERED",
                ipAddress: ip,
                requestId,
                correlationId,
                metadata: { path, context: "upload-limiter" }
            })}`);

            return new NextResponse(
                JSON.stringify({ error: 'Too many file uploads or operations. Please try again later.' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    // Apply rate limiting to general API routes (excluding health checks, status checks, and specialized API routes)
    const isSpecializedApi = 
        isAuthRoute || 
        path.startsWith('/api/ai') || 
        path.startsWith('/api/search') || 
        path.startsWith('/api/applications/apply') || 
        path.startsWith('/api/internal/import-internship');

    if (path.startsWith('/api') && path !== '/api/health' && path !== '/api/ready' && path !== '/api/live' && !isSpecializedApi) {
        const ok = await generalApiLimiter.check(ip);
        if (!ok) {
            return new NextResponse(
                JSON.stringify({ error: 'Too many requests. Please try again later.' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    // 1. Generate a secure cryptographic nonce
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

    // 2. Set the x-nonce in request headers so Server Components can read it
    request.headers.set('x-nonce', nonce);

    // Run the Supabase session handler with the modified request headers
    const response = await updateSession(request);

    // 3. Construct Content-Security-Policy (CSP)
    const isDev = process.env.NODE_ENV === 'development';

    const csp = [
        "default-src 'none'",
        "manifest-src 'self'",
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://accounts.google.com https://apis.google.com ${isDev ? "'unsafe-eval'" : ""}`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://i.pravatar.cc https://ui-avatars.com https://avatars.githubusercontent.com https://lh3.googleusercontent.com https://*.amazonaws.com https://images.unsplash.com",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.supabase.in https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://va.vercel-scripts.com https://vitals.vercel-insights.com https://accounts.google.com https://oauth2.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        "frame-src 'self' https://checkout.razorpay.com https://accounts.google.com",
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'self'",
        "upgrade-insecure-requests"
    ].join('; ');

    // 4. Apply Security Headers to Response
    response.headers.set('Content-Security-Policy', csp);
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
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

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for public assets, metadata files, and health endpoints.
         * This avoids redirecting browser metadata and PWA resources to /auth/sign-in.
         */
        '/((?!_next/.*|favicon.ico|favicon.svg|apple-touch-icon.png|site.webmanifest|manifest.webmanifest|robots.txt|sitemap.xml|sitemap-index.xml|opensearch.xml|sw.js|images/.*|icons/.*|fonts/.*|logos/.*|assets/.*|static/.*|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|xml|txt|webmanifest)$|api/health|api/ready|api/live).*)',
    ],
};

export default proxy;
