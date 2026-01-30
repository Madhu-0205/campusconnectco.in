import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { gigId, studentId, amount } = await req.json()

        // Fetch DB user
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id }
        })

        if (!dbUser || dbUser.role !== "CLIENT") {
            return NextResponse.json({ error: "Only clients can lock escrow" }, { status: 403 })
        }

        // Validate gig ownership
        const gig = await prisma.gig.findUnique({
            where: { id: gigId }
        })

        if (!gig || gig.posterId !== dbUser.id) {
            return NextResponse.json({ error: "Invalid gig access" }, { status: 403 })
        }

        // Create escrow
        const escrow = await prisma.escrow.create({
            data: {
                gigId,
                clientId: dbUser.id,
                workerId: studentId,
                amount,
                status: "LOCKED"
            }
        })

        // Log transaction
        await prisma.transaction.create({
            data: {
                userId: dbUser.id,
                gigId,
                amount,
                type: "ESCROW_LOCK",
                status: "COMPLETED",
                description: "Escrow locked for gig"
            }
        })

        return NextResponse.json(escrow)

    } catch (err) {
        console.error("[ESCROW_LOCK_ERROR]", err)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
