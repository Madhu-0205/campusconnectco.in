import { calculateDistance } from "../matching"
import { calculateGigRankingScore } from "./gigRanking"

const MAX_RADIUS_KM = 5

interface UserProfile {
    latitude: number | null;
    longitude: number | null;
    skills: string | null;
    rating?: number;
    completedJobs?: number;
}

interface Gig {
    id: string;
    latitude: number | null;
    longitude: number | null;
    tags: string | null;
    description: string;
    urgency?: number;
    [key: string]: any;
}

export function filterAndRankGigs({
    user,
    gigs,
}: {
    user: UserProfile
    gigs: Gig[]
}) {
    if (!user?.latitude || !user?.longitude || !Array.isArray(gigs)) return []

    return gigs
        .map((gig) => {
            if (!gig?.latitude || !gig?.longitude) return null

            const distance = calculateDistance(
                user.latitude as number,
                user.longitude as number,
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
        .filter((item): item is (Exclude<typeof item, null>) => item !== null)
        .sort((a, b) => b.aiScore - a.aiScore)
}
