import { NextResponse } from "next/server";

import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const auth = await protectApi(["CLIENT", "FOUNDER"]);
        if (auth.errorResponse) return auth.errorResponse;

        const { user } = auth;
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const count = await prisma.application.count({
            where: {
                gig: { posted_by: user.id },
                status: "PENDING"
            }
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error("Pending Count Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
