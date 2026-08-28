// ─── Shared TypeScript types for the Skills API ─────────────────────────────

/** A single skill record as stored in and returned from the database */
export interface SkillRecord {
 id: string;
 name: string;
 category: string;
 icon: string;
 color: string;
 keywords: string[];
}

/** Query parameters accepted by GET /api/skills/suggestions */
export interface SkillSuggestionParams {
 /** Free-text search term — matches name, category, and keywords */
 q?: string;
 /** Filter by exact category name */
 category?: string;
 /** Page number (1-indexed, default 1) */
 page?: number;
 /** Items per page (default 20, max 50) */
 limit?: number;
 /** Sort field:"name" |"category" (default"name") */
 sort?:"name" |"category";
}

/** Shape of the paginated API response */
export interface SkillSuggestionResponse {
 data: SkillRecord[];
 meta: {
 query: string;
 category: string | null;
 page: number;
 limit: number;
 total: number;
 totalPages: number;
 hasNextPage: boolean;
 hasPreviousPage: boolean;
 };
}

/** Shape of a category summary item (for populating filter UIs) */
export interface SkillCategory {
 name: string;
 count: number;
}

/** Shape of the categories endpoint response */
export interface SkillCategoriesResponse {
 categories: SkillCategory[];
}

/** Unified error response shape */
export interface ApiErrorResponse {
 error: string;
 details?: string;
}
