import {
  Zap, Building2, Rocket, Crown, Check, ArrowRight,
  ShieldCheck, Brain, Target, 
  Sparkles, Lock
} from "lucide-react"
import { Metadata } from "next"
import Link from "next/link"



export const metadata: Metadata = {
  title: "Employer Plans & Pricing | CampusConnect",
  description: "Choose the right plan to hire India's top student talent. From startups to enterprises.",
}

const PLANS = [
  {
    id: "FREE",
    name: "Basic",
    price: "Free",
    priceNote: "Forever",
    icon: Rocket,
    color: "text-slate-400",
    bg: "bg-white/5 border-white/15",
    glow: "rgba(255,255,255,0.05)",
    cta: "Get Started",
    ctaStyle: "border border-white/20 text-white hover:bg-white/5",
    description: "For founders testing the waters",
    features: [
      "1 active gig posting",
      "View top 3 AI-matched candidates",
      "Standard applicant review",
      "Basic Kanban pipeline",
      "Escrow-protected payments",
    ],
    locked: [
      "AI candidate ranking",
      "Bulk messaging",
      "Campus drives",
      "Analytics dashboard",
    ],
  },
  {
    id: "LAUNCHPAD",
    name: "Launchpad",
    price: "₹999",
    priceNote: "per month",
    icon: Zap,
    color: "text-[#0EA5E9]",
    bg: "bg-[#0EA5E9]/10 border-[#0EA5E9]/25",
    glow: "rgba(14,165,233,0.1)",
    cta: "Start Launchpad",
    ctaStyle: "bg-[#0EA5E9]/20 border border-[#0EA5E9]/50 text-[#38BDF8] hover:bg-[#0EA5E9]/30",
    description: "For active startups scaling fast",
    features: [
      "3 active gig postings",
      "AI JD Generator",
      "Verified candidate filter (edu email)",
      "Full AI match list (top 20)",
      "Applicant messaging",
      "Priority listing",
    ],
    locked: [
      "Bulk CSV export",
      "Campus drives",
      "Hiring analytics",
    ],
  },
  {
    id: "GROWTH",
    name: "Growth",
    price: "₹3,499",
    priceNote: "per month",
    icon: Building2,
    color: "text-[#7C3AED]",
    bg: "bg-[#7C3AED]/15 border-[#7C3AED]/35",
    glow: "rgba(124,58,237,0.15)",
    recommended: true,
    cta: "Start Growth",
    ctaStyle: "",
    description: "For growing teams & agencies",
    features: [
      "10 active gig postings",
      "Full AI semantic talent search",
      "Unlimited candidate messaging",
      "Bulk CSV export to ATS",
      "Applicant ranking by reputation score",
      "Hiring funnel analytics",
      "Team collaboration (3 seats)",
      "Priority support",
    ],
    locked: [
      "Campus drive orchestrator",
      "ATS integrations",
    ],
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: "Custom",
    priceNote: "Annual contract",
    icon: Crown,
    color: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10 border-[#F59E0B]/25",
    glow: "rgba(245,158,11,0.1)",
    cta: "Talk to Sales",
    ctaHref: "/contact-us",
    ctaStyle: "border border-[#F59E0B]/40 text-[#F59E0B] hover:bg-[#F59E0B]/10",
    description: "For corporates & placement drives",
    features: [
      "Unlimited gig postings",
      "Campus Placement Drive Orchestrator",
      "Target 100+ colleges by tier/city",
      "Virtual assessment & coding round bridge",
      "ATS Integration (Greenhouse, Workday)",
      "Dedicated account manager",
      "Custom employer branding page",
      "GSTIN invoicing & enterprise billing",
      "SLA-backed uptime guarantee",
    ],
    locked: [],
  },
]

const FEATURE_MATRIX = [
  { feature: "Active Gig Postings", free: "1", launchpad: "3", growth: "10", enterprise: "Unlimited" },
  { feature: "AI Candidate Match", free: "Top 3 (blurred)", launchpad: "Top 20", growth: "Full list", enterprise: "Full list" },
  { feature: "Verified Candidate Filter", free: "✗", launchpad: "✓", growth: "✓", enterprise: "✓" },
  { feature: "AI JD Generator", free: "✗", launchpad: "✓", growth: "✓", enterprise: "✓" },
  { feature: "Bulk Messaging", free: "✗", launchpad: "✗", growth: "✓", enterprise: "✓" },
  { feature: "CSV Export / ATS Sync", free: "✗", launchpad: "✗", growth: "✓", enterprise: "✓" },
  { feature: "Hiring Analytics", free: "✗", launchpad: "✗", growth: "✓", enterprise: "✓" },
  { feature: "Campus Drive Orchestrator", free: "✗", launchpad: "✗", growth: "✗", enterprise: "✓" },
  { feature: "Team Seats", free: "1", launchpad: "1", growth: "3", enterprise: "Unlimited" },
]

export default function EmployerUpgradePage() {
  return (
    <div
      className="min-h-screen text-slate-100"
      style={{ background: "var(--color-background)", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
    >
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-96 h-96 blur-[140px] rounded-full" style={{ background: "rgba(124,58,237,0.12)" }} />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 blur-[120px] rounded-full" style={{ background: "rgba(255,77,28,0.08)" }} />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 blur-[140px] rounded-full" style={{ background: "rgba(245,158,11,0.07)" }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

        {/* HERO */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7C3AED]/15 border border-[#7C3AED]/30 text-[#A78BFA] text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles size={12} />
            B2B SaaS Employer Platform
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
            Hire India&apos;s <span style={{ background: "linear-gradient(135deg, var(--color-primary), #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Best Student Talent</span>
          </h1>
          <p className="text-lg text-slate-400 mb-3">
            From seed-stage startups to Fortune 500 campus drives. Pre-vetted, AI-matched, escrow-protected.
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {[
              { icon: ShieldCheck, label: "Verified Students", color: "text-[#10B981]" },
              { icon: Brain, label: "AI-Powered Matching", color: "text-[#7C3AED]" },
              { icon: Target, label: "Campus Drive Tools", color: "text-[#F59E0B]" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className={`flex items-center gap-2 text-sm font-bold ${color}`}>
                <Icon size={15} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* PLANS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 flex flex-col transition-all duration-300 ${
                  plan.recommended ? "ring-2 ring-[#7C3AED]/50" : ""
                }`}
                style={{
                  background: "var(--color-surface)",
                  border: `1px solid var(--color-border)`,
                  boxShadow: plan.recommended ? `0 0 40px ${plan.glow}` : undefined,
                }}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" style={{ background: "linear-gradient(90deg, #7C3AED, var(--color-primary))", color: "white" }}>
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <div className={`inline-flex w-10 h-10 rounded-xl border items-center justify-center mb-3 ${plan.bg}`}>
                    <Icon size={18} className={plan.color} />
                  </div>
                  <h2 className="font-black text-white text-lg">{plan.name}</h2>
                  <p className="text-slate-500 text-xs mt-0.5">{plan.description}</p>
                </div>

                <div className="mb-5">
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-white">{plan.price}</span>
                    {plan.price !== "Free" && plan.price !== "Custom" && (
                      <span className="text-slate-500 text-sm mb-1">/mo</span>
                    )}
                  </div>
                  <p className="text-slate-600 text-xs">{plan.priceNote}</p>
                </div>

                <div className="flex-1 space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check size={13} className={`${plan.color} shrink-0 mt-0.5`} />
                      {f}
                    </div>
                  ))}
                  {plan.locked.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <Lock size={11} className="text-slate-700 shrink-0 mt-0.5" />
                      {f}
                    </div>
                  ))}
                </div>

                <Link href={plan.ctaHref || "/client-hub"}>
                  <button
                    className={`w-full py-3 rounded-xl font-black text-sm transition-all active:scale-95 ${plan.ctaStyle}`}
                    style={
                      plan.recommended
                        ? { background: "linear-gradient(135deg, #7C3AED, var(--color-primary))", color: "white", boxShadow: "0 4px 20px rgba(124,58,237,0.3)" }
                        : {}
                    }
                  >
                    {plan.cta}
                    {plan.id !== "ENTERPRISE" && <ArrowRight size={13} className="inline ml-1.5" />}
                  </button>
                </Link>
              </div>
            )
          })}
        </div>

        {/* FEATURE MATRIX */}
        <div>
          <h2 className="text-2xl font-black text-white text-center mb-8" style={{ fontFamily: "var(--font-display)" }}>
            Full Feature Comparison
          </h2>
          <div
            className="rounded-3xl overflow-hidden"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <th className="text-left py-4 px-6 text-slate-500 text-sm font-bold">Feature</th>
                    {["Basic", "Launchpad", "Growth", "Enterprise"].map((p) => (
                      <th key={p} className="text-center py-4 px-4 text-sm font-black text-white">{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_MATRIX.map((row, i) => (
                    <tr
                      key={row.feature}
                      className="transition-colors hover:bg-white/2"
                      style={{ borderBottom: i < FEATURE_MATRIX.length - 1 ? "1px solid var(--color-border)" : "none" }}
                    >
                      <td className="py-3.5 px-6 text-sm text-slate-400">{row.feature}</td>
                      {[row.free, row.launchpad, row.growth, row.enterprise].map((val, idx) => (
                        <td key={idx} className="text-center py-3.5 px-4 text-sm">
                          {val === "✓" ? (
                            <Check size={15} className="text-[#10B981] mx-auto" />
                          ) : val === "✗" ? (
                            <span className="text-slate-700">—</span>
                          ) : (
                            <span className="text-slate-300 font-medium">{val}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SOCIAL PROOF */}
        <div className="text-center">
          <p className="text-slate-500 text-sm mb-6">Trusted by top startups and enterprises across India</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { stat: "< 48hrs", label: "Avg Time to Hire" },
              { stat: "10,000+", label: "Verified Students" },
              { stat: "100%", label: "Escrow Protected" },
              { stat: "4.9★", label: "Employer Rating" },
            ].map(({ stat, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black text-white">{stat}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
