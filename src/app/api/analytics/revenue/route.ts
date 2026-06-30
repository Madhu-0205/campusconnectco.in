import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

interface ChartDataItem {
    name: string;
    income: number;
    expense: number;
}

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

        const isAdmin = dbUser.role === "FOUNDER" || authUser.email === "madhuvalurouthu52@gmail.com"

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const escrows = await prisma.escrow.findMany({
            where: {
                ...(isAdmin ? { platformFee: { gt: 0 } } : { OR: [{ clientId: dbUser.id }, { workerId: dbUser.id }] }),
                status: "RELEASED",
                createdAt: { gte: thirtyDaysAgo },
            },
            orderBy: { createdAt: "asc" },
        })

        const chartData = escrows.reduce((acc: ChartDataItem[], curr: any) => {
            const dateStr = curr.createdAt.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
            })

            const existing = acc.find((d) => d.name === dateStr)

            let income = 0;
            let expense = 0;

            if (isAdmin) {
                income = curr.platformFee || 0;
            } else {
                if (curr.workerId === dbUser.id) {
                    income = curr.payout || curr.amount - (curr.platformFee || 0);
                } else if (curr.clientId === dbUser.id) {
                    expense = curr.amount;
                }
            }

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
