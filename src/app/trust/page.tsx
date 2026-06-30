import type { Metadata } from "next"
import Link from "next/link"
import {
  Shield, CheckCircle, Lock, Eye, AlertTriangle,
  BadgeCheck, Scale, Users, Star, Zap, ArrowRight,
  CreditCard, FileText, Globe, HeartHandshake
} from "lucide-react"

export const metadata: Metadata = {
  title: "Trust & Safety | CampusConnect — How We Protect Students and Employers",
  description:
    "CampusConnect's 5-layer trust system: academic verification, milestone escrow, identity checks, dispute resolution, and fraud detection. Built for safe student-employer collaboration.",
  openGraph: {
    title: "Trust & Safety | CampusConnect",
    description: "India's safest student freelancing platform. See how we protect every transaction.",
    images: [{ url: "/og-trust.jpg" }],
  },
  alternates: { canonical: "https://campusconnectco.in/trust" },
}

const TRUST_PILLARS = [
  {
    icon: BadgeCheck,
    title: "Academic Verification",
    subtitle: "Every student is who they say they are",
    color: "text-[#0EA5E9]",
    bg: "bg-[#0EA5E9]/10 border-[#0EA5E9]/20",
    points: [
      "Institutional email verification (.edu domains)",
      "Government ID cross-check",
      "Enrollment document validation",
      "College registrar API integration (for select institutes)",
    ],
  },
  {
    icon: CreditCard,
    title: "Milestone Escrow",
    subtitle: "Payment held securely until work is approved",
    color: "text-[#10B981]",
    bg: "bg-[#10B981]/10 border-[#10B981]/20",
    points: [
      "Employer funds held in escrow before work starts",
      "Released only on student delivery + employer approval",
      "Automatic release after 7 days if no disputes",
      "Razorpay-powered payment infrastructure",
    ],
  },
  {
    icon: Eye,
    title: "Work Quality Verification",
    subtitle: "AI + human review of delivered work",
    color: "text-[#7C3AED]",
    bg: "bg-[#7C3AED]/10 border-[#7C3AED]/20",
    points: [
      "Plagiarism detection on all deliverables",
      "AI-powered quality scoring",
      "Peer review for high-value gigs (>₹10,000)",
      "Verified portfolio — employers see real work samples",
    ],
  },
  {
    icon: Scale,
    title: "Dispute Resolution",
    subtitle: "Fair, fast, human-mediated conflict resolution",
    color: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10 border-[#F59E0B]/20",
    points: [
      "72-hour initial response SLA",
      "Dedicated trust & safety team",
      "Evidence-based mediation process",
      "Full refund on verified fraud cases",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Fraud Detection Engine",
    subtitle: "ML-powered protection against bad actors",
    color: "text-[#EF4444]",
    bg: "bg-[#EF4444]/10 border-[#EF4444]/20",
    points: [
      "Real-time suspicious activity flagging",
      "Device fingerprinting & IP analysis",
      "Velocity checks on new accounts",
      "Automatic hold on high-risk transactions",
    ],
  },
  {
    icon: Lock,
    title: "Data Privacy",
    subtitle: "Your data belongs to you",
    color: "text-slate-300",
    bg: "bg-white/5 border-white/10",
    points: [
      "DPDP Act 2023 compliant",
      "No data sold to third parties",
      "Right to erasure — delete your account anytime",
      "End-to-end encrypted messages",
    ],
  },
]

const SAFETY_STATS = [
  { value: "₹0", label: "Student funds lost to fraud", sub: "ever" },
  { value: "99.3%", label: "Disputes resolved", sub: "within 72 hours" },
  { value: "100%", label: "Employer-released escrow payments", sub: "successfully processed" },
  { value: "<0.2%", label: "Fraud rate", sub: "industry average: 2.1%" },
]

const FAQS = [
  {
    q: "What happens if an employer doesn't pay?",
    a: "Payment is held in escrow before you start work. If an employer refuses to release funds after delivery without a valid dispute, our team investigates and releases payment to the student within 7 business days.",
  },
  {
    q: "How does CampusConnect verify students?",
    a: "We verify institutional email addresses, cross-check government ID, and for select partner institutes, connect directly with registrar systems. All verified accounts display a blue BadgeCheck mark.",
  },
  {
    q: "Can employers see my personal contact information?",
    a: "No. All communication happens through our encrypted messaging system until you choose to share contact details. Your phone number and personal email are never visible to employers.",
  },
  {
    q: "What if I deliver work and the employer is unsatisfied?",
    a: "We use a milestone-based system — you agree on deliverables upfront. If there's a dispute about quality, our team reviews the original brief and submitted work. If work meets the agreed scope, payment is released.",
  },
  {
    q: "Is CampusConnect safe for employers hiring first-time freelancers?",
    a: "Yes. All students have verified identities, academic credentials, and reputation scores based on past gig completion. You can see their verified work portfolio before making an offer.",
  },
]

import { headers } from "next/headers"

export default async function TrustPage() {
  const nonce = (await headers()).get("x-nonce") || undefined;
  return (
    <div
      className="min-h-screen text-slate-100"
      style={{ background: "var(--color-background)", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
    >
      {/* JSON-LD: FAQPage schema */}
      <script
        type="application/ld+json"
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": FAQS.map((faq) => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": { "@type": "Answer", "text": faq.a },
            })),
          }),
        }}
      />

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 w-96 h-96 blur-[150px] rounded-full" style={{ background: "rgba(16,185,129,0.08)" }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* HERO */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#34D399] text-[11px] font-black uppercase tracking-widest mb-6">
            <Shield size={11} />
            5-Layer Protection System
          </div>
          <h1
            className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight"
            style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}
          >
            Built Safe from<br />
            <span style={{ background: "linear-gradient(135deg, #10B981, #0EA5E9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Day One
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            We built CampusConnect knowing students are trusting us with their first professional income and employers are trusting us with their reputation. Every feature was designed around safety.
          </p>
        </div>

        {/* SAFETY STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SAFETY_STATS.map(({ value, label, sub }) => (
            <div
              key={label}
              className="p-5 rounded-2xl text-center"
              style={{ background: "var(--color-surface)", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              <p className="text-2xl font-black text-[#10B981]">{value}</p>
              <p className="text-xs text-white font-bold mt-1">{label}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* 5-LAYER SYSTEM */}
        <div>
          <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
            <Shield size={18} className="text-[#10B981]" />
            The 5-Layer Trust System
          </h2>
          <p className="text-slate-500 mb-8 text-sm">Every transaction on CampusConnect passes through all five layers simultaneously.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TRUST_PILLARS.map(({ icon: Icon, title, subtitle, color, bg, points }, i) => (
              <div
                key={title}
                className="p-6 rounded-3xl"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${bg}`}>
                    <Icon size={18} className={color} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-white text-sm">{title}</h3>
                      <span className="text-[10px] text-slate-600">Layer {i + 1}</span>
                    </div>
                    <p className="text-xs text-slate-500">{subtitle}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-xs text-slate-400">
                      <CheckCircle size={11} className={`${color} shrink-0 mt-0.5`} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* VERIFICATION BADGE EXPLAINER */}
        <div
          className="p-8 rounded-3xl"
          style={{ background: "var(--color-surface)", border: "1px solid rgba(14,165,233,0.25)" }}
        >
          <h2 className="font-black text-white text-xl mb-2 flex items-center gap-2">
            <BadgeCheck size={18} className="text-[#0EA5E9]" />
            What the Verified Badge Means
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            A blue BadgeCheck on any CampusConnect profile means that user has passed all three verification stages:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: "01", label: "Identity Verified", desc: "Government ID matched to account name and date of birth" },
              { step: "02", label: "Academic Verified", desc: "Enrolled student confirmed via institutional email + documents" },
              { step: "03", label: "Track Record Verified", desc: "At least 1 completed gig with employer rating of 4.0+" },
            ].map(({ step, label, desc }) => (
              <div key={step} className="p-4 rounded-2xl bg-[#0EA5E9]/5 border border-[#0EA5E9]/15">
                <span className="text-[11px] font-black text-[#0EA5E9] uppercase tracking-widest">{step}</span>
                <p className="font-black text-white text-sm mt-1">{label}</p>
                <p className="text-xs text-slate-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
            <HeartHandshake size={18} className="text-[#F59E0B]" />
            Frequently Asked Safety Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl overflow-hidden"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-bold text-white text-sm">{faq.q}</span>
                  <Zap size={14} className="text-slate-500 group-open:text-[#7C3AED] transition-colors shrink-0 ml-2" />
                </summary>
                <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/8 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* LINKS TO LEGAL */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Privacy Policy", href: "/privacy-policy", icon: Lock },
            { label: "Terms of Service", href: "/terms-and-conditions", icon: FileText },
            { label: "Refund Policy", href: "/refund-policy", icon: CreditCard },
            { label: "Editorial Standards", href: "/editorial", icon: Globe },
          ].map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-2 p-3 rounded-xl text-sm text-slate-400 hover:text-white transition-all border border-white/8 hover:border-white/15"
              style={{ background: "var(--color-surface)" }}
            >
              <Icon size={13} className="text-slate-500" />
              {label}
              <ArrowRight size={11} className="ml-auto text-slate-600" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
