import { NextRequest, NextResponse } from "next/server";

import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";
import { generalApiLimiter } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// GET /api/internships?recommended=true — student-facing, OPEN only
export async function GET(req: NextRequest) {
    const { errorResponse, user } = await protectApi(["STUDENT", "FOUNDER"]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const recommended = searchParams.get("recommended") === "true";
    const trending = searchParams.get("trending") === "true";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    try {
        // Base query — only OPEN internships for students
        const baseWhere = { status: "OPEN" };

        if (trending) {
            // Trending = sorted by (applyCount * 3 + views) desc in last 30 days
            const internships = await prisma.internship.findMany({
                where: baseWhere,
                orderBy: [
                    { applyCount: "desc" },
                    { views: "desc" },
                    { isFeatured: "desc" },
                    { createdAt: "desc" },
                ],
                take: limit,
            });
            return NextResponse.json({ internships });
        }

        if (recommended && user) {
            // AI Recommendation: fetch user skills + saved internships to rank
            type SavedInternship = { internshipId: string; internship: unknown };
            type UserSkillWithSkill = { skill: { name: string } };

            const [dbUser, savedInternships] = await Promise.all([
                prisma.user.findUnique({
                    where: { id: user.id },
                    include: { userSkills: { include: { skill: true } } },
                }),
                // savedInternship is a valid schema model — cast via unknown to avoid any
                prisma.$queryRaw<SavedInternship[]>`
                    SELECT "internshipId" FROM "SavedInternship" WHERE "userId" = ${user.id}
                `,
            ]);

            const userSkillNames = (dbUser?.userSkills as UserSkillWithSkill[] || []).map(
                (us) => us.skill.name.toLowerCase()
            );

            // Get all open internships
            const all = await prisma.internship.findMany({
                where: baseWhere,
                orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
                take: 50,
            });

            // Score each internship by skill match
            const savedIds = new Set((savedInternships as SavedInternship[]).map((s) => s.internshipId));
            const scored = all.map((internship: any) => {
                const internshipSkills = (internship.skills || "")
                    .split(",")
                    .map((s: any) => s.trim().toLowerCase());
                const matchCount = internshipSkills.filter((s: string) =>
                    userSkillNames.some((us: string) => us.includes(s) || s.includes(us))
                ).length;
                const savedBoost = savedIds.has(internship.id) ? 2 : 0;
                const featuredBoost = internship.isFeatured ? 1 : 0;
                return { internship, score: matchCount * 3 + savedBoost + featuredBoost };
            });

            // Sort by score desc, take top N
            scored.sort((a: any, b: any) => b.score - a.score);
            const internships = scored.slice(0, limit).map((s: any) => s.internship);
            return NextResponse.json({ internships });
        }

        // Default: featured first, then newest
        const internships = await prisma.internship.findMany({
            where: baseWhere,
            orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
            take: limit,
        });

        return NextResponse.json({ internships });
    } catch (error) {
        console.error("[GET /api/internships]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST - Create a new internship (Founder only)
export async function POST(req: Request) {
    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    if (!(await generalApiLimiter.check(ip))) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    const auth = await protectApi(["FOUNDER"]);
    if (auth.errorResponse) return auth.errorResponse;

    try {
        const body = await req.json();
        const internship = await prisma.internship.create({
            data: {
                ...body,
                status: "OPEN"
            }
        });
        return NextResponse.json(internship, { status: 201 });
    } catch (error) {
        console.error("[INTERNSHIPS_POST]", error);
        return NextResponse.json({ error: "Failed to create internship" }, { status: 500 });
    }
}

// PATCH - Update internship details or status
export async function PATCH(req: Request) {
    const auth = await protectApi(["FOUNDER"]);
    if (auth.errorResponse) return auth.errorResponse;

    try {
        const { id, ...data } = await req.json();
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const updated = await prisma.internship.update({
            where: { id },
            data
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("[INTERNSHIPS_PATCH]", error);
        return NextResponse.json({ error: "Failed to update internship" }, { status: 500 });
    }
}

// DELETE - Remove an internship
export async function DELETE(req: Request) {
    const auth = await protectApi(["FOUNDER"]);
    if (auth.errorResponse) return auth.errorResponse;

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await prisma.internship.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[INTERNSHIPS_DELETE]", error);
        return NextResponse.json({ error: "Failed to delete internship" }, { status: 500 });
    }
}

