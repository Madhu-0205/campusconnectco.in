"use client"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { PlusCircle, Users, CheckCircle, Briefcase, ArrowRight, Search, Filter } from "lucide-react"
import Link from "next/link"

export default function ClientDashboard() {
    return (
        <div className="space-y-10 relative z-10">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <h2 className="text-4xl font-black text-foreground tracking-tight">Client Hub</h2>
                    <p className="text-muted-foreground font-medium">Manage your campus gigs and hire top talent.</p>
                </div>
                <Link href="/dashboard/client/post-gig">
                    <Button className="font-black h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-xl shadow-slate-900/10 active:scale-95 transition-all">
                        <PlusCircle className="mr-2 h-5 w-5" /> Post New Gig
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <Card className="p-10 rounded-[2.5rem] border border-white/20 dark:border-slate-800 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl group hover:scale-[1.02] transition-all duration-500">
                    <div className="flex items-center gap-6">
                        <div className="p-5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-3xl group-hover:rotate-6 transition-transform">
                            <Briefcase className="h-10 w-10" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Active Gigs</p>
                            <h3 className="text-5xl font-black text-foreground tracking-tighter">3</h3>
                        </div>
                    </div>
                </Card>

                <Card className="p-10 rounded-[2.5rem] border border-white/20 dark:border-slate-800 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl group hover:scale-[1.02] transition-all duration-500">
                    <div className="flex items-center gap-6">
                        <div className="p-5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-3xl group-hover:rotate-6 transition-transform">
                            <Users className="h-10 w-10" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Applicants</p>
                            <h3 className="text-5xl font-black text-foreground tracking-tighter">12</h3>
                        </div>
                    </div>
                </Card>

                <Card className="p-10 rounded-[2.5rem] border border-white/20 dark:border-slate-800 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl group hover:scale-[1.02] transition-all duration-500">
                    <div className="flex items-center gap-6">
                        <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-3xl group-hover:rotate-6 transition-transform">
                            <CheckCircle className="h-10 w-10" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Completed</p>
                            <h3 className="text-5xl font-black text-foreground tracking-tighter">8</h3>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Active Gigs List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="font-black text-2xl text-foreground tracking-tight">Your Active Gigs</h3>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-muted-foreground font-bold hover:text-foreground rounded-xl"> <Filter size={16} className="mr-2" /> Filter </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground font-bold hover:text-foreground rounded-xl"> <Search size={16} className="mr-2" /> Search </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    {[
                        { title: "React Native Developer for MVP", applications: 5, posted: "2 days ago", budget: "₹15,000" },
                        { title: "Social Media Manager (Campus Launch)", applications: 8, posted: "1 day ago", budget: "₹8,000" },
                        { title: "Technical Content Writer - AI Blog", applications: 3, posted: "5 days ago", budget: "₹5,000" },
                    ].map((gig, i) => (
                        <Card key={i} className="flex flex-col md:flex-row md:items-center justify-between p-10 rounded-[2.5rem] border border-white/20 dark:border-slate-800 shadow-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 group">
                            <div className="flex items-center gap-8 mb-6 md:mb-0">
                                <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center font-black text-xl group-hover:bg-electric group-hover:text-white transition-all duration-500">
                                    {gig.title[0]}
                                </div>
                                <div>
                                    <h4 className="font-black text-2xl text-foreground tracking-tight group-hover:text-electric transition-colors">{gig.title}</h4>
                                    <div className="flex items-center gap-4 mt-2">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{gig.posted}</p>
                                        <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                                        <p className="text-xs font-black text-electric uppercase tracking-widest">{gig.applications} Applicants</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-10 w-full md:w-auto">
                                <div className="text-right">
                                    <p className="text-3xl font-black text-foreground tracking-tighter">{gig.budget}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fixed Budget</p>
                                </div>
                                <Link href="/dashboard/client/applicants">
                                    <Button variant="outline" className="rounded-2xl font-black px-8 py-6 h-auto border-slate-200 dark:border-slate-700 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all active:scale-95 shadow-lg">
                                        Manage <ArrowRight size={16} className="ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
