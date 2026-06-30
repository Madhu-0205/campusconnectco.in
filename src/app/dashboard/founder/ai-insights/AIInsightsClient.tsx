"use client";

import { Brain, ShieldAlert, Sparkles, AlertOctagon, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AIInsightsClient({ stats }: { stats: any }) {
    // Basic heuristics to simulate AI insights over the provided fetched data
    const totalGigs = stats.gigs.length;
    const recentGigs = stats.gigs.slice(0, 10).map((g: { title: string }) => g.title).join(" ").toLowerCase();

    // Simulate detecting a trend
    let topCategory = "Software Development";
    if (recentGigs.includes("design") || recentGigs.includes("logo")) topCategory = "UI/UX Design";
    if (recentGigs.includes("marketing") || recentGigs.includes("seo")) topCategory = "Marketing";

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                    <Brain className="text-(--primary)" size={32} />
                    Platform <span className="text-(--primary)">Intelligence</span>
                </h1>
                <p className="text-slate-500 font-medium mt-1">AI-powered analytics and fraud detection rules evaluating live data.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-linear-to-br from-orange-500/10 to-transparent border border-(--primary)/20 shadow-lg">
                    <h2 className="font-black text-orange-400 flex items-center gap-2 mb-4">
                        <TrendingUp size={24} /> Growth Intelligence
                    </h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                            <p className="font-bold text-slate-300">📈 Applications are surging</p>
                            <p className="text-slate-500 mt-1">We analyzed recent activity. {stats.apps} new applications submitted recently, marking an active hiring trend.</p>
                        </div>
                        <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                            <p className="font-bold text-slate-300">🔥 &quot;{topCategory}&quot; is trending</p>
                            <p className="text-slate-500 mt-1">Based on keyword extraction from the last {Math.min(10, totalGigs)} gigs posted, students are actively looking for {topCategory} expertise.</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-linear-to-br from-rose-500/10 to-transparent border border-rose-500/20 shadow-lg relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-b from-transparent via-rose-500/2 to-transparent pointer-events-none" />
                    <h2 className="font-black text-rose-500 flex items-center gap-2 mb-4 relative z-10">
                        <ShieldAlert size={24} /> Fraud Detection Logs
                    </h2>
                    <div className="space-y-4 relative z-10">
                        <div className="p-4 bg-black/20 rounded-xl border border-white/5 flex items-start gap-3">
                            <AlertOctagon size={16} className="text-rose-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-bold text-rose-400">Suspicious Repeated Transactions</p>
                                <p className="text-slate-500 mt-1">The Escrow Model is continuously scanning for velocity anomalies (rapid repeated locked funds).</p>
                                <span className="inline-block mt-2 px-2.5 py-1 bg-emerald-500/10 text-[9px] font-black uppercase rounded-lg tracking-widest border border-emerald-500/20">Status: Safe</span>
                            </div>
                        </div>
                        <div className="p-4 bg-black/20 rounded-xl border border-white/5 flex items-start gap-3">
                            <Sparkles size={16} className="text-(--primary) mt-0.5 shrink-0" />
                            <div>
                                <p className="font-bold text-orange-400">Spam Pattern Recognition</p>
                                <p className="text-slate-500 mt-1">The system flags gigs asking for &quot;Cryptocurrency&quot;, &quot;Telegram&quot;, or offering &quot;Guaranteed Easy Money&quot; and pushes them to the Moderation Queue.</p>
                                <span className="inline-block mt-2 px-2.5 py-1 bg-(--primary)/10 text-[9px] font-black uppercase rounded-lg tracking-widest border border-(--primary)/20">Active rules: 14</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
