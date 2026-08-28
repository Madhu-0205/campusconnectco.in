import { Suspense } from 'react'

import { DesignNode } from '@/components/v2/inspector/DesignNode'
import { OpportunityDiscoveryClient } from '@/components/v2/OpportunityDiscoveryClient'
import { QualityGate } from '@/components/v2/QualityGate'
import { ContextualMapLayout } from '@/components/v2/maps/ContextualMapLayout'
import { MapDataSync } from '@/components/v2/maps/MapDataSync'
import { MarkerData } from '@/components/v2/maps/MapContext'
import { getUnifiedOpportunities } from '@/lib/opportunities/fetcher'

interface PageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    location?: string
    type?: string
    sort?: string
    page?: string
  }>
}

export const metadata = {
  title: "Discover Opportunities | CampusConnect",
  description: "Find your next gig, internship, or job on CampusConnect.",
}

export default async function OpportunitiesDiscoveryPage({ searchParams }: PageProps) {
  const params = await searchParams
  
  const page = parseInt(params.page ?? '0')
  const typeParam = (params.type || 'all') as "all" | "gig" | "internship"
  const sortParam = (params.sort || 'newest') as "newest" | "compensation_high" | "compensation_low"

  const { opportunities, hasMore } = await getUnifiedOpportunities({
    query: params.q,
    category: params.category,
    location: params.location,
    type: typeParam,
    page: page,
    limit: 20,
    sortBy: sortParam,
  })

  // We map them precisely to the shape OpportunityDiscoveryClient expects
  const mappedOpportunities = opportunities.map(opp => ({
    id: opp.sourceId, // ID for routing (assuming legacy routes)
    type: opp.type,
    title: opp.title,
    company: opp.company,
    location: opp.location,
    compensation: opp.compensation,
    stipend: opp.compensation, // Client handles it based on type
    duration: opp.duration,
    workType: opp.workType,
    tags: opp.tags,
    logoUrl: opp.logoUrl ?? undefined,
    href: opp.href,
    isFeatured: opp.isFeatured,
    isUrgent: opp.isUrgent
  }))

  const markers: MarkerData[] = opportunities
    .filter(opp => opp.latitude && opp.longitude)
    .map(opp => ({
      id: opp.sourceId,
      type: opp.type,
      lat: opp.latitude!,
      lng: opp.longitude!,
      title: opp.title,
      subtitle: opp.company,
      isPremium: opp.isFeatured
    }))

  return (
    <DesignNode
      metadata={{
        name: "OpportunityDiscoveryPage",
        tokens: ['bg-background', 'text-foreground', 'font-sans'],
        typography: "Inter (Sans)",
        motionPreset: "stagger, springSmooth",
        borderRadius: "rounded-2xl",
        elevation: "shadow-glow-primary",
        colors: "background, foreground, primary",
        spacing: "p-6, gap-8",
        accessibilityNotes: "Fully responsive, keyboard navigable filters."
      }}
    >
      <ContextualMapLayout>
        <MapDataSync markers={markers} />
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 w-full">
          
          {/* Visual Header */}
          <div className="sticky top-0 z-30 py-8 overflow-hidden border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="pointer-events-none absolute left-0 top-0 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
            <div className="pointer-events-none absolute right-0 top-0 h-125 w-125 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/5 blur-[100px]" />
            
            <div className="px-6 relative z-10 w-full">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground border border-border mb-4">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Opportunity Matrix
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
                    Find Your <span className="text-primary">Next Role</span>
                  </h1>
                  <p className="text-base font-medium text-muted-foreground">
                    Discover gigs, internships, and entry-level roles tailored for students.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 w-full">
            <QualityGate 
              componentName="OpportunityDiscoveryPage"
              checks={{ 
                accessibility: true, 
                responsive: true, 
                darkMode: true, 
                lightMode: true,
                keyboardNavigation: true,
                motion: true,
                loadingState: true,
                emptyState: true,
                errorState: true,
                performance: true
              }} 
            />
            <Suspense fallback={
              <div className="flex flex-col gap-8">
                <div className="h-14 w-full animate-pulse rounded-2xl bg-surface-2 border border-border" />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-62.5 w-full animate-pulse rounded-2xl bg-surface-2 border border-border" />
                  ))}
                </div>
              </div>
            }>
              <OpportunityDiscoveryClient gigs={mappedOpportunities} hasMore={hasMore} page={page} />
            </Suspense>
          </div>
        </div>
      </ContextualMapLayout>
    </DesignNode>
  )
}
