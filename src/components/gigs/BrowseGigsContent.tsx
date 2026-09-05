"use client";
import { motion, AnimatePresence } from"framer-motion";
import {
 Briefcase,
 Search,
 SlidersHorizontal,
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 DollarSign,
 Clock,
 TrendingUp,
 Star,
 X,
 Grid3x3,
 List,
} from"lucide-react";
import Link from"next/link";
import { useRouter, useSearchParams } from"next/navigation";
import React, { useState, useEffect, useCallback } from"react";

import { useMapContext } from"@/components/v2/maps/MapContext";

interface Gig {
 id: string;
 title: string;
 description: string;
 budget: number;
 deadline: Date | null;
 status: string;
 tags: string | null;
 createdAt: Date;
 latitude?: number | null;
 longitude?: number | null;
 _count?: {
 applications: number;
 };
 poster?: {
 name: string | null;
 email: string;
 };
}

interface FilterState {
 category: string[];
 budgetMin: number;
 budgetMax: number;
 location: string;
 sortBy: string;
 status: string;
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string | number }) {
 return (
 <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-accent text-foreground rounded-lg">
 <Icon size={20} className="text-foreground" />
 </div>
 <div>
 <p className="text-muted-foreground font-medium">{label}</p>
 <p className="font-bold text-foreground">{value}</p>
 </div>
 </div>
 </div>
 );
}

function GigCard({ gig, viewMode }: { gig: Gig; viewMode:"grid" |"list" }) {
 const { setHoveredId } = useMapContext();
 if (viewMode ==="list") {
 return (
 <Link href={`/gigs/${gig.id}`}>
 <motion.div
 whileHover={{ scale: 1.01 }}
 onMouseEnter={() => setHoveredId(gig.id)}
 onMouseLeave={() => setHoveredId(null)}
 className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-lg transition-all cursor-pointer"
 >
 <div className="flex items-start justify-between gap-4">
 <div className="flex-1">
 <h3 className="font-bold text-foreground mb-2 hover:text-foreground transition-colors">
 {gig.title}
 </h3>
 <p className="text-muted-foreground line-clamp-2 mb-3">
 {gig.description}
 </p>
 <div className="flex flex-wrap gap-2">
 {gig.tags?.split(",").slice(0, 3).map((tag, idx) => (
 <span
 key={idx}
 className="px-2 py-1 bg-accent text-muted-foreground text-xs font-medium rounded"
 >
 {tag.trim()}
 </span>
 ))}
 </div>
 </div>
 <div className="text-right">
 <p className="font-black text-foreground mb-2">₹{gig.budget.toLocaleString()}</p>
 <p className="text-muted-foreground">
 {gig._count?.applications || 0} applicants
 </p>
 </div>
 </div>
 </motion.div>
 </Link>
 );
 }

 return (
 <Link href={`/gigs/${gig.id}`}>
 <motion.div
 whileHover={{ y: -8, scale: 1.02 }}
 onMouseEnter={() => setHoveredId(gig.id)}
 onMouseLeave={() => setHoveredId(null)}
 transition={{ duration: 0.25 }}
 className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-2xl transition-all cursor-pointer h-full flex flex-col"
 >
 <div className="flex items-start justify-between mb-4">
 <div className="flex-1">
 <h3 className="font-bold text-foreground mb-1 hover:text-foreground transition-colors line-clamp-2">
 {gig.title}
 </h3>
 {gig.tags && (
 <p className="text-muted-foreground font-medium">
 {gig.tags.split(",")[0].trim()}
 </p>
 )}
 </div>
 <span
 className={`px-2 py-1 rounded-lg font-bold ${gig.status ==="OPEN" ?"bg-green-100" :"bg-gray-100 text-gray-700" }`}
 >
 {gig.status}
 </span>
 </div>

 <p className="text-muted-foreground line-clamp-3 mb-4 flex-1">
 {gig.description}
 </p>

 <div className="pt-4 border-border space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground">Budget</span>
 <span className="font-black text-foreground">₹{gig.budget.toLocaleString()}</span>
 </div>
 <div className="flex items-center justify-between text-muted-foreground">
 <span>{gig._count?.applications || 0} applicants</span>
 {gig.deadline && (
 <span>Due: {new Date(gig.deadline).toLocaleDateString()}</span>
 )}
 </div>
 </div>
 </motion.div>
 </Link>
 );
}

function SkeletonCard({ viewMode }: { viewMode:"grid" |"list" }) {
 if (viewMode ==="list") {
 return (
 <div className="animate-pulse bg-card rounded-xl p-6 shadow-sm border border-border">
 <div className="flex items-start justify-between gap-4">
 <div className="flex-1 space-y-3">
 <div className="h-6 bg-accent rounded w-3/4"></div>
 <div className="h-4 bg-accent rounded w-full"></div>
 <div className="h-4 bg-accent rounded w-2/3"></div>
 </div>
 <div className="h-8 w-24 bg-accent rounded"></div>
 </div>
 </div>
 );
 }

 return (
 <div className="animate-pulse bg-card rounded-2xl p-6 shadow-sm border border-border">
 <div className="space-y-4">
 <div className="h-6 bg-accent rounded w-3/4"></div>
 <div className="h-4 bg-accent rounded w-1/2"></div>
 <div className="h-20 bg-accent rounded"></div>
 <div className="flex justify-between pt-4 border-border">
 <div className="h-4 bg-accent rounded w-1/3"></div>
 <div className="h-6 bg-accent rounded w-1/4"></div>
 </div>
 </div>
 </div>
 );
}

export default function BrowseGigsContent() {
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 const router = useRouter();
 const searchParams = useSearchParams();
 const { setMarkers } = useMapContext();

 const [gigs, setGigs] = useState<Gig[]>([]);
 const [loading, setLoading] = useState(true);
 const [newTodayCount, setNewTodayCount] = useState(0);

 useEffect(() => {
 const today = new Date();
 const count = gigs.filter(g => {
 const gigDate = new Date(g.createdAt);
 return gigDate.toDateString() === today.toDateString();
 }).length;
 setNewTodayCount(count);
 
 // Sync to map
 const validMarkers = gigs.filter(g => g.latitude && g.longitude).map(g => ({
 id: g.id,
 type:"gig" as const,
 lat: g.latitude!,
 lng: g.longitude!,
 title: g.title,
 subtitle: g.tags?.split(",")[0] ||""
 }));
 setMarkers(validMarkers);
 }, [gigs, setMarkers]);
 const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ||"");
 const [showFilters, setShowFilters] = useState(false);
 const [viewMode, setViewMode] = useState<"grid" |"list">("grid");
 const [page, setPage] = useState(1);
 const [totalGigs, setTotalGigs] = useState(0);
 const [hasMore, setHasMore] = useState(true);

 const [filters, setFilters] = useState<FilterState>({
 category: [],
 budgetMin: 0,
 budgetMax: 100000,
 location:"",
 sortBy:"newest",
 status:"OPEN",
 });

 const categories = [
"Development",
"Design",
"Marketing",
"Writing",
"Video Editing",
"Data Entry",
"Social Media",
"Photography",
"Consulting",
"Other",
 ];

 const sortOptions = [
 { value:"newest", label:"Newest First" },
 { value:"oldest", label:"Oldest First" },
 { value:"budget-high", label:"Highest Budget" },
 { value:"budget-low", label:"Lowest Budget" },
 { value:"deadline", label:"Deadline Soon" },
 { value:"popular", label:"Most Applications" },
 ];

 const loadGigs = useCallback(async (pageNum: number, reset = false) => {
 setLoading(true);
 try {
 const params = new URLSearchParams();
 params.set("page", pageNum.toString());
 params.set("limit","12");

 if (searchQuery) params.set("q", searchQuery);
 if (filters.category.length > 0) params.set("category", filters.category.join(","));
 if (filters.budgetMin > 0) params.set("budgetMin", filters.budgetMin.toString());
 if (filters.budgetMax < 100000) params.set("budgetMax", filters.budgetMax.toString());
 if (filters.location) params.set("location", filters.location);
 if (filters.sortBy) params.set("sortBy", filters.sortBy);
 if (filters.status) params.set("status", filters.status);

 const response = await fetch(`/api/gigs/browse?${params.toString()}`);

 if (!response.ok) {
 throw new Error("Failed to fetch gigs");
 }

 const data = await response.json();

 if (reset) {
 setGigs(data.gigs || []);
 setPage(1);
 } else {
 setGigs((prev) => [...prev, ...(data.gigs || [])]);
 setPage(pageNum);
 }

 setTotalGigs(data.total || 0);
 setHasMore(data.hasMore || false);
 } catch (error) {
 console.error("Error loading gigs:", error);
 setGigs([]);
 } finally {
 setLoading(false);
 }
 }, [searchQuery, filters]);

 useEffect(() => {
 loadGigs(1, true);
 }, [loadGigs]);

 const handleSearch = (e: React.FormEvent) => {
 e.preventDefault();
 loadGigs(1, true);
 };

 const toggleCategory = (category: string) => {
 setFilters((prev) => ({
 ...prev,
 category: prev.category.includes(category)
 ? prev.category.filter((c) => c !== category)
 : [...prev.category, category],
 }));
 };

 const clearFilters = () => {
 setFilters({
 category: [],
 budgetMin: 0,
 budgetMax: 100000,
 location:"",
 sortBy:"newest",
 status:"OPEN",
 });
 setSearchQuery("");
 };

 const activeFiltersCount =
 filters.category.length +
 (filters.budgetMin > 0 ? 1 : 0) +
 (filters.budgetMax < 100000 ? 1 : 0) +
 (filters.location ? 1 : 0);

 return (
 <div className="min-h-screen bg-background pt-24 pb-12">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 className="mb-8"
 >
 <h1 className="md:text-5xl font-black text-foreground mb-3">
 Browse <span className="text-transparent bg-linear-to-r from-electric to-primary-light">Gigs</span>
 </h1>
 <p className="text-muted-foreground">
 Discover opportunities tailored to your skills
 </p>
 </motion.div>

 {/* Stats Bar */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
 <StatCard icon={Briefcase} label="Total Gigs" value={totalGigs} />
 <StatCard icon={TrendingUp} label="Active" value={gigs.filter(g => g.status ==="OPEN").length} />
 <StatCard icon={Star} label="Avg Budget" value={`₹${Math.round(gigs.reduce((sum, g) => sum + g.budget, 0) / (gigs.length || 1))}`} />
 <StatCard icon={Clock} label="New Today" value={newTodayCount} />
 </div>

 {/* Search and Filter Bar */}
 <div className="bg-card rounded-2xl shadow-lg p-6 mb-8">
 <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
 {/* Search Input */}
 <div className="relative flex-1">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search gigs by title, description, or tags..."
 className="w-full pl-12 pr-4 py-3 bg-accent border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 text-foreground"
 />
 </div>

 {/* Filter Toggle */}
 <button
 type="button"
 onClick={() => setShowFilters(!showFilters)}
 className="flex items-center gap-2 px-6 py-3 bg-accent text-muted-foreground rounded-xl hover:bg-accent hover:bg-accent transition-colors font-medium"
 >
 <SlidersHorizontal size={20} />
 Filters
 {activeFiltersCount > 0 && (
 <span className="ml-1 px-2 py-0.5 bg-foreground text-background text-xs font-bold rounded-full">
 {activeFiltersCount}
 </span>
 )}
 </button>

 {/* Sort Dropdown */}
 <select
 value={filters.sortBy}
 onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
 className="px-4 py-3 bg-accent border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-electric/50 text-foreground font-medium"
 >
 {sortOptions.map((option) => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </select>

 {/* View Mode Toggle */}
 <div className="flex gap-2 bg-accent p-1 rounded-xl">
 <button
 type="button"
 onClick={() => setViewMode("grid")}
 className={`p-2 rounded-lg transition-colors ${viewMode ==="grid" ?"bg-white bg-accent text-foreground shadow-sm" :"text-muted-foreground" }`}
 >
 <Grid3x3 size={20} />
 </button>
 <button
 type="button"
 onClick={() => setViewMode("list")}
 className={`p-2 rounded-lg transition-colors ${viewMode ==="list" ?"bg-white bg-accent text-foreground shadow-sm" :"text-muted-foreground" }`}
 >
 <List size={20} />
 </button>
 </div>

 {/* Search Button */}
 <button
 type="submit"
 className="px-8 py-3 bg-foreground text-background rounded-xl font-bold hover:opacity-90 transition-colors shadow-lg shadow-sm"
 >
 Search
 </button>
 </form>

 {/* Filters Panel */}
 <AnimatePresence>
 {showFilters && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height:"auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.3 }}
 className="mt-6 pt-6 border-border overflow-hidden"
 >
 <div className="grid md:grid-cols-3 gap-6">
 {/* Category Filter */}
 <div>
 <h3 className="font-bold text-foreground mb-3">
 Category
 </h3>
 <div className="space-y-2 max-h-48 overflow-y-auto">
 {categories.map((category) => (
 <label
 key={category}
 className="flex items-center gap-2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
 >
 <input
 type="checkbox"
 checked={filters.category.includes(category)}
 onChange={() => toggleCategory(category)}
 className="rounded border-slate-300 text-foreground focus:ring-electric"
 />
 {category}
 </label>
 ))}
 </div>
 </div>

 {/* Budget Range */}
 <div>
 <h3 className="font-bold text-foreground mb-3">
 Budget Range
 </h3>
 <div className="space-y-3">
 <div>
 <label className="text-muted-foreground mb-1 block">
 Minimum (₹)
 </label>
 <input
 type="number"
 value={filters.budgetMin}
 onChange={(e) =>
 setFilters({ ...filters, budgetMin: Number(e.target.value) })
 }
 className="w-full px-3 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/50 text-foreground"
 min="0"
 />
 </div>
 <div>
 <label className="text-muted-foreground mb-1 block">
 Maximum (₹)
 </label>
 <input
 type="number"
 value={filters.budgetMax}
 onChange={(e) =>
 setFilters({ ...filters, budgetMax: Number(e.target.value) })
 }
 className="w-full px-3 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/50 text-foreground"
 min="0"
 />
 </div>
 </div>
 </div>

 {/* Location & Status */}
 <div className="space-y-4">
 <div>
 <h3 className="font-bold text-foreground mb-3">
 Location
 </h3>
 <input
 type="text"
 value={filters.location}
 onChange={(e) => setFilters({ ...filters, location: e.target.value })}
 placeholder="City or region..."
 className="w-full px-3 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/50 text-foreground"
 />
 </div>
 <div>
 <h3 className="font-bold text-foreground mb-3">
 Status
 </h3>
 <select
 value={filters.status}
 onChange={(e) => setFilters({ ...filters, status: e.target.value })}
 className="w-full px-3 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/50 text-foreground"
 >
 <option value="">All Status</option>
 <option value="OPEN">Open</option>
 <option value="CLOSED">Closed</option>
 </select>
 </div>
 </div>
 </div>

 {/* Clear Filters */}
 {activeFiltersCount > 0 && (
 <button
 onClick={clearFilters}
 className="mt-4 flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 :bg-red-900/20 rounded-lg transition-colors font-medium"
 >
 <X size={16} />
 Clear all filters
 </button>
 )}
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* Results Count */}
 <div className="flex items-center justify-between mb-6">
 <p className="text-muted-foreground">
 Showing <span className="font-bold text-foreground">{gigs.length}</span> of{""}
 <span className="font-bold text-foreground">{totalGigs}</span> gigs
 </p>
 </div>

 {/* Gigs Grid/List */}
 {loading && gigs.length === 0 ? (
 <div className={viewMode ==="grid" ?"grid md:grid-cols-2 lg:grid-cols-3 gap-6" :"space-y-4"}>
 {[...Array(6)].map((_, i) => (
 <SkeletonCard key={i} viewMode={viewMode} />
 ))}
 </div>
 ) : gigs.length === 0 ? (
 <div className="text-center py-20">
 <Briefcase size={64} className="mx-auto text-muted-foreground mb-4" />
 <h3 className="font-bold text-foreground mb-2">No gigs found</h3>
 <p className="text-muted-foreground mb-6">
 Try adjusting your filters or search query
 </p>
 <button
 onClick={clearFilters}
 className="px-6 py-3 bg-foreground text-background rounded-xl font-bold hover:opacity-90 transition-colors"
 >
 Clear Filters
 </button>
 </div>
 ) : (
 <>
 <div className={viewMode ==="grid" ?"grid md:grid-cols-2 lg:grid-cols-3 gap-6" :"space-y-4"}>
 {gigs.map((gig) => (
 <GigCard key={gig.id} gig={gig} viewMode={viewMode} />
 ))}
 </div>

 {/* Load More */}
 {hasMore && !loading && (
 <div className="flex justify-center mt-10">
 <button
 onClick={() => loadGigs(page + 1)}
 className="px-8 py-3 bg-card text-foreground rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
 >
 Load More Gigs
 </button>
 </div>
 )}

 {loading && gigs.length > 0 && (
 <div className="flex justify-center mt-10">
 <div className="animate-spin rounded-full h-8 w-8 border-electric"></div>
 </div>
 )}
 </>
 )}
 </div>
 </div>
 );
}
