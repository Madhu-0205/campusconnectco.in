import { NextRequest, NextResponse } from"next/server";

import prisma from"@/lib/prisma";
import type {
 SkillSuggestionResponse,
 ApiErrorResponse,
} from"@/types/skills";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// ─── GET /api/skills/suggestions ─────────────────────────────────────────────
//
// Query parameters:
// q string Free-text search (name + category + keywords)
// category string Exact category filter (e.g."Animation")
// page number Page number, 1-indexed (default: 1)
// limit number Items per page (default: 20, max: 50)
// sort name|category (default:"name")
//
// Response: SkillSuggestionResponse (see src/types/skills.ts)
//
// Query optimization notes:
// • name has a B-tree index → prefix/exact lookups are O(log n)
// • category has a B-tree index → category filter hits the index
// • (name, category) composite index → sorted filtered scans avoid filesort
// • keywords is a Postgres text[] column; hasSome matches exact array items.
// For partial keyword search at scale, use a GIN tsvector index (see below).
// • Prisma $transaction([count, findMany]) issues both queries over the same
// connection so the planner shares plan cache statistics.

export async function GET(
 request: NextRequest,
): Promise<NextResponse<SkillSuggestionResponse | ApiErrorResponse>> {
 try {
 const sp = request.nextUrl.searchParams;

 // ── Parse & validate query params ──────────────────────────────────────

 const rawQuery = sp.get("q")?.trim() ??"";
 const categoryFilter = sp.get("category")?.trim() ?? null;
 const sortField = sp.get("sort") ==="category" ?"category" :"name";

 const pageRaw = parseInt(sp.get("page") ??"1", 10);
 const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

 const limitRaw = parseInt(sp.get("limit") ?? String(DEFAULT_LIMIT), 10);
 const limit = Math.min(
 Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : DEFAULT_LIMIT,
 MAX_LIMIT,
 );

 const skip = (page - 1) * limit;

 // ── Build WHERE clause ────────────────────────────────────────────────
 //
 // Using explicit Prisma.SkillWhereInput[] for the AND array.
 // Priority (index-friendly first):
 // 1. category equals → hits @@index([category])
 // 2. name contains → hits @@index([name])
 // 3. keywords hasSome → array scan, bounded by table size

 // Build as a plain object to keep TypeScript happy
 const where: {
 AND?: object[];
 } = {};

 const andClauses: object[] = [];

 // Category filter (exact, case-insensitive; uses @@index([category]))
 if (categoryFilter) {
 andClauses.push({
 category: { equals: categoryFilter, mode:"insensitive" },
 });
 }

 // Free-text search: name, optional category, keywords array element
 if (rawQuery) {
 const orClauses: object[] = [
 { name: { contains: rawQuery, mode:"insensitive" } },
 ...(!categoryFilter
 ? [{ category: { contains: rawQuery, mode:"insensitive" } }]
 : []),
 // hasSome matches exact array elements; see GIN note below
 // for partial-match at scale
 { keywords: { hasSome: [rawQuery.toLowerCase()] } },
 ];
 andClauses.push({ OR: orClauses });
 }

 if (andClauses.length > 0) {
 where.AND = andClauses;
 }

 // ── Execute queries in parallel transaction ───────────────────────────

 const [total, skills] = await prisma.$transaction([
 prisma.skill.count({ where }),
 prisma.skill.findMany({
 where,
 select: {
 id: true,
 name: true,
 category: true,
 icon: true,
 color: true,
 keywords: true,
 },
 orderBy: { [sortField]:"asc" },
 skip,
 take: limit,
 }),
 ]);

 // ── In-memory keyword boost ───────────────────────────────────────────
 //
 // hasSome only matches exact array elements. If the user typed a partial
 // keyword (e.g."anim" to match"animation"), nudge those skills to the
 // top within the current page window. This is O(n) on the small page
 // result set — acceptable until a GIN index is added.

 const q = rawQuery.toLowerCase();
 if (rawQuery && skills.length > 1) {
 skills.sort((a: any, b: any) => {
 const aHits = a.keywords.some((k: any) => k.includes(q));
 const bHits = b.keywords.some((k: any) => k.includes(q));
 if (aHits && !bHits) return -1;
 if (!aHits && bHits) return 1;
 return a.name.localeCompare(b.name);
 });
 }

 const totalPages = Math.max(1, Math.ceil(total / limit));

 const response: SkillSuggestionResponse = {
 data: skills,
 meta: {
 query: rawQuery,
 category: categoryFilter,
 page,
 limit,
 total,
 totalPages,
 hasNextPage: page < totalPages,
 hasPreviousPage: page > 1,
 },
 };

 return NextResponse.json(response, {
 status: 200,
 headers: {
 // Cache at CDN for 60 s; stale-while-revalidate for 30 s
"Cache-Control":"public, s-maxage=60, stale-while-revalidate=30",
 },
 });
 } catch (err) {
 console.error("[/api/skills/suggestions] Error:", err);
 return NextResponse.json<ApiErrorResponse>(
 {
 error:"Failed to fetch skill suggestions",
 details: err instanceof Error ? err.message :"Unknown error",
 },
 { status: 500 },
 );
 }
}

/*
 * ─── Production Scaling Note: GIN index for partial keyword search ──────────
 *
 * Current `hasSome` only matches exact array elements. To support partial
 * substring keyword search (e.g."anim" matching"animation") at O(log n),
 * add this to a future migration SQL step:
 *
 * -- Immutable helper function
 * CREATE OR REPLACE FUNCTION skills_kw_tsv(keywords TEXT[])
 * RETURNS tsvector LANGUAGE SQL IMMUTABLE AS $$
 * SELECT to_tsvector('english', array_to_string(keywords, ' '));
 * $$;
 *
 * -- GIN index on the tsvector
 * CREATE INDEX CONCURRENTLY idx_skill_keywords_gin
 * ON"Skill" USING GIN (skills_kw_tsv(keywords));
 *
 * Then replace hasSome with:
 * prisma.$queryRaw`
 * SELECT id, name, category, icon, color, keywords FROM"Skill"
 * WHERE skills_kw_tsv(keywords) @@ plainto_tsquery('english', ${rawQuery})
 * AND ...
 * ORDER BY name
 * LIMIT ${limit} OFFSET ${skip}
 * `
 */
