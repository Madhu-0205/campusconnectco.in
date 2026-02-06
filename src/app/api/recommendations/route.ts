import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { calculateDistance, calculateMatchScore, calculateRadiusScore } from "@/lib/matching"

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const parseCoord = (val: string | null) => {
            if (!val) return null;
            const parsed = parseFloat(val);
            return isNaN(parsed) ? null : parsed;
        };

        const lat = parseCoord(searchParams.get("lat"))
        const lng = parseCoord(searchParams.get("lng"))
        const type = searchParams.get("type") || "gigs" // "gigs" or "talent"

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true, skills: true, latitude: true, longitude: true }
        })

        if (!dbUser) {
            return new NextResponse("User profile not found", { status: 404 })
        }

        // Use provided lat/lng or fallback to user's saved location
        const searchLat = lat ?? dbUser.latitude ?? 0
        const searchLng = lng ?? dbUser.longitude ?? 0

        if (type === "gigs") {
            const gigs = await prisma.gig.findMany({
                where: { status: "OPEN" },
                include: {
                    poster: {
                        select: { name: true, image: true }
                    }
                }
            })

            const ratedGigs = gigs.map(gig => {
                const distance = (gig.latitude != null && gig.longitude != null)
                    ? calculateDistance(searchLat, searchLng, gig.latitude, gig.longitude)
                    : null

                const skillScore = calculateMatchScore(dbUser.skills || "", gig.tags || "", gig.description)
                const radiusScore = calculateRadiusScore(distance)

                // Hybrid Formula: 70% skill match, 30% proximity
                const finalScore = (skillScore * 0.7) + (radiusScore * 100 * 0.3)

                return {
                    ...gig,
                    distance,
                    matchScore: Math.round(finalScore)
                }
            })

            ratedGigs.sort((a, b) => b.matchScore - a.matchScore)
            return NextResponse.json(ratedGigs.slice(0, 10))
        } else {
            // Recommendation for Talent
            const talent = await prisma.user.findMany({
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
                    bio: true
                }
            })

            const ratedTalent = talent.map(t => {
                const distance = (t.latitude != null && t.longitude != null)
                    ? calculateDistance(searchLat, searchLng, t.latitude, t.longitude)
                    : null

                return {
                    ...t,
                    distance,
                    matchScore: 0
                }
            })

            ratedTalent.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
            return NextResponse.json(ratedTalent.slice(0, 10))
        }

    } catch (error) {
        console.error("Recommendations Error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
