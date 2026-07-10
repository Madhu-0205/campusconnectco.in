"use client";

import { motion } from "framer-motion";
import {
    Briefcase,
    Search,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Eye,
    Clock,
    DollarSign,
    Calendar,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Gig {
    id: string;
    title: string;
    description: string;
    budget: number;
    deadline: Date | null;
    status: string;
    tags: string | null;
    createdAt: Date;
    poster: {
        name: string | null;
        email: string;
    };
    _count: {
        applications: number;
    };
}

export default function GigModerationPage() {
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        closed: 0,
        pending: 0,
    });

    useEffect(() => {
        loadGigs();
    }, []);

    const loadGigs = async () => {
        try {
            const response = await fetch("/api/founder/gigs");
            if (!response.ok) throw new Error("Failed to fetch gigs");

            const data = await response.json();
            setGigs(data.gigs || []);
            setStats(data.stats || { total: 0, open: 0, closed: 0, pending: 0 });
        } catch (error) {
            console.error("Error loading gigs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGigAction = async (gigId: string, action: string) => {
        try {
            const response = await fetch(`/api/founder/gigs/${gigId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });

            if (!response.ok) throw new Error("Failed to perform action");

            // Reload gigs
            loadGigs();
        } catch (error) {
            console.error("Error performing action:", error);
            alert("Failed to perform action");
        }
    };

    const filteredGigs = gigs.filter((gig) => {
        const matchesSearch =
            gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            gig.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            gig.poster.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || gig.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="md:text-4xl font-black text-white mb-2">
                        Gig Moderation
                    </h1>
                    <p className="text-slate-400">
                        Review and moderate all gigs posted on the platform
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={Briefcase}
                        label="Total Gigs"
                        value={stats.total}
                        color="blue"
                    />
                    <StatCard
                        icon={CheckCircle}
                        label="Open"
                        value={stats.open}
                        color="green"
                    />
                    <StatCard
                        icon={XCircle}
                        label="Closed"
                        value={stats.closed}
                        color="red"
                    />
                    <StatCard
                        icon={Clock}
                        label="Pending"
                        value={stats.pending}
                        color="amber"
                    />
                </div>

                {/* Filters */}
                <div className="bg-[#111116] rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                size={20}
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search gigs by title, description, or poster..."
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--primary)/50 text-white"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--primary)/50 text-white"
                        >
                            <option value="all">All Status</option>
                            <option value="OPEN">Open</option>
                            <option value="CLOSED">Closed</option>
                            <option value="PENDING">Pending</option>
                        </select>
                    </div>
                </div>

                {/* Gigs Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-[#111116] rounded-2xl p-6 shadow-sm">
                                <div className="h-6 bg-white/5 rounded mb-3" />
                                <div className="h-4 bg-white/5 rounded mb-2" />
                                <div className="h-4 bg-white/5 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : filteredGigs.length === 0 ? (
                    <div className="text-center py-20">
                        <Briefcase size={64} className="mx-auto text-slate-700 mb-4" />
                        <h3 className="font-bold text-white mb-2">
                            No gigs found
                        </h3>
                        <p className="text-slate-400">
                            Try adjusting your search or filters
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredGigs.map((gig) => (
                            <motion.div
                                key={gig.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#111116] rounded-2xl p-6 shadow-sm border border-white/10 hover:shadow-lg transition-all"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="font-bold text-white line-clamp-2 flex-1">
                                        {gig.title}
                                    </h3>
                                    <span
                                        className={`ml-2 px-2 py-1 rounded-lg font-bold shrink-0 ${gig.status === "OPEN" ? "bg-green-500/20" : gig.status === "CLOSED" ? "bg-red-500/20" : "bg-amber-500/20 text-amber-400" }`}
                                    >
                                        {gig.status}
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-slate-400 line-clamp-3 mb-4">
                                    {gig.description}
                                </p>

                                {/* Info */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <DollarSign size={16} />
                                        <span className="font-semibold text-orange-500">
                                            ₹{gig.budget.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Briefcase size={16} />
                                        <span>{gig._count.applications} applications</span>
                                    </div>
                                    {gig.deadline && (
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Calendar size={16} />
                                            <span>Due: {new Date(gig.deadline).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Poster */}
                                <div className="pt-4 border-white/10 mb-4">
                                    <p className="text-slate-400">Posted by</p>
                                    <p className="font-medium text-white">
                                        {gig.poster.name || gig.poster.email}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Link
                                        href={`/gigs/${gig.id}`}
                                        className="flex-1 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors font-medium text-center flex items-center justify-center gap-2"
                                    >
                                        <Eye size={16} />
                                        View
                                    </Link>
                                    {gig.status === "PENDING" && (
                                        <>
                                            <button
                                                onClick={() => handleGigAction(gig.id, "approve")}
                                                className="flex-1 px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={16} />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to reject this gig?")) {
                                                        handleGigAction(gig.id, "reject");
                                                    }
                                                }}
                                                className="flex-1 px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={16} />
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {gig.status === "OPEN" && (
                                        <button
                                            onClick={() => {
                                                if (confirm("Are you sure you want to flag this gig?")) {
                                                    handleGigAction(gig.id, "flag");
                                                }
                                            }}
                                            className="flex-1 px-4 py-2 bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                        >
                                            <AlertTriangle size={16} />
                                            Flag
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    color,
}: {
     
    icon: any;
    label: string;
    value: number;
    color: string;
}) {
    const colorClasses = {
        blue: "bg-blue-500/10 text-blue-400",
        green: "bg-green-500/10 text-green-400",
        red: "bg-red-500/10 text-red-400",
        amber: "bg-amber-500/10 text-amber-400",
    };

    return (
        <div className="bg-[#111116] rounded-xl p-6 shadow-sm border border-white/10">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <p className="text-slate-400 font-medium">{label}</p>
                    <p className="font-black text-white">{value}</p>
                </div>
            </div>
        </div>
    );
}
