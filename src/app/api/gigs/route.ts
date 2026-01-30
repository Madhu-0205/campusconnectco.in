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
