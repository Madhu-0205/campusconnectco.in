import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";
import { generalApiLimiter } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/security/sanitization";

const InternshipCreateSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long").trim(),
    description: z.string().min(10, "Description must be at least 10 characters").max(5000, "Description is too long").trim(),
    company: z.string().min(2, "Company name must be at least 2 characters").max(100, "Company name is too long").trim(),
    skills: z.string().max(500).optional().nullable(),
    stipend: z.coerce.number().nonnegative().optional().nullable(),
    duration: z.string().max(50).optional().nullable(),
    location: z.string().max(100).optional().nullable(),
    deadline: z.string().nullish().transform(val => {
        if (!val || val.trim() === "") return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
    }),
    isFeatured: z.boolean().optional(),
    applicationLink: z.string().url("Invalid application URL").or(z.literal("")).optional().nullable(),
    tags: z.string().max(500).optional().nullable(),
});

const InternshipPatchSchema = InternshipCreateSchema.partial().extend({
    id: z.string().uuid("Invalid Internship ID format"),
    status: z.enum(["OPEN", "CLOSED", "ARCHIVED"]).optional(),
});

export const dynamic = "force-dynamic";

// GET /api/internships?recommended=true — student-facing, OPEN only
export async function GET(req: NextRequest) {
    const { errorResponse, user } = await protectApi(["STUDENT", "FOUNDER"]);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const recommended = searchParams.get("recommended") === "true";
    const trending = searchParams.get("trending") === "true";
    const location = searchParams.get("location") || "";
    const collegeId = searchParams.get("collegeId") || "";
    const city = searchParams.get("city") || "";
    const state = searchParams.get("state") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    try {
        // Base query — only OPEN internships for students
        const baseWhere: any = { status: "OPEN" };

        if (location) {
            baseWhere.OR = [
                ...(baseWhere.OR || []),
                { city: { contains: location, mode: "insensitive" } },
                { state: { contains: location, mode: "insensitive" } },
            ];
        }
        if (city) baseWhere.city = { contains: city, mode: "insensitive" };
        if (state) baseWhere.state = { contains: state, mode: "insensitive" };
        if (collegeId) baseWhere.collegeId = collegeId;

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
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const parseResult = InternshipCreateSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = parseResult.data;

        // Sanitize string inputs
        const title = sanitizeInput(data.title);
        const description = sanitizeInput(data.description);
        const company = sanitizeInput(data.company);
        const skills = data.skills ? sanitizeInput(data.skills) : null;
        const duration = data.duration ? sanitizeInput(data.duration) : null;
        const location = data.location ? sanitizeInput(data.location) : null;
        const applicationLink = data.applicationLink ? sanitizeInput(data.applicationLink) : null;
        const tags = data.tags ? sanitizeInput(data.tags) : null;

        const internship = await prisma.internship.create({
            data: {
                title,
                description,
                company,
                skills,
                stipend: data.stipend,
                duration,
                location,
                deadline: data.deadline,
                isFeatured: data.isFeatured || false,
                applicationLink,
                tags,
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
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const parseResult = InternshipPatchSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { id, ...data } = parseResult.data;

        // Construct update record with sanitization
        const updateData: any = {};
        if (data.title !== undefined) updateData.title = sanitizeInput(data.title);
        if (data.description !== undefined) updateData.description = sanitizeInput(data.description);
        if (data.company !== undefined) updateData.company = sanitizeInput(data.company);
        if (data.skills !== undefined) updateData.skills = data.skills ? sanitizeInput(data.skills) : null;
        if (data.stipend !== undefined) updateData.stipend = data.stipend;
        if (data.duration !== undefined) updateData.duration = data.duration ? sanitizeInput(data.duration) : null;
        if (data.location !== undefined) updateData.location = data.location ? sanitizeInput(data.location) : null;
        if (data.deadline !== undefined) updateData.deadline = data.deadline;
        if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
        if (data.applicationLink !== undefined) updateData.applicationLink = data.applicationLink ? sanitizeInput(data.applicationLink) : null;
        if (data.tags !== undefined) updateData.tags = data.tags ? sanitizeInput(data.tags) : null;
        if (data.status !== undefined) updateData.status = data.status;

        const updated = await prisma.internship.update({
            where: { id },
            data: updateData
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

        // Validate UUID format to prevent DB casting crashes
        if (!z.string().uuid().safeParse(id).success) {
            return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
        }

        await prisma.internship.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[INTERNSHIPS_DELETE]", error);
        return NextResponse.json({ error: "Failed to delete internship" }, { status: 500 });
    }
}

