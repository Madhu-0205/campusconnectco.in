import { NextRequest, NextResponse } from "next/server";

import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

interface SavedInternshipDelegate {
    findUnique: (args: unknown) => Promise<unknown>;
    create: (args: unknown) => Promise<unknown>;
    update: (args: unknown) => Promise<unknown>;
    delete: (args: unknown) => Promise<unknown>;
}
const getSaved = () => (prisma as unknown as { savedInternship: SavedInternshipDelegate }).savedInternship;
const getIntern = () => (prisma as unknown as { internship: { update: (args: unknown) => Promise<unknown> } }).internship;

// PATCH /api/internships/[id]/engage — student engagement (view, save, like, apply-click)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { errorResponse, user } = await protectApi(["STUDENT", "FOUNDER"]);
    if (errorResponse) return errorResponse;

    const { id } = await params;
    const { action } = await req.json();

    try {
        if (action === "view") {
            await getIntern().update({
                where: { id },
                data: { views: { increment: 1 } },
            });
            return NextResponse.json({ ok: true });
        }

        if (action === "apply-click") {
            await getIntern().update({
                where: { id },
                data: { applyCount: { increment: 1 } },
            });
            return NextResponse.json({ ok: true });
        }

        if (action === "save" || action === "unsave") {
            const existing = await getSaved().findUnique({
                where: { userId_internshipId: { userId: user!.id, internshipId: id } },
            });
            if (action === "save" && !existing) {
                await getSaved().create({
                    data: { userId: user!.id, internshipId: id },
                });
            } else if (action === "unsave" && existing) {
                await getSaved().delete({
                    where: { userId_internshipId: { userId: user!.id, internshipId: id } },
                });
            }
            return NextResponse.json({ ok: true, saved: action === "save" });
        }

        if (action === "like" || action === "unlike") {
            const existing = await getSaved().findUnique({
                where: { userId_internshipId: { userId: user!.id, internshipId: id } },
            });
            if (!existing) {
                await getSaved().create({
                    data: { userId: user!.id, internshipId: id, liked: action === "like" },
                });
            } else {
                await getSaved().update({
                    where: { userId_internshipId: { userId: user!.id, internshipId: id } },
                    data: { liked: action === "like" },
                });
            }
            return NextResponse.json({ ok: true, liked: action === "like" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("[PATCH /api/internships/[id]/engage]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// GET /api/internships/[id]/engage — get user's engagement state + full internship
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { errorResponse, user } = await protectApi(["STUDENT", "FOUNDER"]);
    if (errorResponse) return errorResponse;

    const { id } = await params;

    try {
        const [internship, engagement] = await Promise.all([
            prisma.internship.findUnique({ where: { id } }),
            user
                ? getSaved().findUnique({
                    where: { userId_internshipId: { userId: user.id, internshipId: id } },
                }) as Promise<{ liked?: boolean } | null>
                : null,
        ]);

        if (!internship) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json({
            internship,
            saved: !!engagement,
            liked: engagement?.liked ?? false,
        });
    } catch (error) {
        console.error("[GET /api/internships/[id]/engage]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
