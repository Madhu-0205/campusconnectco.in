import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { amount, currency = "INR" } = body;

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json({
                error: "Configuration Error",
                details: "Razorpay API Keys are missing in server environment."
            }, { status: 500 });
        }

        const options = {
            amount: Math.round(amount * 100), // amount in paisa
            currency,
            receipt: `receipt_${Date.now()}`,
            notes: {
                gigId: body.gigId || "general_deposit",
                userId: user.id
            }
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json(order);

    } catch (error: any) {
        console.error("Razorpay Order Logic Error:", error);

        return NextResponse.json({
            error: "Order creation failed",
            details: error.message || "Unknown error"
        }, { status: 500 });
    }
}
