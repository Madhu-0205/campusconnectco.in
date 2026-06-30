import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { SkillCategoriesResponse, ApiErrorResponse } from "@/types/skills";

// ─── GET /api/skills/categories ──────────────────────────────────────────────
//
// Returns all distinct categories with their skill counts.
// Used to populate category filter chips in the SkillSelector UI.
//
// Query parameters:
//   (none)
//
// Response: SkillCategoriesResponse

export async function GET(): Promise<NextResponse<SkillCategoriesResponse | ApiErrorResponse>> {
    try {
        // groupBy on the indexed category column — Postgres uses the B-tree index
        // to group without a full sequential scan.
        const groups = await prisma.skill.groupBy({
            by: ["category"],
            _count: { id: true },
            orderBy: { category: "asc" },
        });

        const categories = groups.map((g: any) => ({
            name: g.category,
            count: g._count.id,
        }));

        return NextResponse.json<SkillCategoriesResponse>(
            { categories },
            {
                status: 200,
                headers: {
                    // Categories change rarely — cache for 5 minutes
                    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
                },
            },
        );
    } catch (err) {
        console.error("[/api/skills/categories] Error:", err);
        return NextResponse.json<ApiErrorResponse>(
            {
                error: "Failed to fetch skill categories",
                details: err instanceof Error ? err.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
