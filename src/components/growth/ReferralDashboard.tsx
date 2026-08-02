"use client"

import {
  Copy, Share2, Gift, TrendingUp, CheckCircle2,
  MessageCircle, Linkedin,
  Twitter
} from "lucide-react"
import { useEffect, useState, useCallback } from "react"

interface ReferralStats {
  totalSent: number
  signedUp: number
  converted: number
  rewarded: number
  totalCashEarned: number
  conversionRate: number
}

interface ReferralData {
  referralCode: string
  referralLink: string
  stats: ReferralStats
  recentReferrals: Array<{
    id: string
    status: string
    channel?: string
    createdAt: string
  }>
}

const TIER_CONFIG = [
  { min: 0,  max: 2,  name: "Starter",     color: "#10B981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)", badge: "🌱", bonus: "₹100" },
  { min: 3,  max: 9,  name: "Champion",    color: "#0EA5E9", bg: "rgba(14,165,233,0.1)",  border: "rgba(14,165,233,0.25)", badge: "⚡", bonus: "₹150" },
  { min: 10, max: 24, name: "Ambassador",  color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)", badge: "🏆", bonus: "₹200" },
  { min: 25, max: Infinity, name: "Legend",color: "#7C3AED", bg: "rgba(124,58,237,0.1)",  border: "rgba(124,58,237,0.25)", badge: "👑", bonus: "₹250" },
]

function currentTier(converted: number) {
  return TIER_CONFIG.find(t => converted >= t.min && converted <= t.max) || TIER_CONFIG[0]
}

function nextTier(converted: number) {
  const idx = TIER_CONFIG.findIndex(t => converted >= t.min && converted <= t.max)
  return TIER_CONFIG[idx + 1] || null
}

export function ReferralDashboard({}: { userId: string }) {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/growth/referral")
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const copyLink = async () => {
    if (!data?.referralLink) return
    await navigator.clipboard.writeText(data.referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    // Track share event
    fetch("/api/growth/referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: "copy" }),
    })
  }

  const shareOnChannel = (channel: "whatsapp" | "linkedin" | "twitter") => {
    if (!data?.referralLink) return
    const link = data.referralLink
    const text = encodeURIComponent(`Hey! I'm building my freelance career on CampusConnect — India's best platform for student gigs. Join me and we both get rewards when you complete your first gig 🚀 `)

    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${text}${encodeURIComponent(link)}`,
      linkedin: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(link)}`,
    }

    window.open(urls[channel], "_blank", "noopener,noreferrer")
    fetch("/api/growth/referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel }),
    })
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-3xl bg-white/5" />)}
      </div>
    )
  }

  if (!data) return null

  const tier = currentTier(data.stats.converted)
  const next = nextTier(data.stats.converted)
  const progressToNext = next
    ? Math.min(100, Math.round(((data.stats.converted - tier.min) / (next.min - tier.min)) * 100))
    : 100

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2
          className="text-xl font-black text-white flex items-center gap-2"
          style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}
        >
          <Gift size={18} className="text-[#F59E0B]" />
          Refer & Earn
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Both you and your friend get rewards when they complete their first gig.
        </p>
      </div>

      {/* Tier card */}
      <div
        className="p-5 rounded-3xl relative overflow-hidden"
        style={{ background: tier.bg, border: `1px solid ${tier.border}` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{tier.badge}</span>
            <div>
              <p className="font-black text-white text-sm">{tier.name} Tier</p>
              <p className="text-[10px] text-slate-500">{tier.bonus} per successful referral</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-white">{data.stats.converted}</p>
            <p className="text-[10px] text-slate-500">converted</p>
          </div>
        </div>
        {next && (
          <>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progressToNext}%`, background: tier.color }}
              />
            </div>
            <p className="text-[10px] text-slate-500">
              {next.min - data.stats.converted} more to reach {next.name} ({next.bonus}/referral)
            </p>
          </>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Sent",      value: data.stats.totalSent,    icon: Share2,    color: "text-[#0EA5E9]" },
          { label: "Converted", value: data.stats.converted,    icon: CheckCircle2, color: "text-[#10B981]" },
          { label: "Earned",    value: `₹${data.stats.totalCashEarned}`, icon: TrendingUp, color: "text-[#F59E0B]" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="p-4 rounded-2xl text-center"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <Icon size={13} className={`${color} mx-auto mb-1`} />
            <p className={`text-lg font-black ${color}`}>{value}</p>
            <p className="text-[10px] text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Your referral link</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs text-slate-300 bg-white/5 rounded-xl px-3 py-2 truncate font-mono">
            {data.referralLink}
          </code>
          <button
            onClick={copyLink}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all active:scale-95"
            style={{
              background: copied ? "rgba(16,185,129,0.15)" : "linear-gradient(135deg, #7C3AED, #FF4500)",
              color: copied ? "#10B981" : "#fff",
            }}
          >
            {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="text-[10px] text-slate-600 mt-1.5">
          Code: <span className="font-black text-slate-400">{data.referralCode}</span>
        </p>
      </div>

      {/* Share buttons */}
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Share on</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { channel: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle, color: "#10B981", bg: "rgba(16,185,129,0.1)" },
            { channel: "linkedin" as const, label: "LinkedIn", icon: Linkedin, color: "#0EA5E9", bg: "rgba(14,165,233,0.1)" },
            { channel: "twitter" as const, label: "Twitter", icon: Twitter, color: "#64748B", bg: "rgba(100,116,139,0.1)" },
          ].map(({ channel, label, icon: Icon, color, bg }) => (
            <button
              key={channel}
              onClick={() => shareOnChannel(channel)}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 hover:brightness-110"
              style={{ background: bg, border: `1px solid ${color}30`, color }}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div
        className="p-4 rounded-2xl"
        style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}
      >
        <p className="text-[10px] font-black text-[#A78BFA] uppercase tracking-wider mb-3">How it works</p>
        <div className="space-y-2">
          {[
            { step: "1", text: "Share your unique referral link" },
            { step: "2", text: "Friend signs up with your link" },
            { step: "3", text: "They complete their first gig" },
            { step: "4", text: "You both earn XP + ₹100 bonus" },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-3">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                style={{ background: "rgba(124,58,237,0.2)", color: "#A78BFA" }}
              >
                {step}
              </span>
              <span className="text-xs text-slate-400">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tier ladder */}
      <div
        className="p-4 rounded-2xl"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Referral tiers</p>
        <div className="space-y-2">
          {TIER_CONFIG.map((t) => (
            <div
              key={t.name}
              className={`flex items-center justify-between p-2 rounded-xl transition-all ${data.stats.converted >= t.min ? "opacity-100" : "opacity-40"}`}
              style={{ background: data.stats.converted >= t.min ? t.bg : "transparent" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{t.badge}</span>
                <span className="text-xs font-bold text-white">{t.name}</span>
                <span className="text-[10px] text-slate-500">{t.min === 0 ? "0-2 referrals" : `${t.min}+ referrals`}</span>
              </div>
              <span className="text-xs font-black" style={{ color: t.color }}>{t.bonus}/ref</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
