"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import type {
    SkillRecord,
    SkillSuggestionResponse,
    SkillCategoriesResponse,
    SkillCategory,
} from "@/types/skills";

// ─── Types ───────────────────────────────────────────────────────────────────

interface UseSkillSuggestionsOptions {
    /** Debounce delay in ms (default: 250) */
    debounceMs?: number;
    /** Items per page (default: 20) */
    limit?: number;
    /** Category filter (optional) */
    category?: string | null;
    /** Sort field (default: "name") */
    sort?: "name" | "category";
    /** Whether to start fetching immediately on mount (default: false) */
    fetchOnMount?: boolean;
}

interface UseSkillSuggestionsReturn {
    results: SkillRecord[];
    query: string;
    setQuery: (q: string) => void;
    page: number;
    setPage: (p: number) => void;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    isLoading: boolean;
    error: string | null;
    /** Reload with current query/page */
    refetch: () => void;
}

// ─── useSkillSuggestions ─────────────────────────────────────────────────────

/**
 * Fetches paginated, searchable skill suggestions from /api/skills/suggestions.
 *
 * Features:
 *   - Debounced query input (250ms default)
 *   - Stale-while-revalidate: keeps old results visible while loading
 *   - Aborts in-flight requests when query changes (no race conditions)
 *   - Returns full pagination metadata
 *
 * @example
 * const { results, setQuery, isLoading } = useSkillSuggestions({ limit: 10 });
 */
export function useSkillSuggestions({
    debounceMs = 250,
    limit = 20,
    category = null,
    sort = "name",
    fetchOnMount = false,
}: UseSkillSuggestionsOptions = {}): UseSkillSuggestionsReturn {
    const [query, setQueryRaw] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [page, setPage] = useState(1);
    const [results, setResults] = useState<SkillRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchTick, setFetchTick] = useState(0);

    const abortRef = useRef<AbortController | null>(null);

    // Debounce the raw query string
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(query), debounceMs);
        return () => clearTimeout(t);
    }, [query, debounceMs]);

    // Reset to page 1 whenever the search query changes
    const setQuery = useCallback((q: string) => {
        setQueryRaw(q);
        setPage(1);
    }, []);

    // Fetch
    useEffect(() => {
        const shouldFetch = fetchOnMount || debouncedQuery.length > 0 || category;
        if (!shouldFetch) {
            const t = setTimeout(() => {
                setResults([]);
                setTotal(0);
            }, 0);
            return () => clearTimeout(t);
        }

        // Cancel any in-flight request
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const params = new URLSearchParams();
        if (debouncedQuery) params.set("q", debouncedQuery);
        if (category) params.set("category", category);
        params.set("page", String(page));
        params.set("limit", String(limit));
        params.set("sort", sort);

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(true);

        setError(null);

        fetch(`/api/skills/suggestions?${params.toString()}`, {
            signal: controller.signal,
        })
            .then(async (res) => {
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error((body as { error?: string }).error ?? "Request failed");
                }
                return res.json() as Promise<SkillSuggestionResponse>;
            })
            .then((data) => {
                setResults(data.data);
                setTotal(data.meta.total);
                setTotalPages(data.meta.totalPages);
                setHasNextPage(data.meta.hasNextPage);
                setHasPreviousPage(data.meta.hasPreviousPage);
            })
            .catch((err: unknown) => {
                if (err instanceof Error && err.name === "AbortError") return;
                setError(err instanceof Error ? err.message : "Unknown error");
            })
            .finally(() => setIsLoading(false));

        return () => controller.abort();

    }, [debouncedQuery, page, limit, category, sort, fetchOnMount, fetchTick]);

    const refetch = useCallback(() => setFetchTick((t) => t + 1), []);

    return {
        results,
        query,
        setQuery,
        page,
        setPage,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        isLoading,
        error,
        refetch,
    };
}

// ─── useSkillCategories ───────────────────────────────────────────────────────

interface UseSkillCategoriesReturn {
    categories: SkillCategory[];
    isLoading: boolean;
    error: string | null;
}

/**
 * Fetches distinct skill categories with counts from /api/skills/categories.
 * Response is cached by the browser (CDN sets s-maxage=300).
 *
 * @example
 * const { categories } = useSkillCategories();
 */
export function useSkillCategories(): UseSkillCategoriesReturn {
    const [categories, setCategories] = useState<SkillCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetch("/api/skills/categories")
            .then(async (res) => {
                if (!res.ok) throw new Error("Failed to fetch categories");
                return res.json() as Promise<SkillCategoriesResponse>;
            })
            .then((data) => {
                if (!cancelled) setCategories(data.categories);
            })
            .catch((err: unknown) => {
                if (!cancelled)
                    setError(err instanceof Error ? err.message : "Unknown error");
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => { cancelled = true; };
    }, []);

    return { categories, isLoading, error };
}
