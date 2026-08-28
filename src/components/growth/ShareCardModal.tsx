"use client"

import {
 MessageCircle, Linkedin, Twitter, Instagram,
 X, CheckCircle2, ExternalLink, Copy, Zap
} from"lucide-react"
import { useState, useEffect, useCallback } from"react"

interface ShareCardModalProps {
 type: string
 userId: string
 onClose: () => void
}

interface CardData {
 template: { headline: string; subtext: string; emoji: string }
 shareUrl: string
 shareText: { whatsapp: string; twitter: string; linkedin: string; instagram: string }
 referralCode: string | null
 userName: string
 college: string
}

const CHANNELS = [
 {
 id:"whatsapp",
 label:"WhatsApp",
 icon: MessageCircle,
 color:"#10B981",
 bg:"rgba(16,185,129,0.12)",
 border:"rgba(16,185,129,0.3)",
 hint:"Highest reach for Indian students",
 recommended: true,
 },
 {
 id:"linkedin",
 label:"LinkedIn",
 icon: Linkedin,
 color:"#0EA5E9",
 bg:"rgba(14,165,233,0.12)",
 border:"rgba(14,165,233,0.3)",
 hint:"Attracts employer attention",
 recommended: false,
 },
 {
 id:"twitter",
 label:"Twitter / X",
 icon: Twitter,
 color:"#64748B",
 bg:"rgba(100,116,139,0.1)",
 border:"rgba(100,116,139,0.2)",
 hint:"Public — indexed by Google",
 recommended: false,
 },
 {
 id:"instagram",
 label:"Instagram Story",
 icon: Instagram,
 color:"#F59E0B",
 bg:"rgba(245,158,11,0.1)",
 border:"rgba(245,158,11,0.25)",
 hint:"Copy caption for your story",
 recommended: false,
 },
] as const

export function ShareCardModal({ type, userId, onClose }: ShareCardModalProps) {
 const [data, setData] = useState<CardData | null>(null)
 const [loading, setLoading] = useState(true)
 const [copied, setCopied] = useState<string | null>(null)

 const fetchCard = useCallback(async () => {
 try {
 const res = await fetch(`/api/growth/share-card?type=${type}&userId=${userId}`)
 if (res.ok) setData(await res.json())
 } finally {
 setLoading(false)
 }
 }, [type, userId])

 useEffect(() => { fetchCard() }, [fetchCard])

 const shareOn = (channel:"whatsapp" |"linkedin" |"twitter" |"instagram") => {
 if (!data) return

 const text = data.shareText[channel]

 const urls: Record<string, string | null> = {
 whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
 linkedin: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.shareUrl)}&summary=${encodeURIComponent(text)}`,
 twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
 instagram: null, // Instagram has no web share API — user copies text
 }

 const url = urls[channel]
 if (url) {
 window.open(url,"_blank","noopener,noreferrer")
 } else {
 // Copy for Instagram
 navigator.clipboard.writeText(text)
 setCopied(channel)
 setTimeout(() => setCopied(null), 2500)
 }
 }

 const copyLink = async () => {
 if (!data) return
 await navigator.clipboard.writeText(data.shareUrl)
 setCopied("link")
 setTimeout(() => setCopied(null), 2500)
 }

 return (
 <div
 className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
 style={{ background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)" }}
 onClick={e => e.target === e.currentTarget && onClose()}
 >
 <div
 className="w-full max-w-md rounded-3xl overflow-hidden relative"
 style={{ background:"var(--color-surface, #0F1624)", border:"1px solid rgba(255,255,255,0.08)" }}
 >
 {/* Header gradient */}
 <div
 className="p-6 relative overflow-hidden"
 style={{ background:"linear-gradient(135deg, rgba(31,169,113,0.2), rgba(255,69,0,0.12))" }}
 >
 <div className="absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full" style={{ background:"rgba(31,169,113,0.3)" }} />
 <button
 onClick={onClose}
 className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
 >
 <X size={14} className="text-slate-300" />
 </button>

 {loading ? (
 <div className="space-y-3 animate-pulse">
 <div className="h-8 bg-white/10 rounded-xl w-3/4" />
 <div className="h-4 bg-white/5 rounded-xl w-1/2" />
 </div>
 ) : data ? (
 <div className="relative z-10">
 <div className="text-4xl mb-2">{data.template.emoji}</div>
 <h2 className="font-black text-white text-base leading-snug mb-1" style={{ fontFamily:"var(--font-display)" }}>
 {data.template.headline}
 </h2>
 <p className="text-sm text-slate-400">{data.template.subtext}</p>
 </div>
 ) : (
 <p className="text-slate-500 text-sm">Could not load share card</p>
 )}
 </div>

 {/* Share channels */}
 <div className="p-5 space-y-3">
 <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Share via</p>

 {CHANNELS.map(({ id, label, icon: Icon, color, bg, border, hint, recommended }) => (
 <button
 key={id}
 onClick={() => shareOn(id as"whatsapp" |"linkedin" |"twitter" |"instagram")}
 disabled={!data}
 className="w-full flex items-center justify-between p-3 rounded-2xl transition-all active:scale-[0.98] hover:brightness-110 disabled:opacity-40"
 style={{ background: bg, border: `1px solid ${border}` }}
 >
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
 <Icon size={16} style={{ color }} />
 </div>
 <div className="text-left">
 <div className="flex items-center gap-2">
 <span className="text-sm font-black text-white">{label}</span>
 {recommended && (
 <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-[#10B981] bg-[#10B981]/15 uppercase tracking-wide">
 Best
 </span>
 )}
 </div>
 <p className="text-[10px] text-slate-500">{hint}</p>
 </div>
 </div>
 {copied === id ? (
 <CheckCircle2 size={14} className="text-[#10B981]" />
 ) : id ==="instagram" ? (
 <Copy size={13} className="text-slate-500" />
 ) : (
 <ExternalLink size={13} className="text-slate-500" />
 )}
 </button>
 ))}

 {/* Direct link */}
 {data && (
 <div className="pt-1">
 <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-2">Or copy your referral link</p>
 <div className="flex items-center gap-2">
 <code className="flex-1 text-[10px] text-slate-400 bg-white/5 rounded-xl px-3 py-2 truncate font-mono">
 {data.shareUrl}
 </code>
 <button
 onClick={copyLink}
 className="shrink-0 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1 transition-all active:scale-95"
 style={{
 background: copied ==="link" ?"rgba(16,185,129,0.15)" :"rgba(31,169,113,0.2)",
 color: copied ==="link" ?"#10B981" :"#A78BFA",
 border:"1px solid rgba(31,169,113,0.25)",
 }}
 >
 {copied ==="link" ? <CheckCircle2 size={11} /> : <Copy size={11} />}
 {copied ==="link" ?"Copied!" :"Copy"}
 </button>
 </div>
 {data.referralCode && (
 <p className="text-[10px] text-slate-600 mt-1">
 Referral code: <span className="font-black text-slate-400">{data.referralCode}</span>
 </p>
 )}
 </div>
 )}

 {/* XP nudge */}
 <div
 className="flex items-center gap-3 p-3 rounded-2xl"
 style={{ background:"rgba(31,169,113,0.08)", border:"1px solid rgba(31,169,113,0.15)" }}
 >
 <Zap size={14} className="text-[#1FA971] shrink-0" />
 <p className="text-xs text-slate-400">
 You and your friend both earn <span className="font-black text-white">100 XP + ₹100</span> when they complete their first gig.
 </p>
 </div>
 </div>
 </div>
 </div>
 )
}
