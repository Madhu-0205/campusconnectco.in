import { NextRequest, NextResponse } from "next/server";

import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { errorResponse } = await protectApi(["FOUNDER"]);
    if (errorResponse) return errorResponse;

    try {
        const { id } = await params;
        const body = await request.json();
        const { action, ...updateData } = body;

        let data: Record<string, unknown> = {};

        if (action === "approve") {
            data = { status: "OPEN" };
        } else if (action === "reject") {
            data = { status: "CLOSED" };
        } else if (action === "feature") {
            const current = await prisma.internship.findUnique({ where: { id }, select: { isFeatured: true } });
            data = { isFeatured: !current?.isFeatured };
        } else {
            // Direct update
            const { title, description, company, skills, stipend, duration, location, deadline, status, isFeatured, applicationLink, tags } = updateData;
            if (title !== undefined) data.title = title;
            if (description !== undefined) data.description = description;
            if (company !== undefined) data.company = company;
            if (skills !== undefined) data.skills = skills;
            if (stipend !== undefined) data.stipend = stipend ? parseFloat(stipend) : null;
            if (duration !== undefined) data.duration = duration;
            if (location !== undefined) data.location = location;
            if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null;
            if (status !== undefined) data.status = status;
            if (isFeatured !== undefined) data.isFeatured = isFeatured;
            if (applicationLink !== undefined) data.applicationLink = applicationLink;
            if (tags !== undefined) data.tags = tags;
        }

        const internship = await prisma.internship.update({
            where: { id },
            data,
        });

        return NextResponse.json({ internship });
    } catch (error) {
        console.error("[PATCH /api/founder/internships/[id]]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { errorResponse } = await protectApi(["FOUNDER"]);
    if (errorResponse) return errorResponse;

    try {
        const { id } = await params;
        // Soft delete via status
        await prisma.internship.update({
            where: { id },
            data: { status: "DELETED" },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /api/founder/internships/[id]]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
