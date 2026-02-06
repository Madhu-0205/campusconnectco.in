import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id }
        });

        if (!dbUser) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const allTransactions = await prisma.transaction.findMany({
            where: { userId: dbUser.id },
            orderBy: { createdAt: "desc" }
        });

        // Calculate Balance
        // Credits: ESCROW_RELEASE, DEPOSIT
        // Debits: ESCROW_LOCK, WITHDRAWAL
        const totalCredits = allTransactions
            .filter(t => t.status === "COMPLETED" && ["ESCROW_RELEASE", "DEPOSIT"].includes(t.type))
            .reduce((sum: number, t: any) => sum + (t.netAmount || t.amount), 0);

        const totalDebits = allTransactions
            .filter(t => (t.status === "COMPLETED" || t.status === "PENDING") && ["ESCROW_LOCK", "WITHDRAWAL"].includes(t.type))
            .reduce((sum: number, t: any) => sum + t.amount, 0);

        const availableBalance = totalCredits - totalDebits;

        // Recently protected (Escrows in LOCKED status)
        const lockedInEscrowRes = await prisma.escrow.aggregate({
            where: {
                OR: [
                    { clientId: dbUser.id },
                    { workerId: dbUser.id }
                ],
                status: "LOCKED"
            },
            _sum: { amount: true }
        });

        return NextResponse.json({
            balance: availableBalance,
            lockedInEscrow: lockedInEscrowRes._sum.amount || 0,
            transactions: allTransactions.slice(0, 10) // Only latest 10 for UI
        });

    } catch (error) {
        console.error("Wallet fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
