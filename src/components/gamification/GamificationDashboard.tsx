"use client"

import {
  Flame, Zap, Trophy, Star, TrendingUp, Target,
  Shield, Brain, Users, ArrowRight, Sparkles,
  BadgeCheck, ChevronRight, Award, Rocket
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useCallback } from "react"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Badge {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  color: string
  tier: string
  rarity: string
  xpReward: number
}

interface UserBadge {
  earnedAt: string
  badge: Badge
}

interface GamificationProfile {
  totalXp: number
  level: number
  levelTitle: string
  levelProgress: number
  nextLevelXp: number
  currentStreak: number
  longestStreak: number
  streakMultiplier: number
  smartScore: number
  reliabilityScore: number
  executionScore: number
  learningScore: number
  communityScore: number
  gigsCompleted: number
  totalEarned: number
  userBadges: UserBadge[]
  xpEvents: Array<{
    id: string
    type: string
    xpAwarded: number
    description: string
    createdAt: string
  }>
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function XpBar({ progress, levelTitle, level, nextLevelXp, totalXp }: {
  progress: number; levelTitle: string; level: number; nextLevelXp: number; totalXp: number
}) {
  return (
    <div className="p-6 rounded-3xl relative overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl" style={{ background: "rgba(124,58,237,0.15)" }} />
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-2xl font-black text-white"
              style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}
            >
              Level {level}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-[#A78BFA] bg-[#7C3AED]/15 border border-[#7C3AED]/25">
              {levelTitle}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{totalXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP</p>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black" style={{ background: "linear-gradient(135deg, #7C3AED, #FF4500)" }}>
          <Zap size={20} className="text-white" />
        </div>
      </div>
      <div className="relative h-3 bg-white/8 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
          style={{ width: `${progress}%`, background: "linear-gradient(90deg, #7C3AED, #FF4500)", boxShadow: "0 0 12px rgba(124,58,237,0.5)" }}
        />
      </div>
      <p className="text-[10px] text-slate-600 mt-2">{progress}% to next level</p>
    </div>
  )
}

function StreakCard({ current, longest, multiplier }: { current: number; longest: number; multiplier: number }) {
  const fire = current >= 30 ? "🔥🔥" : current >= 7 ? "🔥" : "✨"
  const isHot = current >= 7

  return (
    <div
      className="p-5 rounded-3xl relative overflow-hidden"
      style={{
        background: isHot ? "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(245,158,11,0.08))" : "var(--color-surface)",
        border: `1px solid ${isHot ? "rgba(239,68,68,0.25)" : "var(--color-border)"}`,
      }}
    >
      {isHot && <div className="absolute -right-4 -top-4 w-20 h-20 blur-3xl rounded-full bg-[#EF4444]/20" />}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Flame size={11} className={isHot ? "text-[#EF4444]" : "text-slate-500"} />
          Daily Streak
        </span>
        {multiplier > 1 && (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/25 text-[#FCD34D]">
            {multiplier}× XP
          </span>
        )}
      </div>
      <p className="text-4xl font-black text-white my-1">{fire} {current}</p>
      <p className="text-xs text-slate-500">days · best: {longest}</p>
      {current === 0 && (
        <p className="text-[10px] text-slate-600 mt-2 border-t border-white/5 pt-2">
          Complete any activity today to start your streak
        </p>
      )}
    </div>
  )
}

function ScoreRadar({ reliability, execution, learning, community, smart }: {
  reliability: number; execution: number; learning: number; community: number; smart: number
}) {
  const dims = [
    { label: "Reliability", value: reliability, icon: Shield, color: "#0EA5E9", desc: "Milestones on time" },
    { label: "Execution", value: execution, icon: Rocket, color: "#10B981", desc: "Gigs & earnings" },
    { label: "Learning", value: learning, icon: Brain, color: "#7C3AED", desc: "Skills & assessments" },
    { label: "Community", value: community, icon: Users, color: "#F59E0B", desc: "Endorsements & mentoring" },
  ]

  return (
    <div className="p-6 rounded-3xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-black text-white text-sm">Smart Score</h3>
          <p className="text-[10px] text-slate-500">4-dimensional reputation</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-white">{smart}</p>
          <p className="text-[10px] text-slate-500">/ 100</p>
        </div>
      </div>

      <div className="space-y-3">
        {dims.map(({ label, value, icon: Icon, color, desc }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Icon size={11} style={{ color }} />
                <span className="text-xs text-slate-400">{label}</span>
              </div>
              <span className="text-xs font-black text-white">{value}</span>
            </div>
            <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${value}%`, background: color }}
              />
            </div>
            <p className="text-[10px] text-slate-600 mt-0.5">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function BadgeWall({ badges }: { badges: UserBadge[] }) {
  const TIER_ORDER = ["LEGENDARY", "PLATINUM", "GOLD", "SILVER", "BRONZE"]

  const sorted = [...badges].sort((a, b) =>
    TIER_ORDER.indexOf(a.badge.tier) - TIER_ORDER.indexOf(b.badge.tier)
  )

  return (
    <div className="p-6 rounded-3xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
      <h3 className="font-black text-white text-sm mb-4 flex items-center gap-2">
        <Trophy size={14} className="text-[#F59E0B]" />
        Badges ({badges.length})
      </h3>

      {badges.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-3xl mb-2">🎯</p>
          <p className="text-xs text-slate-500">Complete your first gig to earn badges</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {sorted.map((ub) => (
            <div
              key={ub.badge.id}
              className="aspect-square rounded-2xl flex flex-col items-center justify-center p-2 group relative cursor-default"
              style={{ background: `${ub.badge.color}15`, border: `1px solid ${ub.badge.color}30` }}
              title={`${ub.badge.name} — ${ub.badge.description}`}
            >
              <span className="text-xl">{ub.badge.icon}</span>
              <span className="text-[8px] text-slate-500 mt-0.5 text-center leading-tight hidden group-hover:block absolute -bottom-6 bg-slate-900 px-1 rounded z-10 whitespace-nowrap">
                {ub.badge.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function XpFeed({ events }: { events: GamificationProfile["xpEvents"] }) {
  if (!events.length) return null

  return (
    <div className="p-5 rounded-3xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
      <h3 className="font-black text-white text-sm mb-4 flex items-center gap-2">
        <Zap size={13} className="text-[#7C3AED]" />
        Recent XP
      </h3>
      <div className="space-y-2">
        {events.slice(0, 6).map((ev) => (
          <div key={ev.id} className="flex items-center justify-between text-xs">
            <span className="text-slate-400 truncate flex-1">{ev.description}</span>
            <span className="font-black text-[#10B981] shrink-0 ml-2">+{ev.xpAwarded} XP</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function GamificationDashboard() {
  const [profile, setProfile] = useState<GamificationProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/gamification/profile")
      if (res.ok) setProfile(await res.json())
    } catch {
      // Non-critical
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 rounded-3xl bg-white/5" />
        ))}
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
            <Sparkles size={16} className="text-[#F59E0B]" />
            Your Progress
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Keep building. Every gig counts.</p>
        </div>
        <Link
          href="/leaderboard"
          className="flex items-center gap-1.5 text-xs font-bold text-[#A78BFA] hover:text-white transition-colors"
        >
          <Trophy size={12} /> Leaderboard <ChevronRight size={11} />
        </Link>
      </div>

      {/* Primary cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <XpBar
          progress={profile.levelProgress}
          levelTitle={profile.levelTitle}
          level={profile.level}
          nextLevelXp={profile.nextLevelXp}
          totalXp={profile.totalXp}
        />
        <StreakCard
          current={profile.currentStreak}
          longest={profile.longestStreak}
          multiplier={profile.streakMultiplier}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Gigs Done", value: profile.gigsCompleted, icon: Target, color: "text-[#10B981]" },
          { label: "Total Earned", value: `₹${(profile.totalEarned / 1000).toFixed(0)}k`, icon: TrendingUp, color: "text-[#F59E0B]" },
          { label: "Smart Score", value: profile.smartScore, icon: Star, color: "text-[#7C3AED]" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="p-4 rounded-2xl text-center"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <Icon size={14} className={`${color} mx-auto mb-1`} />
            <p className={`text-lg font-black ${color}`}>{value}</p>
            <p className="text-[10px] text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Score + badges + feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <ScoreRadar
            reliability={profile.reliabilityScore}
            execution={profile.executionScore}
            learning={profile.learningScore}
            community={profile.communityScore}
            smart={profile.smartScore}
          />
        </div>
        <div className="lg:col-span-1">
          <BadgeWall badges={profile.userBadges} />
        </div>
        <div className="lg:col-span-1 space-y-4">
          <XpFeed events={profile.xpEvents} />
          {/* Streak multiplier bonus card */}
          {profile.streakMultiplier > 1 && (
            <div
              className="p-4 rounded-2xl"
              style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(239,68,68,0.08))", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              <p className="text-[10px] font-black text-[#FCD34D] uppercase tracking-wider mb-1">🔥 Streak Active</p>
              <p className="text-white text-sm font-bold">All XP this week is {profile.streakMultiplier}×</p>
              <p className="text-xs text-slate-500 mt-0.5">Keep your streak alive to maximise reputation</p>
            </div>
          )}
          {/* CTA: Find a gig */}
          <Link
            href="/get-gig"
            className="flex items-center justify-between p-4 rounded-2xl group transition-all"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(255,69,0,0.1))", border: "1px solid rgba(124,58,237,0.2)" }}
          >
            <div>
              <p className="text-sm font-black text-white">Find a gig</p>
              <p className="text-[10px] text-slate-500">Earn XP + real money</p>
            </div>
            <ArrowRight size={16} className="text-[#A78BFA] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}
