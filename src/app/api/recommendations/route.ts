import { NextResponse } from "next/server"

import { calculateDistance, calculateMatchScore } from "@/lib/matching"
import { getActiveOpportunityPrismaFilter } from "@/lib/opportunities/lifecycle"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

/**
 * Multi-Factor Recommendation Engine for CampusConnect
 *
 * Scoring Model (0 - 100 points):
 * 1. Skill Match (0 - 60 points):
 *    - Input: Student's parsed skills vs gig title, tags, and description
 *    - Normalization: calculateMatchScore returns 0-100, scaled to 60%
 *    - Reason: Ensures students are matched to roles aligned with their technical abilities.
 * 2. Location Proximity / College Relevance (0 - 30 points):
 *    - Hierarchy: (1) Device GPS -> (2) Saved User Location -> (3) Verified College Coordinates
 *    - Normalization:
 *      <= 15 km: 30 pts
 *      <= 50 km: 20 pts
 *      <= 100 km: 10 pts
 *      Remote opportunities: 20 pts baseline
 *      > 100 km: 0 pts
 *    - Reason: Enables discovery of local campus gigs and relevant regional/remote opportunities.
 * 3. Freshness (0 - 10 points):
 *    - Input: Gig createdAt timestamp
 *    - Normalization: <= 3 days: 10 pts, <= 7 days: 7 pts, <= 14 days: 4 pts, older: 1 pt
 *    - Reason: Prioritizes actively hiring founders with quick turnaround times.
 *
 * Safety & Privacy:
 * - Strictly excludes inactive, draft, or closed gigs.
 * - Strictly excludes self-posted opportunities (posted_by != user.id).
 * - Exact private coordinates are stripped from responses before sending to the client.
 */

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    const { searchParams } = new URL(req.url)
    const parseCoord = (val: string | null) => {
      if (!val) return null
      const parsed = parseFloat(val)
      return isNaN(parsed) ? null : parsed
    }

    const lat = parseCoord(searchParams.get("lat"))
    const lng = parseCoord(searchParams.get("lng"))
    const type = searchParams.get("type") || "gigs" // "gigs" or "talent"

    // ── ANONYMOUS USER DISCOVERY ──────────────────────────────────────────────
    if (authError || !user) {
      const now = Date.now()
      const searchLat = lat
      const searchLng = lng

      // Fetch active, non-deleted gigs and/or internships
      const fetchGigs = type === "gigs" || type === "all"
      const fetchInternships = type === "internships" || type === "all"

      const [publicGigs, publicInternships] = await Promise.all([
        fetchGigs
          ? prisma.gig.findMany({
              take: 20,
              where: {
                status: "OPEN",
                ...getActiveOpportunityPrismaFilter(),
              },
              orderBy: { createdAt: "desc" },
              include: {
                poster: {
                  select: { name: true, image: true, isVerified: true }
                }
              }
            })
          : Promise.resolve([]),
        fetchInternships
          ? prisma.internship.findMany({
              take: 20,
              where: {
                status: "OPEN",
                ...getActiveOpportunityPrismaFilter(),
              },
              orderBy: { createdAt: "desc" },
              include: {
                poster: {
                  select: { name: true, image: true, isVerified: true }
                }
              }
            })
          : Promise.resolve([])
      ])

      const rateItem = (item: any, itemType: "gig" | "internship") => {
        const isRemote = (item.location?.toLowerCase().includes("remote") || item.work_mode?.toLowerCase() === "remote") ?? false
        let distance: number | null = null
        let proximityScore = 0

        if (searchLat !== null && searchLng !== null && item.latitude != null && item.longitude != null) {
          distance = calculateDistance(searchLat, searchLng, item.latitude, item.longitude)
          if (distance <= 15) proximityScore = 30
          else if (distance <= 50) proximityScore = 20
          else if (distance <= 100) proximityScore = 10
          else proximityScore = isRemote ? 15 : 0
        } else if (isRemote) {
          proximityScore = 20
        }

        const ageInDays = (now - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        let freshnessScore = 1
        if (ageInDays <= 3) freshnessScore = 10
        else if (ageInDays <= 7) freshnessScore = 7
        else if (ageInDays <= 14) freshnessScore = 4

        const finalScore = Math.min(100, Math.round(proximityScore + freshnessScore))

        const badges: string[] = []
        if (distance !== null && distance <= 50) {
          badges.push("Near your location")
        } else if (isRemote) {
          badges.push("Remote opportunity")
        }
        if (ageInDays <= 7) {
          badges.push("Fresh opportunity")
        }
        if (badges.length === 0) {
          badges.push("Verified opportunity")
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { latitude, longitude, ...safeItem } = item
        return {
          ...safeItem,
          type: itemType,
          distance: distance !== null ? Math.round(distance) : null,
          matchScore: finalScore,
          badges,
          recommendationReason: badges[0] || "Verified opportunity"
        }
      }

      const rated = [
        ...publicGigs.map(g => rateItem(g, "gig")),
        ...publicInternships.map(i => rateItem(i, "internship"))
      ]

      rated.sort((a, b) => b.matchScore - a.matchScore)

      return NextResponse.json(rated.slice(0, 10), {
        headers: {
          "Cache-Control": "private, no-store, must-revalidate"
        }
      })
    }

    // ── AUTHENTICATED USER DISCOVERY ──────────────────────────────────────────
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, skills: true, latitude: true, longitude: true, collegeId: true }
    })

    if (!dbUser) {
      return new NextResponse("User profile not found", { status: 404 })
    }

    // Resolve location hierarchy: GPS -> User Saved -> College -> None
    let searchLat: number | null = null
    let searchLng: number | null = null
    let locationSource: "gps" | "user_saved" | "college" | "none" = "none"
    let collegeName: string | null = null

    if (lat !== null && lng !== null) {
      searchLat = lat
      searchLng = lng
      locationSource = "gps"
    } else if (dbUser.latitude !== null && dbUser.longitude !== null) {
      searchLat = dbUser.latitude
      searchLng = dbUser.longitude
      locationSource = "user_saved"
    } else if (dbUser.collegeId) {
      const college = await prisma.college.findUnique({
        where: { id: dbUser.collegeId },
        select: { name: true, latitude: true, longitude: true }
      })
      if (college?.latitude && college?.longitude) {
        searchLat = college.latitude
        searchLng = college.longitude
        locationSource = "college"
        collegeName = college.name
      }
    }

    if (type === "gigs" || type === "internships" || type === "all") {
      const fetchGigs = type === "gigs" || type === "all"
      const fetchInternships = type === "internships" || type === "all"

      const [gigs, internships] = await Promise.all([
        fetchGigs
          ? prisma.gig.findMany({
              take: 50,
              where: {
                status: "OPEN",
                ...getActiveOpportunityPrismaFilter(),
                posted_by: { not: dbUser.id }
              },
              include: {
                poster: {
                  select: { name: true, image: true, isVerified: true }
                }
              }
            })
          : Promise.resolve([]),
        fetchInternships
          ? prisma.internship.findMany({
              take: 50,
              where: {
                status: "OPEN",
                ...getActiveOpportunityPrismaFilter(),
                posted_by: { not: dbUser.id }
              },
              include: {
                poster: {
                  select: { name: true, image: true, isVerified: true }
                }
              }
            })
          : Promise.resolve([])
      ])

      const now = Date.now()

      const rateItem = (item: any, itemType: "gig" | "internship") => {
        const itemSkills = itemType === "gig" 
          ? (Array.isArray(item.required_skills) ? item.required_skills.join(", ") : (item.tags || ""))
          : (item.skills || item.tags || "")

        // 1. Skill Score (0 - 60)
        const rawSkillScore = calculateMatchScore(dbUser.skills || "", itemSkills, item.description)
        const skillScore = (rawSkillScore / 100) * 60

        // 2. Proximity Score (0 - 30)
        let distance: number | null = null
        let proximityScore = 0
        const isRemote = (item.location?.toLowerCase().includes("remote") || item.work_mode?.toLowerCase() === "remote") ?? false

        if (searchLat !== null && searchLng !== null && item.latitude != null && item.longitude != null) {
          distance = calculateDistance(searchLat, searchLng, item.latitude, item.longitude)
          if (distance <= 15) {
            proximityScore = 30
          } else if (distance <= 50) {
            proximityScore = 20
          } else if (distance <= 100) {
            proximityScore = 10
          } else {
            proximityScore = isRemote ? 15 : 0
          }
        } else if (isRemote) {
          proximityScore = 20
        }

        // 3. Freshness Score (0 - 10)
        const ageInDays = (now - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        let freshnessScore = 1
        if (ageInDays <= 3) freshnessScore = 10
        else if (ageInDays <= 7) freshnessScore = 7
        else if (ageInDays <= 14) freshnessScore = 4

        const finalScore = Math.min(100, Math.round(skillScore + proximityScore + freshnessScore))

        // Truthful Explanations / Badges
        const badges: string[] = []
        if (rawSkillScore >= 40) {
          badges.push("Matches your skills")
        }
        if (distance !== null && distance <= 50) {
          if (locationSource === "college") {
            badges.push(`Near ${collegeName || "your college"}`)
          } else if (locationSource === "gps") {
            badges.push("Near your location")
          } else if (locationSource === "user_saved") {
            badges.push("Near your preferred location")
          }
        } else if (isRemote) {
          badges.push("Remote opportunity")
        }
        if (ageInDays <= 7) {
          badges.push("Fresh opportunity")
        }
        if (badges.length === 0) {
          badges.push("Verified opportunity")
        }

        // Strip sensitive private coordinates
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { latitude, longitude, ...safeItem } = item

        return {
          ...safeItem,
          type: itemType,
          distance: distance !== null ? Math.round(distance) : null,
          matchScore: finalScore,
          badges,
          recommendationReason: badges[0] || "Recommended for your profile"
        }
      }

      const rated = [
        ...gigs.map(g => rateItem(g, "gig")),
        ...internships.map(i => rateItem(i, "internship"))
      ]

      rated.sort((a, b) => b.matchScore - a.matchScore)

      return NextResponse.json(rated.slice(0, 10), {
        headers: {
          "Cache-Control": "private, no-store, must-revalidate"
        }
      })
    } else {
      // Recommendation for Talent (Peers/Candidates)
      const talent = await prisma.user.findMany({
        take: 50,
        where: {
          role: "STUDENT",
          id: { not: dbUser.id }
        },
        select: {
          id: true,
          name: true,
          image: true,
          skills: true,
          latitude: true,
          longitude: true,
          bio: true,
          college: true,
          isVerified: true
        }
      })

      const ratedTalent = talent.map((t: any) => {
        const distance = (searchLat !== null && searchLng !== null && t.latitude != null && t.longitude != null)
          ? calculateDistance(searchLat, searchLng, t.latitude, t.longitude)
          : null

        const rawSkillScore = calculateMatchScore(dbUser.skills || "", t.skills || "", t.bio)
        const badges: string[] = []
        if (rawSkillScore >= 40) badges.push("Complementary skills")
        if (distance !== null && distance <= 50) badges.push("Nearby student")
        if (t.college && dbUser.collegeId) badges.push("Same campus network")

        // Strip sensitive private coordinates
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { latitude, longitude, ...safeTalent } = t

        return {
          ...safeTalent,
          distance: distance !== null ? Math.round(distance) : null,
          matchScore: Math.round(rawSkillScore),
          badges
        }
      })

      ratedTalent.sort((a: any, b: any) => b.matchScore - a.matchScore)
      return NextResponse.json(ratedTalent.slice(0, 10), {
        headers: {
          "Cache-Control": "private, no-store, must-revalidate"
        }
      })
    }
  } catch (error) {
    console.error("API Error in src/app/api/recommendations/route.ts:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
