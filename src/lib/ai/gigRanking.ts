import { calculateMatchScore, calculateRadiusScore } from "../matching"

export function calculateGigRankingScore({
    userSkills,
    gigTags,
    description,
    distanceKm,
    rating = 4,
    completedJobs = 0,
    urgency = 0,
}: {
    userSkills: string | null
    gigTags: string | null
    description?: string
    distanceKm: number | null
    rating?: number
    completedJobs?: number
    urgency?: number
}) {
    const skillScore = calculateMatchScore(userSkills, gigTags, description) / 100
    const radiusScore = calculateRadiusScore(distanceKm)
    const ratingScore = rating / 5
    const completionScore = Math.min(completedJobs / 30, 1)
    const urgencyBoost = Math.min(urgency / 10, 1)

    const finalScore =
        skillScore * 0.4 +
        radiusScore * 0.25 +
        ratingScore * 0.15 +
        completionScore * 0.1 +
        urgencyBoost * 0.1

    return Math.round(finalScore * 100)
}
