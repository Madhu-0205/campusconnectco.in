"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Briefcase, Search, Star, TrendingUp } from "lucide-react"

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
        <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8"
            >
                <div>
                    <h1 className="text-3xl font-bold">Find Your Next Gig</h1>
                    <p className="text-slate-600">
                        AI-matched micro jobs near your location
                    </p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search gigs..."
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        className="px-6 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    )
}

function StatCard({ icon: Icon, label, value }: any) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-xl font-semibold">{value}</p>
            </div>
        </div>
    )
}

function GigCard({ gig }: any) {
    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.015 }}
            transition={{ duration: 0.25 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow p-6 space-y-4"
        >
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-semibold text-lg">{gig.title}</h3>
                    <p className="text-slate-500 text-sm">
                        {gig.tags || "General"}
                    </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-600">
                    ₹{gig.budget}
                </span>
            </div>

            <p className="text-sm text-slate-600 line-clamp-2">
                {gig.description}
            </p>

            <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                    Deadline:{" "}
                    {gig.deadline
                        ? new Date(gig.deadline).toLocaleDateString()
                        : "Flexible"}
                </span>

                <button className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition">
                    Apply
                </button>
            </div>
        </motion.div>
    )
}

function SkeletonCard() {
    return (
        <div className="animate-pulse bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="h-4 bg-slate-200 rounded w-2/3" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="h-12 bg-slate-200 rounded" />
            <div className="flex justify-between">
                <div className="h-3 bg-slate-200 rounded w-1/4" />
                <div className="h-6 bg-slate-200 rounded w-16" />
            </div>
        </div>
    )
}
