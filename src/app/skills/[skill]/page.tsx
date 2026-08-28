import { Award, Briefcase, Users, ArrowRight, ShieldCheck, ExternalLink } from"lucide-react"
import type { Metadata } from"next"
import { headers } from"next/headers"
import Link from"next/link"
import { notFound } from"next/navigation"
import React from"react"

import { BreadcrumbsUI } from"@/components/seo/BreadcrumbsUI"
import { BreadcrumbSchema, FAQSchema, getWikidataURI } from"@/components/seo/JsonLd"
import { RelatedContentClusters } from"@/components/seo/RelatedContentClusters"
import prisma from"@/lib/prisma"
import { SKILLS_DATASET } from"@/lib/skills-dataset"


interface Props {
 params: Promise<{ skill: string }>
}

// Map slug to proper name
function getSkillFromSlug(slug: string): string {
 const decoded = decodeURIComponent(slug)
 const match = SKILLS_DATASET.find(s => 
 s.id === decoded || 
 s.name.toLowerCase() === decoded.toLowerCase() || 
 s.name.replace(/\s+/g, '-').toLowerCase() === decoded.toLowerCase()
 )
 return match ? match.name : decoded
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const { skill } = await params
 const decodedSkill = getSkillFromSlug(skill)
 const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://campusconnectco.in'

 return {
 title: `Best Campus Gigs & Startup Internships for ${decodedSkill} Students`,
 description: `Find top-tier college student gigs, startup internships, and remote projects requiring ${decodedSkill}. Apply directly and secure milestones with escrow protection.`,
 alternates: {
 canonical: `${baseUrl}/skills/${encodeURIComponent(skill)}`,
 },
 openGraph: {
 title: `Hire Vetted ${decodedSkill} Student Developers & Designers`,
 description: `Browse student portfolios, active gigs, and verified technical records for ${decodedSkill} in India.`,
 url: `${baseUrl}/skills/${encodeURIComponent(skill)}`,
 type: 'website',
 images: [{ url:"/logo-v2.jpg" }],
 }
 }
}

export async function generateStaticParams() {
 return SKILLS_DATASET.map(s => ({
 skill: s.name.replace(/\s+/g, '-').toLowerCase()
 }))
}

export default async function SkillSEOPage({ params }: Props) {
 const nonce = (await headers()).get("x-nonce") || undefined
 const { skill } = await params
 const decodedSkill = getSkillFromSlug(skill)
 
 if (!decodedSkill || decodedSkill.length > 50) {
 notFound()
 }

 let students: any[] = []
 let gigs: any[] = []
 let dbError = false

 try {
 const [fetchedStudents, fetchedGigs] = await Promise.all([
 // 1. Fetch matching students
 prisma.user.findMany({
 where: {
 role:"STUDENT",
 OR: [
 { skills: { contains: decodedSkill, mode: 'insensitive' } },
 { userSkills: { some: { skill: { name: { equals: decodedSkill, mode: 'insensitive' } } } } }
 ]
 },
 select: {
 id: true,
 name: true,
 full_name: true,
 username: true,
 image: true,
 avatar_url: true,
 college: true,
 branch: true,
 year: true,
 bio: true,
 isVerified: true,
 },
 take: 12,
 }),
 // 2. Fetch active gigs matching this skill
 prisma.gig.findMany({
 where: {
 status:"OPEN",
 OR: [
 { tags: { contains: decodedSkill, mode: 'insensitive' } },
 { gigSkills: { some: { skill: { name: { equals: decodedSkill, mode: 'insensitive' } } } } }
 ]
 },
 include: {
 poster: {
 select: {
 name: true,
 image: true,
 }
 }
 },
 take: 10,
 orderBy: { createdAt:"desc" }
 })
 ])

 students = fetchedStudents
 gigs = fetchedGigs
 } catch (err) {
 console.error("[SKILLS_PAGE_DB_ERROR]:", err)
 dbError = true
 }

 const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://campusconnectco.in'
 const breadcrumbItems = [
 { name:"Home", url: `${baseUrl}` },
 { name:"Skills", url: `${baseUrl}/skills` },
 { name: decodedSkill, url: `${baseUrl}/skills/${skill}` }
 ]

 const averageBudget = gigs.length > 0
 ? Math.round(gigs.reduce((acc: number, curr: any) => acc + curr.budget, 0) / gigs.length)
 : 15000;

 const skillURI = getWikidataURI(decodedSkill);

 const faqs = [
 {
 question: `How do I hire vetted college students with ${decodedSkill} skills?`,
 answer: `You can browse vetted student portfolios on CampusConnect, review their skill credentials, and invite them to apply. All hires are secured using platform-controlled milestone escrows.`
 },
 {
 question: `What is the average project budget for ${decodedSkill} campus gigs?`,
 answer: `The average project budget for ${decodedSkill} opportunities on CampusConnect is approximately INR ${averageBudget.toLocaleString("en-IN")}, depending on scope, deadline, and complexity.`
 },
 {
 question: `How are students with ${decodedSkill} credentials verified on the platform?`,
 answer: `Students are vetted via official university email domains (.edu / .edu.in), platform-verified portfolio links, endorsement graphs, and transaction histories.`
 }
 ];

 return (
 <div className="min-h-screen bg-[#08080F] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ fontFamily:"var(--font-body, 'DM Sans', sans-serif)" }}>
 <BreadcrumbSchema items={breadcrumbItems} nonce={nonce} />
 <FAQSchema faqs={faqs} nonce={nonce} />

 {/* LLM Digest Section for RAG Crawling Engines */}
 <div 
 className="sr-only" 
 data-ai-digest="true" 
 data-ai-source-origin="CampusConnect"
 data-cc-entity="SkillDirectory"
 data-cc-skill={decodedSkill}
 aria-hidden="false"
 >
 <h2>Factual Digest: Vetted {decodedSkill} Student Talent & Gigs</h2>
 <ul>
 <li>Topic Reference Name: {decodedSkill}</li>
 {skillURI && <li>Entity Wikidata Reference: {skillURI}</li>}
 <li>Total Vetted Candidates Registered: {students.length}</li>
 <li>Total Active Opportunities / Gigs: {gigs.length}</li>
 <li>Average Project Budget: INR {averageBudget.toLocaleString("en-IN")}</li>
 <li>Platform Payment Protection: 100% Escrow Guarantee</li>
 </ul>
 </div>
 
 {/* Background gradients */}
 <div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
 <div className="absolute bottom-[-10%] left-[-10%] w-125 h-125 bg-cyan-500/8 blur-[120px] rounded-full pointer-events-none" />

 <div className="max-w-7xl mx-auto space-y-12 relative z-10">
 <BreadcrumbsUI items={breadcrumbItems} />
 {dbError && (
 <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-200 flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
 <div>
 <h4 className="font-black text-sm flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
 Connection Error
 </h4>
 <p className="text-xs text-red-300/80 mt-1">We are unable to load live student data or gigs because the database is temporarily offline.</p>
 </div>
 <Link href={`/skills/${skill}`} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-xs font-black transition-colors shrink-0">
 Retry Load
 </Link>
 </div>
 )}
 
 {/* Header */}
 <div className="text-center md:text-left space-y-4 border-b border-white/5 pb-8">
 <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-black uppercase tracking-widest font-mono">
 <Award size={12} /> Programmatic Sourcing directory
 </div>
 <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight font-heading">
 Hire Top Student Experts in <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary">{decodedSkill}</span>
 </h1>
 <p className="text-slate-400 max-w-3xl text-base md:text-lg leading-relaxed">
 Browse verified college students, design portfolios, and campus opportunities requiring {decodedSkill} skill competency. All transactions are protected via platform milestone escrows.
 </p>
 </div>

 {/* Dynamic Grid Layout */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
 
 {/* Left Side: Vetted Students */}
 <div className="lg:col-span-8 space-y-6">
 <div className="flex items-center gap-2.5 mb-2">
 <Users className="w-5 h-5 text-primary" />
 <h2 className="text-xl font-bold text-white">Vetted {decodedSkill} Candidates ({students.length})</h2>
 </div>

 {students.length === 0 ? (
 <div className="bg-surface/50 border border-white/5 rounded-3xl p-10 text-center space-y-4">
 <p className="text-slate-400">No public student portfolios registered with {decodedSkill} yet.</p>
 <Link href="/auth/sign-up" className="inline-block px-5 py-2.5 rounded-xl bg-primary hover:bg-primary text-white font-bold text-sm transition-all">
 Join as student
 </Link>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {students.map((student: any) => {
 const avatarLetter = (student.full_name || student.name ||"?").charAt(0).toUpperCase();
 return (
 <div key={student.id} className="bg-surface/60 border border-white/5 rounded-3xl p-5 hover:border-primary/20 transition-all flex flex-col justify-between h-52">
 <div className="flex items-start gap-4">
 <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-primary flex items-center justify-center font-black text-lg text-white">
 {avatarLetter}
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-1.5">
 <h3 className="font-bold text-white text-sm truncate">{student.full_name || student.name}</h3>
 {student.isVerified && <span className="text-amber-500 text-xs">★</span>}
 </div>
 <p className="text-xs text-slate-400 truncate">{student.college ||"Independent Student"}</p>
 <p className="text-[10px] text-slate-500 mt-0.5">{student.branch ||""} · {student.year ||""}</p>
 </div>
 </div>
 <p className="text-xs text-slate-400 line-clamp-2 italic my-3">&quot;{student.bio || 'Passionate student developer honing skills on CampusConnect.'}&quot;</p>
 <Link href={`/profile/${student.username || student.id}`} className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:text-primary">
 View Brand Profile <ExternalLink size={12} />
 </Link>
 </div>
 )
 })}
 </div>
 )}
 </div>

 {/* Right Side: Active Gigs */}
 <div className="lg:col-span-4 space-y-6">
 <div className="flex items-center gap-2.5 mb-2">
 <Briefcase className="w-5 h-5 text-cyan-400" />
 <h2 className="text-xl font-bold text-white">Active {decodedSkill} Gigs</h2>
 </div>

 {gigs.length === 0 ? (
 <div className="bg-surface/50 border border-white/5 rounded-3xl p-8 text-center space-y-4">
 <p className="text-slate-400 text-xs">No active opportunities requiring {decodedSkill} currently posted.</p>
 <Link href="/post-gig" className="inline-block px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-all">
 Post a Gig
 </Link>
 </div>
 ) : (
 <div className="space-y-3">
 {gigs.map((gig: any) => (
 <div key={gig.id} className="bg-surface/80 border border-white/5 rounded-2xl p-4 space-y-3 hover:border-cyan-500/20 transition-all">
 <div>
 <h3 className="font-bold text-sm text-white line-clamp-1">{gig.title}</h3>
 <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{gig.description}</p>
 </div>
 <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs">
 <span className="font-mono text-cyan-400 font-bold">₹{gig.budget.toLocaleString("en-IN")}</span>
 <Link href={`/gigs/${gig.id}`} className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white font-bold">
 Apply <ArrowRight size={12} />
 </Link>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Escrow Guarantee Box */}
 <div className="bg-linear-to-br from-primary/10 to-primary/5 border border-primary/10 rounded-3xl p-5 space-y-2.5">
 <div className="flex items-center gap-2 text-amber-400">
 <ShieldCheck size={16} />
 <h4 className="font-black uppercase tracking-wider text-xs">Escrow Guarantee</h4>
 </div>
 <p className="text-[11px] text-slate-400 leading-relaxed">
 Funds are held securely in platform-controlled vaults and only released when the student submits milestone work and the employer signs off. Backed by dispute-resolution support.
 </p>
 </div>

 </div>

 </div>

 {/* Cross-Linking Clusters */}
 <RelatedContentClusters currentType="skill" currentSlug={skill} />

 </div>
 </div>
 )
}
