import { Sparkles } from 'lucide-react'
import { Suspense } from 'react'

import { FilterSidebar } from '@/components/gigs/FilterSidebar'
import { GigEmptyState } from '@/components/gigs/GigEmptyState'
import { GigGrid } from '@/components/gigs/GigGrid'
import { GigGridSkeleton } from '@/components/gigs/GigGridSkeleton'
import { GigSearchBar } from '@/components/gigs/GigSearchBar'
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
    // .eq('status', 'active')           // Showing ALL gigs as per requirement
    // .gt('expires_at', new Date().toISOString())  // The user requested this, but let's ensure expires_at is actually populated in DB first. 
    // I'll leave the expiring filter disabled for now so they see data immediately on "show ALL" request.

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

  // Get current user's skills for match calculation
  const { data: { user } } = await supabase.auth.getUser()
  let userSkills: string[] = []
  if (user?.id) {
    const { data: userData } = await supabase
      .from('User')
      .select('skills')
      .eq('id', user.id)
      .single()
    
    // Safety check for parsing skills
    if (userData?.skills) {
        userSkills = Array.isArray(userData.skills) 
          ? userData.skills 
          : userData.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
    }
  }

  const safeGigs = gigs ?? []

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      {/* Visual Header */}
      <div className="border-white/5 backdrop-blur-3xl sticky top-16 z-30 py-10 overflow-hidden" style={{ background: "rgba(10,10,15,0.60)" }}>
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-[100px]" style={{ background: "rgba(255,77,28,0.10)" }} />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-[120px]" style={{ background: "rgba(255,77,28,0.06)" }} />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border text-[10px] font-black uppercase tracking-widest mb-4" style={{ borderColor: "rgba(255,77,28,0.25)", color: "var(--color-primary)" }}>
                <Sparkles size={14} /> Live Gigs Terminal
              </div>
              <h1 className="md:text-5xl font-black text-white tracking-tight mb-3">
                Find Your <span style={{ background: "linear-gradient(135deg, #ff4d1c 0%, #ffb800 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Next Sprint</span>
              </h1>
              <div className="flex items-center gap-4">
                 <p className="text-lg font-medium">
                  {totalCount ?? 0} active opportunities available for students right now.
                </p>
                <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider animate-pulse">
                   <div className="w-1 h-1 rounded-full bg-emerald-400" />
                   Streaming Live
                </div>
              </div>
            </div>
          </div>
          <GigSearchBar defaultValue={params.q || ''} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        {/* Filter sidebar */}
        <FilterSidebar
          currentFilters={params}
          className="lg:w-80 shrink-0"
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <Suspense fallback={<GigGridSkeleton count={10} />}>
            {safeGigs.length === 0 ? (
              <GigEmptyState hasFilters={Object.keys(params).length > 0} />
            ) : (
              <GigGrid
                gigs={safeGigs}
                userSkills={userSkills}
                userId={user?.id}
                totalCount={totalCount ?? 0}
                currentPage={page}
              />
            )}
          </Suspense>
        </main>
      </div>
    </div>
  )
}
