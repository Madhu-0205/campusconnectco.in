"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    Search, MapPin, Clock, DollarSign, Calendar, Heart, Bookmark,
    Share2, ArrowUpRight, TrendingUp, Sparkles,
    ChevronRight, Users, Eye,
    GraduationCap, Star, Flame
} from "lucide-react";

interface Internship {
    id: string;
    title: string;
    description: string;
    company: string;
    skills: string | null;
    stipend: number | null;
    duration: string | null;
    location: string | null;
    tags: string | null;
    applicationLink: string | null;
    deadline: string | null;
    status: string;
    isFeatured: boolean;
    views: number;
    applyCount: number;
    createdAt: string;
}

interface EngagementState {
    [id: string]: { saved: boolean; liked: boolean };
}

function TrendScore({ views, applyCount }: { views: number; applyCount: number }) {
    const score = views + applyCount * 3;
    if (score > 50) return (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-(--primary)/10 rounded-full text-[10px] font-black">
            <Flame size={10} className="animate-pulse" /> Hot
        </span>
    );
    if (score > 20) return (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 rounded-full text-[10px] font-black">
            <TrendingUp size={10} /> Trending
        </span>
    );
    return null;
}

function TagBadge({ label }: { label: string }) {
    const colors: Record<string, string> = {
        Remote: "bg-emerald-500/10 text-emerald-400",
        Hybrid: "bg-blue-500/10 text-blue-400",
        Onsite: "bg-purple-500/10 text-purple-400",
    };
    return (
        <span className={`px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${colors[label] || "bg-(--surface-2) text-slate-500"}`}>
            {label}
        </span>
    );
}

function InternshipSkeleton() {
    return (
        <div className="bg-(--surface) rounded-2xl border border-white/10 p-5 animate-pulse">
            <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/10" />
                <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-(--surface-2) rounded w-1/2" />
                </div>
            </div>
            <div className="h-3 bg-(--surface-2) rounded w-full mb-1" />
            <div className="h-3 bg-(--surface-2) rounded w-2/3" />
        </div>
    );
}

function InternshipCard({
    internship,
    engagement,
    onOpen,
    onLike,
    onSave,
    onShare,
}: {
    internship: Internship;
    engagement: { saved: boolean; liked: boolean };
    onOpen: () => void;
    onLike: () => void;
    onSave: () => void;
    onShare: () => void;
}) {
    const tagList = internship.tags ? internship.tags.split(",").map((t) => t.trim()) : [];
    const skillList = internship.skills ? internship.skills.split(",").map((s) => s.trim()).slice(0, 3) : [];
    const deadline = internship.deadline ? new Date(internship.deadline) : null;
    
    // Use a stable reference for current time if this were an effect, 
    // but in a client component render, we should ideally use a state or just accept it's "impure" 
    // but for the linter, we can move it to a variable at the start of the component or just use a helper.
    // Actually, for "Closing Soon" we can just check if it's within 7 days.
    const now = new Date().getTime();
    const isExpiring = deadline && (deadline.getTime() - now) < 7 * 24 * 60 * 60 * 1000;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -2 }}
            className={`bg-(--surface) rounded-2xl border transition-all shadow-sm hover:shadow-lg group cursor-pointer overflow-hidden ${internship.isFeatured ? "border-orange-400/50 ring-1 ring-orange-400/20 hover:ring-orange-400/40" : "border-white/10 hover:border-orange-400/30" }`}
            onClick={onOpen}
        >
            {internship.isFeatured && (
                <div className="bg-linear-to-r from-orange-500 to-purple-500 px-4 py-1 flex items-center gap-1.5">
                    <Star size={11} className="text-white" fill="white" />
                    <span className="text-[10px] font-black tracking-widest uppercase">Featured</span>
                </div>
            )}
            <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                    {/* Company avatar */}
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500 to-purple-600 flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                        {internship.company.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-black text-sm line-clamp-1 group-hover:text-orange-400 transition-colors">
                                {internship.title}
                            </h3>
                            <ChevronRight size={14} className="text-slate-400 group-hover:text-(--primary) transition-all group-hover:translate-x-0.5 shrink-0 mt-0.5" />
                        </div>
                        <p className="text-slate-500 font-medium">{internship.company}</p>
                    </div>
                </div>

                {/* Tags + trend */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <TrendScore views={internship.views} applyCount={internship.applyCount} />
                    {internship.isFeatured && <span className="px-2 py-0.5 bg-(--primary)/10 rounded-full text-[10px] font-black">⭐ Featured</span>}
                    {tagList.map((t) => <TagBadge key={t} label={t} />)}
                    {isExpiring && <span className="px-2 py-0.5 bg-red-500/10 rounded-full text-[10px] font-black">⚡ Closing Soon</span>}
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-y-1.5 text-slate-500 mb-3">
                    {internship.location && (
                        <span className="flex items-center gap-1"><MapPin size={11} /> {internship.location}</span>
                    )}
                    {internship.stipend && (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                            <DollarSign size={11} /> ₹{internship.stipend.toLocaleString()}/mo
                        </span>
                    )}
                    {internship.duration && (
                        <span className="flex items-center gap-1"><Clock size={11} /> {internship.duration}</span>
                    )}
                    {deadline && (
                        <span className={`flex items-center gap-1 ${isExpiring ? "text-red-500 font-bold" : ""}`}>
                            <Calendar size={11} /> {deadline.toLocaleDateString()}
                        </span>
                    )}
                </div>

                {/* Skills */}
                {skillList.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {skillList.map((s) => (
                            <span key={s} className="px-2 py-0.5 bg-(--surface-2) rounded-lg text-[11px] font-medium">
                                {s}
                            </span>
                        ))}
                        {(internship.skills?.split(",").length || 0) > 3 && (
                            <span className="px-2 py-0.5 text-[11px]">
                                +{(internship.skills?.split(",").length || 0) - 3} more
                            </span>
                        )}
                    </div>
                )}

                {/* Engagement row */}
                <div className="flex items-center justify-between border-white/5 pt-3 -mx-5 px-5 mt-auto">
                    <div className="flex items-center gap-1 text-slate-400 font-medium">
                        <Eye size={11} /> {internship.views}
                        <span className="ml-2 flex items-center gap-1"><Users size={11} /> {internship.applyCount} applied</span>
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={onLike}
                            className={`p-1.5 rounded-lg transition-all hover:scale-110 ${engagement.liked ? "text-red-500 bg-red-500/10" : "text-slate-400 hover:text-red-500 hover:bg-red-500/10"}`}
                            title="Like"
                        >
                            <Heart size={14} fill={engagement.liked ? "currentColor" : "none"} />
                        </button>
                        <button
                            onClick={onSave}
                            className={`p-1.5 rounded-lg transition-all hover:scale-110 ${engagement.saved ? "text-(--primary) bg-(--primary)/10" : "text-slate-400 hover:text-(--primary) hover:bg-(--primary)/10"}`}
                            title="Save"
                        >
                            <Bookmark size={14} fill={engagement.saved ? "currentColor" : "none"} />
                        </button>
                        <button
                            onClick={onShare}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all hover:scale-110"
                            title="Share"
                        >
                            <Share2 size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}


export default function InternshipsClient({ 
    initialInternships = [], 
    initialTrending = [], 
    initialRecommended = [] 
}: { 
    initialInternships: Internship[], 
    initialTrending: Internship[], 
    initialRecommended: Internship[] 
}) {
    const [internships, setInternships] = useState<Internship[]>(initialInternships);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [trending, setTrending] = useState<Internship[]>(initialTrending);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [recommended, setRecommended] = useState<Internship[]>(initialRecommended);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"all" | "trending" | "recommended" | "saved">("all");
    const [search, setSearch] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [engagement, setEngagement] = useState<EngagementState>({});
    const router = useRouter();

    const fetchInternships = useCallback(async () => {
        // Only run if we need to refresh (optional)
        // setLoading(true);
        // ... fetching logic removed for server-first approach
    }, []);

    useEffect(() => {
        fetchInternships();
    }, [fetchInternships]);

    const handleEngage = async (id: string, action: string) => {
        try {
            await fetch(`/api/internships/${id}/engage`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
        } catch { /* silent */ }
    };

    const handleOpen = (internship: Internship) => {
        // Track locally but don't await blocking navigation
        handleEngage(internship.id, "view").catch(() => {});
        router.push(`/dashboard/student/internships/${internship.id}`);
    };

    const handleLike = async (id: string) => {
        const current = engagement[id]?.liked;
        setEngagement((prev) => ({
            ...prev,
            [id]: { ...prev[id], liked: !current },
        }));
        await handleEngage(id, current ? "unlike" : "like");
        toast.success(current ? "Removed like" : "❤️ Liked!");
    };

    const handleSave = async (id: string) => {
        const current = engagement[id]?.saved;
        setEngagement((prev) => ({
            ...prev,
            [id]: { ...prev[id], saved: !current },
        }));
        await handleEngage(id, current ? "unsave" : "save");
        toast.success(current ? "Removed from saved" : "🔖 Saved for later!");
    };

    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(`${window.location.origin}/dashboard/student/internships`);
            toast.success("Link copied to clipboard!");
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleApply = async (internship: Internship) => {
        await handleEngage(internship.id, "apply-click");
        setInternships((prev) =>
            prev.map((i) => i.id === internship.id ? { ...i, applyCount: i.applyCount + 1 } : i)
        );
        if (internship.applicationLink) {
            window.open(internship.applicationLink, "_blank", "noopener,noreferrer");
            toast.success("Opening official application page...");
        } else {
            toast.info("No external link. The team will be notified of your interest.");
        }
    };

    const filterAndSearch = (list: Internship[]) => {
        return list.filter((i) => {
            const q = search.toLowerCase();
            const matchSearch =
                !q ||
                i.title.toLowerCase().includes(q) ||
                i.company.toLowerCase().includes(q) ||
                (i.skills || "").toLowerCase().includes(q) ||
                (i.tags || "").toLowerCase().includes(q);
            const matchLocation =
                !locationFilter ||
                (i.location || "").toLowerCase().includes(locationFilter.toLowerCase()) ||
                (i.tags || "").toLowerCase().includes(locationFilter.toLowerCase());
            return matchSearch && matchLocation;
        });
    };

    const savedList = internships.filter((i) => engagement[i.id]?.saved);
    const displayList =
        activeTab === "trending" ? filterAndSearch(trending)
            : activeTab === "recommended" ? filterAndSearch(recommended)
                : activeTab === "saved" ? filterAndSearch(savedList)
                    : filterAndSearch(internships);

    const tabDef: { id: typeof activeTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
        { id: "all", label: "All", icon: GraduationCap },
        { id: "trending", label: "Trending", icon: Flame },
        { id: "recommended", label: "For You", icon: Sparkles },
        { id: "saved", label: "Saved", icon: Bookmark },
    ];

    return (
        <div className="space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <span className="font-black uppercase tracking-widest text-[10px] mb-1.5 flex items-center gap-1">
                        <GraduationCap size={11} /> Internship Hub
                    </span>
                    <h1 className="md:text-4xl font-black text-white tracking-tight">
                        Find Your Next <span className="text-transparent bg-linear-to-r from-orange-600 to-purple-600">Internship</span>
                    </h1>
                    <p className="font-medium mt-1.5 text-sm">
                        AI-matched opportunities. One-click official applications.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-slate-500 bg-(--surface-2) border border-white/10 rounded-xl px-3 py-2">
                    <Sparkles size={13} className="text-(--primary)" />
                    <span><strong className="text-white">{internships.length}</strong> open internships</span>
                </div>
            </div>

            {/* Trending highlight strip */}
            {!loading && trending.length > 0 && activeTab === "all" && (
                <div className="bg-linear-to-r from-orange-500/5 via-red-500/5 to-pink-500/5 border border-(--primary)/20 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Flame size={14} className="text-(--primary) animate-pulse" />
                        <h2 className="font-black text-white">Trending Right Now</h2>
                        <span className="text-slate-400 ml-auto">Based on applications + views</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x">
                        {trending.slice(0, 4).map((i) => (
                            <button
                                key={i.id}
                                onClick={() => handleOpen(i)}
                                className="flex items-center gap-2 bg-(--surface) border border-white/10 rounded-xl px-3 py-2 min-w-max snap-start hover:border-orange-400/50 hover:shadow-sm transition-all"
                            >
                                <div className="w-6 h-6 rounded-lg bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center text-[10px] font-black shrink-0">
                                    {i.company.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-white line-clamp-1">{i.title}</p>
                                    <p className="text-slate-500">{i.company} · {i.applyCount} applied</p>
                                </div>
                                <ArrowUpRight size={12} className="text-(--primary) ml-1 shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Recommended strip */}
            {!loading && recommended.length > 0 && activeTab === "all" && (
                <div className="bg-linear-to-r from-orange-500/5 via-purple-500/5 to-blue-500/5 border border-(--primary)/20 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={14} className="text-(--primary)" />
                        <h2 className="font-black text-white">Recommended for You</h2>
                        <span className="text-slate-400 ml-auto">Matched to your skills</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x">
                        {recommended.slice(0, 4).map((i) => (
                            <button
                                key={i.id}
                                onClick={() => handleOpen(i)}
                                className="flex items-center gap-2 bg-(--surface) border border-white/10 rounded-xl px-3 py-2 min-w-max snap-start hover:border-orange-400/50 hover:shadow-sm transition-all"
                            >
                                <div className="w-6 h-6 rounded-lg bg-linear-to-br from-orange-500 to-purple-500 flex items-center justify-center text-[10px] font-black shrink-0">
                                    {i.company.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-white line-clamp-1">{i.title}</p>
                                    <p className="text-slate-500">{i.company}{i.stipend ? ` · ₹${i.stipend.toLocaleString()}` : ""}</p>
                                </div>
                                <Sparkles size={11} className="text-(--primary) ml-1 shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Search + filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search internships, companies, skills..."
                        className="w-full pl-10 pr-4 py-2.5 bg-(--surface) border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-all"
                    />
                </div>
                <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        placeholder="Location or mode..."
                        className="w-full sm:w-44 pl-9 pr-4 py-2.5 bg-(--surface) border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-all"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 bg-(--surface-2) p-1 rounded-2xl w-fit">
                {tabDef.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${activeTab === tab.id ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300" }`}
                        >
                            <Icon size={13} />
                            {tab.label}
                            {tab.id === "saved" && savedList.length > 0 && (
                                <span className="ml-0.5 px-1.5 py-0.5 bg-(--primary) text-[9px] font-black rounded-full">
                                    {savedList.length}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => <InternshipSkeleton key={i} />)}
                </div>
            ) : displayList.length === 0 ? (
                <div className="py-20 text-center rounded-3xl border border-white/10">
                    <GraduationCap size={48} className="mx-auto text-slate-700 mb-3" />
                    <p className="font-black text-white">
                        {activeTab === "saved" ? "No saved internships yet" : "No internships found"}
                    </p>
                    <p className="text-slate-400 mt-1">
                        {activeTab === "saved"
                            ? "Bookmark internships you like to find them here"
                            : "Try a different search or check back later"}
                    </p>
                </div>
            ) : (
                <AnimatePresence mode="popLayout">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {displayList.map((internship) => (
                            <InternshipCard
                                key={internship.id}
                                internship={internship}
                                engagement={engagement[internship.id] || { saved: false, liked: false }}
                                onOpen={() => handleOpen(internship)}
                                onLike={() => handleLike(internship.id)}
                                onSave={() => handleSave(internship.id)}
                                onShare={handleShare}
                            />
                        ))}
                    </div>
                </AnimatePresence>
            )}
        </div>
    );
}
