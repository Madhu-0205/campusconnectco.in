import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

// GET - Fetch current user's applications
export async function GET(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const searchParams = new URL(req.url).searchParams
        const page = Math.max(parseInt(searchParams.get("page") || "1"), 1)
        const pageSize = Math.min(Math.max(parseInt(searchParams.get("limit") || "20"), 20), 100)
        const skip = (page - 1) * pageSize

        const [applications, total] = await Promise.all([
            prisma.application.findMany({
                where: { applicantId: user.id },
                include: {
                    gig: {
                        select: {
                            id: true,
                            title: true,
                            budget: true,
                            status: true,
                            ownerConfirmed: true,
                            studentConfirmed: true,
                            posted_by: true,
                            poster: { select: { name: true } },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
            }),
            prisma.application.count({ where: { applicantId: user.id } }),
        ])

        return NextResponse.json({
            items: applications,
            page,
            pageSize,
            totalItems: total,
            totalPages: Math.ceil(total / pageSize),
            hasNextPage: skip + applications.length < total,
            hasPreviousPage: page > 1,
        })
    } catch (err: unknown) {
        console.error("APPLICATION_GET_ERROR:", err)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// POST - Submit a new application
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
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } })

        if (!dbUser || dbUser.role !== "STUDENT") {
            return NextResponse.json({ error: "Only students can apply to gigs" }, { status: 403 })
        }

        // Check if already applied
        const existingApplication = await prisma.application.findFirst({
            where: { gigId, applicantId: user.id },
        })

        if (existingApplication) {
            return NextResponse.json({ error: "Already applied" }, { status: 409 })
        }

        const application = await prisma.application.create({
            data: { gigId, applicantId: user.id, status: "PENDING" },
        })

        return NextResponse.json(application, { status: 201 })
    } catch (err: unknown) {
        console.error("APPLICATION_POST_ERROR:", err)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
