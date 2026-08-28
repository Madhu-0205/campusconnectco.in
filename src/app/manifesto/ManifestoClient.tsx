"use client"

import { motion, useScroll } from"framer-motion"
import { Shield, Users, Zap, Heart, Star, CheckCircle2, ArrowLeft, ArrowRight, Rocket } from"lucide-react"
import Link from"next/link"

const PILLARS = [
 {
 num:"01",
 icon: Users,
 title:"The Student Foundation",
 content:"Traditional platforms rely on top-down verification. CampusConnect flips the script. We believe that a student's reputation within their own community is the most powerful signal of professional capability and reliability.",
 borderColor:"rgba(255,77,28,0.25)",
 iconBg:"rgba(255,77,28,0.10)",
 iconColor:"#ff4d1c",
 accentBg:"#ff4d1c",
 },
 {
 num:"02",
 icon: Zap,
 title:"Empowerment over Extraction",
 content:"We aren't here to take; we're here to build. Every interaction on our platform is designed to increase a student's 'Trust Capital' — a digital asset more valuable than any resume.",
 borderColor:"rgba(255,184,0,0.25)",
 iconBg:"rgba(255,184,0,0.10)",
 iconColor:"#ffb800",
 accentBg:"#ffb800",
 },
 {
 num:"03",
 icon: Heart,
 title:"Radical Transparency",
 content:"Trust requires visibility. Our peer-to-peer scoring and verified campus identities ensure that every gig, every payout, and every collaboration is backed by real-world accountability.",
 borderColor:"rgba(255,77,120,0.25)",
 iconBg:"rgba(255,77,120,0.10)",
 iconColor:"#ff4d78",
 accentBg:"#ff4d78",
 },
 {
 num:"04",
 icon: Rocket,
 title:"Built for Scale",
 content:"From 1 campus to 1,000 — our platform is built to grow with India's student ecosystem. Every feature we ship is designed to work at 10× the current scale.",
 borderColor:"rgba(0,201,167,0.25)",
 iconBg:"rgba(0,201,167,0.10)",
 iconColor:"#00c9a7",
 accentBg:"#00c9a7",
 },
]

function Reveal({ children, delay = 0, className ="" }: { children: React.ReactNode; delay?: number; className?: string }) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 24 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin:"-60px" }}
 transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
 className={className}
 >
 {children}
 </motion.div>
 )
}

export default function ManifestoPage() {
 const { scrollYProgress } = useScroll()
 
 return (
 <div
 className="min-h-screen overflow-hidden relative"
 style={{
 background:"var(--color-background)",
 color:"var(--color-text)",
 fontFamily:"var(--font-body)",
 position:"relative",
 }}
 >
 {/* Scroll progress — orange */}
 <motion.div
 className="fixed top-0 left-0 right-0 h-0.5 origin-left z-100 pointer-events-none"
 style={{ scaleX: scrollYProgress, background:"var(--color-primary)" }}
 />

 {/* Noise grain */}
 <div className="fixed inset-0 noise-bg opacity-[0.025] pointer-events-none" />

 {/* Background dots grid */}
 <div className="fixed inset-0 bg-size-[48px_48px] pointer-events-none" />

 {/* Top-right orange glow */}
 <div
 className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none opacity-15"
 style={{ background:"radial-gradient(circle, rgba(255,77,28,0.25) 0%, transparent 70%)" }}
 />

 {/* Back nav */}
 <div className="max-w-7xl mx-auto px-6 pt-6 relative z-10">
 <Link
 href="/about"
 className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
 style={{ color:"var(--color-text-muted)" }}
 onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color ="var(--color-text)" }}
 onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color ="var(--color-text-muted)" }}
 >
 <ArrowLeft size={16} /> Back to Our Story
 </Link>
 </div>

 <div className="max-w-4xl mx-auto px-6 pt-16 pb-32 relative z-10">

 {/* ── HERO ─────────────────────────────────────────────────── */}
 <section className="text-center mb-28">
 <motion.div
 initial={{ opacity: 0, y: -12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest mb-10"
 style={{
 background:"rgba(255,255,255,0.05)",
 border:"1px solid rgba(255,255,255,0.10)",
 color:"var(--color-text)",
 }}
 >
 <Shield size={13} style={{ color:"var(--color-primary)" }} />
 The CampusConnect Manifesto
 </motion.div>

 <motion.h1
 initial={{ opacity: 0, scale: 0.94 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] mb-8"
 style={{ fontFamily:"var(--font-display)" }}
 >
 Trust is{""}
 <span
 style={{
 background:"linear-gradient(135deg, #ff4d1c 0%, #ffb800 100%)",
 WebkitBackgroundClip:"text",
 WebkitTextFillColor:"transparent",
 }}
 >
 Student-Built.
 </span>
 </motion.h1>

 <motion.p
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ delay: 0.3 }}
 className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed font-medium"
 style={{ color:"var(--color-text-muted)" }}
 >
 We believe the traditional model of corporate trust is broken. We&apos;re building a
 new foundation where students aren&apos;t just participants — they are the arbiters of integrity.
 </motion.p>
 </section>

 {/* ── PILLARS ──────────────────────────────────────────────── */}
 <section className="space-y-6 mb-28">
 {PILLARS.map(({ num, icon: Icon, title, content, borderColor, iconBg, iconColor, accentBg }, i) => (
 <Reveal key={num} delay={i * 0.08}>
 <motion.div
 whileHover={{ x: 4 }}
 transition={{ type:"spring", stiffness: 300, damping: 25 }}
 className="group flex flex-col md:flex-row gap-7 items-start p-8 rounded-3xl transition-all duration-300"
 style={{
 background:"var(--color-surface)",
 border: `1px solid var(--color-border)`,
 boxShadow:"0 4px 24px rgba(0,0,0,0.3)",
 }}
 onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = borderColor }}
 onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor ="var(--color-border)" }}
 >
 <div className="flex items-center gap-4 shrink-0">
 <span
 className="text-5xl font-black leading-none"
 style={{ fontFamily:"var(--font-display)", color:"rgba(255,255,255,0.06)" }}
 >
 {num}
 </span>
 <div
 className="w-14 h-14 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-110"
 style={{ background: iconBg, borderColor, color: iconColor }}
 >
 <Icon size={22} />
 </div>
 </div>
 <div className="flex-1">
 <h3
 className="text-xl font-black mb-3 transition-colors"
 style={{ fontFamily:"var(--font-display)", color:"var(--color-text)" }}
 onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = iconColor }}
 onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color ="var(--color-text)" }}
 >
 {title}
 </h3>
 <p className="leading-relaxed" style={{ color:"var(--color-text-muted)" }}>
 {content}
 </p>
 </div>
 <div
 className="ml-auto w-1 self-stretch rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
 style={{ background: accentBg }}
 />
 </motion.div>
 </Reveal>
 ))}
 </section>

 {/* ── BELIEFS ────────────────────────────────────────────────── */}
 <Reveal>
 <section
 className="rounded-3xl p-10 mb-12"
 style={{
 background:"var(--color-surface-2)",
 border:"1px solid var(--color-border)",
 }}
 >
 <h2
 className="text-2xl font-black mb-7"
 style={{ fontFamily:"var(--font-display)", color:"var(--color-text)" }}
 >
 We believe that…
 </h2>
 <div className="space-y-4">
 {[
"Students are the most underutilised talent pool in the world.",
"Real experience beats theory every single time.",
"A verified peer network is more trustworthy than a corporate reference.",
"Financial independence should start at 20, not 25.",
"The best startups will be built by students who never stopped working.",
 ].map((b, i) => (
 <motion.div
 key={i}
 initial={{ opacity: 0, x: -10 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true }}
 transition={{ delay: i * 0.07 }}
 className="flex items-start gap-3.5"
 >
 <CheckCircle2 size={18} className="mt-0.5 shrink-0" style={{ color:"var(--color-primary)" }} />
 <span className="font-medium leading-relaxed" style={{ color:"var(--color-text-muted)" }}>
 {b}
 </span>
 </motion.div>
 ))}
 </div>
 </section>
 </Reveal>

 {/* ── FINAL STATEMENT ─────────────────────────────────────────── */}
 <Reveal>
 <div
 className="relative rounded-3xl p-12 md:p-16 overflow-hidden"
 style={{
 background:"var(--color-surface)",
 border:"1px solid var(--color-border)",
 }}
 >
 {/* Radial glow */}
 <div
 className="absolute top-0 right-0 w-full h-full pointer-events-none"
 style={{ background:"radial-gradient(circle at 80% 20%, rgba(255,77,28,0.06), transparent)" }}
 />
 <div
 className="absolute -bottom-10 -left-10 w-48 h-48 blur-[60px] rounded-full pointer-events-none"
 style={{ background:"rgba(255,77,28,0.15)" }}
 />
 {/* Ghost star */}
 <div className="absolute top-0 right-0 opacity-[0.04] pointer-events-none">
 <Star size={250} />
 </div>

 <div className="relative z-10">
 <p
 className="text-xs font-black uppercase tracking-widest mb-4"
 style={{ color:"var(--color-primary)" }}
 >
 The Bottom Line
 </p>
 <h2
 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6"
 style={{ fontFamily:"var(--font-display)", color:"var(--color-text)" }}
 >
 This is more than a marketplace.<br />
 It&apos;s a{""}
 <span style={{ color:"var(--color-primary)" }}>Trust Factory.</span>
 </h2>
 <p
 className="text-lg font-medium leading-relaxed max-w-xl mb-10"
 style={{ color:"var(--color-text-muted)" }}
 >
 Join us in redefining the future of work — where your value is proven by your
 actions and your growth is accelerated by the trust of your peers.
 </p>
 <div className="flex flex-wrap gap-4">
 <Link
 href="/auth/sign-up"
 className="h-12 px-8 text-white rounded-full font-black flex items-center gap-2 transition-all active:scale-95 hover:-translate-y-0.5"
 style={{
 background:"var(--color-primary)",
 boxShadow:"var(--shadow-btn-primary)",
 }}
 >
 Join the Movement <ArrowRight className="h-4 w-4" />
 </Link>
 <Link
 href="/about"
 className="h-12 px-8 rounded-full font-black flex items-center gap-2 transition-all hover:bg-white/10"
 style={{
 border:"1px solid rgba(255,255,255,0.20)",
 color:"var(--color-text)",
 }}
 >
 Our Story
 </Link>
 </div>
 </div>
 </div>
 </Reveal>
 </div>
 </div>
 )
}
