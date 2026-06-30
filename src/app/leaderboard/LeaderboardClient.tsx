"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Trophy, Star, Flame, Target, TrendingUp,
  Search, Crown, Zap, GraduationCap, BadgeCheck
} from "lucide-react"

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  username?: string
  avatar?: string
  college: string
  year?: string
  smartScore: number
  totalXp: number
  level: number
  levelTitle: string
  gigsCompleted: number
  totalEarned: number
  currentStreak: number
  topBadges: Array<{ icon: string; color: string; tier: string }>
  isCurrentUser: boolean
}

const PERIODS = [
  { value: "ALL_TIME", label: "All Time" },
  { value: "MONTHLY", label: "This Month" },
  { value: "WEEKLY", label: "This Week" },
]

const TOP_COLLEGES = [
  "", "IIT Delhi", "IIT Bombay", "IIT Madras", "BITS Pilani",
  "NIT Trichy", "IIIT Hyderabad", "VIT Vellore", "DTU", "SRM"
]

const RANK_COLORS = ["text-[#F59E0B]", "text-slate-300", "text-[#CD7F32]"]
const RANK_BG = ["bg-[#F59E0B]/15 border-[#F59E0B]/30", "bg-white/5 border-white/15", "bg-[#CD7F32]/15 border-[#CD7F32]/30"]

export function LeaderboardClient({ nonce }: { nonce?: string }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [period, setPeriod] = useState("ALL_TIME")
  const [college, setCollege] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [myRank, setMyRank] = useState<number | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ period, limit: "100" })
      if (college) params.set("college", college)
      const res = await fetch(`/api/gamification/leaderboard?${params}`)
      if (res.ok) {
        const data = await res.json()
        setEntries(data.leaderboard)
        setMyRank(data.myRank?.rank ?? null)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [period, college])

  useEffect(() => { fetchLeaderboard() }, [fetchLeaderboard])

  const filtered = search
    ? entries.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.college.toLowerCase().includes(search.toLowerCase())
      )
    : entries

  const top3 = filtered.slice(0, 3)
  const rest = filtered.slice(3)

  return (
    <div
      className="min-h-screen text-slate-100"
      style={{ background: "var(--color-background)", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
    >
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 blur-[150px] rounded-full" style={{ background: "rgba(245,158,11,0.08)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 blur-[120px] rounded-full" style={{ background: "rgba(124,58,237,0.07)" }} />
      </div>

      {/* JSON-LD */}
      <script nonce={nonce} suppressHydrationWarning
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Campus Leaderboard | CampusConnect",
            "url": "https://campusconnectco.in/leaderboard",
            "description": "Top-ranked Indian students by verified gig completions and career achievement on CampusConnect.",
          }),
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#FCD34D] text-[11px] font-black uppercase tracking-widest mb-5">
            <Trophy size={11} />
            Live Rankings
          </div>
          <h1
            className="text-4xl font-black text-white mb-3"
            style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}
          >
            Campus Leaderboard
          </h1>
          <p className="text-slate-400 text-sm">
            Ranked by Smart Score — a verified combination of reliability, execution, learning, and community impact.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Period */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${period === p.value ? "text-white" : "text-slate-500 hover:text-slate-300"}`}
                style={period === p.value ? { background: "linear-gradient(135deg, #7C3AED, #FF4500)" } : {}}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* College filter */}
          <select
            value={college}
            onChange={e => setCollege(e.target.value)}
            className="text-xs font-bold rounded-xl px-3 py-2 text-slate-300 appearance-none"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            {TOP_COLLEGES.map(c => (
              <option key={c} value={c}>{c || "All Colleges"}</option>
            ))}
          </select>

          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-48 rounded-xl px-3 py-2" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <Search size={13} className="text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search name or college…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-300 placeholder-slate-600 outline-none flex-1"
            />
          </div>
        </div>

        {/* My rank callout */}
        {myRank && myRank > 3 && (
          <div
            className="flex items-center justify-between p-4 rounded-2xl"
            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)" }}
          >
            <div className="flex items-center gap-2">
              <BadgeCheck size={14} className="text-[#A78BFA]" />
              <span className="text-sm font-bold text-white">Your rank: <strong className="text-[#A78BFA]">#{myRank}</strong></span>
            </div>
            <Link href="/get-gig" className="text-xs text-[#A78BFA] hover:text-white font-bold flex items-center gap-1">
              Earn XP <TrendingUp size={11} />
            </Link>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Trophy size={32} className="mx-auto mb-3 opacity-30" />
            <p>No students found for this filter.</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {top3.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {/* 2nd */}
                {top3[1] && (
                  <div
                    className="p-4 rounded-3xl text-center order-1 mt-4"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 border text-sm font-black ${RANK_BG[1]} ${RANK_COLORS[1]}`}>2</div>
                    <div className="w-12 h-12 rounded-xl bg-slate-500/20 flex items-center justify-center mx-auto mb-2 text-lg font-black text-slate-300 relative overflow-hidden">
                      {top3[1].avatar ? <Image src={top3[1].avatar} alt={top3[1].name} fill className="object-cover" /> : top3[1].name.charAt(0)}
                    </div>
                    <p className="font-black text-white text-xs truncate">{top3[1].name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{top3[1].college}</p>
                    <p className="text-sm font-black text-slate-300 mt-1">{top3[1].smartScore}</p>
                    <p className="text-[9px] text-slate-600">Smart Score</p>
                  </div>
                )}

                {/* 1st */}
                {top3[0] && (
                  <div
                    className="p-5 rounded-3xl text-center order-2 relative"
                    style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(255,69,0,0.08))", border: "1px solid rgba(245,158,11,0.3)" }}
                  >
                    <Crown size={16} className="text-[#F59E0B] mx-auto mb-1" />
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-2 border text-sm font-black ${RANK_BG[0]} ${RANK_COLORS[0]}`}>1</div>
                    <div className="w-14 h-14 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center mx-auto mb-2 text-xl font-black text-[#FCD34D] relative overflow-hidden">
                      {top3[0].avatar ? <Image src={top3[0].avatar} alt={top3[0].name} fill className="object-cover" /> : top3[0].name.charAt(0)}
                    </div>
                    <p className="font-black text-white text-sm truncate">{top3[0].name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{top3[0].college}</p>
                    <p className="text-lg font-black text-[#F59E0B] mt-1">{top3[0].smartScore}</p>
                    <p className="text-[9px] text-slate-500">Smart Score</p>
                    <div className="flex justify-center gap-1 mt-2">
                      {top3[0].topBadges.map((b, i) => (
                        <span key={i} className="text-sm">{b.icon}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3rd */}
                {top3[2] && (
                  <div
                    className="p-4 rounded-3xl text-center order-3 mt-4"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 border text-sm font-black ${RANK_BG[2]} ${RANK_COLORS[2]}`}>3</div>
                    <div className="w-12 h-12 rounded-xl bg-[#CD7F32]/20 flex items-center justify-center mx-auto mb-2 text-lg font-black text-[#CD7F32] relative overflow-hidden">
                      {top3[2].avatar ? <Image src={top3[2].avatar} alt={top3[2].name} fill className="object-cover" /> : top3[2].name.charAt(0)}
                    </div>
                    <p className="font-black text-white text-xs truncate">{top3[2].name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{top3[2].college}</p>
                    <p className="text-sm font-black text-[#CD7F32] mt-1">{top3[2].smartScore}</p>
                    <p className="text-[9px] text-slate-600">Smart Score</p>
                  </div>
                )}
              </div>
            )}

            {/* Rest of the table */}
            <div className="space-y-2">
              {rest.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 p-4 rounded-2xl transition-all hover:border-[#7C3AED]/30 ${entry.isCurrentUser ? "ring-1 ring-[#7C3AED]/40" : ""}`}
                  style={{ background: "var(--color-surface)", border: `1px solid ${entry.isCurrentUser ? "rgba(124,58,237,0.3)" : "var(--color-border)"}` }}
                >
                  <span className="text-sm font-black text-slate-500 w-7 text-center shrink-0">#{entry.rank}</span>

                  <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/15 flex items-center justify-center text-sm font-black text-[#A78BFA] shrink-0 relative overflow-hidden">
                    {entry.avatar
                      ? <Image src={entry.avatar} alt={entry.name} fill className="object-cover" />
                      : entry.name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-white text-sm truncate">{entry.name}</span>
                      {entry.isCurrentUser && <BadgeCheck size={12} className="text-[#0EA5E9] shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                        <GraduationCap size={9} /> {entry.college}
                      </span>
                      {entry.currentStreak > 0 && (
                        <span className="text-[10px] text-[#EF4444] flex items-center gap-0.5">
                          <Flame size={9} /> {entry.currentStreak}d
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-1">
                    {entry.topBadges.map((b, i) => (
                      <span key={i} className="text-sm" title={b.tier}>{b.icon}</span>
                    ))}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-black text-white text-sm">{entry.smartScore}</p>
                    <p className="text-[10px] text-slate-600">Score</p>
                  </div>

                  <div className="text-right shrink-0 hidden md:block">
                    <p className="font-black text-[#10B981] text-sm">{entry.gigsCompleted}</p>
                    <p className="text-[10px] text-slate-600">Gigs</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CTA */}
        <div
          className="rounded-3xl p-8 text-center"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(255,69,0,0.08))", border: "1px solid rgba(124,58,237,0.2)" }}
        >
          <Zap size={20} className="text-[#7C3AED] mx-auto mb-3" />
          <h2 className="font-black text-white text-lg mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Ready to climb the ranks?
          </h2>
          <p className="text-slate-400 text-sm mb-5">Complete gigs, earn XP, maintain streaks. Your Smart Score updates live.</p>
          <Link
            href="/get-gig"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm text-white transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #7C3AED, #FF4500)", boxShadow: "0 6px 24px rgba(124,58,237,0.35)" }}
          >
            Find a Gig <Star size={13} />
          </Link>
        </div>
      </div>
    </div>
  )
}
