"use client"

import {
  Search, Filter, GraduationCap, Star, ShieldCheck,
  Github, MessageSquare, Eye,
  X, Lock, BookOpen, Award
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useMemo, useTransition } from "react"

import { Card } from "@/components/ui/Card"

type Candidate = {
  id: string
  name: string | null
  full_name: string | null
  image: string | null
  avatar_url: string | null
  college: string | null
  branch: string | null
  year: string | null
  skills: string | null
  bio: string | null
  isVerified: boolean
  github: string | null
  linkedin: string | null
  portfolio: string | null
  userSkills: { skill: { name: string; category: string; color: string } }[]
  reviewsReceived: { rating: number }[]
  reputationScore: number
  avgRating: number
  matchScore: number | null
}

const COLLEGE_TIERS: Record<string, string[]> = {
  "Tier 1": ["IIT", "IIM", "BITS", "NIT Trichy", "NIT Warangal", "IIIT"],
  "Tier 2": ["NIT", "VNIT", "SVNIT", "VIT", "SASTRA"],
  "Tier 3": [],
}

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year", "PG"]

function getTier(college: string | null): string {
  if (!college) return "Tier 3"
  for (const [tier, patterns] of Object.entries(COLLEGE_TIERS)) {
    if (tier === "Tier 3") continue
    if (patterns.some((p) => college.includes(p))) return tier
  }
  return "Tier 2"
}

function ReputationBadge({ score }: { score: number }) {
  const tier =
    score >= 80 ? { label: "Elite", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/15 border-[#F59E0B]/30" } :
    score >= 60 ? { label: "Advanced", color: "text-[#7C3AED]", bg: "bg-[#7C3AED]/15 border-[#7C3AED]/30" } :
    score >= 40 ? { label: "Rising", color: "text-[#0EA5E9]", bg: "bg-[#0EA5E9]/15 border-[#0EA5E9]/30" } :
    { label: "Newcomer", color: "text-slate-400", bg: "bg-white/5 border-white/10" }
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${tier.bg} ${tier.color}`}>
      {tier.label}
    </span>
  )
}

export function TalentSearchClient({
  candidates,
  initialQuery,
}: {
  candidates: Candidate[]
  initialQuery: string
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [query, setQuery] = useState(initialQuery)
  const [selectedTier, setSelectedTier] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [minScore, setMinScore] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (selectedTier) {
        const tier = getTier(c.college)
        if (tier !== selectedTier) return false
      }
      if (selectedYear && c.year !== selectedYear) return false
      if (c.reputationScore < minScore) return false
      return true
    })
  }, [candidates, selectedTier, selectedYear, minScore])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(() => {
      const params = new URLSearchParams()
      if (query) params.set("q", query)
      router.push(`/employer/talent-search?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    setSelectedTier("")
    setSelectedYear("")
    setMinScore(0)
  }

  const hasFilters = selectedTier || selectedYear || minScore > 0

  return (
    <div className="space-y-5">
      {/* SEARCH BAR */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div
          className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <Search size={16} className="text-slate-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search by skills (e.g. "React Developer", "UI Designer", "Data Analyst")'
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-600 outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="text-slate-500 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${
            showFilters || hasFilters
              ? "bg-[#7C3AED]/20 border-[#7C3AED]/40 text-[#A78BFA]"
              : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
          }`}
          style={{ background: showFilters || hasFilters ? undefined : "var(--color-surface)" }}
        >
          <Filter size={14} />
          Filters
          {hasFilters && (
            <span className="w-4 h-4 bg-[#7C3AED] rounded-full text-[9px] font-black text-white flex items-center justify-center">
              !
            </span>
          )}
        </button>
        <button
          type="submit"
          className="px-6 py-3 rounded-2xl text-sm font-black transition-all active:scale-95"
          style={{ background: "var(--color-primary)", boxShadow: "0 4px 16px rgba(255,77,28,0.3)" }}
        >
          Search
        </button>
      </form>

      {/* FILTERS PANEL */}
      {showFilters && (
        <div
          className="p-5 rounded-2xl space-y-4"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Filter Candidates</h3>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-[#A78BFA] hover:text-white flex items-center gap-1">
                <X size={11} /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* College Tier */}
            <div>
              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">College Tier</label>
              <div className="flex flex-wrap gap-2">
                {["Tier 1", "Tier 2", "Tier 3"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTier(selectedTier === t ? "" : t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedTier === t
                        ? "bg-[#7C3AED]/25 border-[#7C3AED]/50 text-[#A78BFA]"
                        : "border-white/10 text-slate-500 hover:border-white/20"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Year */}
            <div>
              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">Year</label>
              <div className="flex flex-wrap gap-2">
                {YEAR_OPTIONS.slice(0, 4).map((y) => (
                  <button
                    key={y}
                    onClick={() => setSelectedYear(selectedYear === y ? "" : y)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedYear === y
                        ? "bg-[#0EA5E9]/25 border-[#0EA5E9]/50 text-[#38BDF8]"
                        : "border-white/10 text-slate-500 hover:border-white/20"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Min Reputation Score */}
            <div>
              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">
                Min Reputation Score: <span className="text-[#F59E0B]">{minScore}+</span>
              </label>
              <input
                type="range"
                min={0}
                max={80}
                step={10}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full accent-[#F59E0B]"
              />
            </div>
          </div>
        </div>
      )}

      {/* RESULTS HEADER */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          Showing <span className="text-white font-bold">{filtered.length}</span> candidates
          {initialQuery && <> for <span className="text-[#A78BFA] font-bold">&quot;{initialQuery}&quot;</span></>}
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Award size={12} className="text-[#F59E0B]" />
          Sorted by Reputation Score
        </div>
      </div>

      {/* CANDIDATES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((candidate, idx) => {
          const name = candidate.full_name || candidate.name || "Anonymous"
          const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
          const isLocked = idx >= 3 // First 3 free, rest locked
          const skills = candidate.userSkills.slice(0, 3)

          return (
            <Card
              key={candidate.id}
              className={`relative p-5 rounded-2xl overflow-hidden transition-all duration-300 group ${
                isLocked ? "opacity-75" : "hover:-translate-y-1 hover:shadow-2xl"
              }`}
              style={{
                background: "var(--color-surface)",
                border: `1px solid ${isLocked ? "var(--color-border)" : "rgba(124,58,237,0.2)"}`,
              }}
            >
              {/* Locked overlay */}
              {isLocked && (
                <div className="absolute inset-0 z-20 rounded-2xl flex flex-col items-center justify-center gap-2 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.5)" }}>
                  <Lock size={20} className="text-[#A78BFA]" />
                  <p className="text-xs font-bold text-slate-300">Upgrade to view full profile</p>
                  <Link href="/employer/upgrade">
                    <button className="text-[10px] font-black px-3 py-1.5 rounded-lg bg-[#7C3AED]/30 border border-[#7C3AED]/50 text-[#A78BFA] hover:bg-[#7C3AED]/50 transition-all">
                      Unlock — ₹3,499/mo
                    </button>
                  </Link>
                </div>
              )}

              {/* Hover glow */}
              {!isLocked && (
                <div className="absolute -right-8 -top-8 w-24 h-24 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[#7C3AED]/20" />
              )}

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative shrink-0">
                    {candidate.image || candidate.avatar_url ? (
                      <Image
                        src={candidate.image || candidate.avatar_url || ""}
                        alt={name}
                        width={44}
                        height={44}
                        className="rounded-xl object-cover"
                      />
                    ) : (
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm"
                        style={{ background: "linear-gradient(135deg, var(--color-primary), #7C3AED)" }}
                      >
                        {initials}
                      </div>
                    )}
                    {candidate.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#10B981] rounded-full flex items-center justify-center">
                        <ShieldCheck size={9} className="text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-white text-sm truncate">{isLocked ? `${name.split(" ")[0]} **` : name}</p>
                      <ReputationBadge score={candidate.reputationScore} />
                    </div>
                    {candidate.college && (
                      <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5 truncate">
                        <GraduationCap size={10} />
                        {isLocked ? "Verified University" : candidate.college}
                      </p>
                    )}
                  </div>

                  {/* Match score */}
                  {candidate.matchScore && (
                    <div className="shrink-0 text-center">
                      <div className="text-lg font-black text-[#7C3AED]">{candidate.matchScore}%</div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-wider">match</div>
                    </div>
                  )}
                </div>

                {/* Reputation score bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500 font-bold">Reputation Score</span>
                    <span className="text-xs font-black text-[#F59E0B]">{candidate.reputationScore}/100</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${candidate.reputationScore}%`,
                        background: "linear-gradient(90deg, #F59E0B, #EF4444)",
                      }}
                    />
                  </div>
                </div>

                {/* Skills */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {skills.map(({ skill }) => (
                      <span
                        key={skill.name}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${skill.color}20`, color: skill.color, border: `1px solid ${skill.color}40` }}
                      >
                        {skill.name}
                      </span>
                    ))}
                    {candidate.userSkills.length > 3 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                        +{candidate.userSkills.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Info row */}
                <div className="flex items-center gap-3 mb-4">
                  {candidate.branch && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <BookOpen size={10} />
                      {isLocked ? "Engineering" : candidate.branch}
                    </span>
                  )}
                  {candidate.year && (
                    <span className="text-xs text-slate-500">{candidate.year}</span>
                  )}
                  {candidate.avgRating > 0 && (
                    <span className="text-xs text-[#F59E0B] flex items-center gap-1">
                      <Star size={10} />
                      {candidate.avgRating.toFixed(1)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/profile/${candidate.id}`} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border border-white/10 hover:border-[#7C3AED]/40 hover:bg-[#7C3AED]/10 text-slate-400 hover:text-[#A78BFA] transition-all">
                      <Eye size={12} />
                      View Profile
                    </button>
                  </Link>
                  <Link href={`/messages?to=${candidate.id}`}>
                    <button className="px-3 py-2 rounded-xl border border-white/10 hover:border-[#10B981]/40 hover:bg-[#10B981]/10 text-slate-400 hover:text-[#10B981] transition-all">
                      <MessageSquare size={12} />
                    </button>
                  </Link>
                  {candidate.github && (
                    <a href={candidate.github} target="_blank" rel="noopener noreferrer">
                      <button className="px-3 py-2 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all">
                        <Github size={12} />
                      </button>
                    </a>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Search size={40} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 font-bold">No candidates found</p>
          <p className="text-slate-600 text-sm mt-1">Try a different skill or remove filters</p>
        </div>
      )}
    </div>
  )
}
