"use client";

import { Suspense } from "react";

import BrowseGigsContent from "@/components/gigs/BrowseGigsContent";

export default function BrowseGigsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-primary"></div></div>}>
            <BrowseGigsContent />
        </Suspense>
    );
}
