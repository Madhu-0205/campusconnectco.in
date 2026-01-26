"use client"

import { Card } from "@/components/ui/Card"
import FinancialChart from "@/components/Analytics/FinancialChart"
import MonthlyComparison from "@/components/Analytics/MonthlyComparison"
import { ShieldCheck, TrendingUp, Users, Zap, Briefcase, Activity } from "lucide-react"

export default function FounderDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <span className="w-8 h-1 bg-amber-500 rounded-full" />
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Platform Integrity</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Founder <span className="brand-name italic">Hub</span></h2>
                <p className="text-slate-500 font-medium">Monitoring platform commissions and transaction security.</p>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-8 border-none bg-slate-950 text-white rounded-5xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-120 transition-transform">
                        <Zap size={64} className="text-amber-400" />
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Commissions (7-10%)</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-amber-400">₹</span>
                        <h3 className="text-6xl font-black tracking-tighter text-amber-400">42,850</h3>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-amber-400/80 font-bold">
                        <TrendingUp size={14} /> +12% from last month
                    </div>
                </Card>

                <Card className="p-8 border-slate-100 bg-[#f0f9ff] rounded-5xl shadow-xl group">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Tasks Processed</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-6xl font-black tracking-tighter text-slate-900">1,240</h3>
                        <Briefcase size={24} className="text-electric" />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
                        <Activity size={14} className="text-electric" /> 98% Completion Rate
                    </div>
                </Card>

                <Card className="p-8 border-slate-100 bg-[#fff7ed] rounded-5xl shadow-xl group">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Active Users</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-6xl font-black tracking-tighter text-slate-900">8,500</h3>
                        <Users size={24} className="text-orange-500" />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
                        <ShieldCheck size={14} className="text-orange-500" /> 100% Student Verified
                    </div>
                </Card>
            </div>

            {/* Revenue Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 p-8 rounded-5xl border-slate-100 shadow-xl bg-white">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Commission Feed</h3>
                            <p className="text-slate-500 text-xs font-medium">Real-time revenue generation across all tiers (7-10%)</p>
                        </div>
                        <div className="p-3 bg-amber-500/10 rounded-2xl">
                            <TrendingUp className="text-amber-600" size={24} />
                        </div>
                    </div>
                    <FinancialChart />
                </Card>

                <Card className="p-8 rounded-5xl border-slate-100 shadow-xl bg-white">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Monthly Growth</h3>
                    <MonthlyComparison />
                    <div className="mt-10 p-5 bg-[#f8fafc] rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Revenue Tier Analysis</p>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-600">Tier 1 (10%)</span>
                                <span className="text-xs font-black text-slate-900">45%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full w-[45%]" />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-600">Tier 2 (8.5%)</span>
                                <span className="text-xs font-black text-slate-900">35%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-electric h-full w-[35%]" />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-600">Tier 3 (7%)</span>
                                <span className="text-xs font-black text-slate-900">20%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full w-[20%]" />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
