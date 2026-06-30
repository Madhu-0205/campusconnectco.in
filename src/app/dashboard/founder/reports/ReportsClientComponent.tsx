"use client";

// Force IDE re-parse

import { motion } from "framer-motion";
import {
    BarChart2, Users, Briefcase, FileText, GraduationCap,
    TrendingUp, Download, Calendar, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { useState } from "react";

import { Card } from "@/components/ui/Card"; // Force TS cache update

interface ChartDataPoint {
    month: string;
    users: number;
    gigs: number;
    applications: number;
    revenue: number;
}

interface InternshipStatus {
    status: string;
    count: number;
}

interface Props {
    summary: {
        totalUsers: number;
        totalGigs: number;
        totalApplications: number;
        totalInternships: number;
        totalRevenue: number;
    };
    chartData: ChartDataPoint[];
    internshipBreakdown: InternshipStatus[];
}

type MetricKey = "users" | "gigs" | "applications" | "revenue";

export default function ReportsClient({ summary, chartData, internshipBreakdown }: Props) {
    const [activeMetric, setActiveMetric] = useState<MetricKey>("users");

    type LucideIcon = React.ComponentType<{ size?: number; className?: string }>;
    const metrics: { key: MetricKey; label: string; icon: LucideIcon; color: string; value: string | number }[] = [
        { key: "users", label: "Total Users", icon: Users, color: "text-blue-500 bg-blue-500/10", value: summary.totalUsers.toLocaleString() },
        { key: "gigs", label: "Total Gigs", icon: Briefcase, color: "text-purple-500 bg-purple-500/10", value: summary.totalGigs.toLocaleString() },
        { key: "applications", label: "Applications", icon: FileText, color: "text-orange-500 bg-orange-500/10", value: summary.totalApplications.toLocaleString() },
        { key: "revenue", label: "Platform Revenue", icon: TrendingUp, color: "text-emerald-500 bg-emerald-500/10", value: `₹${summary.totalRevenue.toLocaleString()}` },
    ];

    // Calculate max value for bar scaling
    const maxVal = Math.max(...chartData.map((d) => d[activeMetric] as number), 1);

    const colorMap: Record<MetricKey, string> = {
        users: "bg-blue-500",
        gigs: "bg-purple-500",
        applications: "bg-orange-500",
        revenue: "bg-emerald-500",
    };

    const handleDownload = () => {
        const header = ["Month", "Users", "Gigs", "Applications", "Revenue (₹)"].join(",");
        const rows = chartData.map((d) => [d.month, d.users, d.gigs, d.applications, d.revenue].join(","));
        const csv = [header, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `campusconnect-report-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Trend calc: compare last two months
    const calcTrend = (key: MetricKey) => {
        if (chartData.length < 2) return null;
        const last = chartData[chartData.length - 1][key] as number;
        const prev = chartData[chartData.length - 2][key] as number;
        if (prev === 0) return last > 0 ? 100 : 0;
        return Math.round(((last - prev) / prev) * 100);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        <BarChart2 className="text-orange-500" size={32} />
                        Platform <span className="text-orange-500">Reports</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">6-month performance analytics, growth trends, and activity breakdowns.</p>
                </div>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500/10 border border-orange-500/30 rounded-xl text-sm font-black hover:bg-orange-500/20 transition-colors"
                >
                    <Download size={16} />
                    Export CSV
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m, i) => {
                    const trend = calcTrend(m.key);
                    const Icon = m.icon;
                    return (
                        <motion.button
                            key={m.key}
                            onClick={() => setActiveMetric(m.key)}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`relative text-left p-5 rounded-2xl border transition-all ${activeMetric === m.key ? "border-orange-500/40 shadow-md shadow-orange-500/10" : "border-white/10 bg-[#111116] hover:border-orange-500/30" }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${m.color}`}>
                                <Icon size={18} />
                            </div>
                            <p className="font-black text-slate-500 uppercase tracking-wider mb-1">{m.label}</p>
                            <p className="font-black text-white">{m.value}</p>
                            {trend !== null && (
                                <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                    {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                                    {Math.abs(trend)}% vs last month
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Bar Chart */}
            <Card className="bg-[#111116] rounded-3xl p-6 border border-white/10 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="font-black text-white">
                            6-Month {metrics.find((m) => m.key === activeMetric)?.label} Trend
                        </h2>
                        <p className="text-slate-500 mt-1">Click a KPI card above to switch metric</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                        <Calendar size={13} /> Last 6 months
                    </div>
                </div>

                <div className="flex items-end gap-3 h-52">
                    {chartData.map((d, i) => {
                        const val = d[activeMetric] as number;
                        const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                        return (
                            <div key={d.month} className="flex flex-col items-center gap-2">
                                <div className="relative group w-full flex items-end justify-center" style={{ height: "160px" }}>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${pct}%` }}
                                        transition={{ delay: i * 0.06, type: "spring", stiffness: 120 }}
                                        className={`w-full rounded-t-lg ${colorMap[activeMetric]} opacity-80 group-hover:opacity-100 transition-opacity min-h-[4px]`}
                                    />
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-[10px] font-black px-2 py-1 rounded-lg whitespace-nowrap z-10">
                                        {activeMetric === "revenue" ? `₹${val}` : val}
                                    </div>
                                </div>
                                <span className="font-bold text-slate-400">{d.month}</span>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Bottom row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monthly Table */}
                <Card className="bg-[#111116] rounded-3xl p-6 border border-white/10 shadow-sm">
                    <h2 className="font-black text-white mb-5">Monthly Breakdown</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="font-black uppercase tracking-wider text-slate-400 border-white/5">
                                    <th className="pb-3 text-left">Month</th>
                                    <th className="pb-3 text-right">Users</th>
                                    <th className="pb-3 text-right">Gigs</th>
                                    <th className="pb-3 text-right">Apps</th>
                                    <th className="pb-3 text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {chartData.map((d) => (
                                    <tr key={d.month} className="hover:bg-white/5 transition-colors">
                                        <td className="py-2.5 font-bold text-slate-300">{d.month}</td>
                                        <td className="py-2.5 text-slate-500">{d.users}</td>
                                        <td className="py-2.5 text-slate-500">{d.gigs}</td>
                                        <td className="py-2.5 text-slate-500">{d.applications}</td>
                                        <td className="py-2.5 font-bold text-emerald-400">₹{d.revenue}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Internship Breakdown */}
                <Card className="bg-[#111116] rounded-3xl p-6 border border-white/10 shadow-sm">
                    <h2 className="font-black text-white mb-5 flex items-center gap-2">
                        <GraduationCap size={18} className="text-orange-500" /> Internship Status
                    </h2>
                    <div className="space-y-3">
                        {internshipBreakdown.length === 0 ? (
                            <p className="text-sm">No internship data yet.</p>
                        ) : internshipBreakdown.map((item) => {
                            const total = internshipBreakdown.reduce((s, i) => s + i.count, 0);
                            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                            const color = item.status === "OPEN" ? "bg-emerald-500" :
                                item.status === "CLOSED" ? "bg-red-500" :
                                    item.status === "PENDING_APPROVAL" ? "bg-amber-500" : "bg-slate-400";
                            return (
                                <div key={item.status}>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-slate-400">{item.status.replace(/_/g, " ")}</span>
                                        <span className="text-white">{item.count} ({pct}%)</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ delay: 0.2, type: "spring" }}
                                            className={`h-full rounded-full ${color}`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
}
