"use client"

import {
  TrendingUp, CheckCircle2,
  ArrowRight, Crown, Rocket, Gift, Shield,
  GraduationCap, ChevronDown, ChevronUp
} from "lucide-react"
import { useState } from "react"

const BENEFITS = [
  { icon: TrendingUp, color: "#10B981", title: "Earn from every student you onboard", desc: "Get 5% of the platform fee on every gig your students complete. This compounds every month." },
  { icon: Crown, color: "#F59E0B", title: "\"Campus Captain\" title & badge", desc: "Exclusive badge shown on your public profile and leaderboard. Stands out to employers." },
  { icon: Gift, color: "#7C3AED", title: "CampusConnect merch kit", desc: "Hoodie, laptop sticker pack, and notebook — shipped to you when you onboard your first 10 students." },
  { icon: Rocket, color: "#0EA5E9", title: "Priority for CampusConnect internships", desc: "Ambassadors get first access to paid internship roles within CampusConnect as we grow." },
  { icon: Shield, color: "#EF4444", title: "Official certificate for placements", desc: "\"Campus Growth Lead, CampusConnect\" — add to your resume and LinkedIn." },
  { icon: GraduationCap, color: "#F59E0B", title: "Placement cell introduction", desc: "We help you open the door to your placement cell for an official campus partnership." },
]

const RESPONSIBILITIES = [
  "Host 1 CampusConnect info session per semester (we provide all materials)",
  "Share gig opportunities in your college's WhatsApp groups 2x/week",
  "Onboard a minimum of 5 students per month",
  "Be the point-of-contact for your college's placement cell",
  "Share your campus earnings milestones on LinkedIn (optional but powerful)",
]

const TIERS = [
  { name: "Starter", icon: "🌱", req: "0-2 onboards", perRef: "₹100 bonus", color: "#10B981", unlocks: "Title + Badge" },
  { name: "Champion", icon: "⚡", req: "3-9 onboards", perRef: "₹150 bonus", color: "#0EA5E9", unlocks: "Silver badge + Priority support" },
  { name: "Ambassador", icon: "🏆", req: "10-24 onboards", perRef: "₹200 bonus", color: "#F59E0B", unlocks: "Gold badge + Merch kit + Pro plan" },
  { name: "Legend", icon: "👑", req: "25+ onboards", perRef: "₹250 bonus", color: "#7C3AED", unlocks: "Campus Legend title + Internship track" },
]

const FAQ = [
  {
    q: "How much time does this take per week?",
    a: "About 1-2 hours per week. Mostly WhatsApp sharing and attending 1-2 events per semester. There's no minimum daily requirement.",
  },
  {
    q: "How do I earn the 5% fee share?",
    a: "When a student you onboarded (who signed up using your referral link) completes a gig, you receive 5% of CampusConnect's platform fee — directly to your account. Not a cut from their earnings.",
  },
  {
    q: "Can I be an ambassador if I'm already working on gigs?",
    a: "Absolutely — in fact, ambassadors who actively use the platform are the most effective. Your own earnings story is your best pitch.",
  },
  {
    q: "Is there a minimum GPA or grade requirement?",
    a: "No GPA requirement. We look for students who are active, communicative, and genuinely excited about the platform.",
  },
  {
    q: "What happens after I apply?",
    a: "Our campus ops team reviews your application within 48 hours and schedules a 15-minute onboarding call. You'll get your referral kit (link, materials, WhatsApp caption templates) the same day.",
  },
]

export function AmbassadorClient({ nonce }: { nonce?: string }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [applied, setApplied] = useState(false)
  const [form, setForm] = useState({ name: "", college: "", year: "", whatsapp: "", linkedin: "", why: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // In production: POST to /api/growth/ambassador-apply
    setApplied(true)
  }

  return (
    <div
      className="min-h-screen text-slate-100"
      style={{ background: "var(--color-background, #080D1A)", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
    >
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 blur-[150px] rounded-full" style={{ background: "rgba(124,58,237,0.07)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 blur-[120px] rounded-full" style={{ background: "rgba(245,158,11,0.06)" }} />
      </div>

      {/* JSON-LD */}
      <script nonce={nonce} suppressHydrationWarning
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOccupationalProgram",
            "name": "CampusConnect Campus Ambassador Program",
            "url": "https://campusconnectco.in/ambassador",
            "description": "Become a Campus Captain for CampusConnect. Lead your college community, earn from every student you onboard.",
            "educationalProgramMode": "online",
            "provider": {
              "@type": "Organization",
              "name": "CampusConnect",
              "url": "https://campusconnectco.in",
            },
          }),
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* ── HERO ── */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest mb-6 text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20">
            <Crown size={11} /> Campus Ambassador Program
          </div>
          <h1
            className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight"
            style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}
          >
            Be the{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #F59E0B, #FF4500)" }}
            >
              Campus Captain
            </span>{" "}
            at your college.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Lead your college&apos;s CampusConnect community. Earn from every student you help. Build a resume that actually stands out. No prior experience needed — just hustle.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#apply"
              className="px-8 py-3.5 rounded-2xl font-black text-sm text-white transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, #7C3AED, #FF4500)", boxShadow: "0 8px 32px rgba(124,58,237,0.35)" }}
            >
              Apply Now — Free
            </a>
            <a
              href="#how-it-works"
              className="px-6 py-3.5 rounded-2xl font-black text-sm text-slate-300 border border-white/10 hover:border-white/20 transition-all"
            >
              How it works
            </a>
          </div>
          <p className="text-xs text-slate-600 mt-4">Applications reviewed within 48 hours · No commitment until you&apos;re ready</p>
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Avg ambassador earns", value: "₹2,400/mo", sub: "from fee sharing" },
            { label: "Students onboarded", value: "5/month", sub: "minimum target" },
            { label: "Campuses with captains", value: "Growing", sub: "apply to be first" },
            { label: "Time commitment", value: "2 hrs/week", sub: "flexible schedule" },
          ].map(({ label, value, sub }) => (
            <div
              key={label}
              className="p-5 rounded-3xl text-center"
              style={{ background: "var(--color-surface, #0F1624)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-xl font-black text-white mb-0.5">{value}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{label}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── BENEFITS ── */}
        <div>
          <h2
            className="text-2xl font-black text-white mb-8 text-center"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What you get as Campus Captain
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="p-5 rounded-3xl"
                style={{ background: "var(--color-surface, #0F1624)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: `${color}15` }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <h3 className="font-black text-white text-sm mb-1">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── TIER LADDER ── */}
        <div>
          <h2 className="text-2xl font-black text-white mb-2 text-center" style={{ fontFamily: "var(--font-display)" }}>
            The Ambassador Tier Ladder
          </h2>
          <p className="text-slate-500 text-sm text-center mb-8">The more students you onboard, the more you earn per referral.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIERS.map(({ name, icon, req, perRef, color, unlocks }) => (
              <div
                key={name}
                className="p-5 rounded-3xl"
                style={{ background: `${color}08`, border: `1px solid ${color}25` }}
              >
                <div className="text-2xl mb-2">{icon}</div>
                <p className="font-black text-white text-sm mb-0.5">{name}</p>
                <p className="text-[10px] text-slate-500 mb-3">{req}</p>
                <p className="font-black text-sm mb-1" style={{ color }}>{perRef}</p>
                <p className="text-[10px] text-slate-500">{unlocks}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div id="how-it-works">
          <h2 className="text-2xl font-black text-white mb-8 text-center" style={{ fontFamily: "var(--font-display)" }}>
            Your responsibilities
          </h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {RESPONSIBILITIES.map((r, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-2xl"
                style={{ background: "var(--color-surface, #0F1624)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <CheckCircle2 size={16} className="text-[#10B981] mt-0.5 shrink-0" />
                <p className="text-sm text-slate-300">{r}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div>
          <h2 className="text-2xl font-black text-white mb-8 text-center" style={{ fontFamily: "var(--font-display)" }}>
            Frequently asked questions
          </h2>
          <div className="max-w-2xl mx-auto space-y-2">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden"
                style={{ background: "var(--color-surface, #0F1624)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <button
                  className="w-full flex items-center justify-between p-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-bold text-white text-sm">{item.q}</span>
                  {openFaq === i ? (
                    <ChevronUp size={14} className="text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown size={14} className="text-slate-500 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-3">
                    <p className="text-sm text-slate-400 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── APPLICATION FORM ── */}
        <div id="apply" className="max-w-2xl mx-auto">
          <div
            className="rounded-3xl overflow-hidden"
            style={{ background: "var(--color-surface, #0F1624)", border: "1px solid rgba(124,58,237,0.2)" }}
          >
            <div className="p-6 border-b border-white/5" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(255,69,0,0.06))" }}>
              <h2 className="text-xl font-black text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>
                Apply to be a Campus Captain
              </h2>
              <p className="text-sm text-slate-400">We review every application within 48 hours. No commitment required.</p>
            </div>

            {applied ? (
              <div className="p-10 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-black text-white mb-2">Application received!</h3>
                <p className="text-slate-400 text-sm">Our campus ops team will reach out within 48 hours. Check your WhatsApp and email.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { key: "name", label: "Full Name", placeholder: "Ravi Kumar", required: true },
                    { key: "college", label: "College", placeholder: "IIT Delhi", required: true },
                    { key: "year", label: "Year", placeholder: "2nd year B.Tech", required: true },
                    { key: "whatsapp", label: "WhatsApp Number", placeholder: "+91 98765 43210", required: true },
                  ].map(({ key, label, placeholder, required }) => (
                    <div key={key}>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">{label}</label>
                      <input
                        type="text"
                        placeholder={placeholder}
                        required={required}
                        value={form[key as keyof typeof form]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full text-sm text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 outline-none focus:border-[#7C3AED]/50 transition-all"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">LinkedIn URL (optional)</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/yourname"
                    value={form.linkedin}
                    onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))}
                    className="w-full text-sm text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">Why do you want to be Campus Captain? *</label>
                  <textarea
                    placeholder="Tell us about yourself and why your campus needs CampusConnect..."
                    required
                    rows={4}
                    value={form.why}
                    onChange={e => setForm(f => ({ ...f, why: e.target.value }))}
                    className="w-full text-sm text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 outline-none transition-all resize-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-95"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #FF4500)", boxShadow: "0 8px 32px rgba(124,58,237,0.3)" }}
                >
                  Submit Application <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
