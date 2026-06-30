'use client'
import { Filter, X, ChevronRight, Briefcase, Zap, Globe, Clock, IndianRupee } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
 
 
 
 
import { cn } from '@/lib/utils'

export function FilterSidebar({ currentFilters, className }: { currentFilters: Record<string, unknown>, className?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const categories = [
    { id: 'all', label: 'All Fields' },
    { id: 'design', label: 'UI/UX Design' },
    { id: 'development', label: 'Web/App Dev' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'research', label: 'Research' },
    { id: 'content', label: 'Content' },
    { id: 'finance', label: 'Finance' },
  ]

  const modes = [
    { id: 'all', label: 'All Modes' },
    { id: 'remote', label: 'Remote Only' },
    { id: 'hybrid', label: 'Hybrid/Lab' },
    { id: 'on-site', label: 'On-site Office' },
  ]

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || !value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/gigs/find?${params.toString()}`)
  }

  return (
    <aside className={cn("space-y-12 animate-in slide-in-from-left-4 duration-700", className)}>
      
      {/* Category Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
            <Filter size={14} className="text-indigo-400" />
            <h4 className="font-black text-slate-500 uppercase tracking-widest">Industry Filter</h4>
        </div>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleFilterChange('category', cat.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                (currentFilters.category === cat.id || (!currentFilters.category && cat.id === 'all'))
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-600/5 marcador"
                  : "text-slate-500 hover:bg-white/5 border border-transparent"
              )}
            >
              {cat.label}
              {(currentFilters.category === cat.id || (!currentFilters.category && cat.id === 'all')) && <div className="w-1 h-1 rounded-full bg-indigo-500" />}
            </button>
          ))}
        </div>
      </section>

      {/* Budget Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
            <IndianRupee size={14} className="text-emerald-400" />
            <h4 className="font-black text-slate-500 uppercase tracking-widest">Pricing Model</h4>
        </div>
        <div className="px-4 space-y-4">
           <div>
              <p className="font-black text-slate-600 uppercase tracking-wider mb-2">Range Start</p>
              <input 
                type="number" 
                placeholder="₹200"
                value={(currentFilters.budget_min as string) || ''}
                onChange={e => handleFilterChange('budget_min', e.target.value)}
                className="w-full bg-white/2 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-slate-700 font-black"
              />
           </div>
           <div>
              <p className="font-black text-slate-600 uppercase tracking-wider mb-2">Maximum Budget</p>
              <input 
                type="number" 
                placeholder="₹1,00,000+"
                value={(currentFilters.budget_max as string) || ''}
                onChange={e => handleFilterChange('budget_max', e.target.value)}
                className="w-full bg-white/2 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-slate-700 font-black"
              />
           </div>
        </div>
      </section>

      {/* Mode Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
            <Globe size={14} className="text-sky-400" />
            <h4 className="font-black text-slate-500 uppercase tracking-widest">Location Mode</h4>
        </div>
        <div className="space-y-2">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleFilterChange('mode', mode.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                (currentFilters.mode === mode.id || (!currentFilters.mode && mode.id === 'all'))
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-600/5"
                  : "text-slate-500 hover:bg-white/5 border border-transparent"
              )}
            >
              {mode.label}
              {(currentFilters.mode === mode.id || (!currentFilters.mode && mode.id === 'all')) && <ChevronRight size={10} />}
            </button>
          ))}
        </div>
      </section>

      <button
        onClick={() => router.push('/gigs/find')}
        className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all"
      >
        Reset Workspace
      </button>

    </aside>
  )
}
