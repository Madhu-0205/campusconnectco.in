"use client";

/**
 * GAPageviewTracker — Client Component
 *
 * Fires a GA4 page_view event:
 * 1. On first mount (covers hard reloads and direct URL navigations).
 * 2. On every subsequent App Router navigation (pathname or search change).
 *
 * Why this is necessary:
 * Next.js App Router performs client-side navigation without full page
 * reloads. The standard gtag('config', ...) only fires once on initial load.
 * This component subscribes to pathname changes via usePathname() and
 * useSearchParams() so every route change sends an accurate page_view.
 *
 * Deduplication:
 * The effect runs only when pathname OR searchParams changes. The initial
 * run fires the first page_view. Subsequent runs fire on navigation.
 * No double-firing on initial render.
 */

import { usePathname, useSearchParams } from"next/navigation";
import { useEffect, useRef } from"react";

interface GAPageviewTrackerProps {
 measurementId: string;
}

declare global {
 interface Window {
 gtag?: (...args: any[]) => void;
 }
}

export function GAPageviewTracker({ measurementId }: GAPageviewTrackerProps) {
 const pathname = usePathname();
 const searchParams = useSearchParams();
 // Track whether we've sent the first pageview to avoid duplicates
 const isFirstRender = useRef(true);

 useEffect(() => {
 // Guard: wait for gtag to be available (loaded afterInteractive)
 const sendPageView = () => {
 if (typeof window.gtag !=="function") return;

 const url =
 pathname + (searchParams?.toString() ? `?${searchParams.toString()}` :"");

 window.gtag("event","page_view", {
 page_path: url,
 page_location: window.location.href,
 page_title: document.title,
 send_to: measurementId,
 });
 };

 if (isFirstRender.current) {
 // First render: gtag may not be ready yet; poll briefly
 isFirstRender.current = false;
 const timer = setTimeout(sendPageView, 300);
 return () => clearTimeout(timer);
 }

 // Subsequent navigations: gtag is already loaded
 sendPageView();
 }, [pathname, searchParams, measurementId]);

 // This component renders nothing — it's a side-effect-only tracker
 return null;
}
