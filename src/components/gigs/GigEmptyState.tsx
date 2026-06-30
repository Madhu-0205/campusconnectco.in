"use client"
import Link from 'next/link'
import { Briefcase, Search, Plus, SlidersHorizontal } from 'lucide-react'

export function GigEmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center animate-in fade-in zoom-in duration-700">
      <div className="relative mb-10 group">
        <div className="absolute inset-0 bg-violet-500/20 blur-[60px] rounded-full group-hover:bg-violet-500/30 transition-all" />
        <div className="relative w-24 h-24 rounded-4xl bg-[#111116] border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-all">
          {hasFilters ? (
            <Search className="w-10 h-10 text-violet-400" />
          ) : (
            <Briefcase className="w-10 h-10 text-violet-400" />
          )}
        </div>
      </div>

      <div className="max-w-md space-y-4">
        <h3 className="font-black text-3xl tracking-tight">
          {hasFilters ? 'No gigs match your filters' : 'No gigs yet'}
        </h3>
        <p className="text-lg font-medium leading-relaxed">
          {hasFilters
            ? 'Try adjusting your filters or broadening your search terms to discover more gigs.'
            : 'Be the first to post a gig in this category. Students are ready to work!'
          }
        </p>
      </div>

      <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
        {hasFilters ? (
          <Link
            href="/gigs/find"
            className="px-8 py-4 bg-violet-600 hover:bg-violet-700 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-violet-600/20 transition-all flex items-center gap-2"
          >
            <SlidersHorizontal size={14} /> Clear filters
          </Link>
        ) : (
          <Link
            href="/post-gig"
            className="px-8 py-4 bg-violet-600 hover:bg-violet-700 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-violet-600/20 transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Post a Gig
          </Link>
        )}

        <Link
          href="/gigs/find"
          className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all inline-flex items-center gap-2"
        >
          <Search size={14} /> Browse all gigs
        </Link>
      </div>
    </div>
  )
}
