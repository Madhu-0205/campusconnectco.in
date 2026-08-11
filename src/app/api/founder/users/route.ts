import { NextResponse } from "next/server";

import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

// GET - Fetch users with stats and pagination
export async function GET(req: Request) {
    try {
        const auth = await protectApi(["ADMIN"]);
        if (auth.errorResponse) return auth.errorResponse;

        const searchParams = new URL(req.url).searchParams;
        const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
        const pageSize = Math.min(Math.max(parseInt(searchParams.get("limit") || "20"), 20), 100);
        const skip = (page - 1) * pageSize;

        const [users, total, roleCounts] = await Promise.all([
            prisma.user.findMany({
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
                skip,
                take: pageSize,
            }),
            prisma.user.count(),
            prisma.user.groupBy({
                by: ["role"],
                _count: {
                    id: true,
                },
            }),
        ]);

        const stats = {
            total,
            students: roleCounts.find((r: any) => r.role === "STUDENT")?._count.id || 0,
            clients: roleCounts.find((r: any) => r.role === "CLIENT")?._count.id || 0,
            founders: roleCounts.find((r: any) => r.role === "FOUNDER")?._count.id || 0,
        };

        return NextResponse.json({
            users,
            stats,
            page,
            pageSize,
            totalItems: total,
            totalPages: Math.ceil(total / pageSize),
            hasNextPage: skip + users.length < total,
            hasPreviousPage: page > 1,
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}
