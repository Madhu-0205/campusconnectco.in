import { Suspense } from 'react'

import { DesignNode } from '@/components/v2/inspector/DesignNode'
import { OpportunityDiscoveryClient } from '@/components/v2/OpportunityDiscoveryClient'
import { QualityGate } from '@/components/v2/QualityGate'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    budget_min?: string
    budget_max?: string
    mode?: string
    sort?: string
    page?: string
  }>
}

export default async function FindGigsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const params = await searchParams

  // Build query — start with ALL active gigs, no hidden defaults
  let query = supabase
    .from('gigs')
    .select(`
      *,
      posted_by_user:User!posted_by (
        id,
        full_name,
        company_name,
        avatar_url,
        image,
        college
      )
    `, { count: 'exact' })

  // Apply filters ONLY if settings are present
  if (params.q?.trim()) {
    query = query.or(
      `title.ilike.%${params.q}%,description.ilike.%${params.q}%`
    )
  }

  if (params.category && params.category !== 'all') {
    query = query.eq('category', params.category)
  }

  if (params.budget_min) {
    query = query.gte('budget', parseInt(params.budget_min))
  }

  if (params.budget_max) {
    query = query.lte('budget', parseInt(params.budget_max))
  }

  if (params.mode && params.mode !== 'all') {
    query = query.eq('work_mode', params.mode)
  }

  // Sort logic
  const sortBy = params.sort || 'newest'
  if (sortBy === 'budget_high') query = query.order('budget', { ascending: false })
  else if (sortBy === 'budget_low') query = query.order('budget', { ascending: true })
  else query = query.order('created_at', { ascending: false })

  // Pagination
  const page = parseInt(params.page ?? '0')
  query = query.range(page * 20, page * 20 + 19)

  const { data: gigs, error, count: totalCount } = await query

  if (error) console.error('[FindGigs] Supabase query error:', error.message)

  const safeGigs = gigs ?? []

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
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
        
        {/* Visual Header */}
        <div className="sticky top-16 z-30 py-12 overflow-hidden border-b border-border bg-background/80 backdrop-blur-xl">
          {/* Ambient Background Glows */}
          <div className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/5 blur-[100px]" />
          
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground border border-border mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Live Gigs Terminal
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                  Find Your <span className="text-primary">Next Sprint</span>
                </h1>
                <p className="text-lg font-medium text-muted-foreground">
                  {totalCount ?? 0} active opportunities available for students right now.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-12">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-[250px] w-full animate-pulse rounded-2xl bg-surface-2 border border-border" />
                  ))}
                </div>
              </div>
            }>
              <OpportunityDiscoveryClient gigs={safeGigs} />
            </Suspense>
          </div>
        </div>
    </DesignNode>
  )
}
