"use client"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { ArrowUpRight, Clock, DollarSign, Search, Sparkles, ArrowRight, Zap } from "lucide-react"
import AIRecommendations from "@/components/Feed/AIRecommendations"
import Link from "next/link"

export default function StudentDashboard() {
    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome back, Alex! 👋</h2>
                    <p className="text-slate-500 font-medium">Here&apos;s what&apos;s happening with your gigs today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Find more gigs..."
                            className="pl-10 pr-4 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm focus:ring-4 focus:ring-blue-500/5 outline-none font-medium text-sm transition-all w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-slate-900 text-white border-none p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <DollarSign size={100} />
                    </div>
                    <div className="relative z-10 flex justify-between items-start mb-8">
                        <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10">
                            <DollarSign size={28} className="text-emerald-400" />
                        </div>
                        <span className="text-[10px] font-black bg-emerald-500 text-white px-3 py-1 rounded-full">+12%</span>
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Earnings</h4>
                        <div className="text-5xl font-black tracking-tighter">₹1,25,000</div>
                    </div>
                </Card>

                <Card className="p-10 rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white group hover:shadow-2xl transition-all duration-500">
                    <div className="flex justify-between items-start mb-8">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl group-hover:scale-110 transition-transform duration-500">
                            <ArrowUpRight size={28} />
                        </div>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Live Status</span>
                    </div>
                    <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Active Gigs</h4>
                    <div className="text-5xl font-black text-slate-900 tracking-tighter">4</div>
                </Card>

                <Card className="p-10 rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white group hover:shadow-2xl transition-all duration-500">
                    <div className="flex justify-between items-start mb-8">
                        <div className="p-4 bg-orange-50 text-orange-600 rounded-3xl group-hover:scale-110 transition-transform duration-500">
                            <Clock size={28} />
                        </div>
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Pending</span>
                    </div>
                    <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">In Progress</h4>
                    <div className="text-5xl font-black text-slate-900 tracking-tighter">2</div>
                </Card>
            </div>

            {/* AI Insights & Recent Gigs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-electric/10 rounded-xl">
                                <Sparkles className="text-electric animate-pulse" size={24} />
                            </div>
                            <h3 className="font-black text-3xl tracking-tight text-slate-900">Recommended for <span className="text-electric italic">You</span></h3>
                        </div>
                        <Link href="/dashboard/student/gigs">
                            <Button variant="ghost" size="sm" className="text-electric font-black hover:bg-electric/10 rounded-xl px-4">Browse All <ArrowRight className="ml-2 h-4 w-4" /></Button>
                        </Link>
                    </div>

                    <div className="grid gap-6">
                        <AIRecommendations />
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-8">
                    <Card className="bg-slate-900 text-white p-8 rounded-[2.5rem] border-none shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Zap size={120} />
                        </div>
                        <h3 className="font-black text-2xl mb-4 relative z-10 leading-tight">Power up your <br /><span className="text-electric italic">Profile</span></h3>
                        <p className="text-slate-400 text-sm mb-8 relative z-10 leading-relaxed font-medium">Add a portfolio link to unlock specialized AI matches and increase trust.</p>
                        <Link href="/profile">
                            <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-extrabold py-6 rounded-[1.25rem] relative z-10 shadow-xl active:scale-95 transition-all">Update Profile</Button>
                        </Link>
                    </Card>

                    <Card className="p-8 rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white flex flex-col items-center text-center">
                        <h4 className="font-black text-slate-900 mb-6 uppercase text-xs tracking-widest">Match Accuracy</h4>
                        <div className="relative w-32 h-32 mb-6">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="364.4" strokeDashoffset="127.5" className="text-electric stroke-cap-round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-black text-slate-900">65%</span>
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile Readiness</p>
                    </Card>
                </div>
            </div>
        </div>
    )
}
