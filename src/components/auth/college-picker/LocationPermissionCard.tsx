"use client"

import { motion } from"framer-motion"
import { MapPin, Shield, ChevronRight, X } from"lucide-react"

interface LocationPermissionCardProps {
 onAllow: () => void
 onSkip: () => void
 isRequesting: boolean
}

export default function LocationPermissionCard({
 onAllow,
 onSkip,
 isRequesting,
}: LocationPermissionCardProps) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 16, scale: 0.97 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
 className="relative overflow-hidden rounded-2xl border border-white/8 p-6 text-center"
 style={{
 background:
"linear-gradient(135deg, rgba(31,169,113,0.08) 0%, rgba(17,17,39,0.7) 100%)",
 backdropFilter:"blur(16px)",
 }}
 >
 {/* Ambient glow */}
 <div
 className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full pointer-events-none"
 style={{
 background:
"radial-gradient(circle, rgba(31,169,113,0.18) 0%, transparent 70%)",
 }}
 />

 {/* Top accent line */}
 <div
 className="absolute top-0 left-0 right-0 h-px"
 style={{
 background:
"linear-gradient(90deg, transparent, rgba(31,169,113,0.6), rgba(6,182,212,0.4), transparent)",
 }}
 />

 <div className="relative z-10 space-y-5">
 {/* Animated pin icon */}
 <motion.div
 animate={{ y: [0, -6, 0] }}
 transition={{ duration: 2.5, repeat: Infinity, ease:"easeInOut" }}
 className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
 style={{
 background:"rgba(31,169,113,0.12)",
 border:"1.5px solid rgba(31,169,113,0.3)",
 boxShadow:"0 8px 24px rgba(31,169,113,0.2)",
 }}
 >
 <MapPin className="w-7 h-7" style={{ color:"#8B5CF6" }} />
 </motion.div>

 {/* Heading */}
 <div>
 <h3
 className="text-lg font-black text-white mb-1.5"
 style={{ fontFamily:"var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}
 >
 Find your campus instantly
 </h3>
 <p className="text-sm leading-relaxed" style={{ color:"#94A3B8" }}>
 We&apos;ll use your location to recommend nearby colleges. Your exact
 location is{""}
 <span className="font-bold" style={{ color:"#C4B5FD" }}>
 never shared
 </span>
 .
 </p>
 </div>

 {/* Privacy note */}
 <div
 className="flex items-center justify-center gap-2 text-xs font-medium"
 style={{ color:"#64748B" }}
 >
 <Shield className="w-3.5 h-3.5 shrink-0" style={{ color:"#10B981" }} />
 Location stays on your device — not stored
 </div>

 {/* CTAs */}
 <div className="flex flex-col gap-2.5">
 <motion.button
 type="button"
 onClick={onAllow}
 disabled={isRequesting}
 whileTap={{ scale: 0.97 }}
 className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
 style={{
 background: isRequesting
 ?"rgba(31,169,113,0.5)"
 :"linear-gradient(135deg, #1FA971 0%, #6366F1 100%)",
 boxShadow:"0 4px 16px rgba(31,169,113,0.3)",
 }}
 >
 {isRequesting ? (
 <>
 <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 Requesting…
 </>
 ) : (
 <>
 <MapPin className="w-4 h-4" />
 Allow Location
 <ChevronRight className="w-4 h-4" />
 </>
 )}
 </motion.button>

 <motion.button
 type="button"
 onClick={onSkip}
 disabled={isRequesting}
 whileTap={{ scale: 0.97 }}
 className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
 style={{
 color:"#64748B",
 border:"1px solid rgba(255,255,255,0.07)",
 }}
 >
 <X className="w-3.5 h-3.5" />
 Skip
 </motion.button>
 </div>
 </div>
 </motion.div>
 )
}
