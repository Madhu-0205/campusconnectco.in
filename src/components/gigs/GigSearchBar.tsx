'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Search, Zap, Loader2 } from 'lucide-react'

export function GigSearchBar({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(defaultValue || '')
  const [searching, setSearching] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    const params = new URLSearchParams(searchParams.toString())
    if (query.trim()) {
      params.set('q', query.trim())
    } else {
      params.delete('q')
    }
    router.push(`/gigs/find?${params.toString()}`)
    setTimeout(() => setSearching(false), 500)
  }

  return (
    <form onSubmit={handleSearch} className="group relative w-full max-w-2xl animate-in slide-in-from-top-4 duration-700">
      <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full group-hover:bg-indigo-500/15 transition-all opacity-50" />
      <div className="relative flex items-center bg-[#111116]/80 backdrop-blur-3xl border border-white/5 group-hover:border-indigo-500/30 rounded-3xl p-1 shadow-2xl transition-all">
        <Search className="absolute left-6 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by keywords (e.g. Next.js, Figma, Marketing...)"
          className="w-full bg-transparent pl-16 pr-5 py-5 rounded-3xl font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-0"
        />
        <button
          type="submit"
          disabled={searching}
          className="mr-1 bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 py-4 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
        >
          {searching ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} className="fill-white" />}
          Explore
        </button>
      </div>
    </form>
  )
}
