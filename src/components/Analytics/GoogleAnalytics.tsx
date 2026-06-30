/**
 * GoogleAnalytics — CSP-compliant GA4 integration for Next.js 16 App Router
 *
 * Architecture:
 * - GAScripts (Server Component): renders two <Script> tags using next/script
 *   strategy="afterInteractive". The nonce from proxy.ts is forwarded to the
 *   inline init script so it is accepted by the strict CSP nonce policy.
 * - GAPageviewTracker (Client Component): listens to Next.js App Router navigation
 *   events and fires page_view for every client-side route change. Without this
 *   gtag only fires on hard reloads.
 *
 * Why next/script and NOT @next/third-parties/google?
 * - @next/third-parties wraps the inline dataLayer init in a <Script> with
 *   strategy="afterInteractive", but does NOT expose a `nonce` prop, making it
 *   impossible to attach the per-request CSP nonce to the inline script.
 * - Using next/script directly gives us full control over the nonce attribute.
 *
 * CSP requirements already satisfied in proxy.ts:
 *   script-src: ... https://www.googletagmanager.com ...
 *   connect-src: ... https://www.google-analytics.com https://stats.g.doubleclick.net ...
 *   (region1.google-analytics.com added via this PR)
 */

import Script from "next/script";

import { GAPageviewTracker } from "./GAPageviewTracker";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

interface GoogleAnalyticsProps {
  nonce?: string;
}

/**
 * GAScripts — Server Component.
 * Renders the gtag.js loader and the inline dataLayer initialisation script.
 * Both scripts carry the request-scoped CSP nonce.
 */
export function GAScripts({ nonce }: GoogleAnalyticsProps) {
  // Skip if GA ID is not configured (e.g. local dev without the env var)
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      {/*
       * 1. Load the gtag.js library from Google.
       *    strategy="afterInteractive" → deferred until after hydration;
       *    never blocks rendering, never causes hydration mismatches.
       *    The nonce is forwarded so the CSP nonce policy permits it.
       */}
      <Script
        id="ga4-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
        nonce={nonce}
      />

      {/*
       * 2. Inline initialisation script — attaches window.dataLayer and
       *    calls gtag('js', ...) + gtag('config', ...).
       *    Must be an inline Script; nonce is mandatory for CSP compliance.
       *    page_view is NOT sent automatically here; GAPageviewTracker handles
       *    it for both initial loads and subsequent navigations.
       */}
      <script
        id="ga4-init"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              send_page_view: false,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />

      {/*
       * 3. Client-side pageview tracker — fires page_view on every
       *    App Router navigation including the initial load.
       */}
      <GAPageviewTracker measurementId={GA_MEASUREMENT_ID} />
    </>
  );
}
