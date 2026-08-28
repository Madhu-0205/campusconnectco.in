"use client"

import { Megaphone, ExternalLink } from"lucide-react"
import Link from"next/link"
import React, { useState, useEffect } from"react"

interface AdvertisementBannerProps {
 slotId?: string
 label?: string
 widthLabel?: string
 className?: string
}

function AdvertisementBannerSkeleton() {
 return (
 <div className="w-full rounded-2xl overflow-hidden relative" style={{ minHeight:"90px", background:"rgba(17,17,39,0.4)", border:"1px dashed rgba(31,169,113,0.15)" }}>
 <div className="flex items-center gap-4 p-4 sm:p-5 h-full" style={{ minHeight:"90px" }}>
 <div className="w-10 h-10 rounded-xl shrink-0 shimmer" />
 <div className="flex-1 space-y-2">
 <div className="h-3 w-32 rounded shimmer" />
 <div className="h-4 w-64 rounded shimmer" />
 </div>
 <div className="hidden sm:flex items-center gap-3 shrink-0">
 <div className="h-8 w-24 rounded-lg shimmer" />
 <div className="h-8 w-28 rounded-xl shimmer" />
 </div>
 </div>
 </div>
 )
}

export default function AdvertisementBanner({
 slotId ="hero-bottom-728x90",
 label ="Sponsored Placement",
 widthLabel ="728 × 90 Leaderboard",
 className ="",
}: AdvertisementBannerProps) {
 const [mounted, setMounted] = useState(false)

 useEffect(() => {
 const t = setTimeout(() => setMounted(true), 300)
 return () => clearTimeout(t)
 }, [])

 return (
 <aside
 role="complementary"
 aria-label="Sponsored advertisement"
 data-ad-slot={slotId}
 className={`w-full max-w-5xl mx-auto my-8 px-4 sm:px-6 ${className}`}
 >
 {!mounted ? (
 <AdvertisementBannerSkeleton />
 ) : (
 <div
 className="group relative overflow-hidden rounded-2xl border border-dashed transition-all duration-300"
 style={{
 borderColor:"rgba(31,169,113,0.2)",
 background:"rgba(17,17,39,0.6)",
 backdropFilter:"blur(12px)",
 boxShadow:"0 2px 20px rgba(0,0,0,0.3)",
 minHeight:"90px",
 transform:"scale(1)",
 transition:"transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
 }}
 onMouseEnter={e => {
 e.currentTarget.style.borderColor ="rgba(31,169,113,0.45)"
 e.currentTarget.style.boxShadow ="0 4px 32px rgba(31,169,113,0.12)"
 e.currentTarget.style.transform ="scale(1.005)"
 }}
 onMouseLeave={e => {
 e.currentTarget.style.borderColor ="rgba(31,169,113,0.2)"
 e.currentTarget.style.boxShadow ="0 2px 20px rgba(0,0,0,0.3)"
 e.currentTarget.style.transform ="scale(1)"
 }}
 >
 {/* Ambient glow */}
 <div
 className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
 style={{ background:"radial-gradient(circle, rgba(31,169,113,0.08) 0%, transparent 70%)" }}
 />
 {/* Top accent line */}
 <div
 className="absolute top-0 left-0 right-0 h-px"
 style={{ background:"linear-gradient(90deg, transparent, rgba(31,169,113,0.5), rgba(6,182,212,0.3), transparent)" }}
 />

 <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5">
 {/* Left: icon + copy */}
 <div className="flex items-center gap-3 text-center sm:text-left">
 <div
 className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
 style={{
 background:"rgba(31,169,113,0.12)",
 border:"1px solid rgba(31,169,113,0.25)",
 color:"var(--primary-light)",
 }}
 >
 <Megaphone className="w-5 h-5" />
 </div>
 <div>
 <div className="flex items-center justify-center sm:justify-start gap-2 mb-0.5">
 <span
 className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded font-mono"
 style={{
 background:"rgba(255,255,255,0.05)",
 color:"var(--text-3)",
 border:"1px solid rgba(255,255,255,0.08)",
 }}
 >
 Advertisement
 </span>
 <span className="text-xs font-mono" style={{ color:"var(--text-3)" }}>
 {label}
 </span>
 </div>
 <p className="text-sm font-semibold" style={{ color:"var(--text)" }}>
 Partner with CampusConnect — Reach 10,000+ Verified Tech Students Across India
 </p>
 </div>
 </div>

 {/* Right: size label + CTA */}
 <div className="flex items-center gap-3 shrink-0">
 <span
 className="hidden md:inline-block text-[11px] font-mono px-2.5 py-1 rounded-lg"
 style={{
 color:"var(--text-3)",
 border:"1px solid rgba(255,255,255,0.06)",
 background:"rgba(255,255,255,0.02)",
 }}
 >
 {widthLabel}
 </span>
 <Link
 href="/contact-us?subject=Advertising"
 className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
 style={{
 background:"rgba(31,169,113,0.18)",
 border:"1px solid rgba(31,169,113,0.35)",
 color:"var(--primary-light)",
 transition:"background 0.2s ease, transform 0.15s ease",
 }}
 onMouseEnter={e => {
 e.currentTarget.style.background ="rgba(31,169,113,0.28)"
 e.currentTarget.style.transform ="scale(1.04)"
 }}
 onMouseLeave={e => {
 e.currentTarget.style.background ="rgba(31,169,113,0.18)"
 e.currentTarget.style.transform ="scale(1)"
 }}
 onMouseDown={e => { e.currentTarget.style.transform ="scale(0.97)" }}
 onMouseUp={e => { e.currentTarget.style.transform ="scale(1.04)" }}
 >
 Promote Here <ExternalLink className="w-3.5 h-3.5" />
 </Link>
 </div>
 </div>
 </div>
 )}
 </aside>
 )
}
