import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"

import { StudentPersonSchema } from "@/components/seo/JsonLd"
import prisma from "@/lib/prisma"

import PublicProfileClient from "./PublicProfileClient"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://campusconnectco.in'
  const pageUrl = `${baseUrl}/profile/${username}`

  // Fetch minimal profile data for rich metadata
  let displayName = username
  let description = `View ${username}'s verified skills, completed gigs, and career portfolio on CampusConnect.`
  let keywords: string[] = ['student freelancer india', 'campus talent', 'hire student']

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { name: true, full_name: true, bio: true, college: true, skills: true, isVerified: true },
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
      // opengraph-image.tsx in this segment is auto-served by Next.js
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
      <div className="min-h-screen bg-[#08080F] text-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-6 bg-[#111127]/60 border border-white/5 p-8 rounded-3xl backdrop-blur-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black">Connection Offline</h2>
          <p className="text-slate-400 text-sm">We are temporarily unable to load this user&apos;s profile details because the database is offline. Please try reloading the page.</p>
          <a href={`/profile/${username}`} className="inline-block w-full py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-sm font-black transition-colors">
            Retry Connection
          </a>
        </div>
      </div>
    )
  }

  // If user not found, 404
  if (!user) {
    notFound()
  }

  // Calculate stats based on DB relationships
  const gigsCompleted = user.workerEscrows?.filter((e: any) => e.status === "RELEASED").length || 0;
  // Reduce to get total earned
  const totalEarned = user.workerEscrows?.filter((e: any) => e.status === "RELEASED").reduce((acc: number, e: any) => acc + (e.payout || 0), 0) || 0;
  
  const reviews = user.reviewsReceived || [];
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;
  
  const studentData = {
    name: user.full_name || user.name || "Student",
    username: user.username,
    isVerified: user.isVerified,
    college: user.college || "Add College",
    branch: user.branch || "Add Branch",
    year: user.year || "Add Year",
    bio: user.bio || "No bio added yet.",
    avatar: user.avatar_url || user.image,
    available: true, // TODO: Make dynamic based on user setting
    linkedin: user.linkedin,
    github: user.github,
    portfolio: user.portfolio,
    joinedAt: user.createdAt.toLocaleString('default', { month: 'long', year: 'numeric' }),
    skills: user.userSkills?.map((us: any) => ({
      name: us.skill.name,
      level: "Intermediate" // fallback, would need level in UserSkill schema for real logic
    })) || [],
    stats: {
      gigsCompleted,
      totalEarned,
      avgRating: Number(avgRating),
      responseRate: 98, // Static for now
      profileStrength: 82, // Static for now until profile completeness logic is put in
    },
    // Mock completed gigs until we query gig data properly via escrows
    completedGigs: user.workerEscrows?.filter((e: any) => e.status === "RELEASED").map((e: any) => ({
      id: e.gigId,
      title: e.gig.title,
      company: "Client", 
      budget: e.amount,
      rating: 5,
      review: "Excellent work!",
      completedAt: e.createdAt.toLocaleString('default', { month: 'long', year: 'numeric' }),
      skills: [],
    })) || [],
    endorsements: user.endorsementsReceived?.map((e: any) => ({
      name: e.endorser.name || e.endorser.full_name || "Anonymous",
      role: "User",
      text: "Endorsed for a skill",
    })) || []
  }

  const personData = {
    name: studentData.name,
    jobTitle: "Student Developer",
    alumniOf: studentData.college,
    sameAs: [studentData.linkedin, studentData.github, studentData.portfolio].filter((x): x is string => typeof x === "string")
  }

  return (
    <>
      <StudentPersonSchema data={personData} nonce={nonce} />
      <PublicProfileClient username={username} profile={studentData} />
    </>
  )
}
