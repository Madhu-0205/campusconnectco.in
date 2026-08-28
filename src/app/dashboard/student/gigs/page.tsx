import { Suspense } from"react"

import { AIChatWidget } from"@/components/ai/AIChatWidget"
import { GigList } from"@/components/gigs/GigList"

import { GigsFilters } from"./GigsFilters"

export const dynamic ="force-dynamic"

interface PageProps {
 searchParams: Promise<{ q?: string; lat?: string; lng?: string; category?: string }>
}

// ─── Skeleton for GigList loading ────────────────────────────────────────────
function GigListSkeleton() {
 return (
 <div className="space-y-4">
 {[...Array(5)].map((_, i) => (
 <div key={i} className="bg-[#111116] border border-white/10 rounded-2xl p-6 animate-pulse">
 <div className="flex gap-5">
 <div className="w-14 h-14 rounded-2xl bg-white/10 shrink-0" />
 <div className="flex-1 space-y-3">
 <div className="h-4 bg-white/10 rounded-full w-2/3" />
 <div className="h-3 bg-white/5 rounded-full w-1/3" />
 <div className="h-3 bg-white/5 rounded-full w-full" />
 <div className="h-3 bg-white/5 rounded-full w-4/5" />
 <div className="flex gap-2 pt-1">
 {[70, 50, 60].map(w => (
 <div key={w} className="h-6 rounded-lg bg-white/10" style={{ width: `${w}px` }} />
 ))}
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 )
}

export default async function BrowseGigsPage({ searchParams }: PageProps) {
 const params = await searchParams

 return (
 <div className="max-w-7xl mx-auto px-4 pb-16 pt-2">
 {/*
 * GigsFilters is a Client Component — handles search input,
 * category pills, filter panel, and sort controls.
 * It uses router.push() to update URL params, which triggers
 * this Server Component to re-render with new searchParams.
 */}
 <Suspense fallback={null}>
 <GigsFilters />
 </Suspense>

 {/*
 * GigList is a Server Component — reads searchParams from URL
 * and fetches from the database via Prisma.
 */}
 <Suspense fallback={<GigListSkeleton />}>
 <GigList searchParams={params} />
 </Suspense>

 {/* AI Gig Assistant — floats above the page */}
 <AIChatWidget
 context={{ mode: 'gig-help' }}
 initialMessage="👋 I'm your AI Gig Assistant! I can help you write cover letters, understand gig requirements, estimate project timelines, or negotiate budgets."
 />
 </div>
 )
}
