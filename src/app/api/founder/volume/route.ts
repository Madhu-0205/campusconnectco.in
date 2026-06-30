import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { protectApi } from "@/lib/auth-checks"

export async function GET() {
    try {
        const auth = await protectApi(["FOUNDER"]);
        if (auth.errorResponse) return auth.errorResponse;

        const transactions = await prisma.transaction.findMany({
            where: {
                status: { in: ["PAID", "COMPLETED", "RELEASED"] },
            },
            select: { platformFee: true, amount: true }
        })

        const totalVolume = transactions.reduce(
            (sum: number, t: any) => sum + Number(t.amount),
            0
        )
        const platformRevenue = transactions.reduce(
            (sum: number, t: any) => sum + Number(t.platformFee),
            0
        )

        return NextResponse.json({ totalVolume, platformRevenue })
    } catch (error) {
        console.error("[VOLUME_GET_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
