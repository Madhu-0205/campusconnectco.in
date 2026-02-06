import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { filterAndRankGigs } from "@/lib/ai/filterAndRank"

export async function GET(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ gigs: [] })
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
    })

    if (!dbUser?.latitude || !dbUser?.longitude) {
        return NextResponse.json({ gigs: [] })
    }

    const gigs = await prisma.gig.findMany({
        where: { status: "OPEN" },
        orderBy: { createdAt: "desc" }
    })

    const ranked = filterAndRankGigs({
        user: dbUser,
        gigs
    })

    return NextResponse.json({
        gigs: ranked,
        matched: ranked.length
    })
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
