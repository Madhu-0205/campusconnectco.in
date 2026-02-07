import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { filterAndRankGigs } from "@/lib/ai/filterAndRank"

export async function GET(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ gigs: [], matched: 0 })
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id }
        })

        if (!dbUser?.latitude || !dbUser?.longitude) {
            return NextResponse.json({ gigs: [], matched: 0 })
        }

        const searchParams = new URL(req.url).searchParams
        const query = searchParams.get("q") || ""
        const page = parseInt(searchParams.get("page") || "1")

        const gigs = await prisma.gig.findMany({
            where: {
                status: "OPEN",
                OR: query ? [
                    { title: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                    { tags: { contains: query, mode: "insensitive" } }
                ] : undefined
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        })

        const ranked = filterAndRankGigs({
            user: dbUser,
            gigs
        })

        // Pagination logic could be improved here or in DB query
        const ITEMS_PER_PAGE = 10
        const start = (page - 1) * ITEMS_PER_PAGE
        const paginated = ranked.slice(start, start + ITEMS_PER_PAGE)

        return NextResponse.json({
            gigs: paginated,
            matched: ranked.length,
            hasMore: start + ITEMS_PER_PAGE < ranked.length
        })
    } catch (error: any) {
        console.error("[GIGS_GET_ERROR]:", error)
        return NextResponse.json({ gigs: [], error: error.message }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { title, description, budget, deadline } = body

        if (!title || !description || !budget) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id }
        })

        if (!dbUser) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 })
        }

        const gig = await prisma.gig.create({
            data: {
                title,
                description,
                budget: parseFloat(budget.toString()),
                deadline: deadline ? new Date(deadline) : null,
                posterId: dbUser.id,
                status: "OPEN",
                latitude: dbUser.latitude,
                longitude: dbUser.longitude
            }
        })

        return NextResponse.json(gig, { status: 201 })
    } catch (error: any) {
        console.error("[GIGS_POST_ERROR]:", error)
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
    }
}
