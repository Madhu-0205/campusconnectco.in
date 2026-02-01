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

    const body = await req.json()
    const { gigId, studentId, amount } = body

    if (!gigId || !studentId || !amount) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    const numericAmount = Number(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser || dbUser.role !== "CLIENT") {
      return NextResponse.json({ error: "Only clients can lock escrow" }, { status: 403 })
    }

    const gig = await prisma.gig.findUnique({
      where: { id: gigId }
    })

    if (!gig || gig.posterId !== dbUser.id) {
      return NextResponse.json({ error: "Invalid gig access" }, { status: 403 })
    }

    const escrow = await prisma.escrow.create({
      data: {
        gigId,
        clientId: dbUser.id,
        workerId: studentId,
        amount: numericAmount,   // ✅ FIX
        status: "LOCKED"
      }
    })

    await prisma.transaction.create({
      data: {
        userId: dbUser.id,
        gigId,
        amount: numericAmount,   // ✅ FIX
        type: "ESCROW_LOCK",
        status: "COMPLETED",
        description: "Escrow locked for gig"
      }
    })

    return NextResponse.json({ success: true, escrow })

  } catch (err: any) {
    console.error("[ESCROW_LOCK_ERROR]", err)
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}
