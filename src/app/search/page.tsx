"use client";

import { Suspense } from "react";

import SearchContent from "@/components/Search/SearchContent";

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-primary"></div></div>}>
            <SearchContent />
        </Suspense>
    );
}
