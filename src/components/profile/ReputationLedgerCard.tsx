"use client"

import { ShieldCheck, Briefcase, Zap, Users, HelpCircle, Award } from"lucide-react"
import React from"react"

interface ReputationLedgerCardProps {
 reliability: number
 execution: number
 learning: number
 community: number
}

export function ReputationLedgerCard({
 reliability,
 execution,
 learning,
 community
}: ReputationLedgerCardProps) {
 const score = Math.round((reliability + execution + learning + community) / 4)

 // Progression Tier Mapping
 let level = 1
 let tierName ="Freshman"
 let tierTitle ="Skills Explorer"
 let tierColor ="text-success bg-success/10 text-success border-emerald-500/20"
 let progressMax = 30
 let progressMin = 0

 if (score >= 95) {
 level = 45
 tierName ="Graduate"
 tierTitle ="Alumni Elite"
 tierColor ="text-amber-400 bg-warning/10 text-warning border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
 progressMax = 100
 progressMin = 95
 } else if (score >= 80) {
 level = 32
 tierName ="Senior"
 tierTitle ="Placement Moat"
 tierColor ="text-foreground bg-cyan-500/10 border-cyan-500/20"
 progressMax = 95
 progressMin = 80
 } else if (score >= 55) {
 level = 24
 tierName ="Junior"
 tierTitle ="Escrow Builder"
 tierColor ="text-foreground bg-accent border-border"
 progressMax = 80
 progressMin = 55
 } else if (score >= 30) {
 level = 12
 tierName ="Sophomore"
 tierTitle ="Micro-operator"
 tierColor ="text-pink-400 bg-pink-500/10 border-pink-500/20"
 progressMax = 55
 progressMin = 30
 }

 const tierPercentage = Math.min(100, Math.max(0, ((score - progressMin) / (progressMax - progressMin)) * 100))

 const dimensions = [
 {
 label:"Reliability",
 score: reliability,
 icon: ShieldCheck,
 color:"text-success",
 bg:"bg-success/10 text-success",
 barColor:"bg-emerald-500",
 desc:"Milestones completed on schedule and dispute-free escrows."
 },
 {
 label:"Execution",
 score: execution,
 icon: Briefcase,
 color:"text-foreground",
 bg:"bg-cyan-500/10",
 barColor:"bg-cyan-500",
 desc:"Completed gigs volume, verified earnings, and recruiter reviews."
 },
 {
 label:"Learning",
 score: learning,
 icon: Zap,
 color:"text-foreground",
 bg:"bg-accent",
 barColor:"bg-primary",
 desc:"Vetted skill count and overall portfolio completeness."
 },
 {
 label:"Community",
 score: community,
 icon: Users,
 color:"text-pink-400",
 bg:"bg-pink-500/10",
 barColor:"bg-pink-500",
 desc:"Accepted connections, referrals, and peer endorsements."
 }
 ]

 return (
 <div className="rounded-3xl border border-white/5 bg-white/2 p-6 shadow-2xl relative overflow-hidden group">
 {/* Background effects */}
 <div className="absolute -right-16 -top-16 w-32 h-32 blur-[60px] bg-(--primary)/10 rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />
 
 <div className="flex items-center justify-between mb-6 relative z-10">
 <h3 className="font-black text-foreground flex items-center gap-2 text-base font-display">
 <Award size={18} className="text-foreground" /> Reputation Ledger
 </h3>
 <div className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 uppercase tracking-wider ${tierColor}`}>
 <span>Lv.{level}</span>
 <span>·</span>
 <span>{tierName}</span>
 </div>
 </div>

 {/* Smart Reputation Score Section */}
 <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/5 relative z-10">
 <div className="relative w-20 h-20 shrink-0">
 <svg className="w-full h-full -rotate-90">
 <circle cx="40" cy="40" r="35" strokeWidth="6" fill="transparent" className="text-foreground/5 stroke-current" />
 <circle cx="40" cy="40" r="35" strokeWidth="6" fill="transparent" strokeDasharray="220"
 strokeDashoffset={220 - (220 * score) / 100}
 className="text-primary stroke-current transition-all duration-1000" strokeLinecap="round" />
 </svg>
 <div className="absolute inset-0 flex flex-col items-center justify-center">
 <span className="font-black text-xl text-foreground leading-none">{score}</span>
 <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mt-0.5">SRS</span>
 </div>
 </div>
 <div className="flex-1 space-y-2">
 <div className="flex justify-between items-baseline">
 <h4 className="font-bold text-foreground text-sm">{tierTitle}</h4>
 <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Level Progress</span>
 </div>
 {/* Progress slider bar to next tier */}
 <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
 <div className="h-full bg-linear-to-r from-primary to-primary rounded-full" style={{ width: `${tierPercentage}%` }} />
 </div>
 <p className="text-[10px] text-muted-foreground font-medium">Accumulate reputation points by completing escrow gigs to level up.</p>
 </div>
 </div>

 {/* 4-D Dimensions Stack */}
 <div className="space-y-4 relative z-10">
 {dimensions.map((dim) => {
 const Icon = dim.icon
 return (
 <div key={dim.label} className="group/item relative space-y-1.5 p-3 rounded-2xl border border-transparent hover:border-white/5 hover:bg-white/2 transition-all">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <div className={`p-1.5 rounded-lg border border-white/5 ${dim.bg} ${dim.color}`}>
 <Icon size={14} />
 </div>
 <span className="font-bold text-muted-foreground text-xs">{dim.label}</span>
 {/* Hover info tooltip trigger */}
 <div className="relative group/tooltip">
 <HelpCircle size={11} className="text-muted-foreground hover:text-muted-foreground cursor-help" />
 <div className="absolute left-1/2 -translate-x-1/2 bottom-5 w-48 p-2 rounded-lg bg-slate-950 border border-border shadow-2xl opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-200 pointer-events-none z-50 text-[10px] text-muted-foreground leading-normal font-medium">
 {dim.desc}
 </div>
 </div>
 </div>
 <span className={`font-mono text-xs font-black ${dim.color}`}>{dim.score} / 100</span>
 </div>
 
 {/* Visual Score Bar */}
 <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
 <div className={`h-full rounded-full ${dim.barColor}`} style={{ width: `${dim.score}%` }} />
 </div>
 </div>
 )
 })}
 </div>
 </div>
 )
}
