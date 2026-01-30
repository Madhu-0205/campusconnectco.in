import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const transactionSchema = z.object({
    amount: z.number().positive(),
    type: z.enum(["DEPOSIT", "WITHDRAWAL"]),
})

export async function GET() {
    try {
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({
                transactions: [],
                stats: {
                    totalEarnings: 0,
                    pendingPayouts: 0,
                    availableBalance: 0,
                },
            })
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                transactions: {
                    orderBy: { createdAt: "desc" },
                },
            },
        })

        if (!dbUser) {
            return NextResponse.json({
                transactions: [],
                stats: {
                    totalEarnings: 0,
                    pendingPayouts: 0,
                    availableBalance: 0,
                },
            })
        }

        const totalCredits = dbUser.transactions
            .filter(
                (t) =>
                    t.status === "COMPLETED" &&
                    ["ESCROW_RELEASE", "DEPOSIT"].includes(t.type)
            )
            .reduce((sum, t) => sum + (t.netAmount || t.amount), 0)

        const pendingPayouts = dbUser.transactions
            .filter(
                (t) => t.status === "PENDING" && t.type === "ESCROW_RELEASE"
            )
            .reduce((sum, t) => sum + t.amount, 0)

        const totalDebits = dbUser.transactions
            .filter(
                (t) =>
                    (t.status === "COMPLETED" || t.status === "PENDING") &&
                    ["ESCROW_LOCK", "WITHDRAWAL"].includes(t.type)
            )
            .reduce((sum, t) => sum + t.amount, 0)

        const availableBalance = totalCredits - totalDebits

        return NextResponse.json({
            transactions: dbUser.transactions || [],
            stats: {
                totalEarnings: totalCredits || 0,
                pendingPayouts: pendingPayouts || 0,
                availableBalance: availableBalance || 0,
            },
        })
    } catch (error) {
        console.error("[TRANSACTIONS_GET_ERROR]:", error)
        return NextResponse.json({
            transactions: [],
            stats: {
                totalEarnings: 0,
                pendingPayouts: 0,
                availableBalance: 0,
            },
        })
    }
}
