"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
    Search, Briefcase, Code, Palette, TrendingUp,
    PenLine, BookOpen, Zap, X, SlidersHorizontal
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/Button"

const CATEGORIES = [
    { label: "All", icon: Briefcase, color: "bg-white/5 text-slate-300 border-white/10" },
    { label: "Design", icon: Palette, color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    { label: "Development", icon: Code, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { label: "Marketing", icon: TrendingUp, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    { label: "Writing", icon: PenLine, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    { label: "Research", icon: BookOpen, color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
]

const SORT_OPTIONS = [
    { label: "Best Match", value: "match" },
    { label: "Newest First", value: "newest" },
    { label: "Budget: High to Low", value: "budget_desc" },
    { label: "Budget: Low to High", value: "budget_asc" },
]

export function GigsFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState(searchParams.get("q") || "")
    const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All")
    const [sortBy, setSortBy] = useState("match")
    const [showFilters, setShowFilters] = useState(false)

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (query) params.set("q", query)
        if (activeCategory !== "All") params.set("category", activeCategory)
        router.push(`?${params.toString()}`)
    }

    const handleCategoryChange = (label: string) => {
        setActiveCategory(label)
        const params = new URLSearchParams(searchParams.toString())
        if (label === "All") {
            params.delete("category")
        } else {
            params.set("category", label)
        }
        router.push(`?${params.toString()}`)
    }

    return (
        <>
            {/* ── HERO BANNER ──────────────────────────────────────────── */}
            <div className="relative rounded-3xl overflow-hidden mb-8 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700">
                <div className="absolute inset-0">
                    <div className="absolute top-[-30%] left-[10%] w-64 h-64 bg-(--primary)/20 blur-[60px] rounded-full" />
                    <div className="absolute bottom-[-20%] right-[10%] w-48 h-48 bg-purple-500/15 blur-[60px] rounded-full" />
                </div>
                <div className="relative z-10 p-9 md:p-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 font-black text-white uppercase tracking-widest mb-5">
                        <Zap size={11} className="text-orange-500" /> Opportunity Hub
                    </div>
                    <h1 className="md:text-5xl font-black text-white tracking-tight mb-3">
                        Find Your <span className="text-orange-500">Next Opportunity</span>
                    </h1>
                    <p className="text-base max-w-xl leading-relaxed mb-8">
                        Discover AI-matched gigs tailored to your skills. Build your portfolio, earn real money.
                    </p>

                    {/* Search form */}
                    <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search gigs, skills, or projects..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--primary)/50 backdrop-blur-sm text-sm font-medium"
                            />
                        </div>
                        <Button type="submit" className="h-11 px-5 bg-(--primary) hover:bg-blue-600 text-white rounded-xl font-black shrink-0">
                            Search
                        </Button>
                    </form>
                </div>
            </div>

            {/* ── CATEGORY PILLS ───────────────────────────────────────── */}
            <div className="flex flex-wrap gap-2 mb-5">
                {CATEGORIES.map(({ label, icon: Icon, color }) => (
                    <motion.button
                        key={label}
                        onClick={() => handleCategoryChange(label)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border font-black transition-all ${activeCategory === label ? "bg-(--primary) border-electric text-white shadow-md shadow-(--primary)/20" : color }`}
                    >
                        <Icon size={13} />{label}
                    </motion.button>
                ))}
            </div>

            {/* ── SORT + FILTERS ROW ───────────────────────────────────── */}
            <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 ml-auto">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 font-bold text-slate-400 hover:border-(--primary)/40 transition-all"
                    >
                        <SlidersHorizontal size={13} /> Filters {showFilters && <X size={11} />}
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10">
                        <span className="font-black text-slate-400">Sort:</span>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="font-bold text-white bg-transparent outline-none cursor-pointer"
                        >
                            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* ── ADVANCED FILTER PANEL ────────────────────────────────── */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mb-7"
                    >
                        <div className="bg-[#111116] border border-white/10 rounded-2xl p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="font-black text-slate-500 uppercase tracking-widest block mb-3">Budget Range</label>
                                <div className="flex items-center gap-2 font-bold text-slate-300">
                                    <span className="px-2.5 py-1.5 rounded-lg bg-white/5">₹0</span>
                                    <div className="flex-1 h-1.5 bg-white/10 rounded-full">
                                        <div className="h-full w-3/4 bg-(--primary) rounded-full" />
                                    </div>
                                    <span className="px-2.5 py-1.5 rounded-lg bg-white/5">₹50K+</span>
                                </div>
                            </div>
                            <div>
                                <label className="font-black text-slate-500 uppercase tracking-widest block mb-3">Duration</label>
                                <div className="flex flex-wrap gap-2">
                                    {["< 1 week", "1-2 weeks", "1 month", "Ongoing"].map(d => (
                                        <button key={d} className="px-3 py-1.5 rounded-xl border border-white/10 font-bold text-slate-400 hover:border-(--primary)/40 hover:text-orange-500 transition-all">
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="font-black text-slate-500 uppercase tracking-widest block mb-3">Work Mode</label>
                                <div className="flex flex-wrap gap-2">
                                    {["Remote", "On Campus", "Hybrid"].map(t => (
                                        <button key={t} className="px-3 py-1.5 rounded-xl border border-white/10 font-bold text-slate-400 hover:border-(--primary)/40 hover:text-orange-500 transition-all">
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
