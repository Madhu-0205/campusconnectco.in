import { NextResponse } from "next/server";

import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    const { errorResponse, user } = await protectApi(["COLLEGE", "FOUNDER"]);
    if (errorResponse) return errorResponse;

    try {
        const profile = await prisma.user.findUnique({
            where: { id: user.id },
            select: { college: true }
        });

        if (!profile?.college) {
            return NextResponse.json({ error: "College name not set in profile" }, { status: 400 });
        }

        const students = await prisma.user.findMany({
            where: {
                role: "STUDENT",
                college: profile.college
            },
            select: {
                id: true,
                name: true,
                email: true,
                branch: true,
                year: true,
                isVerified: true
            },
            orderBy: { createdAt: "desc" },
            take: 100
        });

        return NextResponse.json({ students });
    } catch (error) {
        console.error("[COLLEGE_STUDENTS_GET]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
