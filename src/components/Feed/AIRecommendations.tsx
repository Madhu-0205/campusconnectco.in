"use client";

import { Sparkles, Briefcase, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

type RecommendationItem = {
    id: string;
    title: string;
    name?: string;
    matchScore: number;
    company?: string;
    skills?: string;
    distance?: number | null;
};

export default function AIRecommendations() {
    const [activeTab, setActiveTab] = useState<'talent' | 'gigs' | 'peers'>('gigs');
    const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true);
            try {
                // Get user location
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;
                    const res = await fetch(`/api/recommendations?type=${activeTab === 'peers' ? 'talent' : activeTab}&lat=${latitude}&lng=${longitude}`);
                    const data = await res.json();
                    setRecommendations(data.map((item: any) => ({
                        id: item.id,
                        title: item.title || item.name,
                        matchScore: item.matchScore || 0,
                        company: item.poster?.name || (activeTab === 'peers' ? "Fellow Student" : "Campus Startup"),
                        skills: item.skills,
                        distance: item.distance
                    })));
                }, async () => {
                    // Fallback without location
                    const res = await fetch(`/api/recommendations?type=${activeTab === 'peers' ? 'talent' : activeTab}`);
                    const data = await res.json();
                    setRecommendations(data.map((item: any) => ({
                        id: item.id,
                        title: item.title || item.name,
                        matchScore: item.matchScore || 0,
                        company: item.poster?.name || (activeTab === 'peers' ? "Fellow Student" : "Campus Startup"),
                        skills: item.skills,
                        distance: item.distance
                    })));
                });
            } catch (err) {
                console.error("Failed to fetch recommendations", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [activeTab]);

    return (
        <div className="glass-card rounded-4xl p-6 mb-6 border border-electric/20 relative overflow-hidden shadow-2xl">
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-electric/20 rounded-full blur-3xl p-10 animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl p-10"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-electric animate-bounce-subtle" size={24} />
                    <h3 className="text-white font-black text-lg tracking-tight">Smart Match <span className="text-electric italic">AI</span></h3>
                </div>
                <span className="px-2.5 py-1 bg-electric/10 text-electric text-[10px] font-black rounded-lg border border-electric/20 shadow-glow">V2.0</span>
            </div>

            <div className="flex bg-slate-900/80 p-1.5 rounded-2xl mb-6 relative z-10 border border-white/5 shadow-inner">
                <button
                    onClick={() => setActiveTab('gigs')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black rounded-xl transition-all duration-300 ${activeTab === 'gigs' ? 'bg-electric text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-gray-500 hover:text-white'}`}
                >
                    <Briefcase size={14} /> GIGS
                </button>
                <button
                    onClick={() => setActiveTab('peers')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black rounded-xl transition-all duration-300 ${activeTab === 'peers' ? 'bg-electric text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-gray-500 hover:text-white'}`}
                >
                    <Users size={14} /> PEERS
                </button>
                <button
                    onClick={() => setActiveTab('talent')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black rounded-xl transition-all duration-300 ${activeTab === 'talent' ? 'bg-electric text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-gray-500 hover:text-white'}`}
                >
                    <User size={14} /> TALENT
                </button>
            </div>

            <div className="space-y-4 relative z-10">
                {loading ? (
                    <div className="py-16 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-electric mb-4"></div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Optimizing Matches...</p>
                    </div>
                ) : recommendations.length === 0 ? (
                    <div className="py-16 text-center text-gray-500 text-xs font-bold bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">No suggestions in your radius.</div>
                ) : (
                    recommendations.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-electric/50 hover:bg-slate-900/60 transition-all duration-300 cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-black text-electric group-hover:bg-electric group-hover:text-white transition-colors">
                                        {item.title[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white group-hover:text-electric transition-colors truncate max-w-[140px] tracking-tight">{item.title}</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter truncate max-w-[140px]">{item.company}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-emerald-400 flex items-center justify-end gap-1">
                                        <Zap size={10} className="fill-emerald-400" /> {item.matchScore}%
                                    </div>
                                    {item.distance && (
                                        <p className="text-[10px] text-gray-400 font-medium">{item.distance.toFixed(1)} km</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                                <div className="flex gap-1">
                                    {(item.skills?.split(',') || []).slice(0, 2).map((s, idx) => (
                                        <span key={idx} className="text-[8px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded-md font-bold uppercase tracking-widest"> {s.trim()} </span>
                                    ))}
                                </div>
                                <div className="flex items-center text-electric text-[10px] font-black gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    CONNECT <ArrowRight size={10} />
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}

import { Users, Zap } from "lucide-react"

