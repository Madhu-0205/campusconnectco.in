import { NextRequest, NextResponse } from "next/server";
import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

export async function GET() {
    const { errorResponse } = await protectApi(["FOUNDER"]);
    if (errorResponse) return errorResponse;

    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ announcements });
    } catch (error) {
        console.error("[GET /api/founder/announcements]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { errorResponse } = await protectApi(["FOUNDER"]);
    if (errorResponse) return errorResponse;

    try {
        const body = await request.json();
        const { title, body: bodyText, priority, isActive } = body;

        if (!title || !bodyText) {
            return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
        }

        const announcement = await prisma.announcement.create({
            data: {
                title,
                body: bodyText,
                priority: priority || "NORMAL",
                isActive: isActive ?? true,
            },
        });

        return NextResponse.json({ announcement }, { status: 201 });
    } catch (error) {
        console.error("[POST /api/founder/announcements]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
