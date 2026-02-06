import { createClient } from "@/lib/supabase/server"
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
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const json = await req.json();
        const body = withdrawSchema.parse(json);

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                transactions: true
            }
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        // Calculate Balance
        // Sum of COMPLETED (ESCROW_RELEASE, DEPOSIT) - Sum of COMPLETED (ESCROW_LOCK, WITHDRAWAL)
        const totalCredits = dbUser.transactions
            .filter(t => t.status === "COMPLETED" && ["ESCROW_RELEASE", "DEPOSIT"].includes(t.type))
            .reduce((sum: number, t: any) => sum + (t.netAmount || t.amount), 0);

        const totalDebits = dbUser.transactions
            .filter(t => (t.status === "COMPLETED" || t.status === "PENDING") && ["ESCROW_LOCK", "WITHDRAWAL"].includes(t.type))
            .reduce((sum: number, t: any) => sum + t.amount, 0);

        const availableBalance = totalCredits - totalDebits;

        if (body.amount > availableBalance) {
            return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
        }

        // Update User Bank Details
        if (body.type === "bank" && body.accNumber) {
            await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                    accNumber: body.accNumber,
                    ifscCode: body.ifscCode,
                    bankName: body.bankName
                }
            });
        } else if (body.type === "upi" && body.upiId) {
            await prisma.user.update({
                where: { id: dbUser.id },
                data: { upiId: body.upiId }
            });
        }

        // Create Withdrawal Transaction
        await prisma.transaction.create({
            data: {
                userId: dbUser.id,
                amount: body.amount,
                type: "WITHDRAWAL",
                status: "PENDING",
                description: `Withdrawal via ${body.type === 'bank' ? 'Bank Account' : 'UPI'}`
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 422 });
        }
        console.error("Withdrawal error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
