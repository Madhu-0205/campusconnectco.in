import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const withdrawSchema = z.object({
    amount: z.number().positive(),
    type: z.enum(["bank", "upi"]),
    accNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    bankName: z.string().optional(),
    upiId: z.string().optional(),
})

export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const json = await req.json()
        const body = withdrawSchema.parse(json)

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                transactions: true
            }
        })

        if (!user) {
            return new NextResponse("User not found", { status: 404 })
        }

        // Calculate Balance
        // Sum of COMPLETED (ESCROW_RELEASE, DEPOSIT) - Sum of COMPLETED (ESCROW_LOCK, WITHDRAWAL)
        const totalCredits = user.transactions
            .filter(t => t.status === "COMPLETED" && ["ESCROW_RELEASE", "DEPOSIT"].includes(t.type))
            .reduce((sum, t) => sum + (t.netAmount || t.amount), 0);

        const totalDebits = user.transactions
            .filter(t => (t.status === "COMPLETED" || t.status === "PENDING") && ["ESCROW_LOCK", "WITHDRAWAL"].includes(t.type))
            .reduce((sum, t) => sum + t.amount, 0);

        const availableBalance = totalCredits - totalDebits;

        if (body.amount > availableBalance) {
            return new NextResponse("Insufficient funds", { status: 400 })
        }

        // Update User Bank Details
        if (body.type === "bank" && body.accNumber) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    accNumber: body.accNumber,
                    ifscCode: body.ifscCode,
                    bankName: body.bankName
                }
            })
        } else if (body.type === "upi" && body.upiId) {
            await prisma.user.update({
                where: { id: user.id },
                data: { upiId: body.upiId }
            })
        }

        // Create Withdrawal Transaction
        await prisma.transaction.create({
            data: {
                userId: user.id,
                amount: body.amount,
                type: "WITHDRAWAL",
                status: "PENDING",
                description: `Withdrawal via ${body.type === 'bank' ? 'Bank Account' : 'UPI'}`
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Withdrawal error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
