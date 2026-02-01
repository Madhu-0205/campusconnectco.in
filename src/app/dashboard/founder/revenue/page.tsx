"use client"

import { Card } from "@/components/ui/Card"
import FinancialChart from "@/components/Analytics/FinancialChart"
import { TrendingUp, ArrowUpRight, ArrowDownRight, Zap, Target, DollarSign } from "lucide-react"
import { motion } from "framer-motion"

export default function PlatformRevenuePage() {
    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <span className="w-8 h-1 bg-amber-500 rounded-full" />
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Financial Analytics</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Platform <span className="brand-name italic text-amber-600">Revenue</span></h2>
                <p className="text-slate-500 font-medium">Detailed breakdown of commissions and transaction volume across all tiers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Gross Volume", value: "₹4,28,500", change: "+14.2%", icon: DollarSign, color: "text-emerald-500" },
                    { label: "Platform Cut", value: "₹42,850", change: "+12.1%", icon: Zap, color: "text-amber-500" },
                    { label: "Avg Tier Cut", value: "8.5%", change: "0.0%", icon: Target, color: "text-electric" },
                    { label: "Unlocks", value: "1,240", change: "+5.4%", icon: TrendingUp, color: "text-indigo-500" },
                ].map((stat, i) => (
                    <Card key={i} className="p-6 border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl bg-slate-50 ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
                                <ArrowUpRight size={12} /> {stat.change}
                            </span>
                        </div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-950 tracking-tight">{stat.value}</h3>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 p-8 rounded-[2.5rem] border-none bg-white shadow-2xl">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Revenue Stream</h3>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">7-day rolling performance</p>
                        </div>
                        <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-amber-500/20 outline-none">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>Last Quarter</option>
                        </select>
                    </div>
                    <div className="h-[400px]">
                        <FinancialChart />
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="p-8 rounded-[2.5rem] border-none bg-slate-950 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:rotate-12 transition-transform">
                            <Zap size={160} />
                        </div>
                        <h3 className="text-xl font-bold mb-6">Tier Distribution</h3>
                        <div className="space-y-6 relative z-10">
                            {[
                                { tier: "Enterprise (10%)", value: 45, color: "bg-amber-500" },
                                { tier: "Standard (8.5%)", value: 35, color: "bg-electric" },
                                { tier: "Micro (7%)", value: 20, color: "bg-emerald-500" },
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-400">{item.tier}</span>
                                        <span className="text-white">{item.value}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.value}%` }}
                                            className={`h-full ${item.color}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-8 rounded-[2.5rem] border-none bg-white shadow-xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Top Revenue Gigs</h3>
                        <div className="space-y-5">
                            {[
                                { title: "Mobile App Dev", revenue: "₹2,500 cut", company: "Zomato" },
                                { title: "UI Design Kit", revenue: "₹1,200 cut", company: "Razorpay" },
                                { title: "API Backend", revenue: "₹3,100 cut", company: "Swiggy" },
                            ].map((gig, i) => (
                                <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{gig.title}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{gig.company}</p>
                                    </div>
                                    <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">
                                        {gig.revenue}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
