import { NextResponse } from "next/server";

import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

// GET - Fetch all users with stats
export async function GET() {
    try {
        const auth = await protectApi(["FOUNDER"]);
        if (auth.errorResponse) return auth.errorResponse;

        // Fetch all users with their activity counts
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true,
                isSuspended: true,
                createdAt: true,
                _count: {
                    select: {
                        gigsPosted: true,
                        applications: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Calculate stats
        const stats = {
            total: users.length,
            students: users.filter((u: any) => u.role === "STUDENT").length,
            clients: users.filter((u: any) => u.role === "CLIENT").length,
            founders: users.filter((u: any) => u.role === "FOUNDER").length,
        };

        return NextResponse.json({ users, stats });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}
