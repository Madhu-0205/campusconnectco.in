import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { SEO_LANDING_PAGE_SLUGS } from '@/lib/seoLandingPages'

import { fetchWithBackoff } from './fetch'

export async function updateSession(request: NextRequest) {
 let supabaseResponse = NextResponse.next({
 request: {
 headers: request.headers,
 },
 })

 const supabase = createServerClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 {
 global: {
 fetch: fetchWithBackoff,
 },
 cookies: {
 getAll() {
 return request.cookies.getAll()
 },
 setAll(cookiesToSet: { name: string, value: string, options: CookieOptions }[]) {
 cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
 supabaseResponse = NextResponse.next({
 request: {
 headers: request.headers,
 },
 })
 cookiesToSet.forEach(({ name, value, options }) =>
 supabaseResponse.cookies.set(name, value, options)
 )
 },
 },
 }
 )

 const {
 data: { user },
 } = await supabase.auth.getUser()

 const path = request.nextUrl.pathname;

 // Helper to copy cookies from supabaseResponse to any other response we return
 function copyCookies(from: NextResponse, to: NextResponse) {
 from.cookies.getAll().forEach((cookie) => {
 to.cookies.set(cookie.name, cookie.value, {
 path: cookie.path,
 domain: cookie.domain,
 maxAge: cookie.maxAge,
 expires: cookie.expires,
 secure: cookie.secure,
 httpOnly: cookie.httpOnly,
 sameSite: cookie.sameSite,
 });
 });
 return to;
 }

  const seoSlugSet = new Set(SEO_LANDING_PAGE_SLUGS.map((slug) => `/${slug}`));

  // 1. PUBLIC ROUTES ALLOW LIST
  const isPublicRoute =
    path === '/' ||
    path === '/about' ||
    path === '/our-story' ||
    path === '/leaderboard' ||
    path === '/success-stories' ||
    path === '/ambassador' ||
    path === '/pricing' ||
    path === '/trust' ||
    path === '/contact-us' ||
    path === '/contact' ||
    path === '/manifesto' ||
    path === '/marketplace' ||
    path === '/internships' ||
    path === '/terms' ||
    path === '/terms-and-conditions' ||
    path === '/privacy' ||
    path === '/privacy-policy' ||
    path === '/refund-policy' ||
    path === '/community-guidelines' ||
    path === '/cookies' ||
    path === '/companies' ||
    path === '/opportunities' ||
    path === '/editorial' ||
    path === '/design-system' ||
    path === '/v2-catalog' ||
    path === '/join' ||
    path === '/get-gig' ||
    seoSlugSet.has(path) ||
    path.startsWith('/auth') ||
    path.startsWith('/api/auth') ||
    path === '/api/health' ||
    path === '/api/ready' ||
    path === '/api/live' ||
    path === '/api/stats' ||
    path.startsWith('/api/skills') ||
    path.startsWith('/api/colleges') ||
    path.startsWith('/api/recommendations') ||
    path.startsWith('/api/ai/resume-analyze') ||
    path.startsWith('/api/internal/import-internship') ||
    path.startsWith('/api/internal/opportunities') ||
    path.startsWith('/api/analytics/track') ||
    path.startsWith('/api/growth/referral/lookup') ||
    path.startsWith('/api/public/gigs/trending') ||
    path.startsWith('/skills') ||
    path.startsWith('/skill-selector') ||
    path.startsWith('/browse-gigs') ||
    path.startsWith('/gigs/') ||
    path.startsWith('/internships/') ||
    path.startsWith('/companies/') ||
    path.startsWith('/colleges/') ||
    path.startsWith('/careers/') ||
    path.startsWith('/guides/') ||
    path.startsWith('/topics/') ||
    path.startsWith('/profile/') ||
    path.startsWith('/_next/') ||
    path.startsWith('/images/') ||
    path.startsWith('/icons/') ||
    path.startsWith('/logos/') ||
    path.startsWith('/fonts/') ||
    path.startsWith('/assets/') ||
    path.startsWith('/static/') ||
    path === '/favicon.ico' ||
    path === '/favicon.svg' ||
    path === '/apple-touch-icon.png' ||
    path === '/site.webmanifest' ||
    path === '/manifest.webmanifest' ||
    path === '/robots.txt' ||
    path === '/sitemap.xml' ||
    path === '/sitemap-index.xml' ||
    path === '/opensearch.xml' ||
    path === '/sw.js';

 // 2. REDIRECT IF NOT LOGGED IN AND NOT PUBLIC
 if (!user && !isPublicRoute) {
 if (path.startsWith('/api/')) {
 const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 return copyCookies(supabaseResponse, res);
 }

 const url = request.nextUrl.clone();
 url.pathname = '/auth/sign-in';
 const fullReturnUrl = request.nextUrl.search ? `${path}${request.nextUrl.search}` : path;
 url.searchParams.set('returnUrl', fullReturnUrl);
 const res = NextResponse.redirect(url);
 return copyCookies(supabaseResponse, res);
 }

 if (user) {
 // 3. AUTO-REDIRECT LOGGED IN USERS AWAY FROM AUTH PAGES
 if (path.startsWith('/auth')) {
 const role = user.user_metadata?.role;
 const email = user.email?.toLowerCase().trim();
 const isFounder = role === 'FOUNDER' || email === 'madhuvalurouthu52@gmail.com';
 const url = request.nextUrl.clone();
 if (role === 'CLIENT' || role === 'STARTUP') {
 url.pathname = '/client-hub';
 } else if (isFounder) {
 url.pathname = '/dashboard/founder';
 } else {
 url.pathname = '/dashboard/student';
 }
 const res = NextResponse.redirect(url);
 return copyCookies(supabaseResponse, res);
 }
 }

 return supabaseResponse
}
