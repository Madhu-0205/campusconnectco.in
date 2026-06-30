import { NextResponse } from "next/server";

import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    const { errorResponse } = await protectApi(["FOUNDER"]);
    if (errorResponse) return errorResponse;

    try {
        const [pendingGigs, pendingInternships, pendingUsers] = await Promise.all([
            prisma.gig.findMany({
                where: { status: "OPEN" },
                include: { poster: { select: { name: true, email: true } } },
                orderBy: { createdAt: "desc" },
            }),
            prisma.internship.findMany({
                where: { status: "OPEN" },
                orderBy: { createdAt: "desc" },
            }),
            prisma.user.findMany({
                where: { isVerified: false, isSuspended: false },
                orderBy: { createdAt: "desc" },
                take: 20,
                select: { id: true, name: true, email: true, role: true, createdAt: true },
            }),
        ]);

        return NextResponse.json({
            pendingGigs: pendingGigs.map((g: any) => ({
                id: g.id,
                title: g.title,
                description: g.description,
                budget: g.budget,
                tags: g.tags,
                posterName: g.poster?.name || g.poster?.email || "Unknown",
                createdAt: g.createdAt.toISOString(),
            })),
            pendingInternships: pendingInternships.map((i: any) => ({
                id: i.id,
                title: i.title,
                company: i.company,
                location: i.location,
                stipend: i.stipend,
                skills: i.skills,
                createdAt: i.createdAt.toISOString(),
            })),
            pendingUsers: pendingUsers.map((u: any) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                createdAt: u.createdAt.toISOString(),
            })),
        });
    } catch (error) {
        console.error("[GET /api/founder/approvals]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const { errorResponse } = await protectApi(["FOUNDER"]);
    if (errorResponse) return errorResponse;

    try {
        const { id, type, action } = await req.json();

        if (!id || !type || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (type === "GIG") {
            const status = action === "APPROVE" ? "OPEN" : "REJECTED";
            await prisma.gig.update({
                where: { id },
                data: { status }
            });
        } else if (type === "INTERNSHIP") {
            const status = action === "APPROVE" ? "OPEN" : "REJECTED";
            await prisma.internship.update({
                where: { id },
                data: { status }
            });
        } else if (type === "USER") {
            const isVerified = action === "APPROVE";
            await prisma.user.update({
                where: { id },
                data: { isVerified }
            });
        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: `Item ${action}D successfully` });
    } catch (error) {
        console.error("[PATCH /api/founder/approvals]", error);
        return NextResponse.json({ error: "Failed to process approval action" }, { status: 500 });
    }
}
