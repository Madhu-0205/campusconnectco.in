import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { generalApiLimiter } from '@/lib/rate-limit';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Generate Request ID and Correlation ID for observability
    const requestId = crypto.randomUUID();
    const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();

    // Inject into request headers
    request.headers.set('x-request-id', requestId);
    request.headers.set('x-correlation-id', correlationId);

    // Apply rate limiting to API routes (excluding health checks)
    if (path.startsWith('/api') && path !== '/api/health' && path !== '/api/ready' && path !== '/api/live') {
        const ip = (request as any).ip || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
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
         * Match all request paths except for static files.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

export default proxy;
