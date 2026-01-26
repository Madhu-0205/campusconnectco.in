import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const applicationSchema = z.object({
    gigId: z.string(),
    coverLetter: z.string().optional(),
})

export async function GET(req: Request) {
    try {
        const session = await auth()

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        const applications = await prisma.application.findMany({
            where: { applicantId: user.id },
            include: {
                gig: {
                    include: {
                        poster: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json(applications)
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const json = await req.json()
        const body = applicationSchema.parse(json)

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        // Check if already applied
        const existing = await prisma.application.findFirst({
            where: {
                gigId: body.gigId,
                applicantId: user.id
            }
        })

        if (existing) {
            return new NextResponse("Already applied", { status: 409 })
        }

        const application = await prisma.application.create({
            data: {
                gigId: body.gigId,
                applicantId: user.id,
                coverLetter: body.coverLetter,
                status: "PENDING"
            },
        })

        return NextResponse.json(application)
    } catch (error) {
        console.error(error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
