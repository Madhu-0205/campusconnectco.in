import { calculateDistance } from "../matching"
import { calculateGigRankingScore } from "./gigRanking"

const MAX_RADIUS_KM = 5

export function filterAndRankGigs({
    user,
    gigs,
}: {
    user: any
    gigs: any[]
}) {
    if (!user?.latitude || !user?.longitude || !Array.isArray(gigs)) return []

    return gigs
        .map((gig) => {
            if (!gig?.latitude || !gig?.longitude) return null

            const distance = calculateDistance(
                user.latitude,
                user.longitude,
                gig.latitude,
                gig.longitude
            )

            if (distance > MAX_RADIUS_KM) return null

            const aiScore = calculateGigRankingScore({
                userSkills: user.skills || "",
                gigTags: gig.tags || "",
                description: gig.description || "",
                distanceKm: distance,
                rating: user.rating ?? 4,
                completedJobs: user.completedJobs ?? 0,
                urgency: gig.urgency ?? 0,
            })

            return {
                ...gig,
                distanceKm: Number(distance.toFixed(2)),
                aiScore,
            }
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.aiScore - a.aiScore)
}
