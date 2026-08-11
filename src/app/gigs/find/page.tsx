import { Suspense } from 'react'
import { DesignNode } from '@/components/v2/inspector/DesignNode'
import { OpportunityDiscoveryClient } from '@/components/v2/OpportunityDiscoveryClient'
import { QualityGate } from '@/components/v2/QualityGate'
import prisma from '@/lib/prisma'

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
  const params = await searchParams
  
  const where: any = { status: 'OPEN' }

  if (params.q?.trim()) {
    where.OR = [
      { title: { contains: params.q, mode: 'insensitive' } },
      { description: { contains: params.q, mode: 'insensitive' } }
    ]
  }

  if (params.category && params.category !== 'all') {
    where.tags = { contains: params.category, mode: 'insensitive' }
  }

  if (params.budget_min) {
    where.budget = { ...where.budget, gte: parseInt(params.budget_min) }
  }

  if (params.budget_max) {
    where.budget = { ...where.budget, lte: parseInt(params.budget_max) }
  }

  if (params.mode && params.mode !== 'all') {
    where.work_mode = params.mode
  }

  let orderBy: any = { createdAt: 'desc' }
  const sortBy = params.sort || 'newest'
  if (sortBy === 'budget_high') orderBy = { budget: 'desc' }
  else if (sortBy === 'budget_low') orderBy = { budget: 'asc' }

  const page = parseInt(params.page ?? '0')
  
  const [gigs, totalCount] = await Promise.all([
    prisma.gig.findMany({
      where,
      orderBy,
      skip: page * 20,
      take: 20,
      include: {
        poster: {
          select: {
            id: true,
            name: true,
            image: true,
            college: true
          }
        }
      }
    }),
    prisma.gig.count({ where })
  ])

  // Transform Prisma response to match what the client expects (snake_case if needed, or adjust client)
  // The OpportunityDiscoveryClient probably expects poster info in `posted_by_user`.
  // Let's pass it exactly as we fetched it, we might need to adjust the client or map it here.
  const mappedGigs = gigs.map(gig => ({
    ...gig,
    posted_by_user: {
      id: gig.poster?.id,
      full_name: gig.poster?.name,
      company_name: null, // No company on user
      avatar_url: gig.poster?.image,
      image: gig.poster?.image,
      college: gig.poster?.college
    }
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
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
        
        {/* Visual Header */}
        <div className="sticky top-16 z-30 py-12 overflow-hidden border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="pointer-events-none absolute left-0 top-0 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="pointer-events-none absolute right-0 top-0 h-125 w-125 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/5 blur-[100px]" />
          
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
                    <div key={i} className="h-62.5 w-full animate-pulse rounded-2xl bg-surface-2 border border-border" />
                  ))}
                </div>
              </div>
            }>
              <OpportunityDiscoveryClient gigs={mappedGigs as any} />
            </Suspense>
          </div>
        </div>
    </DesignNode>
  )
}
