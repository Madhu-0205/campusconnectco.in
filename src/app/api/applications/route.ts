import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { gigId } = await req.json()

    if (!gigId) {
        return NextResponse.json({ error: "gigId is required" }, { status: 400 })
    }

    const application = await prisma.application.create({
        data: {
            gigId: gigId,
            applicantId: user.id,
            status: "PENDING"
        }
    })

    return NextResponse.json(application)
}
