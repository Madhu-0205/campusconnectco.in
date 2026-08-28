"use client"

import { motion, AnimatePresence } from"framer-motion"
import { Briefcase, Search, Star, Sparkles, MapPin, Clock, Filter, IndianRupee, Activity, Users, Check } from"lucide-react"
import { useRouter } from"next/navigation"
import { useEffect, useState } from"react"

import { Button } from"@/components/ui/Button"

interface Gig {
 id: string
 title: string
 description: string
 budget: number
 deadline: string | null
 tags?: string
 status: string
 poster?: { name: string, image: string }
 _count?: { applications: number }
 createdAt: string
}

interface SmartMatch extends Gig {
 matchPercentage?: number
 matchReason?: string
}

export default function GetGigPage() {
 const router = useRouter()

 // Core State
 const [gigs, setGigs] = useState<Gig[]>([])
 const [smartMatches, setSmartMatches] = useState<SmartMatch[]>([])

 // Filters & Search
 const [query, setQuery] = useState("")
 const [activeCategory, setActiveCategory] = useState("All")
 const [sortOrder, setSortOrder] = useState("relevant")
 const [minBudget, setMinBudget] = useState("")

 // UI State
 const [loading, setLoading] = useState(true)
 const [loadingMatches, setLoadingMatches] = useState(true)
 const [page, setPage] = useState(1)
 const [hasMore, setHasMore] = useState(true)
 const [showFilters, setShowFilters] = useState(false)

 const categories = ["All","Development","Design","Marketing","Writing","Video","Other"]

 // AI Smart Match Fetcher
 const loadSmartMatches = async () => {
 setLoadingMatches(true)
 try {
 const res = await fetch(`/api/recommendations?type=gigs`)
 if (res.ok) {
 const data = await res.json()
 const matches = data
 .filter((gig: Gig & { matchScore?: number }) => (gig.matchScore ?? 0) > 0)
 .map((gig: Gig & { matchScore?: number }) => ({
 ...gig,
 // Use real hybrid score from the recommendations engine (skill overlap + proximity)
 matchPercentage: gig.matchScore ?? null,
 matchReason:"Matches your skill profile and location"
 }))
 setSmartMatches(matches.slice(0, 3)) // top 3 for sidebar
 }
 } catch (err) {
 console.error("Failed to load smart matches", err)
 } finally {
 setLoadingMatches(false)
 }
 }

 // Main Gigs Fetcher
 const loadGigs = async (pageNo: number, reset = false) => {
 setLoading(true)
 try {
 const params = new URLSearchParams()
 if (query) params.set("q", query)
 if (activeCategory !=="All") params.set("category", activeCategory)
 if (minBudget) params.set("minBudget", minBudget)
 if (sortOrder) params.set("sort", sortOrder)
 params.set("page", pageNo.toString())

 const res = await fetch(`/api/gigs?${params.toString()}`)
 if (res.ok) {
 const data = await res.json()
 const safeGigs = Array.isArray(data?.gigs) ? data.gigs : []

 if (reset) {
 setGigs(safeGigs)
 } else {
 setGigs((prev) => [...prev, ...safeGigs])
 }
 setPage(pageNo)
 setHasMore(Boolean(data?.hasMore))
 }
 } catch (err) {
 console.error("Failed to load gigs", err)
 if (reset) setGigs([])
 }
 setLoading(false)
 }

 // Initialization
 useEffect(() => {
 loadSmartMatches()
 }, [])

 // Debounced Search & Filter Trigger
 useEffect(() => {
 const timer = setTimeout(() => {
 loadGigs(1, true)
 }, 300)
 return () => clearTimeout(timer)
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [query, activeCategory, sortOrder, minBudget])

 const handleApply = (gigId: string) => {
 // Mock apply logic or Route to gig details modal
 router.push(`/?gig=${gigId}`)
 }

 return (
 <div className="min-h-screen bg-white/2 text-slate-900 transition-colors duration-300 pb-20">
 {/* Header / Hero Section */}
 <div className="bg-[#111116] border-white/10 pt-8 pb-12 px-6 lg:px-8 relative overflow-hidden">
 <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[150%] bg-electric/5 blur-[100px] rounded-full pointer-events-none" />

 <div className="max-w-7xl mx-auto relative z-10">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
 <div className="max-w-2xl">
 <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
 Find the perfect <span className="text-transparent bg-linear-to-r from-blue-600 to-primary-light">Freelance Gig</span>
 </h1>
 <p className="text-slate-600 font-medium">
 Browse thousands of opportunities or let our AI Smart Match find the best gigs tailored to your skills.
 </p>
 </div>

 {/* Search Bar */}
 <div className="w-full md:w-96 relative group">
 <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-electric transition-colors" size={20} />
 <input
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 placeholder="Search by keyword, skill, or client..."
 className="w-full pl-12 pr-4 py-3.5 bg-white/5 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-electric shadow-sm hover:shadow-md transition-all font-medium text-slate-900"
 />
 </div>
 </div>

 {/* Quick Category Pills */}
 <div className="flex flex-wrap gap-2 items-center">
 <span className="font-bold text-slate-400 mr-2 uppercase tracking-wider">Categories:</span>
 {categories.map(cat => (
 <button
 key={cat}
 onClick={() => setActiveCategory(cat)}
 className={`px-4 py-1.5 rounded-full font-bold transition-all ${activeCategory === cat ?"bg-surface-2 shadow-md scale-105" :"bg-white/5 text-slate-600 border border-white/10 hover:border-slate-300 :border-slate-600" }`}
 >
 {cat}
 </button>
 ))}
 </div>
 </div>
 </div>

 <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col xl:flex-row gap-8">

 {/* Left Column: Main Gigs Listing (Occupies largely) */}
 <div className="flex-1 space-y-6">
 {/* Controls Bar */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111116] p-4 rounded-2xl border border-white/10 shadow-sm">
 <div className="flex items-center gap-2">
 <Briefcase className="text-electric" size={20} />
 <h2 className="font-black text-slate-900">
 {loading && gigs.length === 0 ?"Loading Gigs..." : `${gigs.length}${hasMore ?"+" :""} Gigs Found`}
 </h2>
 </div>

 <div className="flex flex-wrap items-center gap-3">
 {/* Sort */}
 <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
 <span className="font-bold text-slate-500 uppercase">Sort:</span>
 <select
 value={sortOrder}
 onChange={(e) => setSortOrder(e.target.value)}
 className="bg-transparent border-none font-bold text-slate-900 focus:outline-none cursor-pointer p-0"
 >
 <option value="relevant">Most Relevant</option>
 <option value="newest">Newest First</option>
 <option value="budget-high">Budget: High to Low</option>
 <option value="budget-low">Budget: Low to High</option>
 <option value="deadline">Deadline Soonest</option>
 </select>
 </div>

 <button
 onClick={() => setShowFilters(!showFilters)}
 className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors ${showFilters ? 'bg-electric' : 'bg-white/5 hover:bg-slate-200 :bg-slate-700 text-slate-700 border border-white/10'}`}
 >
 <Filter size={16} /> Filters
 </button>
 </div>
 </div>

 {/* Expandable Filters Panel */}
 <AnimatePresence>
 {showFilters && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height:"auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="overflow-hidden"
 >
 <div className="bg-[#111116] p-6 rounded-2xl border border-white/10 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6">
 <div className="space-y-2">
 <label className="font-black uppercase tracking-wider text-slate-500">Min Budget</label>
 <div className="relative">
 <IndianRupee className="absolute left-3 top-2.5 text-slate-400" size={16} />
 <input
 type="number"
 value={minBudget}
 onChange={(e) => setMinBudget(e.target.value)}
 placeholder="e.g. 500"
 className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric shadow-sm font-bold text-slate-900"
 />
 </div>
 </div>
 <div className="space-y-2">
 <label className="font-black uppercase tracking-wider text-slate-500">Duration / Type</label>
 <select className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-electric shadow-sm font-bold text-slate-900">
 <option>All Types</option>
 <option>Fixed Price</option>
 <option>Hourly Rate</option>
 </select>
 </div>
 <div className="flex items-end justify-end">
 <button
 onClick={() => { setMinBudget(""); setActiveCategory("All"); setSortOrder("relevant"); setQuery(""); }}
 className="font-bold text-slate-500 hover:text-slate-900 :text-white transition-colors underline"
 >
 Clear all filters
 </button>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Listings Grid */}
 {loading && gigs.length === 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 {[1, 2, 3, 4, 5, 6].map(i => <GigSkeleton key={i} />)}
 </div>
 ) : gigs.length === 0 ? (
 <div className="text-center py-20 bg-[#111116] rounded-4xl border border-dashed">
 <Search className="h-16 w-16 mx-auto text-slate-300 mb-4" />
 <h3 className="font-black text-slate-900 mb-2">No gigs found</h3>
 <p className="text-slate-500 font-medium max-w-sm mx-auto">Try adjusting your search criteria, clearing filters, or browsing other categories to discover more opportunities.</p>
 <Button
 onClick={() => { setQuery(""); setActiveCategory("All"); setMinBudget(""); }}
 className="mt-6 font-bold"
 >
 Reset Search
 </Button>
 </div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 {gigs.map((gig) => (
 <GigCard key={gig.id} gig={gig} onApply={() => handleApply(gig.id)} />
 ))}
 </div>
 )}

 {hasMore && !loading && gigs.length > 0 && (
 <div className="flex justify-center pt-6">
 <Button
 onClick={() => loadGigs(page + 1)}
 variant="outline"
 className="font-bold border-white/10 hover:border-electric/50 text-slate-700 rounded-xl px-8 h-12"
 >
 Load More Gigs
 </Button>
 </div>
 )}
 </div>

 {/* Right Column: AI Smart Matches Sidebar */}
 <div className="w-full xl:w-80 shrink-0 space-y-6">
 <div className="bg-linear-to-b from-primary to-white border border-primary rounded-3xl p-6 shadow-sm relative overflow-hidden">
 <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
 <Sparkles size={100} />
 </div>

 <div className="flex items-center gap-3 mb-6 relative z-10">
 <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary to-primary-light flex items-center justify-center text-white shadow-lg shadow-primary/20">
 <Sparkles size={20} />
 </div>
 <div>
 <h3 className="font-black text-slate-900">Smart Matches</h3>
 <p className="font-bold uppercase tracking-widest text-primary">Powered by AI</p>
 </div>
 </div>

 <div className="space-y-4 relative z-10">
 {loadingMatches ? (
 <>
 <MatchSkeleton />
 <MatchSkeleton />
 </>
 ) : smartMatches.length === 0 ? (
 <p className="font-medium text-center py-4">
 Update your profile skills to get personalized matches.
 </p>
 ) : (
 smartMatches.map((match) => (
 <motion.div
 key={match.id}
 whileHover={{ y: -2 }}
 className="bg-white border border-white/5 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary :border-primary/50 transition-all cursor-pointer group"
 onClick={() => handleApply(match.id)}
 >
 <div className="flex justify-between items-start mb-2">
 <span className="bg-primary text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1">
 <Activity size={10} /> {match.matchPercentage}% Match
 </span>
 <span className="font-black text-slate-900">
 ₹{match.budget}
 </span>
 </div>
 <h4 className="font-bold text-slate-900 group-hover:text-primary :text-primary transition-colors mb-1 line-clamp-1">
 {match.title}
 </h4>
 <p className="text-slate-500 line-clamp-1 mb-3 font-medium">
 {match.poster?.name ||"Verified Client"} • {match.tags ||"General"}
 </p>

 <div className="font-bold text-slate-400 bg-white/2 p-2 rounded-lg italic">
 &quot;{match.matchReason}&quot;
 </div>
 </motion.div>
 ))
 )}
 </div>

 <Button
 variant="default"
 className="w-full mt-6 bg-surface-2 text-white font-bold rounded-xl"
 onClick={loadSmartMatches}
 disabled={loadingMatches}
 >
 {loadingMatches ?"Analyzing..." :"Refresh Matches"}
 </Button>
 </div>

 {/* Trust Banner */}
 <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 flex items-start gap-4">
 <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
 <Check size={16} strokeWidth={3} />
 </div>
 <div>
 <h4 className="font-bold text-sm">Secure Escrow Payments</h4>
 <p className="font-medium text-emerald-700/80 mt-1 leading-relaxed">
 CampusConnect holds payments in escrow until work is approved. You&apos;re guaranteed to get paid for authorized milestones.
 </p>
 </div>
 </div>
 </div>

 </main>
 </div>
 )
}

function GigCard({ gig, onApply }: { gig: Gig, onApply: () => void }) {
 const [isNew, setIsNew] = useState(false);

 useEffect(() => {
 setIsNew(new Date(gig.createdAt).getTime() > Date.now() - 48 * 3600 * 1000);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const isPopular = (gig._count?.applications || 0) > 5;

 return (
 <div className="bg-[#111116] border border-white/10 rounded-3xl p-6 flex flex-col h-full hover:shadow-lg hover:border-electric/30 transition-all group">
 <div className="flex justify-between items-start gap-4 mb-3">
 <div className="flex flex-wrap items-center gap-2">
 <span className="font-black uppercase tracking-widest text-slate-400 border border-white/10 px-2.5 py-1 rounded-md">
 {gig.tags ||"General"}
 </span>
 {isNew && (
 <span className="bg-blue-100 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1">
 <span role="img" aria-label="new">🔥</span> New
 </span>
 )}
 {isPopular && !isNew && (
 <span className="bg-amber-100 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1">
 <span role="img" aria-label="popular">📈</span> Popular
 </span>
 )}
 </div>
 <div className="flex flex-col items-end">
 <span className="font-black text-slate-900 tracking-tight">
 ₹{gig.budget.toLocaleString()}
 </span>
 <span className="font-bold text-slate-400 uppercase tracking-widest">Fixed Price</span>
 </div>
 </div>

 <h3 className="font-black text-slate-900 mb-2 leading-tight group-hover:text-electric transition-colors line-clamp-2">
 {gig.title}
 </h3>

 <p className="font-medium text-slate-500 line-clamp-2 mb-5 flex-1">
 {gig.description}
 </p>

 <div className="flex flex-wrap items-center gap-4 font-bold text-slate-500 mb-6 bg-white/5/50 p-3 rounded-xl">
 <div className="flex items-center gap-1.5">
 <MapPin size={14} className="text-slate-400" />
 <span>Remote / Campus</span>
 </div>
 <div className="flex items-center gap-1.5">
 <Clock size={14} className="text-slate-400" />
 <span>{gig.deadline ? new Date(gig.deadline).toLocaleDateString() : 'Flexible'}</span>
 </div>
 <div className="flex items-center gap-1.5">
 <Users size={14} className="text-slate-400" />
 <span>{gig._count?.applications || 0} applicants</span>
 </div>
 </div>

 <div className="flex items-center gap-3 pt-4 border-white/5 mt-auto">
 <Button
 onClick={onApply}
 className="flex-1 rounded-xl bg-electric hover:bg-blue-600 text-white font-black shadow-lg shadow-electric/20 transition-all hover:-translate-y-0.5"
 >
 Apply Now
 </Button>
 <button className="h-10 w-10 shrink-0 rounded-xl bg-white/5 hover:bg-slate-200 :bg-slate-700 flex items-center justify-center text-slate-500 border border-white/10 transition-colors">
 <Star size={18} />
 </button>
 </div>
 </div>
 )
}

function GigSkeleton() {
 return (
 <div className="bg-[#111116] border border-white/5 rounded-3xl p-6 h-full space-y-4">
 <div className="flex justify-between">
 <div className="h-6 w-20 rounded-md bg-white/5 animate-pulse" />
 <div className="h-6 w-24 rounded-md bg-white/5 animate-pulse" />
 </div>
 <div className="h-6 w-3/4 rounded-md bg-white/5 animate-pulse" />
 <div className="h-4 w-full rounded-md bg-white/5 animate-pulse" />
 <div className="h-4 w-2/3 rounded-md bg-white/5 animate-pulse" />
 <div className="pt-4 mt-auto">
 <div className="h-10 w-full rounded-xl bg-white/5 animate-pulse" />
 </div>
 </div>
 )
}

function MatchSkeleton() {
 return (
 <div className="bg-white/50 border border-white/5 rounded-2xl p-4 space-y-3">
 <div className="flex justify-between">
 <div className="h-4 w-16 bg-white/5 animate-pulse rounded" />
 <div className="h-4 w-12 bg-white/5 animate-pulse rounded" />
 </div>
 <div className="h-5 w-full bg-white/5 animate-pulse rounded" />
 <div className="h-8 w-full rounded-lg bg-white/5 animate-pulse" />
 </div>
 )
}
