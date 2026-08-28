import {
 Sparkles, Brain,
 GraduationCap, Star, ShieldCheck,
 Lock, ArrowRight, Zap
} from"lucide-react"
import { Metadata } from"next"
import Link from"next/link"

import { TalentSearchClient } from"@/components/employer/TalentSearchClient"
import { Card } from"@/components/ui/Card"
import prisma from"@/lib/prisma"

export const metadata: Metadata = {
 title:"AI Talent Search | CampusConnect Employers",
 description:"Find pre-vetted student talent using semantic AI search. Filter by college tier, skills, and reputation score.",
}

export const dynamic ="force-dynamic"

async function getTalentData(query?: string) {
 try {
 // Fetch top-rated candidates with their skills and reputation signals
 const candidates = await prisma.user.findMany({
 where: {
 role:"STUDENT",
 isVerified: true,
 ...(query ? {
 OR: [
 { skills: { contains: query, mode:"insensitive" } },
 { bio: { contains: query, mode:"insensitive" } },
 { college: { contains: query, mode:"insensitive" } },
 ]
 } : {}),
 },
 select: {
 id: true,
 name: true,
 full_name: true,
 image: true,
 avatar_url: true,
 college: true,
 branch: true,
 year: true,
 skills: true,
 bio: true,
 careerGoal: true,
 isVerified: true,
 github: true,
 linkedin: true,
 portfolio: true,
 userSkills: {
 select: { skill: { select: { name: true, category: true, color: true } } },
 take: 5,
 },
 reviewsReceived: {
 select: { rating: true },
 take: 50,
 },
 gigsPosted: {
 where: { status:"COMPLETED" },
 select: { id: true },
 take: 20,
 },
 endorsementsReceived: {
 select: { id: true },
 take: 30,
 },
 },
 take: 24,
 orderBy: { createdAt:"desc" },
 })

 // Compute reputation score for each candidate
 const ranked = candidates.map((c: any) => {
 const avgRating =
 c.reviewsReceived.length > 0
 ? c.reviewsReceived.reduce((a: any, r: any) => a + r.rating, 0) / c.reviewsReceived.length
 : 0
 const gigsCompleted = c.gigsPosted.length
 const endorsements = c.endorsementsReceived.length
 const reputationScore = Math.min(
 100,
 Math.round(gigsCompleted * 15 + endorsements * 5 + avgRating * 10)
 )
 /**
 * Match score: deterministic skill-overlap between query terms and candidate profile.
 * Formula: (matched_terms / total_query_terms) * 34 + 65 → always in [65, 99].
 * No random values — same query + candidate always yields the same score.
 */
 const matchScore = query
 ? (() => {
 const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
 if (terms.length === 0) return null;
 const haystack = [
 c.skills ?? '',
 c.bio ?? '',
 c.branch ?? '',
 c.careerGoal ?? '',
 c.userSkills.map((us: { skill: { name: string } }) => us.skill.name).join(' '),
 ].join(' ').toLowerCase();
 const hits = terms.filter(t => haystack.includes(t)).length;
 return Math.round((hits / terms.length) * 34 + 65);
 })()
 : null;
 return { ...c, reputationScore, avgRating, matchScore }
 })

 return ranked.sort((a: (typeof ranked)[number], b: (typeof ranked)[number]) => b.reputationScore - a.reputationScore)
 } catch {
 return []
 }
}

export default async function TalentSearchPage({
 searchParams,
}: {
 searchParams: Promise<{ q?: string; tier?: string; year?: string }>
}) {
 // await getSession()
 const params = await searchParams
 const query = params.q ||""
 const candidates = await getTalentData(query)

 const stats = {
 verified: candidates.filter((c: any) => c.isVerified).length,
 colleges: [...new Set(candidates.map((c: any) => c.college).filter(Boolean))].length,
 avgScore: candidates.length
 ? Math.round(candidates.reduce((a: any, c: any) => a + c.reputationScore, 0) / candidates.length)
 : 0,
 }

 return (
 <div
 className="min-h-screen text-slate-100"
 style={{ background:"var(--color-background)", fontFamily:"var(--font-body, 'DM Sans', sans-serif)" }}
 >
 {/* Ambient BG */}
 <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
 <div className="absolute -top-40 left-1/4 w-96 h-96 blur-[140px] rounded-full" style={{ background:"rgba(31,169,113,0.12)" }} />
 <div className="absolute top-1/3 right-1/4 w-80 h-80 blur-[120px] rounded-full" style={{ background:"rgba(16,185,129,0.07)" }} />
 </div>

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

 {/* HEADER */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1FA971]/15 border border-[#1FA971]/30 text-[#A78BFA] text-[10px] font-black uppercase tracking-widest mb-3">
 <Brain size={12} />
 AI-Powered Talent Discovery
 </div>
 <h1 className="text-3xl font-black text-white" style={{ fontFamily:"var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
 Talent Search
 </h1>
 <p className="text-slate-400 mt-1">Find pre-vetted student talent using semantic AI matching</p>
 </div>
 <Link href="/employer/upgrade">
 <button
 className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95"
 style={{ background:"var(--color-primary)", boxShadow:"0 4px 20px rgba(255,77,28,0.3)" }}
 >
 <Sparkles size={14} />
 Unlock Full Access
 </button>
 </Link>
 </div>

 {/* STATS ROW */}
 <div className="grid grid-cols-3 gap-4">
 {[
 { label:"Verified Students", value: `${stats.verified}+`, icon: ShieldCheck, color:"text-[#10B981]", bg:"bg-[#10B981]/10 border-[#10B981]/20" },
 { label:"Colleges Represented", value: `${stats.colleges}+`, icon: GraduationCap, color:"text-[#0EA5E9]", bg:"bg-[#0EA5E9]/10 border-[#0EA5E9]/20" },
 { label:"Avg Reputation Score", value: `${stats.avgScore}/100`, icon: Star, color:"text-[#F59E0B]", bg:"bg-[#F59E0B]/10 border-[#F59E0B]/20" },
 ].map(({ label, value, icon: Icon, color, bg }) => (
 <Card
 key={label}
 className="p-4 rounded-2xl"
 style={{ background:"var(--color-surface)", border:"1px solid var(--color-border)" }}
 >
 <div className="flex items-center gap-3">
 <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${bg}`}>
 <Icon size={16} className={color} />
 </div>
 <div>
 <p className={`font-black ${color}`}>{value}</p>
 <p className="text-slate-500 text-xs">{label}</p>
 </div>
 </div>
 </Card>
 ))}
 </div>

 {/* SEARCH + FILTERS */}
 <TalentSearchClient candidates={candidates} initialQuery={query} />

 {/* UPGRADE GATE BANNER */}
 <div
 className="relative rounded-3xl p-8 overflow-hidden text-center"
 style={{ background:"var(--color-surface)", border:"1px solid rgba(31,169,113,0.3)" }}
 >
 <div className="absolute inset-0 blur-3xl opacity-20" style={{ background:"radial-gradient(circle at center, rgba(31,169,113,0.8), transparent)" }} />
 <div className="relative z-10">
 <div className="w-12 h-12 rounded-2xl bg-[#1FA971]/20 border border-[#1FA971]/40 flex items-center justify-center mx-auto mb-4">
 <Lock size={20} className="text-[#A78BFA]" />
 </div>
 <h3 className="text-xl font-black text-white mb-2" style={{ fontFamily:"var(--font-display)" }}>
 Unlock Full Talent Intelligence
 </h3>
 <p className="text-slate-400 mb-5 max-w-md mx-auto">
 See all match scores, export candidates to ATS, bulk message shortlisted profiles, and unlock
 AI semantic ranking across 10,000+ verified students.
 </p>
 <div className="flex items-center justify-center gap-4 flex-wrap">
 <Link href="/employer/upgrade">
 <button
 className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all active:scale-95"
 style={{ background:"var(--color-primary)", boxShadow:"0 4px 20px rgba(255,77,28,0.3)" }}
 >
 <Zap size={14} />
 Upgrade to Growth — ₹3,499/mo
 </button>
 </Link>
 <Link href="/employer/upgrade" className="text-[#A78BFA] font-bold text-sm flex items-center gap-1 hover:text-white transition-colors">
 View all plans <ArrowRight size={13} />
 </Link>
 </div>
 </div>
 </div>

 </div>
 </div>
 )
}
