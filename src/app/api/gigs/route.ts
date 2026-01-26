import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const gigSchema = z.object({
    title: z.string().min(5),
    description: z.string().min(20),
    budget: z.number().positive(),
    deadline: z.string().optional(),
})

export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const json = await req.json()
        const body = gigSchema.parse(json)

        // Ensure user exists in DB
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        const gig = await prisma.gig.create({
            data: {
                title: body.title,
                description: body.description,
                budget: body.budget,
                deadline: body.deadline ? new Date(body.deadline) : null,
                posterId: user.id,
                status: "OPEN",
            },
        })

        return NextResponse.json(gig)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 })
        }

        return new NextResponse(null, { status: 500 })
    }
}
