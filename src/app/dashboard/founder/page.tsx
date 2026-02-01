"use client"

import { Card } from "@/components/ui/Card"
import FinancialChart from "@/components/Analytics/FinancialChart"
import MonthlyComparison from "@/components/Analytics/MonthlyComparison"
import { ShieldCheck, TrendingUp, Users, Zap, Briefcase, Activity } from "lucide-react"

export default function FounderDashboard() {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-3 px-2">
                <div className="flex items-center gap-3">
                    <span className="w-10 h-1.5 bg-amber-500 rounded-full" />
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Platform Integrity</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Founder <span className="brand-name italic">Hub</span></h2>
                <p className="text-slate-500 font-medium">Monitoring platform commissions and transaction security with precision.</p>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-10 border-none bg-slate-900 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                        <Zap size={120} className="text-amber-400" />
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Total Commissions (7-10%)</p>
                    <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-3xl font-black text-amber-400">₹</span>
                        <h3 className="text-6xl font-black tracking-tighter text-amber-400">42,850</h3>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 rounded-full text-xs font-black text-amber-400">
                        <TrendingUp size={14} /> +12% growth
                    </div>
                </Card>

                <Card className="p-10 rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white group hover:shadow-2xl transition-all duration-500">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Total Tasks Processed</p>
                    <div className="flex items-baseline gap-3 mb-8">
                        <h3 className="text-6xl font-black tracking-tighter text-slate-900">1,240</h3>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <Briefcase size={28} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
                        <Activity size={14} /> 98% Completion Rate
                    </div>
                </Card>

                <Card className="p-10 rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white group hover:shadow-2xl transition-all duration-500">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Active Students</p>
                    <div className="flex items-baseline gap-3 mb-8">
                        <h3 className="text-6xl font-black tracking-tighter text-slate-900">8,500</h3>
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                            <Users size={28} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-orange-500 uppercase tracking-widest">
                        <ShieldCheck size={14} /> 100% Student Verified
                    </div>
                </Card>
            </div>

            {/* Revenue Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <Card className="lg:col-span-2 p-10 rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Commission Feed</h3>
                            <p className="text-slate-500 text-xs font-medium">Real-time revenue generation across all tiers</p>
                        </div>
                        <div className="p-4 bg-amber-500/10 rounded-3xl">
                            <TrendingUp className="text-amber-600" size={28} />
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <FinancialChart />
                    </div>
                </Card>

                <Card className="p-10 rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-10">Monthly Growth</h3>
                    <div className="mb-10">
                        <MonthlyComparison />
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Tier Analysis</p>
                        <div className="space-y-4">
                            {[
                                { label: "Tier 1 (10%)", value: 45, color: "bg-amber-500" },
                                { label: "Tier 2 (8.5%)", value: 35, color: "bg-blue-600" },
                                { label: "Tier 3 (7%)", value: 20, color: "bg-emerald-500" },
                            ].map((tier, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-600">{tier.label}</span>
                                        <span className="text-xs font-black text-slate-900">{tier.value}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                        <div className={`${tier.color} h-full`} style={{ width: `${tier.value}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
