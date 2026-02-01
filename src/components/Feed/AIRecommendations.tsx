"use client";

import { Sparkles, Briefcase, User, Users, ArrowRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

interface RecommendationItem {
    id: string;
    title: string;
    matchScore: number;
    company: string;
    skills: string;
    distance: number | null;
}

interface APIGigItem {
    id: string;
    title?: string;
    name?: string;
    matchScore?: number;
    poster?: {
        name?: string;
    };
    skills?: string;
    distance?: number;
}

export default function AIRecommendations() {
    const [activeTab, setActiveTab] = useState<"talent" | "gigs" | "peers">("gigs");
    const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFallback = useCallback(async (tab: "talent" | "gigs" | "peers") => {
        try {
            const res = await fetch(
                `/api/recommendations?type=${tab === "peers" ? "talent" : tab}`
            );
            if (!res.ok) throw new Error("Fallback API Error");
            const data: APIGigItem[] = await res.json();
            setRecommendations(
                data.map((item) => ({
                    id: item.id || Math.random().toString(),
                    title: item.title || item.name || "Unnamed",
                    matchScore: item.matchScore || 0,
                    company:
                        item.poster?.name ||
                        (tab === "peers" ? "Fellow Student" : "Campus Startup"),
                    skills: item.skills || "",
                    distance: item.distance || null,
                }))
            );
        } catch (error) {
            console.error("Fallback Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true);
            try {
                if (typeof window !== "undefined" && navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            const { latitude, longitude } = position.coords;
                            try {
                                const res = await fetch(
                                    `/api/recommendations?type=${activeTab === "peers" ? "talent" : activeTab}&lat=${latitude}&lng=${longitude}`
                                );
                                if (!res.ok) throw new Error("API Error");
                                const data: APIGigItem[] = await res.json();
                                setRecommendations(
                                    data.map((item) => ({
                                        id: item.id || Math.random().toString(),
                                        title: item.title || item.name || "Unnamed",
                                        matchScore: item.matchScore || 0,
                                        company:
                                            item.poster?.name ||
                                            (activeTab === "peers" ? "Fellow Student" : "Campus Startup"),
                                        skills: item.skills || "",
                                        distance: item.distance || null,
                                    }))
                                );
                            } catch (error) {
                                console.error("Fetch Error:", error);
                                await fetchFallback(activeTab);
                            } finally {
                                setLoading(false);
                            }
                        },
                        async (err) => {
                            console.warn("Geolocation blocked:", err.message);
                            await fetchFallback(activeTab);
                        }
                    );
                } else {
                    await fetchFallback(activeTab);
                }
            } catch (err) {
                console.error("General AI Recommendation Error:", err);
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [activeTab, fetchFallback]);

    return (
        <div className="glass-card rounded-[2.5rem] p-8 mb-6 border border-white/10 relative overflow-hidden shadow-2xl bg-slate-900/60 backdrop-blur-2xl">
            {/* Background Decor */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />

            {/* Header */}
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-xl">
                        <Sparkles className="text-blue-400" size={24} />
                    </div>
                    <h3 className="text-white font-black text-xl tracking-tight">
                        Smart Match <span className="text-blue-400 italic">AI</span>
                    </h3>
                </div>
                <span className="px-3 py-1 text-[10px] bg-white/5 text-white/60 font-black rounded-full border border-white/10 tracking-[0.1em]">
                    SYSTEM V2.0
                </span>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-950/50 p-1.5 rounded-2xl mb-8 relative z-10 border border-white/5 shadow-inner">
                <button
                    onClick={() => setActiveTab("gigs")}
                    suppressHydrationWarning
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black rounded-xl transition-all duration-300 ${activeTab === "gigs" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-white/40 hover:text-white"
                        }`}
                >
                    <Briefcase size={16} /> GIGS
                </button>

                <button
                    onClick={() => setActiveTab("peers")}
                    suppressHydrationWarning
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black rounded-xl transition-all duration-300 ${activeTab === "peers" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-white/40 hover:text-white"
                        }`}
                >
                    <Users size={16} /> PEERS
                </button>

                <button
                    onClick={() => setActiveTab("talent")}
                    suppressHydrationWarning
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black rounded-xl transition-all duration-300 ${activeTab === "talent" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-white/40 hover:text-white"
                        }`}
                >
                    <User size={16} /> TALENT
                </button>
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-[300px]">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center text-center py-20"
                        >
                            <div className="animate-spin h-10 w-10 rounded-full border-t-2 border-blue-500 mb-4" />
                            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">
                                Calibrating Matches…
                            </p>
                        </motion.div>
                    ) : recommendations.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center text-white/20 text-xs font-black uppercase tracking-widest border border-dashed border-white/5 rounded-[2.5rem] py-20"
                        >
                            No suggestions available
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {recommendations.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-white/10 transition-all duration-500 group cursor-pointer"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center text-sm font-black text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                                {item.title ? item.title[0] : "?"}
                                            </div>
                                            <div>
                                                <h4 className="text-base font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight truncate max-w-[150px]">{item.title}</h4>
                                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5 truncate max-w-[150px]">
                                                    {item.company}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="text-xs font-black text-emerald-400 flex items-center gap-1.5 px-2 py-1 bg-emerald-400/10 rounded-lg">
                                                <Zap size={12} className="fill-emerald-400" /> {item.matchScore}%
                                            </div>
                                            {item.distance && (
                                                <span className="text-[10px] text-white/30 font-bold">{item.distance.toFixed(1)} km away</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-5">
                                        <div className="flex gap-2">
                                            {(item.skills ? item.skills.split(",") : [])
                                                .slice(0, 2)
                                                .map((s, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-[9px] px-2 py-1 bg-white/5 text-white/50 rounded-lg font-black uppercase tracking-widest border border-white/5"
                                                    >
                                                        {s.trim()}
                                                    </span>
                                                ))}
                                        </div>
                                        <div className="text-blue-400 text-[10px] font-black flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            SECURE CONNECTION <ArrowRight size={12} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
