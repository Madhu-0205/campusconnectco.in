import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const transactionSchema = z.object({
    amount: z.number().positive(),
    type: z.enum(["DEPOSIT", "WITHDRAWAL"]),
})

export async function GET(req: Request) {
    try {
        const session = await auth()

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                transactions: {
                    orderBy: { createdAt: "desc" }
                }
            }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        // Calculate Stats
        const totalCredits = user.transactions
            .filter(t => t.status === "COMPLETED" && ["ESCROW_RELEASE", "DEPOSIT"].includes(t.type))
            .reduce((sum, t) => sum + (t.netAmount || t.amount), 0);

        const pendingPayouts = user.transactions
            .filter(t => t.status === "PENDING" && t.type === "ESCROW_RELEASE")
            .reduce((sum, t) => sum + t.amount, 0);

        const totalDebits = user.transactions
            .filter(t => (t.status === "COMPLETED" || t.status === "PENDING") && ["ESCROW_LOCK", "WITHDRAWAL"].includes(t.type))
            .reduce((sum, t) => sum + t.amount, 0);

        const availableBalance = totalCredits - totalDebits;

        return NextResponse.json({
            transactions: user.transactions,
            stats: {
                totalEarnings: totalCredits,
                pendingPayouts,
                availableBalance
            }
        })
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
        const body = transactionSchema.parse(json)

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        const transaction = await prisma.transaction.create({
            data: {
                userId: user.id,
                amount: body.amount,
                type: body.type,
                status: "COMPLETED",
            },
        })

        return NextResponse.json(transaction)
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
