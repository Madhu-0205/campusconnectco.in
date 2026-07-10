"use client";

import { motion } from "framer-motion";
import {
    BarChart2, Users, TrendingUp, Briefcase, MessageCircle,
    DollarSign, CheckCircle2, Star, Zap, RefreshCw, Crown
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const FinancialChart = dynamic(() => import("@/components/Analytics/FinancialChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-slate-800/50 rounded-xl"></div>
});

interface AnalyticsData {
    growth: { totalUsers: number; newUsers30d: number; growthRate: number };
    opportunities: {
        totalApplications: number;
        recentApplications30d: number;
        totalGigsCompleted: number;
        recentGigCompletions30d: number;
    };
    engagement: { activeConversations: number };
    monetization: { premiumGigs: number; featuredInternships: number; estimatedRevenue: number };
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } }
};
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

 
function StatCard({ icon: Icon, label, value, sub, color, bgColor }: any) {
    return (
        <motion.div variants={cardVariants}
            className="bg-(--surface) border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-all">
            <div className={`absolute top-0 right-0 w-28 h-28 ${bgColor} blur-3xl rounded-full opacity-60`} />
            <div className={`p-2.5 rounded-xl ${bgColor} ${color} w-fit mb-4 relative z-10`}>
                <Icon size={20} />
            </div>
            <p className="font-bold text-slate-500 uppercase tracking-widest mb-1 relative z-10">{label}</p>
            <p className="font-black text-white relative z-10">{value}</p>
            {sub && <p className="text-slate-400 font-medium mt-1.5 relative z-10">{sub}</p>}
        </motion.div>
    );
}

export default function AnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/analytics/platform");
            if (!res.ok) {
                throw new Error(`Analytics API returned ${res.status}`);
            }
            const json = await res.json();
            setData(json);
        } catch (e: unknown) {
            setError((e as Error).message || "Failed to load analytics.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-10 w-64 bg-(--surface-2) rounded-2xl" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-32 bg-(--surface-2) rounded-2xl" />
                    ))}
                </div>
                <div className="h-80 bg-(--surface-2) rounded-2xl" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl mb-4">
                    <BarChart2 size={32} />
                </div>
                <h2 className="font-bold text-white mb-2">Analytics Unavailable</h2>
                <p className="text-sm mb-6 max-w-sm">{error || "Could not load platform data."}</p>
                <button onClick={fetchAnalytics}
                    className="flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl transition-colors text-sm" style={{ background: "var(--color-primary)" }}>
                    <RefreshCw size={14} /> Retry
                </button>
            </div>
        );
    }

    const stats = [
        { icon: Users, label: "Total Students", value: data.growth.totalUsers.toLocaleString(), sub: `+${data.growth.newUsers30d} this month`, color: "text-blue-400", bgColor: "bg-blue-500/10" },
        { icon: TrendingUp, label: "Growth Rate (30d)", value: `${data.growth.growthRate.toFixed(1)}%`, sub: "Monthly new student growth", color: "text-orange-400", bgColor: "bg-(--primary)/10" },
        { icon: Briefcase, label: "Total Applications", value: data.opportunities.totalApplications.toLocaleString(), sub: `+${data.opportunities.recentApplications30d} last 30 days`, color: "text-purple-400", bgColor: "bg-purple-500/10" },
        { icon: CheckCircle2, label: "Gigs Completed", value: data.opportunities.totalGigsCompleted.toLocaleString(), sub: `+${data.opportunities.recentGigCompletions30d} recently`, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
        { icon: MessageCircle, label: "Active Conversations", value: data.engagement.activeConversations.toLocaleString(), sub: "Live student-founder chats", color: "text-teal-400", bgColor: "bg-teal-500/10" },
        { icon: Star, label: "Premium Gigs", value: data.monetization.premiumGigs.toLocaleString(), sub: "Paid featured listings", color: "text-amber-400", bgColor: "bg-(--accent)/10" },
        { icon: Crown, label: "Featured Internships", value: data.monetization.featuredInternships.toLocaleString(), sub: "Premium placement slots", color: "text-orange-400", bgColor: "bg-(--primary)/10" },
        { icon: DollarSign, label: "Est. Revenue", value: `₹${data.monetization.estimatedRevenue.toLocaleString()}`, sub: "From monetization features", color: "text-rose-400", bgColor: "bg-rose-500/10" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--surface-2) border border-white/10 text-xs font-bold uppercase tracking-wider mb-3">
                        <Zap size={12} className="text-orange-400" /> Live Data
                    </div>
                    <h1 className="md:text-4xl font-black text-white tracking-tight flex items-center gap-3" style={{ fontFamily: "var(--font-display)" }}>
                        <BarChart2 style={{ color: "var(--color-primary)" }} size={32} />
                        Platform <span style={{ color: "var(--color-primary)" }}>Analytics</span>
                    </h1>
                    <p className="text-slate-400 font-medium mt-1">Real-time intelligence — student growth, marketplace activity, and revenue metrics.</p>
                </div>
                <button onClick={fetchAnalytics}
                    className="flex items-center gap-2 px-5 py-2.5 bg-(--surface-2) hover:bg-white/10 border border-white/10 font-bold text-sm rounded-xl transition-all self-start md:self-auto">
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <motion.div variants={containerVariants} initial="hidden" animate="show"
                className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s, i) => <StatCard key={i} {...s} />)}
            </motion.div>

            {/* Revenue Chart */}
            <motion.div variants={cardVariants} initial="hidden" animate="show"
                className="bg-(--surface) border border-white/10 rounded-3xl p-4 md:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6 pb-5 border-white/5">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl"><DollarSign size={20} /></div>
                    <div>
                        <h2 className="font-black text-white">Revenue Growth & Escrow Timeline</h2>
                        <p className="font-bold text-slate-500">Historical escrow & platform fee over time</p>
                    </div>
                </div>
                <div className="h-80">
                    <FinancialChart />
                </div>
            </motion.div>

            {/* Monetization Summary */}
            <motion.div variants={cardVariants} initial="hidden" animate="show"
                className="bg-(--surface) border border-white/10 rounded-3xl p-4 md:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-(--accent)/5 blur-3xl rounded-full" />
                <div className="flex items-center gap-3 mb-6 pb-5 border-white/5 relative z-10">
                    <div className="p-2.5 bg-(--accent)/10 text-amber-400 rounded-xl"><Crown size={20} /></div>
                    <div>
                        <h2 className="font-black text-white">Monetization Overview</h2>
                        <p className="font-bold text-slate-500">Premium listings & projected platform earnings</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {[
                        { label: "Basic Listing", desc: "Free — unlimited", value: "Free", tag: "Default", c: "bg-white/20/10 text-slate-400 border-slate-500/20" },
                        { label: "Featured Listing", desc: "Highlighted in search results", value: "₹499/listing", tag: "Popular", c: "bg-(--primary)/10 text-orange-400 border-(--primary)/20" },
                        { label: "Premium Placement", desc: "Homepage & AI SmartMatch boost", value: "₹999/listing", tag: "Best ROI", c: "bg-(--accent)/10 text-amber-400 border-amber-500/20" },
                    ].map((tier, i) => (
                        <div key={i} className={`p-5 rounded-2xl border ${tier.c} flex flex-col gap-3`}>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg w-fit border ${tier.c}`}>{tier.tag}</span>
                            <h3 className="font-bold text-lg">{tier.label}</h3>
                            <p className="text-slate-400">{tier.desc}</p>
                            <p className="font-black text-white mt-auto">{tier.value}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
