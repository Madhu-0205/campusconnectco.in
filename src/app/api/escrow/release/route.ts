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

        const { escrowId } = await req.json()

        if (!escrowId) {
            return NextResponse.json({ error: "Escrow ID is required" }, { status: 400 })
        }

        // Fetch escrow to check ownership
        const currentEscrow = await prisma.escrow.findUnique({
            where: { id: escrowId },
            include: { gig: true }
        })

        if (!currentEscrow) {
            return NextResponse.json({ error: "Escrow not found" }, { status: 404 })
        }

        // Only the client (gig owner) or an admin can release escrow
        if (currentEscrow.clientId !== user.id && currentEscrow.gig.posterId !== user.id) {
            // Fetch db user to check if they are founder
            const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
            if (!dbUser || dbUser.role !== "FOUNDER") {
                return NextResponse.json({ error: "Not authorized to release this escrow" }, { status: 403 })
            }
        }

        if (currentEscrow.status !== "LOCKED") {
            return NextResponse.json({ error: `Cannot release escrow with status: ${currentEscrow.status}` }, { status: 400 })
        }

        const escrow = await prisma.escrow.update({
            where: { id: escrowId },
            data: { status: "RELEASED" }
        })

        // Log transaction for the worker (release = worker gets money)
        await prisma.transaction.create({
            data: {
                userId: currentEscrow.workerId,
                gigId: currentEscrow.gigId,
                amount: currentEscrow.amount,
                type: "ESCROW_RELEASE",
                status: "COMPLETED",
                description: `Escrow released for gig: ${currentEscrow.gig.title}`
            }
        })

        return NextResponse.json({ success: true, escrow })
    } catch (err: any) {
        console.error("ESCROW RELEASE ERROR:", err)
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
    }
}
