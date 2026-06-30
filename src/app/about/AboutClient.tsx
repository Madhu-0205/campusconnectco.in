"use client"

import { motion, AnimatePresence, useInView, useSpring } from "framer-motion"
import {
  ArrowRight, Star, Shield, Rocket, Users, Target, Trophy, CheckCircle2,
  TrendingUp, Brain, Globe, Lightbulb, MapPin, DollarSign, Zap,
  type LucideIcon
} from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import { fadeUp, staggerContainer, viewportOnce } from "@/lib/animations"

/* ─── Animated Counter ─────────────────────────────────────────────────────── */
function Counter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [val, setVal] = useState(0)
  const spring = useSpring(0, { duration: 2200, bounce: 0 })

  useEffect(() => { if (inView) spring.set(target) }, [inView, target, spring])
  useEffect(() => spring.on("change", v => setVal(Math.round(v))), [spring])

  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>
}

/* ─── Milestone Card ───────────────────────────────────────────────────────── */
function MilestoneCard({ year, title, desc, icon: Icon, color, align }: {
  year: string; title: string; desc: string; icon: LucideIcon; color: string; align: "left" | "right"
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <div ref={ref} className={`flex max-md:flex-col items-center gap-6 md:gap-8 ${align === "right" ? "md:flex-row-reverse" : ""}`}>
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, x: align === "left" ? -40 : 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 w-full"
      >
        <div className={`group rounded-3xl p-7 backdrop-blur-sm transition-all duration-300 ${align === "right" ? "md:text-right" : ""}`} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,77,28,0.30)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(255,77,28,0.12)" }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.4)" }}>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black mb-4 ${color}`}>
            {year}
          </div>
          <div className={`flex items-center gap-3 mb-3 ${align === "right" ? "md:flex-row-reverse" : ""}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border bg-white/5 ${color.replace("text-", "border-").replace("bg-", "")}`}>
              <Icon size={18} />
            </div>
            <h3 className="font-black text-white" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
              {title}
            </h3>
          </div>
          <p className="text-slate-400 leading-relaxed">{desc}</p>
        </div>
      </motion.div>

      {/* Center dot (Desktop) */}
      <motion.div
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="hidden md:block w-5 h-5 rounded-full shrink-0 z-10"
        style={{ background: "#ff4d1c", border: "4px solid var(--color-background)", boxShadow: "0 0 20px rgba(255,77,28,0.5)" }}
      />

      {/* Spacer (Desktop) */}
      <div className="hidden md:block flex-1" />
    </div>
  )
}

/* ─── Team Member Card ──────────────────────────────────────────────────────── */
function TeamCard({ initials, name, role, tags, color }: {
  initials: string; name: string; role: string; tags: string[]; color: string
}) {
  const [hovered, setHovered] = useState(false)
  
  return (
    <motion.div
      whileHover={{ y: -8 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="rounded-3xl p-7 text-center cursor-pointer transition-all"
      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,77,28,0.30)" }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)" }}
    >
      <div className={`w-20 h-20 rounded-3xl ${color} mx-auto mb-5 flex items-center justify-center font-black text-white shadow-lg`}>
        {initials}
      </div>
      <h4 className="font-black text-white mb-0.5" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>{name}</h4>
      <p className="text-xs font-bold mb-4" style={{ color: "var(--color-primary)" }}>{role}</p>
      
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-1.5 justify-center overflow-hidden"
          >
            {tags.map(t => (
              <span key={t} className="font-black px-2 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                {t}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Value Pill ────────────────────────────────────────────────────────────── */
function ValuePill({ icon: Icon, label, color }: { icon: LucideIcon; label: string; color: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold shadow-lg ${color}`}
    >
      <Icon size={14} /> {label}
    </motion.div>
  )
}

export default function AboutClient() {
  return (
    <div
      className="overflow-hidden min-h-screen"
      style={{ background: "var(--color-background)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}
    >
      {/* Noise grain */}
      <div className="fixed inset-0 noise-bg opacity-[0.025] pointer-events-none -z-10" />

      {/* Background blobs — orange palette */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: "rgba(255,77,28,0.10)" }} />
        <div className="absolute top-[40%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: "rgba(0,201,167,0.07)" }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full blur-[120px]" style={{ background: "rgba(255,184,0,0.06)" }} />
      </div>

      {/* ══════════ HERO ══════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 px-6 max-w-5xl mx-auto text-center">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border text-xs font-black uppercase tracking-widest mb-10" style={{ borderColor: "rgba(255,77,28,0.25)", color: "var(--color-primary)", boxShadow: "0 0 20px rgba(255,77,28,0.12)" }}>
            <Star size={12} className="fill-[#7C3AED]" /> Our Story
          </motion.div>
          
          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-8"
            style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}
          >
            Built by students.<br />
            <span style={{ background: "linear-gradient(135deg, #ff4d1c 0%, #ffb800 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              For students.
            </span>
          </motion.h1>
          
          <motion.p
            variants={fadeUp}
            className="md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-12"
          >
            CampusConnect started as a question:{" "}
            <em className="text-white font-black italic">
              &quot;Why do students graduate with no real experience?&quot;
            </em>{" "}
            <br className="hidden md:block" />
            We built the platform we wished we had.
          </motion.p>
        </motion.div>
      </section>

      {/* ══════════ STATS BAR ═════════════════════════════════════════════════ */}
      <section className="py-14 border-white/10 backdrop-blur-sm relative z-10" style={{ background: "rgba(15,15,22,0.5)" }}>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: 12000, suf: "+", label: "Students", icon: Users, color: "text-[#0EA5E9]" },
            { val: 4500, suf: "+", label: "Gigs Completed", icon: Trophy, color: "text-[#ffb800]" },
            { val: 120, suf: "+", label: "Campuses", icon: MapPin, color: "text-[#00c9a7]" },
            { val: 2.5, suf: "Cr+", prefix: "₹", label: "Rupees Earned", icon: DollarSign, color: "text-[#ff4d1c]" },
          ].map(({ val, suf, prefix, label, icon: Icon, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewportOnce} transition={{ delay: i * 0.1 }}>
              <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 ${color}`}>
                <Icon size={20} />
              </div>
              <div className="md:text-4xl font-black text-white mb-1" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
                <Counter target={val} suffix={suf} prefix={prefix} />
              </div>
              <p className="font-bold text-slate-500">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════ THE ORIGIN ════════════════════════════════════════════════ */}
      <section className="py-28 px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={viewportOnce} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 leading-[1.1]" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
              A problem every student faces.<br />
              <span className="text-[#A78BFA]">A solution no one built.</span>
            </h2>
            <div className="space-y-6 leading-relaxed text-lg">
              <p>Every year, thousands of brilliant students graduate from top engineering colleges across India — with perfect grades, zero real-world experience, and empty portfolios.</p>
              <p>The broken cycle dictates: <strong className="text-white">you need experience to get a job, but you need a job to get experience.</strong></p>
              <p>We built CampusConnect to shatter this paradox. By creating a freemium peer-to-peer marketplace and AI career hub, we enable students to build their careers <em className="text-white font-bold">before the degree is even done</em>.</p>
            </div>
          </motion.div>

          {/* Glowing Quote Card */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={viewportOnce} transition={{ duration: 0.6 }}>
            <div className="relative p-px rounded-3xl" style={{ background: "linear-gradient(135deg, rgba(255,77,28,0.50), rgba(255,184,0,0.20))" }}>
              <div className="rounded-3xl p-10 relative overflow-hidden h-full" style={{ background: "var(--color-surface)" }}>
                <div className="absolute -top-10 -right-10 w-40 h-40 blur-3xl rounded-full" style={{ background: "rgba(255,77,28,0.20)" }} />
                <div className="font-black text-white/5 leading-none mb-4 absolute top-4 left-6">&quot;</div>
                <p className="font-black leading-snug mb-8 relative z-10 text-white" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
                  Students are the most ambitious, adaptable, and underutilised talent pool in the world. We&apos;re changing that.
                </p>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white" style={{ background: "linear-gradient(135deg, #ff4d1c, #ffb800)", boxShadow: "0 0 20px rgba(255,77,28,0.40)" }}>CC</div>
                  <div>
                    <p className="font-bold text-white">The CampusConnect Team</p>
                    <p className="text-xs" style={{ color: "var(--color-primary)" }}>Founders, 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ INTERACTIVE TIMELINE ═════════════════════════════════════ */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-white/2 border-white/5 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewportOnce}
              className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
              The Journey So Far
            </motion.h2>
          </div>

          <div className="relative">
            {/* Center Line for Desktop */}
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-white/10" />

            <div className="space-y-12">
              {[
                { year: "Early 2024", title: "The idea is born", desc: "Two final-year students — tired of internship hunts going nowhere — sketch an app on a dorm-room whiteboard.", icon: Lightbulb, color: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20", align: "left" as const },
                { year: "Mid 2024", title: "First 100 students", desc: "Launched quietly on WhatsApp. Within 2 weeks had 100+ students signed up, 15 gigs posted, and the first ₹2,000 earned.", icon: Rocket, color: "text-[#0EA5E9] bg-[#0EA5E9]/10 border-[#0EA5E9]/20", align: "right" as const },
                { year: "Late 2024", title: "AI SmartMatch v1", desc: "Integrated AI opportunity matching to connect students to gigs aligned with their skill set. Match rates jumped 3×.", icon: Brain, color: "text-[#7C3AED] bg-[#7C3AED]/10 border-[#7C3AED]/20", align: "left" as const },
                { year: "2025", title: "Nationwide Expansion", desc: "Expanded to campuses across AP, Telangana, and Karnataka. Freemium model for startups introduced.", icon: Globe, color: "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20", align: "right" as const },
              ].map((m, i) => (
                <MilestoneCard key={i} {...m} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ OUR VALUES ════════════════════════════════════════════════ */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewportOnce}
            className="text-4xl md:text-5xl font-black tracking-tight mb-4" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
            Our Values
          </motion.h2>
          <p className="text-lg">The tenets that define how we build.</p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-16 max-w-4xl mx-auto">
          {[
            { icon: Shield, label: "Trust-First", color: "text-[#0EA5E9] bg-[#0EA5E9]/10 border-[#0EA5E9]/20" },
            { icon: Target, label: "Real Outcomes", color: "text-[#00c9a7] bg-[#00c9a7]/10 border-[#00c9a7]/20" },
            { icon: Zap, label: "Move Fast", color: "text-[#ffb800] bg-[#ffb800]/10 border-[#ffb800]/20" },
            { icon: Globe, label: "Open Campus", color: "text-[#ff4d1c] bg-[#ff4d1c]/10 border-[#ff4d1c]/20" },
            { icon: Brain, label: "Tech-Driven", color: "text-white bg-white/5 border-white/10" },
            { icon: TrendingUp, label: "Always Iterating", color: "text-[#ff4d78] bg-[#ff4d78]/10 border-[#ff4d78]/20" },
          ].map((v, i) => (
            <motion.div key={v.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewportOnce} transition={{ delay: i * 0.05 }}>
              <ValuePill {...v} />
            </motion.div>
          ))}
        </div>

        {/* Trust Pillars */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: CheckCircle2, heading: "Campus-Verified", body: "Every student is verified with their college email. No fake accounts, just verified talent.", color: "text-sky-400 bg-sky-500/10" },
            { icon: DollarSign, heading: "Secure Escrow", body: "Money is locked before work begins. Startups are protected, and students are guaranteed payment.", color: "text-emerald-400 bg-emerald-500/10" },
            { icon: Star, heading: "Merit-Based", body: "Ratings, skill verifications, and completed gigs build trust organically.", color: "text-amber-400 bg-amber-500/10" },
          ].map(({ icon: Icon, heading, body, color }, i) => (
            <motion.div key={heading}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewportOnce} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="rounded-3xl p-8 transition-all"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,77,28,0.30)" }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)" }}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${color}`}>
                <Icon size={24} />
              </div>
              <h3 className="font-black mb-3 text-white">{heading}</h3>
              <p className="text-slate-400 leading-relaxed">{body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════ TEAM ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-white/2 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewportOnce}
              className="text-4xl font-black tracking-tight md:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
              Built by students,<br /><span style={{ color: "var(--color-primary)" }}>run by students</span>
            </motion.h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { initials: "SW", name: "Sathwik", role: "Founder", tags: ["Vision", "Strategy"], color: "bg-linear-to-br from-[#7C3AED] to-[#0EA5E9]" },
              { initials: "SU", name: "Suro", role: "CEO", tags: ["Operations", "Scale"], color: "bg-linear-to-br from-[#0EA5E9] to-indigo-600" },
              { initials: "SH", name: "Shanker", role: "Lead Engineer", tags: ["Next.js", "AI", "Supabase"], color: "bg-linear-to-br from-[#10B981] to-teal-600" },
              { initials: "AK", name: "Akash", role: "Growth & UI", tags: ["Marketing", "Design"], color: "bg-linear-to-br from-[#F59E0B] to-rose-500" },
            ].map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewportOnce} transition={{ delay: i * 0.1 }}>
                <TeamCard {...t} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FINAL CTA ═════════════════════════════════════════════════ */}
      <section className="py-28 px-6 text-center relative max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={viewportOnce} transition={{ duration: 0.5 }}>
          <div className="rounded-3xl p-10 md:p-16 backdrop-blur-md relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(255,77,28,0.15), rgba(255,184,0,0.08))", border: "1px solid rgba(255,77,28,0.25)" }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent)]" />
            
            <h2 className="text-4xl md:text-5xl font-black mb-6 relative z-10" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
              This is your story.<br />
              Write it with us.
            </h2>
            <p className="md:text-xl text-slate-300 mb-10 mx-auto leading-relaxed relative z-10">
              Join thousands of ambitious students building their career roadmaps today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white font-black rounded-2xl transition-all hover:-translate-y-0.5 active:scale-95"
                style={{ background: "var(--color-primary)", boxShadow: "var(--shadow-btn-primary)" }}
              >
                Create Free Profile <ArrowRight size={18} />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 font-bold rounded-2xl transition-all hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.15)", color: "var(--color-text)" }}
              >
                View Startup Pricing
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
      
    </div>
  )
}
