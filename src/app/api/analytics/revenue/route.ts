import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
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

        const isAdmin = user.role === 'FOUNDER';

        // Fetch transactions for the last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        // Return empty data if no transactions table exists yet
        let transactions = [];
        try {
            transactions = await prisma.transaction.findMany({
                where: {
                    ...(isAdmin ? { type: 'COMMISSION' } : { userId: user.id }),
                    status: "COMPLETED",
                    createdAt: { gte: thirtyDaysAgo }
                },
                orderBy: { createdAt: 'asc' }
            })
        } catch (dbError: any) {
            console.error("[REVENUE_API_DB_ERROR]:", {
                message: dbError.message,
                code: dbError.code,
                meta: dbError.meta,
                clientVersion: dbError.clientVersion
            })
            // If table doesn't exist, return empty data
            return NextResponse.json([])
        }

        // Format data for Recharts
        const chartData = transactions.reduce((acc: any[], curr) => {
            const dateStr = curr.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            const existing = acc.find(d => d.name === dateStr);

            // For Founder: Income is 'fee' from COMMISSION transactions
            // For students: Income is 'netAmount' from ESCROW_RELEASE
            const income = isAdmin ? (curr as any).fee : (curr.type === 'ESCROW_RELEASE' ? curr.amount : 0);
            const expense = isAdmin ? 0 : (curr.type === 'WITHDRAWAL' || curr.type === 'COMMISSION' ? curr.amount : 0);

            if (existing) {
                existing.income += income;
                existing.expense += expense;
            } else {
                acc.push({ name: dateStr, income, expense });
            }
            return acc;
        }, []);

        // Fill missing days if needed or just return what we have
        return NextResponse.json(chartData)
    } catch (error: any) {
        console.error("[REVENUE_API_ERROR]:", {
            message: error?.message,
            stack: error?.stack,
            name: error?.name
        })
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
