import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { amount, currency = "INR" } = body;

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return new NextResponse(JSON.stringify({
                error: "Configuration Error",
                details: "Razorpay API Keys are missing in server environment."
            }), { status: 500 });
        }

        const options = {
            amount: Math.round(amount * 100), // amount in paisa
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        // Explicitly format as JSON
        return new NextResponse(JSON.stringify(order), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error("Razorpay Order Logic Error:", error);

        // Return JSON error so frontend can parse it
        return new NextResponse(JSON.stringify({
            error: "Order creation failed",
            details: error.message || "Unknown error"
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
