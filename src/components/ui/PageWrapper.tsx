"use client"

import { cn } from"@/lib/utils"

interface PageWrapperProps {
 children: React.ReactNode
 className?: string
 /**
 * variant:
 *"dark" — ink background (#0a0a0f) with light text, matching the dark
 * sections of the landing page (hero, how-it-works, footer).
 *"light" — warm paper background (#f5f3ee) with dark text, matching the
 * light sections of the landing page (features, gigs, internships).
 *"auto" — inherits GlobalBackground (default for app pages).
 */
 variant?:"dark" |"light" |"auto"
 /** Extra section-level padding (default: py-20 px-4 sm:px-6) */
 noPadding?: boolean
}

/**
 * PageWrapper — the universal outer container for every app page.
 *
 * Wraps content in the correct background, font, and base colour from
 * the landing page design system. Every non-landing page should use
 * this as its outermost element so backgrounds, fonts, and colours are
 * consistent with the landing page.
 */
export default function PageWrapper({
 children,
 className,
 variant ="dark",
 noPadding = false,
}: PageWrapperProps) {
 const styleMap: Record<string, React.CSSProperties> = {
 dark: {
 background:"var(--color-background)", // #0a0a0f
 color:"var(--color-text)", // #f0eee8
 fontFamily:"var(--font-body)",
 },
 light: {
 background:"var(--paper)", // #f5f3ee
 color:"var(--text-primary)", // #0a0a0f
 fontFamily:"var(--font-body)",
 },
 auto: {
 fontFamily:"var(--font-body)",
 },
 }

 return (
 <div
 className={cn(
"relative min-h-screen overflow-hidden",
 !noPadding &&"px-4 sm:px-6",
 className,
 )}
 style={styleMap[variant]}
 >
 {/* Subtle noise grain — same as landing page */}
 {variant ==="dark" && (
 <div
 className="pointer-events-none absolute inset-0 noise-bg opacity-[0.025]"
 aria-hidden="true"
 />
 )}
 {children}
 </div>
 )
}
