import { NextRequest, NextResponse } from "next/server";

import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

export async function GET() {
    const { errorResponse } = await protectApi(["ADMIN"]);
    if (errorResponse) return errorResponse;

    try {
        const [internships, total, open, pending, featured] = await Promise.all([
            prisma.internship.findMany({ take: 50,
                orderBy: { createdAt: "desc" },
            }),
            prisma.internship.count(),
            prisma.internship.count({ where: { status: "OPEN" } }),
            prisma.internship.count({ where: { status: "OPEN" } }),
            prisma.internship.count({ where: { isFeatured: true } }),
        ]);

        return NextResponse.json({ internships, stats: { total, open, pending, featured } });
    } catch (error) {
        console.error("[GET /api/founder/internships]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { errorResponse } = await protectApi(["ADMIN"]);
    if (errorResponse) return errorResponse;

    try {
        const body = await request.json();
        const { title, description, company, skills, stipend, duration, location, deadline, status, isFeatured, applicationLink, tags } = body;

        if (!title || !description || !company) {
            return NextResponse.json({ error: "Title, description, and company are required" }, { status: 400 });
        }

        const internship = await prisma.internship.create({
            data: {
                title,
                description,
                company,
                skills: skills || null,
                stipend: stipend ? parseFloat(stipend) : null,
                duration: duration || null,
                location: location || null,
                tags: tags || null,
                applicationLink: applicationLink || null,
                deadline: deadline ? new Date(deadline) : null,
                status: status || "PENDING_APPROVAL",
                isFeatured: isFeatured || false,
            },
        });

        return NextResponse.json({ internship }, { status: 201 });
    } catch (error) {
        console.error("[POST /api/founder/internships]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
