import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const escrowSchema = z.object({
    gigId: z.string(),
    action: z.enum(["LOCK", "RELEASE", "REFUND"]),
})

export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = escrowSchema.parse(await req.json())

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        const gig = await prisma.gig.findUnique({
            where: { id: body.gigId },
            include: {
                applications: {
                    where: { status: "ACCEPTED" },
                    take: 1,
                },
            },
        })

        if (!gig) {
            return new NextResponse("Gig not found", { status: 404 })
        }

        const acceptedApplication = gig.applications[0]
        if (!acceptedApplication) {
            return new NextResponse("No accepted applicant", { status: 400 })
        }

        const studentId = acceptedApplication.applicantId

        if (gig.status === "COMPLETED") {
            return new NextResponse("Action invalid: Gig already completed", { status: 400 })
        }

        /* ---------------- LOCK FUNDS ---------------- */
        if (body.action === "LOCK") {
            if (gig.posterId !== user.id) {
                return new NextResponse("Only poster can lock funds", { status: 403 })
            }

            if (gig.status !== "ACCEPTED") {
                return new NextResponse("Gig must be accepted first", { status: 400 })
            }

            await prisma.$transaction([
                prisma.gig.update({
                    where: { id: body.gigId },
                    data: { status: "IN_PROGRESS" },
                }),
                prisma.transaction.create({
                    data: {
                        user: { connect: { id: user.id } },
                        gig: { connect: { id: body.gigId } },
                        amount: gig.budget,
                        type: "ESCROW_LOCK",
                        status: "COMPLETED",
                        description: `Funds locked for: ${gig.title}`,
                    },
                }),
            ])
        }

        /* ---------------- RELEASE FUNDS ---------------- */
        if (body.action === "RELEASE") {
            const isPoster = gig.posterId === user.id
            const isStudent = studentId === user.id

            if (!isPoster && !isStudent) {
                return new NextResponse("Unauthorized", { status: 403 })
            }

            // Dual confirmation logic
            const updatedGig = await prisma.gig.update({
                where: { id: body.gigId },
                data: {
                    ownerConfirmed: isPoster ? true : undefined,
                    studentConfirmed: isStudent ? true : undefined,
                },
            })

            // Only release if BOTH parties have confirmed and it's not already COMPLETED
            if (updatedGig.ownerConfirmed && updatedGig.studentConfirmed && gig.status !== "COMPLETED") {
                let commissionRate = 0.1
                if (gig.budget > 5000) commissionRate = 0.07
                else if (gig.budget >= 1000) commissionRate = 0.085

                const fee = gig.budget * commissionRate
                const netAmount = gig.budget - fee

                await prisma.$transaction([
                    prisma.gig.update({
                        where: { id: body.gigId },
                        data: { status: "COMPLETED" },
                    }),

                    prisma.transaction.create({
                        data: {
                            user: { connect: { id: gig.posterId } },
                            gig: { connect: { id: body.gigId } },
                            amount: gig.budget,
                            fee,
                            netAmount: 0,
                            type: "COMMISSION",
                            status: "COMPLETED",
                            description: `Platform commission for: ${gig.title}`,
                        },
                    }),

                    prisma.transaction.create({
                        data: {
                            userId: studentId,
                            gigId: body.gigId,
                            amount: netAmount,
                            fee: 0,
                            netAmount,
                            type: "ESCROW_RELEASE",
                            status: "COMPLETED",
                            description: `Payment released for: ${gig.title}`,
                        },
                    }),
                ])
            }
        }

        /* ---------------- REFUND (optional) ---------------- */
        if (body.action === "REFUND") {
            if (gig.posterId !== user.id) {
                return new NextResponse("Only poster can refund", { status: 403 })
            }

            await prisma.$transaction([
                prisma.gig.update({
                    where: { id: body.gigId },
                    data: { status: "OPEN", ownerConfirmed: false, studentConfirmed: false },
                }),
                prisma.transaction.create({
                    data: {
                        user: { connect: { id: gig.posterId } },
                        gig: { connect: { id: body.gigId } },
                        amount: gig.budget,
                        type: "REFUND",
                        status: "COMPLETED",
                        description: `Refund processed for: ${gig.title}`,
                    },
                }),
            ])
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Escrow API Error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
