import type { Metadata } from "next"
import PublicProfileClient from "./PublicProfileClient"
import { headers } from "next/headers"
import { StudentPersonSchema } from "@/components/seo/JsonLd"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username} — Student Profile | CampusConnect`,
    description: `View ${username}'s verified skills, completed gigs, and career portfolio on CampusConnect.`,
    openGraph: {
      title: `${username} — CampusConnect Profile`,
      description: `Hire ${username} for your next gig or internship.`,
      images: [{ url: "/logo-v2.jpg" }],
    },
  }
}

import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"

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
