"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Briefcase, Search, Star, TrendingUp, LucideIcon } from "lucide-react"

export default function GetGigPage() {
    const [gigs, setGigs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [query, setQuery] = useState("")

    useEffect(() => {
        loadGigs(1, true)
    }, [query])

    const loadGigs = async (pageNo: number, reset = false) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/gigs?page=${pageNo}&q=${query}`)
            if (!res.ok) {
                console.error("Failed to fetch gigs:", res.status, res.statusText)
                throw new Error(`Failed to fetch gigs: ${res.statusText}`)
            }
            const data = await res.json()

            const safeGigs = Array.isArray(data?.gigs) ? data.gigs : []

            if (reset) {
                setGigs(safeGigs)
                setPage(1)
            } else {
                setGigs((prev) => [...prev, ...safeGigs])
                setPage(pageNo)
            }

            setHasMore(Boolean(data?.hasMore))
        } catch (err) {
            console.error("Failed to load gigs", err)
            setGigs([])
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden transition-colors duration-300">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            <main className="max-w-7xl mx-auto p-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8"
                >
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">Find Your Next <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">Gig</span></h1>
                        <p className="text-slate-600 dark:text-slate-400 font-medium text-lg">
                            AI-matched micro jobs near your location
                        </p>
                    </div>

                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-electric transition-colors" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search gigs..."
                            className="w-full pl-9 pr-3 py-2.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/20 transition-all font-medium placeholder:text-slate-400"
                        />
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    <StatCard icon={Briefcase} label="Available Gigs" value={gigs.length} />
                    <StatCard icon={TrendingUp} label="Avg Budget" value="₹500+" />
                    <StatCard icon={Star} label="Top Rating" value="4.9" />
                    <StatCard icon={Search} label="Matches" value={gigs.length} />
                </div>

                {/* Gigs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gigs.map((gig) => (
                        <GigCard key={gig.id} gig={gig} />
                    ))}

                    {loading && [...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>

                {hasMore && !loading && (
                    <div className="flex justify-center mt-10">
                        <button
                            onClick={() => loadGigs(page + 1)}
                            className="px-8 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}



interface Gig {
    id: string
    title: string
    description: string
    budget: number
    deadline: string | null
    tags?: string
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon, label: string, value: string | number }) {
    return (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-[2rem] shadow-sm p-6 flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300">
            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
            </div>
        </div>
    )
}

function GigCard({ gig }: { gig: Gig }) {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl transition-all p-8 space-y-5 group cursor-pointer"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="font-black text-xl text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-electric transition-colors">{gig.title}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {gig.tags || "General"}
                    </p>
                </div>
                <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 whitespace-nowrap">
                    ₹{gig.budget}
                </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-medium">
                {gig.description}
            </p>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50">
                <span className="text-xs font-bold text-slate-400">
                    Due: {gig.deadline
                        ? new Date(gig.deadline).toLocaleDateString()
                        : "Flexible"}
                </span>

                <button className="px-6 py-2 rounded-xl bg-electric text-white text-sm font-bold shadow-lg shadow-electric/20 hover:bg-blue-600 transition-all active:scale-95">
                    Apply Now
                </button>
            </div>
        </motion.div>
    )
}

function SkeletonCard() {
    return (
        <div className="animate-pulse bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] p-8 space-y-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl my-4" />
            <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800/30">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-24" />
            </div>
        </div>
    )
}
