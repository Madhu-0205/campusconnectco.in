"use client"
import { motion } from "framer-motion"
import {
  CheckCircle2, ChevronDown, ShieldCheck,
  MessageSquare
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import FeeCalculator from "@/components/ui/FeeCalculator"
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/animations"

const studentFeatures = [
  "AI Career Roadmap generator",
  "Browse all gigs & internships",
  "Unlimited gig applications",
  "AI Resume analyzer & ATS scorer",
  "WhatsApp gig alerts",
  "Escrow-protected payments",
  "SmartMatch AI recommendations",
  "Career AI chat assistant",
  "Public portfolio page",
]

const startupFreeTier = [
  "Post up to 2 gigs/month",
  "Access all student profiles",
  "15% platform fee per completed gig",
  "Escrow protection on all payments",
  "Basic applicant ranking",
]

const startupStarterTier = [
  "Post up to 10 gigs/month",
  "8% platform fee per gig",
  "Escrow protection on all payments",
  "Priority applicant ranking",
  "Email support",
  "Analytics dashboard",
]

const startupGrowthTier = [
  "Unlimited gig postings",
  "Only 5% platform fee",
  "AI Sourcing Copilot",
  "Priority applicant ranking",
  "Dedicated account manager",
  "Custom career fairs",
  "API access",
  "Custom branding",
]

const faqs = [
  {
    q: "How does escrow work?",
    a: "When a startup accepts a student for a gig, they deposit the payment into our escrow system (powered by Razorpay Route). Funds are only released to the student after the startup approves the completed work. This guarantees students always get paid.",
  },
  {
    q: "Who pays the platform fee — student or startup?",
    a: "Always the startup — never the student. Students use CampusConnect completely free of charge. The platform fee is added on top of the gig value when startups post and fund escrow.",
  },
  {
    q: "Can I switch between tiers?",
    a: "Yes! You can upgrade or downgrade your startup subscription at any time. The new rate applies from the next billing cycle.",
  },
  {
    q: "Is there a placement fee for internships?",
    a: "Yes, for internship placements (longer-term roles), we charge a one-time placement fee of 5–8% of the student's first month stipend, paid by the startup.",
  },
  {
    q: "What if there's a dispute on a gig?",
    a: "Our team reviews all disputes within 24 hours. Funds remain safely in escrow until resolution. If the dispute is resolved in the student's favour, payment is released. If not, it's refunded to the startup.",
  },
  {
    q: "Do I need to pay anything to post my first gig?",
    a: "No. Startups on the Free tier can post 2 gigs per month at no subscription cost. You only pay when a gig is completed successfully. The 15% platform fee is deducted from the escrow at settlement.",
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/8 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left group"
      >
        <span className="font-semibold text-sm pr-4 transition-colors" style={{ color: "var(--color-text)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-primary)" }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text)" }}
          >{q}</span>
        <ChevronDown
          size={18}
          className={`text-slate-500 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          style={open ? { color: "var(--color-primary)" } : {}}
        />
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="px-5 pb-5 text-sm leading-relaxed border-white/5 pt-4"
        >
          {a}
        </motion.div>
      )}
    </div>
  )
}

export default function PricingClient() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)", color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px]" style={{ background: "rgba(255,77,28,0.10)" }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: "rgba(0,201,167,0.07)" }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">

        {/* ── HERO ── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center mb-20"
        >
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6" style={{ background: "rgba(255,77,28,0.10)", border: "1px solid rgba(255,77,28,0.25)", color: "var(--color-primary)" }}>
              <ShieldCheck size={14} /> Transparent Pricing
            </div>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl font-black tracking-tight mb-6 leading-[1.05]"
            style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}
          >
            Free for students.{" "}
            <span className="text-transparent bg-linear-to-r from-[#10B981] to-[#0EA5E9]">
              Always.
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl max-w-2xl mx-auto leading-relaxed">
            We built the model that Internshala and Fiverr couldn&apos;t.{" "}
            <strong className="text-white">Students pay nothing. Startups pay only when you hire.</strong>
          </motion.p>
        </motion.div>

        {/* ── 3 COLUMN PRICING ── */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">

          {/* Students — Free forever */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce} transition={{ duration: 0.6 }}
            className="relative rounded-3xl p-8 flex flex-col"
            style={{ background: "var(--color-surface)", border: "1px solid rgba(16,185,129,0.30)", boxShadow: "0 0 60px rgba(16,185,129,0.08)" }}
          >
            <div className="text-3xl mb-4">🎓</div>
            <h2 className="text-2xl font-black mb-1" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
              Students
            </h2>
            <div className="font-bold text-sm mb-2">Free forever</div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-black text-white">₹0</span>
              <span className="text-slate-500">/month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {studentFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-slate-300">
                  <CheckCircle2 size={16} className="text-[#10B981] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="bg-(--accent)/10 border border-[#10B981]/20 rounded-2xl p-4 mb-6 text-slate-400 leading-relaxed">
              💜 <strong className="text-white">We only earn when you earn</strong> — and we take our cut from the startup, never from you.
            </div>
            <Link href="/auth/sign-up"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#10B981] hover:bg-[#059669] text-[#0A1628] font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:-translate-y-0.5">
              Create Free Profile →
            </Link>
          </motion.div>

          {/* Startup Free */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce} transition={{ duration: 0.6, delay: 0.1 }}
            className="relative rounded-3xl p-8 flex flex-col"
            style={{ background: "var(--color-surface)", border: "1px solid rgba(255,77,28,0.40)", boxShadow: "0 0 60px rgba(255,77,28,0.10)" }}
          >
            {/* Most popular badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-black rounded-full tracking-wider uppercase" style={{ background: "var(--color-primary)", boxShadow: "0 0 20px rgba(255,77,28,0.5)" }}>
              ⭐ Most Popular
            </div>
            <div className="text-3xl mb-4">🚀</div>
            <h2 className="text-2xl font-black mb-1" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
              Startups — Free
            </h2>
            <div className="font-bold text-sm mb-2" style={{ color: "var(--color-primary)" }}>No monthly cost</div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-black text-white">₹0</span>
              <span className="text-slate-500">/month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {startupFreeTier.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-slate-300">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "var(--color-primary)" }} />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mb-6" />
            <Link href="/auth/sign-up?role=client"
              className="w-full flex items-center justify-center gap-2 py-3.5 text-white font-black rounded-2xl transition-all hover:-translate-y-0.5 active:scale-95"
              style={{ background: "var(--color-primary)", boxShadow: "var(--shadow-btn-primary)" }}>
              Start Hiring Free →
            </Link>
          </motion.div>

          {/* Startup Growth */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce} transition={{ duration: 0.6, delay: 0.2 }}
            className="relative rounded-3xl p-8 flex flex-col"
            style={{ background: "var(--color-surface)", border: "1px solid rgba(245,158,11,0.30)", boxShadow: "0 0 60px rgba(245,158,11,0.08)" }}
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#F59E0B] text-xs font-black rounded-full tracking-wider uppercase">
              🏆 Best Value
            </div>
            <div className="text-3xl mb-4">⚡</div>
            <h2 className="text-2xl font-black mb-1" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
              Startups — Growth
            </h2>
            <div className="font-bold text-sm mb-2">Unlimited hiring</div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="font-black text-white">₹2,499</span>
              <span className="text-slate-500">/month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {startupGrowthTier.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-slate-300">
                  <CheckCircle2 size={16} className="text-[#F59E0B] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mb-6" />
            <Link href="/auth/sign-up?role=client&plan=growth"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#0A1628] font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] hover:-translate-y-0.5">
              Upgrade to Growth →
            </Link>
          </motion.div>
        </div>

        {/* ── TRANSPARENCY CALLOUT ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce} transition={{ duration: 0.6 }}
          className="rounded-3xl p-8 text-center mb-16"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <p className="text-lg max-w-3xl mx-auto leading-relaxed">
            🚀 Like{" "}
            <strong className="text-white">Swiggy takes a delivery fee</strong>
            , CampusConnect takes a small platform fee on every completed gig —{" "}
            <strong style={{ color: "var(--color-primary)" }}>paid by the startup, never the student.</strong>
          </p>
        </motion.div>

        {/* ── FEE CALCULATOR ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce} transition={{ duration: 0.7 }}
          className="mb-20"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-black mb-3" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
              Calculate your exact fees
            </h2>
            <p className="text-slate-400">No surprises. Drag the slider — see everything update live.</p>
          </div>
          <FeeCalculator />
        </motion.div>

        {/* ── COMPARISON TABLE ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce} transition={{ duration: 0.7 }}
          className="mb-20"
        >
          <h2 className="font-black text-center mb-10" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
            Why students are switching
          </h2>
          <div className="overflow-x-auto rounded-3xl border border-white/8">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-white/8">
                  <th className="p-4 text-sm font-bold">Feature</th>
                  <th className="p-4 text-center">
                    <span className="text-xs font-black px-3 py-1.5 rounded-xl" style={{ background: "var(--color-primary)", color: "white" }}>CampusConnect</span>
                  </th>
                  <th className="p-4 text-sm font-bold">Internshala</th>
                  <th className="p-4 text-sm font-bold">Fiverr</th>
                  <th className="p-4 text-sm font-bold">LinkedIn</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["AI Roadmap", true, false, false, false],
                  ["Escrow Payments", true, false, false, false],
                  ["India-first Focus", true, true, false, false],
                  ["WhatsApp Alerts", true, false, false, false],
                  ["Free for Students", true, true, false, false],
                  ["Micro-Gig Marketplace", true, false, true, false],
                  ["Startup Sourcing AI", true, false, false, false],
                ].map(([label, ...vals], i) => (
                  <tr key={i} className="border-white/5 hover:bg-white/3 transition-colors">
                    <td className="p-4 text-sm font-medium">{label as string}</td>
                    {(vals as boolean[]).map((v, j) => (
                      <td key={j} className="p-4 text-center">
                        {v ? (
                          <span className={`text-lg ${j === 0 ? "text-[#10B981]" : "text-slate-400"}`}>
                            {j === 0 ? "✅" : "✓"}
                          </span>
                        ) : (
                          <span className="text-slate-700">✗</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── FAQ ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce} transition={{ duration: 0.7 }}
        >
          <h2 className="font-black text-center mb-10" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </motion.div>

        {/* ── BOTTOM CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce} transition={{ duration: 0.7 }}
          className="text-center mt-20"
        >
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
            Ready to launch?
          </h2>
          <p className="text-lg mb-8">Join students already building their careers on CampusConnect.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up"
              className="px-8 py-4 font-black rounded-2xl text-sm transition-all hover:-translate-y-0.5 active:scale-95"
              style={{ background: "var(--color-primary)", boxShadow: "var(--shadow-btn-primary)" }}>
              Create Free Student Profile →
            </Link>
            <Link href="/auth/sign-up?role=client"
              className="px-8 py-4 font-bold rounded-2xl text-sm transition-all hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,0.15)", color: "var(--color-text)" }}>
              Start Hiring Students
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
