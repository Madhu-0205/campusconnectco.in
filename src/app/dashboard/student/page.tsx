import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { ArrowUpRight, Clock, DollarSign, Search } from "lucide-react"

export default function StudentDashboard() {
    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h2 className="text-3xl font-bold text-slate-900">Welcome back, Alex! 👋</h2>
                <p className="text-slate-500">Here&apos;s what&apos;s happening with your gigs today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-linear-to-br from-indigo-500 to-purple-600 text-white border-none">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <DollarSign size={24} />
                        </div>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">₹1,25,000</div>
                    <div className="text-indigo-100 text-sm">Total Earnings</div>
                </Card>

                <Card>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <ArrowUpRight size={24} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">4</div>
                    <div className="text-slate-500 text-sm">Active Applications</div>
                </Card>

                <Card>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <Clock size={24} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">2</div>
                    <div className="text-slate-500 text-sm">Gigs in Progress</div>
                </Card>
            </div>

            {/* AI Insights & Recent Gigs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Sparkles className="text-electric animate-pulse" size={24} />
                            <h3 className="font-black text-2xl tracking-tight text-slate-900">Recommended for <span className="text-electric italic">You</span></h3>
                        </div>
                        <Link href="/dashboard/student/gigs">
                            <Button variant="ghost" size="sm" className="text-electric font-bold hover:bg-electric/10">Browse All <ArrowRight className="ml-2 h-4 w-4" /></Button>
                        </Link>
                    </div>

                    <div className="grid gap-4">
                        <AIRecommendations />
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    <Card className="bg-slate-950 text-white p-6 rounded-4xl border-none shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                            <Zap size={80} />
                        </div>
                        <h3 className="font-black text-xl mb-3 relative z-10">Power up your <br /><span className="brand-name">Profile</span></h3>
                        <p className="text-slate-400 text-sm mb-6 relative z-10 leading-relaxed font-medium">Add a portfolio link to unlock specialized AI matches and increase trust.</p>
                        <Link href="/profile">
                            <Button size="sm" className="w-full bg-white text-slate-900 hover:bg-slate-100 font-black py-4 rounded-xl relative z-10 shadow-lg">Update Profile</Button>
                        </Link>
                    </Card>

                    <Card className="p-6 rounded-4xl border-slate-100 shadow-sm bg-white/50 backdrop-blur-sm">
                        <h4 className="font-bold text-slate-900 mb-2">Smart Match Accuracy</h4>
                        <div className="w-full bg-slate-100 h-2 rounded-full mb-2 overflow-hidden">
                            <div className="bg-electric h-full w-[65%] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Completion: 65%</p>
                    </Card>
                </div>
            </div>
        </div>
    )
}

import AIRecommendations from "@/components/Feed/AIRecommendations"
import Link from "next/link"
import { Sparkles, ArrowRight, Zap } from "lucide-react"

