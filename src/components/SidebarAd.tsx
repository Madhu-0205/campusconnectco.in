"use client"

import { Sparkles, ArrowRight, Zap } from"lucide-react"
import Link from"next/link"
import React, { useState, useEffect } from"react"

interface SidebarAdProps {
 slotId?: string
 title?: string
 subtitle?: string
 ctaText?: string
 href?: string
 className?: string
}

function SidebarAdSkeleton() {
 return (
 <div
 className="w-full rounded-3xl overflow-hidden"
 style={{
 minHeight:"250px",
 background:"rgba(17,17,39,0.5)",
 border:"1px dashed rgba(31,169,113,0.15)",
 }}
 >
 <div className="p-6 space-y-4">
 {/* Header shimmer */}
 <div className="flex items-center justify-between pb-3" style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
 <div className="h-5 w-28 rounded shimmer" />
 <div className="h-4 w-16 rounded shimmer" />
 </div>
 {/* Content shimmer */}
 <div className="space-y-3">
 <div className="w-10 h-10 rounded-2xl shimmer" />
 <div className="h-5 w-40 rounded shimmer" />
 <div className="space-y-1.5">
 <div className="h-3 w-full rounded shimmer" />
 <div className="h-3 w-3/4 rounded shimmer" />
 </div>
 </div>
 {/* CTA shimmer */}
 <div className="pt-2">
 <div className="h-11 w-full rounded-2xl shimmer" />
 </div>
 </div>
 </div>
 )
}

export default function SidebarAd({
 slotId ="sidebar-300x250",
 title ="Hire Verified Campus Talent",
 subtitle ="Post your startup gig or internship drive and connect with top college developers today.",
 ctaText ="Post Opportunity",
 href ="/post-gig",
 className ="",
}: SidebarAdProps) {
 const [mounted, setMounted] = useState(false)
 const [hovered, setHovered] = useState(false)

 useEffect(() => {
 const t = setTimeout(() => setMounted(true), 400)
 return () => clearTimeout(t)
 }, [])

 return (
 <aside
 role="complementary"
 aria-label="Sidebar advertisement"
 data-ad-slot={slotId}
 className={`w-full max-w-[320px] ${className}`}
 >
 {!mounted ? (
 <SidebarAdSkeleton />
 ) : (
 <div
 className="relative overflow-hidden rounded-3xl transition-all duration-300"
 style={{
 minHeight:"250px",
 background:"rgba(17,17,39,0.7)",
 border: `1px dashed ${hovered ?"rgba(31,169,113,0.45)" :"rgba(31,169,113,0.2)"}`,
 backdropFilter:"blur(16px)",
 boxShadow: hovered
 ?"0 12px 40px rgba(31,169,113,0.15)"
 :"0 4px 24px rgba(0,0,0,0.3)",
 transform: hovered ?"translateY(-3px)" :"translateY(0)",
 transition:"transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
 }}
 onMouseEnter={() => setHovered(true)}
 onMouseLeave={() => setHovered(false)}
 >
 {/* Animated ambient glow */}
 <div
 className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none transition-opacity duration-500"
 style={{
 background:"radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)",
 opacity: hovered ? 1 : 0.4,
 }}
 />
 <div
 className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full pointer-events-none transition-opacity duration-500"
 style={{
 background:"radial-gradient(circle, rgba(31,169,113,0.08) 0%, transparent 70%)",
 opacity: hovered ? 1 : 0.3,
 }}
 />

 {/* Gradient top accent */}
 <div
 className="absolute top-0 left-0 right-0 h-[2px]"
 style={{ background:"linear-gradient(90deg, rgba(31,169,113,0.6), rgba(245,158,11,0.5), rgba(31,169,113,0.6))" }}
 />

 <div className="relative z-10 p-6 space-y-4">
 {/* Ad Tag Header */}
 <div
 className="flex items-center justify-between pb-3"
 style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}
 >
 <div className="flex items-center gap-1.5">
 <span
 className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded font-mono"
 style={{
 background:"rgba(255,255,255,0.04)",
 color:"var(--text-3)",
 border:"1px solid rgba(255,255,255,0.07)",
 }}
 >
 Advertisement
 </span>
 </div>
 <span className="text-[10px] font-mono" style={{ color:"var(--text-3)" }}>
 300 × 250
 </span>
 </div>

 {/* Ad Content */}
 <div className="space-y-3">
 <div
 className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-300"
 style={{
 background:"rgba(245,158,11,0.12)",
 border:"1px solid rgba(245,158,11,0.25)",
 color:"var(--gold)",
 transform: hovered ?"scale(1.1) rotate(5deg)" :"scale(1) rotate(0deg)",
 transition:"transform 0.3s ease",
 }}
 >
 <Sparkles className="w-5 h-5" />
 </div>

 <h4
 className="text-lg font-bold leading-tight"
 style={{ fontFamily:"var(--font-heading)", color:"var(--text)" }}
 >
 {title}
 </h4>

 <p className="text-xs leading-relaxed" style={{ color:"var(--text-3)" }}>
 {subtitle}
 </p>

 {/* Trust signal */}
 <div className="flex items-center gap-1.5">
 <Zap className="w-3 h-3" style={{ color:"var(--gold)" }} />
 <span className="text-[10px] font-mono font-bold" style={{ color:"var(--text-3)" }}>
 10,000+ verified students
 </span>
 </div>
 </div>

 {/* CTA Button */}
 <div className="pt-1">
 <Link
 href={href}
 className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
 style={{
 background:"var(--grad-brand)",
 color:"#ffffff",
 boxShadow: hovered ?"0 4px 20px rgba(31,169,113,0.35)" :"0 2px 10px rgba(31,169,113,0.2)",
 transform: hovered ?"scale(1.02)" :"scale(1)",
 transition:"transform 0.2s ease, box-shadow 0.2s ease",
 }}
 >
 {ctaText} <ArrowRight className="w-3.5 h-3.5" />
 </Link>
 </div>
 </div>
 </div>
 )}
 </aside>
 )
}
