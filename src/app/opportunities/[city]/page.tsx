import { Suspense } from 'react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Briefcase, Sparkles, Building2, CheckCircle2, ArrowRight } from 'lucide-react'

import { BreadcrumbSchema, FAQSchema } from '@/components/seo/JsonLd'
import { DesignNode } from '@/components/v2/inspector/DesignNode'
import { ContextualMapLayout } from '@/components/v2/maps/ContextualMapLayout'
import { MarkerData } from '@/components/v2/maps/MapContext'
import { MapDataSync } from '@/components/v2/maps/MapDataSync'
import { OpportunityDiscoveryClient } from '@/components/v2/OpportunityDiscoveryClient'
import { QualityGate } from '@/components/v2/QualityGate'
import prisma from '@/lib/prisma'
import { getActiveOpportunityPrismaFilter } from '@/lib/opportunities/lifecycle'
import { getUnifiedOpportunities } from '@/lib/opportunities/fetcher'

interface CityPageProps {
  params: Promise<{ city: string }>
  searchParams: Promise<{
    q?: string
    category?: string
    type?: string
    sort?: string
    page?: string
  }>
}

function capitalizeCity(city: string): string {
  const decoded = decodeURIComponent(city)
  return decoded.charAt(0).toUpperCase() + decoded.slice(1).toLowerCase()
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = await params
  const cityClean = decodeURIComponent(city).toLowerCase().trim()
  const cityName = capitalizeCity(city)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.campusconnectco.in'

  const activeFilter = getActiveOpportunityPrismaFilter()
  const [gigCount, internshipCount] = await Promise.all([
    prisma.gig.count({
      where: {
        status: { in: ['OPEN', 'active'] },
        ...activeFilter,
        city: { equals: cityClean, mode: 'insensitive' }
      }
    }),
    prisma.internship.count({
      where: {
        status: 'OPEN',
        ...activeFilter,
        city: { equals: cityClean, mode: 'insensitive' }
      }
    })
  ])

  const total = gigCount + internshipCount
  if (total === 0) {
    return {
      title: `Opportunities in ${cityName} | CampusConnectCo`,
      description: `Explore student gigs and internships in ${cityName} on CampusConnectCo.`
    }
  }

  const title = `Student Internships & Gigs in ${cityName} (${total} Active) | CampusConnectCo`
  const description = `Explore ${total} verified student gigs and startup internships in ${cityName}. Connect directly with active recruiters, colleges, and student peers.`
  const canonicalUrl = `${baseUrl}/opportunities/${cityClean}`

  return {
    title,
    description,
    keywords: ['student opportunities', 'college internships', 'campus gigs', cityName, 'student jobs', cityName],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'CampusConnectCo',
      type: 'website',
      images: [{ url: '/logo-v2.jpg' }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@campusconnect_in'
    }
  }
}

export default async function CityOpportunitiesPage({ params, searchParams }: CityPageProps) {
  const { city } = await params
  const search = await searchParams
  const nonce = (await headers()).get('x-nonce') || undefined

  const cityClean = decodeURIComponent(city).toLowerCase().trim()
  const cityName = capitalizeCity(city)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.campusconnectco.in'

  // 1. Verify existence of active opportunities in this city
  const page = parseInt(search.page ?? '0')
  const typeParam = (search.type || 'all') as 'all' | 'gig' | 'internship'
  const sortParam = (search.sort || 'newest') as 'newest' | 'compensation_high' | 'compensation_low'

  const { opportunities, hasMore, total } = await getUnifiedOpportunities({
    query: search.q,
    category: search.category,
    location: cityClean,
    type: typeParam,
    page,
    limit: 20,
    sortBy: sortParam,
  })

  // Guardrail 6: If 0 opportunities exist in this city, return 404 (no thin programmatic SEO pages)
  if (total === 0 && (!search.q || search.q.trim() === '')) {
    // Check if any ever existed or if completely empty
    const anyExists = await prisma.gig.findFirst({
      where: { city: { equals: cityClean, mode: 'insensitive' }, deletedAt: null }
    })
    const anyInternship = await prisma.internship.findFirst({
      where: { city: { equals: cityClean, mode: 'insensitive' }, deletedAt: null }
    })
    if (!anyExists && !anyInternship) {
      notFound()
    }
  }

  // 2. Derive factual summary metrics from the database for this city
  const mappedOpportunities = opportunities.map(opp => ({
    id: opp.sourceId,
    type: opp.type,
    title: opp.title,
    company: opp.company,
    location: opp.location,
    compensation: opp.compensation,
    stipend: opp.compensation,
    duration: opp.duration,
    workType: opp.workType,
    tags: opp.tags,
    logoUrl: opp.logoUrl ?? undefined,
    href: opp.href,
    isFeatured: opp.isFeatured,
    isUrgent: opp.isUrgent,
    distanceMeters: opp.distanceMeters,
    distanceFormatted: opp.distanceFormatted,
    locationType: opp.locationType
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
      location: opp.location,
      compensation: opp.compensation,
      url: opp.href,
      isPremium: opp.isFeatured,
      distanceMeters: opp.distanceMeters,
      distanceFormatted: opp.distanceFormatted,
      locationType: opp.locationType
    }))

  const breadcrumbs = [
    { name: 'Home', url: baseUrl },
    { name: 'Opportunities', url: `${baseUrl}/opportunities` },
    { name: cityName, url: `${baseUrl}/opportunities/${cityClean}` }
  ]

  const faqs = [
    {
      question: `What kinds of student opportunities are available in ${cityName}?`,
      answer: `CampusConnectCo features verified campus gigs, freelance development projects, and startup internships physically located or hybrid in ${cityName}.`
    },
    {
      question: `How are students in ${cityName} protected during projects?`,
      answer: `All campus gigs on CampusConnectCo use deliverable-based milestone tracking, ensuring students are paid upon completed verification.`
    }
  ]

  return (
    <DesignNode
      metadata={{
        name: `CityOpportunityDiscovery-${cityName}`,
        tokens: ['bg-background', 'text-foreground', 'font-sans'],
        typography: 'Inter (Sans)',
        motionPreset: 'stagger, springSmooth',
        borderRadius: 'rounded-2xl',
        elevation: 'shadow-glow-primary',
        colors: 'background, foreground, primary',
        spacing: 'p-6, gap-8',
        accessibilityNotes: `Structured data and discovery for ${cityName} opportunities.`
      }}
    >
      <BreadcrumbSchema items={breadcrumbs} nonce={nonce} />
      <FAQSchema faqs={faqs} nonce={nonce} />

      <ContextualMapLayout>
        <MapDataSync markers={markers} />
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 w-full">
          {/* City Discovery Hero Banner */}
          <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-surface/90 via-surface/40 to-background pt-8 pb-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Link
                  href="/opportunities"
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Opportunities
                </Link>
                <span className="text-xs text-muted-foreground/60">/</span>
                <span className="text-xs font-semibold text-primary">{cityName}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{cityName} Regional Hub</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    Student Internships & Gigs in {cityName}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
                    Discover verified local and hybrid opportunities in {cityName}. Work directly with campus founders and regional startups.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="px-4 py-2 rounded-xl bg-surface-2 border border-border text-center">
                    <span className="block text-xl font-black text-primary">{total}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Active Listings</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Opportunity Discovery Client */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading {cityName} opportunities...</div>}>
              <OpportunityDiscoveryClient
                gigs={mappedOpportunities}
                hasMore={hasMore}
                page={page}
              />
            </Suspense>
          </div>
        </div>
      </ContextualMapLayout>

      <QualityGate
        componentName={`CityOpportunityDiscovery-${cityName}`}
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
    </DesignNode>
  )
}
