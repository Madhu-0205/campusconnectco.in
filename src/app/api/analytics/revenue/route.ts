import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const supabase = await createClient()
        const {
            data: { user: authUser },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !authUser) {
            return NextResponse.json([])
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: authUser.id },
        })

        if (!dbUser) {
            return NextResponse.json([])
        }

        const isAdmin = dbUser.role === "FOUNDER"

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const transactions = await prisma.transaction.findMany({
            where: {
                ...(isAdmin ? { type: "COMMISSION" } : { userId: dbUser.id }),
                status: "COMPLETED",
                createdAt: { gte: thirtyDaysAgo },
            },
            orderBy: { createdAt: "asc" },
        })

        const chartData = transactions.reduce((acc: any[], curr: any) => {
            const dateStr = curr.createdAt.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
            })

            const existing = acc.find((d) => d.name === dateStr)

            const income = isAdmin
                ? curr.fee || 0
                : curr.type === "ESCROW_RELEASE"
                    ? curr.amount
                    : 0

            const expense = isAdmin
                ? 0
                : curr.type === "WITHDRAWAL" || curr.type === "COMMISSION"
                    ? curr.amount
                    : 0

            if (existing) {
                existing.income += income
                existing.expense += expense
            } else {
                acc.push({ name: dateStr, income, expense })
            }

            return acc
        }, [])

        return NextResponse.json(chartData)
    } catch (error) {
        console.error("[REVENUE_API_ERROR]:", error)
        return NextResponse.json([])
    }
}
