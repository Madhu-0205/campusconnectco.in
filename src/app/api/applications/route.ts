import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { gigId } = await req.json()

        if (!gigId) {
            return NextResponse.json({ error: "gigId is required" }, { status: 400 })
        }

        // Fetch user to check role
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id }
        })

        if (!dbUser || dbUser.role !== "STUDENT") {
            return NextResponse.json({ error: "Only students can apply to gigs" }, { status: 403 })
        }

        // Check if already applied
        const existingApplication = await prisma.application.findFirst({
            where: {
                gigId: gigId,
                applicantId: user.id
            }
        })

        if (existingApplication) {
            return NextResponse.json({ error: "Already applied" }, { status: 409 })
        }

        const application = await prisma.application.create({
            data: {
                gigId: gigId,
                applicantId: user.id,
                status: "PENDING"
            }
        })

        return NextResponse.json(application, { status: 201 })
    } catch (err: any) {
        console.error("APPLICATION_POST_ERROR:", err)
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
    }
}
