"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Star, Quote, TrendingUp, Award, Users, ArrowRight,
  CheckCircle, Briefcase, GraduationCap, Building2, MapPin,
  Play, ChevronRight, Sparkles, BadgeCheck, Heart
} from "lucide-react"

// ── DATA ──────────────────────────────────────────────────────────────────────

const AGGREGATE_STATS = [
  { value: "10,000+", label: "Students Placed", icon: GraduationCap, color: "text-[#7C3AED]" },
  { value: "₹4.2 Cr", label: "Earned by Students", icon: TrendingUp, color: "text-[#10B981]" },
  { value: "2,800+", label: "Verified Employers", icon: Building2, color: "text-[#0EA5E9]" },
  { value: "4.9 / 5", label: "Average Rating", icon: Star, color: "text-[#F59E0B]" },
]

const STUDENT_STORIES = [
  {
    id: "arjun-sharma",
    name: "Arjun Sharma",
    role: "B.Tech CSE, IIT Delhi → SDE Intern @ Razorpay",
    avatar: "AS",
    avatarBg: "bg-[#7C3AED]/20",
    avatarColor: "text-[#A78BFA]",
    location: "New Delhi",
    outcome: "₹35,000 earned in 3 months + PPO from first gig client",
    quote:
      "I completed 6 freelance gigs on CampusConnect before my 3rd year ended. When Razorpay interviewed me, the verified work history was the reason I got shortlisted over 300 other candidates. No other platform had real employers with milestone escrow — it's the only place where the work actually counts.",
    tags: ["React", "Node.js", "API Integration"],
    gigType: "Full-Stack Development",
    rating: 5,
    verified: true,
    featured: true,
  },
  {
    id: "priya-nair",
    name: "Priya Nair",
    role: "MBA Marketing, IIMA → Growth Lead @ Zepto",
    avatar: "PN",
    avatarBg: "bg-[#EC4899]/20",
    avatarColor: "text-[#F472B6]",
    location: "Ahmedabad",
    outcome: "3 clients converted to full-time offer within 8 months",
    quote:
      "As an MBA student, I couldn't just say I understood growth marketing — I had to show it. CampusConnect let me run real campaigns for D2C brands and charge professionally. The verified ratings system meant my profile spoke for itself. I walked into Zepto interviews with a portfolio that had actual revenue numbers.",
    tags: ["Growth Marketing", "D2C", "Meta Ads"],
    gigType: "Digital Marketing",
    rating: 5,
    verified: true,
    featured: true,
  },
  {
    id: "rohit-gupta",
    name: "Rohit Gupta",
    role: "B.Des, NID Ahmedabad → UX Designer @ Swiggy",
    avatar: "RG",
    avatarBg: "bg-[#F59E0B]/20",
    avatarColor: "text-[#FCD34D]",
    location: "Bangalore",
    outcome: "₹28,000 first gig → ₹80,000/month by graduation",
    quote:
      "Design students don't get coding-style internships. CampusConnect was the first platform that had real UX briefs from actual startups — not design contests where you work for free and might win nothing. The escrow system meant I always got paid. In 18 months I went from ₹28k to ₹80k/month.",
    tags: ["Figma", "User Research", "Prototyping"],
    gigType: "UX/Product Design",
    rating: 5,
    verified: true,
    featured: false,
  },
  {
    id: "sneha-iyer",
    name: "Sneha Iyer",
    role: "B.Com, Christ University → Analyst @ EY",
    avatar: "SI",
    avatarBg: "bg-[#10B981]/20",
    avatarColor: "text-[#34D399]",
    location: "Bangalore",
    outcome: "Built a verified finance portfolio with 12 real clients",
    quote:
      "Commerce students are told to wait for CA articleship or a bank job. I used CampusConnect to do real financial modeling, MIS reports and pitch decks for 12 different startups. EY specifically cited my 'demonstrated client work' in my offer letter. That's the CampusConnect effect.",
    tags: ["Financial Modeling", "Excel", "Pitch Decks"],
    gigType: "Finance & Analysis",
    rating: 5,
    verified: true,
    featured: false,
  },
  {
    id: "akash-patel",
    name: "Akash Patel",
    role: "B.Tech, VNIT Nagpur → Placed @ Microsoft",
    avatar: "AP",
    avatarBg: "bg-[#0EA5E9]/20",
    avatarColor: "text-[#38BDF8]",
    location: "Pune",
    outcome: "26 LPA offer backed by verified open-source + gig portfolio",
    quote:
      "I'm from a Tier-2 college. Everyone told me Microsoft wouldn't look at my resume. CampusConnect helped me build verified proof — real clients, real code reviews, real ratings. I showed up to Microsoft interviews with a portfolio that would hold up under any scrutiny. They offered me 26 LPA.",
    tags: ["Python", "System Design", "Cloud"],
    gigType: "Backend Engineering",
    rating: 5,
    verified: true,
    featured: true,
  },
  {
    id: "meera-krishnamurthy",
    name: "Meera Krishnamurthy",
    role: "M.Sc Data Science, IISc → ML Engineer @ Flipkart",
    avatar: "MK",
    avatarBg: "bg-[#FF4500]/20",
    avatarColor: "text-[#FF6B35]",
    location: "Bangalore",
    outcome: "Published 3 ML case studies using real client data",
    quote:
      "Research is great but employers want applied ML. Through CampusConnect I built a recommendation engine for a D2C brand, an NLP classifier for a legal tech startup, and a demand forecasting model. These weren't Kaggle notebooks — they were production systems. Flipkart hired me in their first interview round.",
    tags: ["Python", "PyTorch", "MLOps"],
    gigType: "Machine Learning",
    rating: 5,
    verified: true,
    featured: false,
  },
]

const EMPLOYER_STORIES = [
  {
    id: "licious-case",
    company: "Licious",
    logo: "LC",
    logoBg: "bg-[#EF4444]/20",
    logoColor: "text-[#F87171]",
    contact: "Ayesha Mehta, CTO",
    industry: "D2C / FoodTech",
    outcome: "Hired 3 engineers via CampusConnect; saved ₹40L vs agency fees",
    quote:
      "We were scaling rapidly and needed engineers who could ship fast. CampusConnect gave us access to students who'd already proven they could build in production environments. The verified portfolio meant zero surprise hires. We've now made it our default for entry-level technical hiring.",
    metrics: [
      { label: "Time to first hire", value: "6 days" },
      { label: "Cost per hire", value: "₹0 fee" },
      { label: "Retention at 12 months", value: "100%" },
    ],
    plan: "Growth",
  },
  {
    id: "smallcase-case",
    company: "Smallcase",
    logo: "SC",
    logoBg: "bg-[#10B981]/20",
    logoColor: "text-[#34D399]",
    contact: "Ravi Shankar, Head of Engineering",
    industry: "FinTech",
    outcome: "15 campus drives, 8 full-time hires from IIT/NIT campuses",
    quote:
      "Traditional campus placement is a 6-month process. With CampusConnect's Campus Drives feature, we ran 15 virtual drives across IITs and NITs in parallel, screened 800+ students, and made 8 offers in 3 weeks. The quality of candidates was exceptional — all had verified work samples we could evaluate before interviewing.",
    metrics: [
      { label: "Colleges reached", value: "15" },
      { label: "Students screened", value: "800+" },
      { label: "Offer acceptance rate", value: "87%" },
    ],
    plan: "Enterprise",
  },
]

const CATEGORIES = ["All", "Engineering", "Design", "Marketing", "Finance", "Data Science"]

// ── COMPONENT ────────────────────────────────────────────────────────────────

export function SuccessStoriesClient({ nonce }: { nonce?: string }) {
  const [activeCategory, setActiveCategory] = useState("All")
  const [activeTab, setActiveTab] = useState<"students" | "employers">("students")

  const filtered = activeCategory === "All"
    ? STUDENT_STORIES
    : STUDENT_STORIES.filter((s) => s.tags.some((t) =>
        t.toLowerCase().includes(activeCategory.toLowerCase()) ||
        s.gigType.toLowerCase().includes(activeCategory.toLowerCase())
      ))

  const featured = STUDENT_STORIES.filter((s) => s.featured)

  return (
    <div
      className="min-h-screen text-slate-100"
      style={{ background: "var(--color-background)", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
    >
      {/* JSON-LD: AggregateRating + Review schema */}
      <script nonce={nonce} suppressHydrationWarning
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "CampusConnect",
            "url": "https://campusconnectco.in",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "10000",
              "bestRating": "5",
              "worstRating": "1"
            },
            "review": STUDENT_STORIES.slice(0, 3).map((s) => ({
              "@type": "Review",
              "author": { "@type": "Person", "name": s.name },
              "reviewBody": s.quote,
              "reviewRating": { "@type": "Rating", "ratingValue": s.rating },
              "datePublished": "2024-01-01",
            }))
          })
        }}
      />

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-96 h-96 blur-[150px] rounded-full" style={{ background: "rgba(124,58,237,0.1)" }} />
        <div className="absolute top-1/2 right-1/4 w-72 h-72 blur-[120px] rounded-full" style={{ background: "rgba(16,185,129,0.08)" }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* HERO */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#FCD34D] text-[11px] font-black uppercase tracking-widest mb-6">
            <Star size={11} />
            Verified Outcomes · Real Students
          </div>
          <h1
            className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight"
            style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}
          >
            Students Who Chose to<br />
            <span style={{ background: "linear-gradient(135deg, #7C3AED, #FF4500)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Build Before They Graduated
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Every story here is verified. Real students, real work, real outcomes — not internship rejection stories or LinkedIn hustle posts.
          </p>
        </div>

        {/* AGGREGATE STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {AGGREGATE_STATS.map(({ value, label, icon: Icon, color }) => (
            <div
              key={label}
              className="p-5 rounded-2xl text-center"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            >
              <Icon size={20} className={`${color} mx-auto mb-2`} />
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* TAB SWITCHER */}
        <div className="flex items-center gap-2 p-1 rounded-2xl w-fit mx-auto" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          {(["students", "employers"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-black capitalize transition-all ${
                activeTab === tab
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              style={activeTab === tab ? { background: "linear-gradient(135deg, #7C3AED, var(--color-primary, #FF4500))" } : {}}
            >
              {tab === "students" ? "Student Stories" : "Employer Case Studies"}
            </button>
          ))}
        </div>

        {activeTab === "students" && (
          <>
            {/* FEATURED */}
            <div>
              <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                <Sparkles size={18} className="text-[#F59E0B]" />
                Featured Stories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {featured.map((story) => (
                  <div
                    key={story.id}
                    className="p-6 rounded-3xl flex flex-col hover:border-[#7C3AED]/40 transition-all group"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black ${story.avatarBg} ${story.avatarColor}`}>
                          {story.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-black text-white text-sm">{story.name}</p>
                            {story.verified && <BadgeCheck size={13} className="text-[#0EA5E9]" />}
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight">{story.location}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {Array.from({ length: story.rating }).map((_, i) => (
                          <Star key={i} size={11} className="text-[#F59E0B] fill-[#F59E0B]" />
                        ))}
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-4 mb-3">
                        <Quote size={12} className="inline mr-1 text-[#7C3AED]" />
                        {story.quote}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/8">
                      <p className="text-[10px] font-black text-[#10B981]">{story.outcome}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{story.role}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {story.tags.map((t) => (
                        <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#A78BFA] rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CATEGORY FILTER */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-6">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all border ${
                      activeCategory === cat
                        ? "bg-[#7C3AED]/20 border-[#7C3AED]/40 text-[#A78BFA]"
                        : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filtered.map((story) => (
                  <div
                    key={story.id}
                    className="p-5 rounded-2xl flex gap-4 hover:border-[#7C3AED]/30 transition-all"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${story.avatarBg} ${story.avatarColor}`}>
                      {story.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-black text-white text-sm">{story.name}</span>
                        {story.verified && <BadgeCheck size={13} className="text-[#0EA5E9]" />}
                        <span className="text-[10px] text-slate-500">{story.role}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-2">{story.quote}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[11px] font-black text-[#10B981]">{story.outcome}</span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-500">
                          <MapPin size={9} /> {story.location}
                        </span>
                        <span className="text-[10px] text-slate-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/8">
                          {story.gigType}
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                      {Array.from({ length: story.rating }).map((_, i) => (
                        <Star key={i} size={9} className="text-[#F59E0B] fill-[#F59E0B]" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "employers" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Building2 size={18} className="text-[#0EA5E9]" />
              Employer Case Studies
            </h2>
            {EMPLOYER_STORIES.map((cs) => (
              <div
                key={cs.id}
                className="p-8 rounded-3xl"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 ${cs.logoBg} ${cs.logoColor}`}>
                    {cs.logo}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-white text-xl">{cs.company}</h3>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#A78BFA]">
                        {cs.plan} Plan
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{cs.contact} · {cs.industry}</p>
                  </div>
                </div>

                <blockquote className="text-slate-300 text-sm leading-relaxed mb-6 pl-4 border-l-2 border-[#7C3AED]/50">
                  <Quote size={14} className="text-[#7C3AED] mb-1" />
                  {cs.quote}
                </blockquote>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  {cs.metrics.map((m) => (
                    <div key={m.label} className="text-center p-3 rounded-xl bg-white/3 border border-white/8">
                      <p className="font-black text-white text-lg">{m.value}</p>
                      <p className="text-[10px] text-slate-500">{m.label}</p>
                    </div>
                  ))}
                </div>

                <p className="text-xs font-black text-[#10B981]">{cs.outcome}</p>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div
          className="rounded-3xl p-10 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(255,69,0,0.1))", border: "1px solid rgba(124,58,237,0.2)" }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-[100px] rounded-full" style={{ background: "rgba(124,58,237,0.1)" }} />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Your success story starts today
            </h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto text-sm">
              Join 10,000+ students who chose to build experience before graduation. First gig takes minutes to find.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/get-gig"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm text-white transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #7C3AED, #FF4500)", boxShadow: "0 6px 24px rgba(124,58,237,0.35)" }}
              >
                Find My First Gig <ArrowRight size={14} />
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm text-slate-400 border border-white/10 hover:text-white hover:border-white/20 transition-all"
              >
                Our Story <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
