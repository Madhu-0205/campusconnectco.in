import { motion } from"framer-motion"
import type { Metadata } from"next"
import { headers } from"next/headers"
import { notFound } from"next/navigation"

import { StudentPersonSchema } from"@/components/seo/JsonLd"
import { CareerStory } from"@/components/v2/identity/CareerStory"
import { ExperienceTimeline } from"@/components/v2/identity/ExperienceTimeline"
import { IdentityCard } from"@/components/v2/identity/IdentityCard"
import { ProjectShowcase } from"@/components/v2/identity/ProjectShowcase"
import { TechStack } from"@/components/v2/identity/TechStack"
import { DesignNode } from"@/components/v2/inspector/DesignNode"
import { QualityGate } from"@/components/v2/QualityGate"
import prisma from"@/lib/prisma"

export async function generateMetadata({
 params,
}: {
 params: Promise<{ username: string }>
}): Promise<Metadata> {
 const { username } = await params
 const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://campusconnectco.in'
 const pageUrl = `${baseUrl}/profile/${username}`

 let displayName = username
 let description = `View ${username}'s verified skills, completed gigs, and career portfolio on CampusConnect.`
 let keywords: string[] = ['student freelancer india', 'campus talent', 'hire student']

 try {
 const user = await prisma.user.findUnique({
 where: { username },
 select: { name: true, full_name: true, bio: true, college: true, skills: true, isVerified: true, city: true, state: true },
 })
 if (user) {
 displayName = user.full_name ?? user.name ?? username
 const college = user.college ? ` from ${user.college}` : ''
 const verifiedBadge = user.isVerified ? 'Verified ' : ''
 description = user.bio
 ? `${user.bio.slice(0, 140)}...`
 : `${verifiedBadge}student developer${college}. Available for gigs and internships on CampusConnect.`
 if (user.skills) {
 keywords = [...keywords, ...user.skills.split(',').map((s: string) => s.trim()).slice(0, 8)]
 }
 }
 } catch {
 // Fall back to username-based defaults
 }

 return {
 title: `${displayName} — Student Profile | CampusConnect`,
 description,
 keywords,
 alternates: { canonical: pageUrl },
 openGraph: {
 title: `${displayName} | CampusConnect`,
 description,
 url: pageUrl,
 siteName: 'CampusConnect',
 type: 'profile',
 },
 twitter: {
 card: 'summary_large_image',
 title: `${displayName} | CampusConnect`,
 description,
 site: '@campusconnect_in',
 },
 }
}

export default async function PublicProfilePage({
 params,
}: {
 params: Promise<{ username: string }>
}) {
 const nonce = (await headers()).get("x-nonce") || undefined
 const { username } = await params
 
 let user: any = null
 let dbError = false

 try {
 user = await prisma.user.findUnique({
 where: { username },
 include: {
 userSkills: { include: { skill: true } },
 endorsementsReceived: { include: { endorser: true, skill: true } },
 reviewsReceived: { include: { reviewer: true } },
 workerEscrows: { include: { gig: true } }
 }
 })
 } catch (err) {
 console.error("[PROFILE_PAGE_DB_ERROR]:", err)
 dbError = true
 }

 if (dbError) {
 return (
 <div className="min-h-screen bg-background text-foreground flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
 <div className="max-w-md w-full text-center space-y-6 bg-surface-2/60 border border-border p-8 rounded-3xl backdrop-blur-md">
 <div className="w-16 h-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
 <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
 </div>
 <h2 className="text-2xl font-black">Connection Offline</h2>
 <p className="text-muted-foreground text-sm">We are temporarily unable to load this user&apos;s profile details because the database is offline. Please try reloading the page.</p>
 <a href={`/profile/${username}`} className="inline-block w-full py-3 bg-destructive/20 hover:bg-destructive/30 border border-destructive/30 rounded-xl text-sm font-black transition-colors">
 Retry Connection
 </a>
 </div>
 </div>
 )
 }

 if (!user) {
 notFound()
 }

 const studentData = {
 name: user.full_name || user.name ||"Student",
 username: user.username,
 isVerified: user.isVerified,
 college: user.college ||"Add College",
 branch: user.branch ||"Add Branch",
 year: user.year ||"Add Year",
 bio: user.bio ||"",
 location: user.city && user.state ? `${user.city}, ${user.state}` : user.city || user.state || undefined,
 avatar: user.avatar_url || user.image,
 available: true,
 linkedin: user.linkedin,
 github: user.github,
 portfolio: user.portfolio,
 joinedAt: user.createdAt.toLocaleString('default', { month: 'long', year: 'numeric' }),
 skills: user.userSkills?.map((us: any) => ({
 name: us.skill.name,
 level:"Intermediate"
 })) || (user.skills ? user.skills.split(',').map((s: string) => ({ name: s.trim(), level: 'Intermediate' })) : []),
 projects: [
 { id:"1", title:"CampusConnect iOS App", description:"Built the initial prototype for the iOS app.", link:"https://github.com/campusconnect" },
 { id:"2", title:"E-commerce Dashboard", description:"Admin panel for tracking daily revenue and metrics using Next.js and Tremor.", link:"https://github.com/campusconnect" }
 ],
 experiences: user.workerEscrows?.filter((e: any) => e.status ==="RELEASED").map((e: any) => ({
 id: e.gigId,
 title: e.gig.title,
 company:"CampusConnect Verified Client",
 date: e.createdAt.toLocaleString('default', { month: 'short', year: 'numeric' }),
 type:"CampusGig",
 skills: ["Freelance","Gig"],
 })) || [],
 stats: {
 gigsCompleted: user.workerEscrows?.filter((e: any) => e.status ==="RELEASED").length || 0,
 totalEarned: user.workerEscrows?.filter((e: any) => e.status ==="RELEASED").reduce((sum: number, e: any) => sum + (e.payout || e.amount || 0), 0) || 0,
 avgRating: user.reviewsReceived?.length > 0 
 ? (user.reviewsReceived.reduce((sum: number, r: any) => sum + r.rating, 0) / user.reviewsReceived.length).toFixed(1) 
 :"5.0",
 responseRate: 100
 }
 }

 const personData = {
 name: studentData.name,
 jobTitle:"Student Developer",
 alumniOf: studentData.college,
 sameAs: [studentData.linkedin, studentData.github, studentData.portfolio].filter((x): x is string => typeof x ==="string")
 }

 return (
 <>
 <StudentPersonSchema data={personData} nonce={nonce} />
 
 <div className="min-h-screen bg-background pb-32">
 <div className="h-64 w-full bg-surface-2 border-b border-border relative overflow-hidden">
 <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-64 bg-primary/20 blur-[100px] rounded-full" />
 </div>

 <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
 <DesignNode
 metadata={{
 name:"CareerIdentity",
 tokens: ['grid', 'grid-cols-12'],
 typography:"Inter (Sans)",
 motionPreset:"stagger, springSmooth",
 borderRadius:"rounded-4xl",
 elevation:"shadow-glow-primary",
 colors:"background, surface, surface-2, border",
 spacing:"gap-8, gap-12",
 accessibilityNotes:"Uses semantic HTML and proper heading hierarchy. Dialogs use standard ARIA properties."
 }}
 >
 <div className="relative">
 <QualityGate 
 componentName="CareerIdentity"
 checks={{ 
 accessibility: true, 
 responsive: true, 
 darkMode: true, 
 lightMode: true,
 keyboardNavigation: true,
 motion: true,
 loadingState: true,
 emptyState: true,
 errorState: true,
 performance: true
 }} 
 />
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
 
 {/* Left Column: Identity Sidebar */}
 <div className="lg:col-span-4">
 <IdentityCard profile={studentData} />
 </div>

 {/* Right Column: Professional Content */}
 <div className="lg:col-span-8">
 <div className="space-y-8">
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
 <CareerStory bio={studentData.bio} />
 </motion.div>
 
 {studentData.skills.length > 0 && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: 0.05 }}>
 <TechStack skills={studentData.skills} />
 </motion.div>
 )}

 {studentData.projects.length > 0 && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: 0.1 }}>
 <ProjectShowcase projects={studentData.projects} />
 </motion.div>
 )}

 {studentData.experiences.length > 0 && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: 0.15 }}>
 <ExperienceTimeline experiences={studentData.experiences} />
 </motion.div>
 )}
 </div>
 </div>
 </div>
 </div>
 </DesignNode>
 </main>
 </div>
 </>
 )
}
