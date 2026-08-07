"use client";

import { usePathname } from "next/navigation"

import { V2Footer } from "@/components/navigation/V2Footer"
import AppFooter from "@/components/ui/AppFooter"

/**
 * Paths where the V2Footer should NOT appear (they get AppFooter or nothing)
 *  - /          (landing has its own V2Footer rendered inside the page)
 *  - /auth/*    (auth pages are standalone — no footer by design)
 *  - /skill-selector (onboarding flow)
 */
const NO_FOOTER_PREFIXES = [
  "/auth",
  "/skill-selector",
]

const APP_FOOTER_PREFIXES = [
  "/dashboard",
]

export default function FooterWrapper() {
  const pathname = usePathname()

  // Landing root is handled inside (landing)/page.tsx
  if (pathname === "/") return null

  // Hide on auth & onboarding routes
  if (NO_FOOTER_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null

  // Show compact AppFooter on dashboard routes
  if (APP_FOOTER_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return <AppFooter />

  return <V2Footer />
}
