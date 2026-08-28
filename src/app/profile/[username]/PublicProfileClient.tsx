"use client"

import { motion } from"framer-motion"
import {
 ExternalLink, Linkedin, Github, Calendar,
 ShieldCheck, Star, TrendingUp, Briefcase, Award, CheckCircle2, Mail
} from"lucide-react"


import MatchRing from"@/components/ui/MatchRing"
import { VerificationBadge } from"@/components/ui/VerificationBadge"
import { fadeUp, staggerContainer, cardHover, viewportOnce } from"@/lib/animations"

interface PublicProfileClientProps {
 username: string
 
 profile: any
}

const levelColors: Record<string, string> = {
 Advanced:"bg-emerald-500/15 text-emerald-500 border-emerald-500/25",
 Intermediate:"bg-cyan-500/15 text-cyan-500 border-cyan-500/25",
 Beginner:"bg-amber-500/15 text-amber-500 border-amber-500/25",
}

export default function PublicProfileClient({ profile }: PublicProfileClientProps) {
 const s = profile

 return (
 <div
 className="min-h-screen bg-background text-white py-10 px-4 sm:px-6"
 style={{ fontFamily:"var(--font-body, 'DM Sans', sans-serif)" }}
 >
 {/* Background */}
 <div className="fixed inset-0 pointer-events-none -z-10">
 <div className="absolute top-0 left-1/3 w-125 h-125 bg-primary/12 rounded-full blur-[120px]" />
 </div>

 <div className="max-w-5xl mx-auto space-y-8">

 {/* ── PROFILE HEADER ── */}
 <motion.div
 variants={staggerContainer}
 initial="hidden"
 animate="visible"
 className="bg-(--surface) border border-(--border) rounded-3xl p-8 backdrop-blur-sm"
 >
 <div className="flex flex-col sm:flex-row gap-6">
 {/* Avatar */}
 <motion.div variants={fadeUp} className="shrink-0">
 <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-primary to-primary flex items-center justify-center font-black text-4xl shadow-[0_0_40px_rgba(31,169,113,0.3)]">
 {s.name.charAt(0)}
 </div>
 </motion.div>

 {/* Info */}
 <motion.div variants={fadeUp} className="flex-1 min-w-0">
 <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
 <div className="flex items-center gap-2.5 flex-wrap">
 <h1
 className="text-3xl font-black text-white"
 style={{ fontFamily:"var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}
 >
 {s.name}
 </h1>
 <VerificationBadge isVerified={s.isVerified} size="md" />
 </div>
 <p className="text-sm mt-1.5 text-slate-300">{s.branch} · {s.college} · {s.year}</p>
 {/* CTA for startups */}
 <div className="flex gap-3">
 <a
 href={`mailto:hire@campusconnectco.in?subject=Hiring ${s.name}`}
 className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(31,169,113,0.4)]"
 >
 <Mail size={15} />
 Hire This Student
 </a>
 </div>
 </div>

 {/* Availability badge */}
 {s.available && (
 <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold rounded-full mb-3">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
 Available for gigs
 </div>
 )}

 <p className="text-sm leading-relaxed mb-4 max-w-xl">{s.bio}</p>

 {/* Social links */}
 <div className="flex flex-wrap gap-2">
 {s.linkedin && (
 <a href={s.linkedin} target="_blank" rel="noopener noreferrer"
 className="flex items-center gap-1.5 px-3 py-1.5 bg-(--surface-2) hover:bg-white/10 border border-(--border) rounded-xl text-slate-300 font-medium transition-all">
 <Linkedin size={13} /> LinkedIn
 </a>
 )}
 {s.github && (
 <a href={s.github} target="_blank" rel="noopener noreferrer"
 className="flex items-center gap-1.5 px-3 py-1.5 bg-(--surface-2) hover:bg-white/10 border border-(--border) rounded-xl text-slate-300 font-medium transition-all">
 <Github size={13} /> GitHub
 </a>
 )}
 {s.portfolio && (
 <a href={s.portfolio} target="_blank" rel="noopener noreferrer"
 className="flex items-center gap-1.5 px-3 py-1.5 bg-(--surface-2) hover:bg-white/10 border border-(--border) rounded-xl text-slate-300 font-medium transition-all">
 <ExternalLink size={13} /> Portfolio
 </a>
 )}
 <div className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500">
 <Calendar size={13} />
 Joined {s.joinedAt}
 </div>
 </div>
 </motion.div>
 </div>
 </motion.div>

 {/* ── STATS ROW ── */}
 <motion.div
 variants={staggerContainer}
 initial="hidden"
 whileInView="visible"
 viewport={viewportOnce}
 className="grid grid-cols-2 sm:grid-cols-4 gap-4"
 >
 {[
 { label:"Gigs Completed", value: s.stats.gigsCompleted, icon: <Briefcase size={16} />, color:"text-primary", bg:"bg-primary/10" },
 { label:"Total Earned", value: `₹${s.stats.totalEarned.toLocaleString("en-IN")}`, icon: <TrendingUp size={16} />, color:"text-emerald-500", bg:"bg-emerald-500/10" },
 { label:"Avg Rating", value: `${s.stats.avgRating} ★`, icon: <Star size={16} />, color:"text-amber-500", bg:"bg-amber-500/10" },
 { label:"Response Rate", value: `${s.stats.responseRate}%`, icon: <Award size={16} />, color:"text-cyan-500", bg:"bg-cyan-500/10" },
 ].map((stat) => (
 <motion.div
 key={stat.label}
 variants={fadeUp}
 className="bg-(--surface) border border-(--border) rounded-2xl p-5 text-center"
 >
 <div className={`w-9 h-9 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
 {stat.icon}
 </div>
 <div className={`text-2xl font-black ${stat.color} mb-1`}>{stat.value}</div>
 <div className="text-xs font-medium">{stat.label}</div>
 </motion.div>
 ))}
 </motion.div>

 <div className="grid lg:grid-cols-3 gap-8">
 {/* LEFT: Skills + Endorsements */}
 <div className="space-y-6">

 {/* Skills */}
 <motion.div
 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
 viewport={viewportOnce} transition={{ duration: 0.5 }}
 className="bg-(--surface) border border-(--border) rounded-2xl p-6"
 >
 <h3 className="text-base font-black mb-4 flex items-center gap-2">
 <CheckCircle2 size={16} className="text-emerald-500" />
 AI-Verified Skills
 </h3>
 <div className="space-y-2">
 {s.skills.map((skill: { name: string; level: string }) => (
 <div key={skill.name} className="flex items-center justify-between">
 <span className="text-slate-300 font-medium">{skill.name}</span>
 <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${levelColors[skill.level]}`}>
 {skill.level}
 </span>
 </div>
 ))}
 </div>
 </motion.div>

 {/* Profile Strength */}
 <motion.div
 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
 viewport={viewportOnce} transition={{ duration: 0.5, delay: 0.1 }}
 className="bg-(--surface) border border-(--border) rounded-2xl p-6"
 >
 <h3 className="text-base font-black mb-4 flex items-center gap-2">
 <TrendingUp size={16} className="text-[#A78BFA]" />
 Career Progress
 </h3>
 <div className="flex items-center gap-4">
 <MatchRing value={s.stats.profileStrength} size={64} strokeWidth={5} />
 <div>
 <p className="font-bold text-sm">Profile Strength</p>
 <p className="text-xs mt-0.5">Add LinkedIn to reach 90%</p>
 </div>
 </div>
 </motion.div>

 {/* Endorsements */}
 {s.endorsements?.length > 0 && (
 <motion.div
 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
 viewport={viewportOnce} transition={{ duration: 0.5, delay: 0.2 }}
 className="bg-(--surface) border border-(--border) rounded-2xl p-6"
 >
 <h3 className="text-base font-black mb-4">Endorsements</h3>
 <div className="space-y-4">
 {s.endorsements.map((e: { text: string; name: string; role: string }, i: number) => (
 <div key={i} className="bg-white/4 border border-white/6 rounded-xl p-4">
 <p className="text-sm italic mb-3">&quot;{e.text}&quot;</p>
 <div>
 <p className="text-xs font-bold">{e.name}</p>
 <p className="text-xs">{e.role}</p>
 </div>
 </div>
 ))}
 </div>
 </motion.div>
 )}
 </div>

 {/* RIGHT: Completed Gigs */}
 <div className="lg:col-span-2 space-y-4">
 <motion.h2
 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
 viewport={viewportOnce}
 className="text-xl font-black flex items-center gap-2"
 style={{ fontFamily:"var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}
 >
 <ShieldCheck size={20} className="text-emerald-500" />
 Completed Gigs ({s.completedGigs?.length || 0})
 </motion.h2>
 {s.completedGigs?.map((gig: { id: string; title: string; company?: string; completedAt?: string; budget: number; rating?: number; review?: string; skills?: string[] }, i: number) => (
 <motion.div
 key={gig.id}
 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
 viewport={viewportOnce} transition={{ duration: 0.5, delay: i * 0.08 }}
 whileHover={cardHover}
 className="bg-(--surface) border border-(--border) rounded-2xl p-6 hover:border-(--border-subtle) transition-colors"
 >
 <div className="flex items-start justify-between gap-4 mb-3">
 <div>
 <h4 className="font-bold text-base">{gig.title}</h4>
 <p className="text-sm">{gig.company} · {gig.completedAt}</p>
 </div>
 <div className="text-right shrink-0">
 <div className="font-black text-lg">₹{gig.budget.toLocaleString("en-IN")}</div>
 <div className="flex items-center gap-0.5 justify-end mt-0.5">
 {Array.from({ length: 5 }).map((_, j) => (
 <Star key={j} size={11} fill={j < (gig.rating ?? 0) ?"#F59E0B" :"none"} className={j < (gig.rating ?? 0) ?"text-amber-500" :"text-slate-700"} />
 ))}
 </div>
 </div>
 </div>
 <p className="text-sm italic mb-3">&quot;{gig.review}&quot;</p>
 <div className="flex flex-wrap items-center gap-2">
 {gig.skills?.map((skill: string) => (
 <span key={skill} className="px-2 py-0.5 bg-(--surface-2) border border-(--border) rounded-md font-bold text-slate-400">
 {skill}
 </span>
 ))}
 </div>
 </motion.div>
 ))}
 </div>
 </div>
 </div>
 </div>
 )
}
