"use client";

import { Suspense } from "react";

import BrowseGigsContent from "@/components/gigs/BrowseGigsContent";
import { ContextualMapLayout } from "@/components/v2/maps/ContextualMapLayout";

export default function BrowseGigsPage() {
    return (
        <ContextualMapLayout>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-primary"></div></div>}>
                <BrowseGigsContent />
            </Suspense>
        </ContextualMapLayout>
    );
}
