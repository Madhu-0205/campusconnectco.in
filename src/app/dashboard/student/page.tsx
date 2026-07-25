import {
    Sparkles, ArrowRight,
    CircleDot, Activity, CheckCircle2, Trophy, TrendingUp,
    Star, Zap, Brain, Briefcase, Users, MessageCircle, Map as TargetIcon,
    Rocket, FileText, Gift, Crown
} from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

import { AIPersonalizedFeed } from "@/components/ai/AIPersonalizedFeed"
import { TrendingSidebar } from "@/components/ai/TrendingSidebar"
import { RecommendationCard } from "@/components/dashboard/RecommendationCard"
import { CareerRoadmapTracker } from "@/components/dashboard/CareerRoadmapTracker"
import { AIInsightsPanel } from "@/components/dashboard/AIInsightsPanel"
import { getPersonalizedRecommendations, CareerRoadmapGenerator, AIInsightsGenerator } from "@/lib/recommendation-engine"
import { GamificationDashboard } from "@/components/gamification/GamificationDashboard"
import { ReferralTracker } from "@/components/growth/ReferralTracker"
import { ReputationLedgerCard } from "@/components/profile/ReputationLedgerCard"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { protectPage } from "@/lib/auth-checks"
import prisma from "@/lib/prisma"

export default async function StudentDashboard() {
    const { authorized, user } = await protectPage(["STUDENT", "FOUNDER"]) // Founder can view student dashboard for testing
    if (!authorized) {
        redirect("/auth/sign-in")
    }

    let dbUser = null;
    let recentApps: any[] = [];
    let earningsAgg: any = null;
    let completedGigsCount = 0;
    let unreadMessagesCount = 0;
    let activeProjects: any[] = [];
    let pendingPaymentsAgg: any = null;
    let trendingInternships: any[] = [];
    let dbError = false;

    try {
        dbUser = await prisma.user.findUnique({
            where: { id: user?.id },
            include: { userSkills: { include: { skill: true } } }
        });

        const [rApps, earn, completedGigs, unreadMsgs, activeProjs, pendingPay] = await Promise.all([
            prisma.application.findMany({
                where: { applicantId: user?.id },
                include: { gig: true },
                take: 4,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.transaction.aggregate({
                where: { sellerId: user?.id, status: "RELEASED" },
                _sum: { sellerPayout: true }
            }),
            prisma.application.count({ where: { applicantId: user?.id, status: "ACCEPTED", gig: { status: "COMPLETED" } } }),
            prisma.message.count({ where: { conversation: { OR: [{ participant_1: user?.id }, { participant_2: user?.id }] }, sender_id: { not: user?.id }, read_at: null } }),
            prisma.application.findMany({
                where: { applicantId: user?.id, status: "ACCEPTED", gig: { status: { not: "COMPLETED" } } },
                include: { gig: true },
                take: 3,
                orderBy: { updatedAt: 'desc' }
            }),
            prisma.escrow.aggregate({
                where: { workerId: user?.id, status: "LOCKED" },
                _sum: { amount: true }
            })
        ]);

        recentApps = rApps;
        earningsAgg = earn;
        completedGigsCount = completedGigs;
        unreadMessagesCount = unreadMsgs;
        activeProjects = activeProjs;
        pendingPaymentsAgg = pendingPay;

        trendingInternships = await prisma.internship.findMany({
            where: { status: "OPEN" },
            orderBy: [{ applyCount: "desc" }, { views: "desc" }],
            take: 3,
            select: {
                id: true,
                title: true,
                company: true,
                stipend: true,
                tags: true,
                applyCount: true,
                views: true
            }
        });
    } catch (error) {
        console.error("[STUDENT_DASHBOARD_DB_ERROR]:", error);
        dbError = true;
    }

    // Recommendation Engine Integration
    let profileGraph = null;
    let recommendations: any[] = [];
    let roadmap = null;
    let insights: any[] = [];
    try {
        const aiData = await getPersonalizedRecommendations(user!.id);
        profileGraph = aiData.profileGraph;
        recommendations = aiData.recommendations;

        if (profileGraph) {
            roadmap = new CareerRoadmapGenerator().generateRoadmap(profileGraph);
            insights = new AIInsightsGenerator().generateInsights(profileGraph);
        }
    } catch (e) {
        console.error("[AI_ENGINE_ERROR]:", e);
    }

    const earnings = Number(earningsAgg?._sum?.sellerPayout || 0);
    const pendingPayments = Number(pendingPaymentsAgg?._sum?.amount || 0);
    const userName = dbUser?.name?.split(" ")[0] || "Student";

    // Profile completeness
    const fields = [dbUser?.bio, dbUser?.portfolio, dbUser?.linkedin, dbUser?.userSkills?.length, dbUser?.image];
    const profileCompleteness = Math.round((fields.filter(Boolean).length / fields.length) * 100);

    // 4-D Reputation Scores
    const reliabilityScore = Math.min(100, Math.max(75, 95 + (completedGigsCount * 2) - (activeProjects.length > 3 ? 5 : 0)));
    const executionScore = Math.min(100, Math.max(10, completedGigsCount * 15 + Math.min(40, Math.floor(earnings / 3000))));
    const learningScore = Math.min(100, Math.max(10, (dbUser?.userSkills?.length || 0) * 8 + Math.floor(profileCompleteness / 2)));
    const communityScore = Math.min(100, Math.max(10, 45 + (dbUser?.linkedin ? 15 : 0) + (dbUser?.github ? 15 : 0) + completedGigsCount * 4));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 pb-24 space-y-10 animate-in fade-in duration-700 relative text-slate-100">
            <ReferralTracker />
            
            {dbError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 relative z-20">
                    <div>
                        <h3 className="font-bold text-base">Database Connection Offline</h3>
                        <p className="text-sm text-red-300/80 mt-1">Some dashboard features are currently unavailable. We are automatically retrying to restore services.</p>
                    </div>
                    <Link href="/dashboard/student">
                        <Button variant="outline" className="border-red-500/20 text-red-200 hover:bg-red-500/10 rounded-xl font-bold bg-transparent">
                            Refresh Page
                        </Button>
                    </Link>
                </div>
            )}
            
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-500/10 blur-[120px] rounded-full" />
                <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full" />
            </div>

            {/* ── HEADER / WELCOME PANEL */}
            <div className="relative overflow-hidden rounded-4xl bg-(--surface) border border-(--border) p-4 md:p-12 shadow-2xl">
                {/* Glow & Grid inside card */}
                <div className="absolute inset-0 bg-linear-to-r from-violet-600/5 to-cyan-600/5" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 blur-[100px] rounded-full" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-(--border) text-xs font-bold uppercase tracking-wider mb-5">
                            <Brain size={14} className="text-violet-400" /> AI Career Dashboard
                        </div>
                        <h1 className="md:text-5xl font-black text-white tracking-tight leading-tight mb-3" style={{ fontFamily: "var(--font-display)" }}>
                            Welcome back, <br/>
                            <span className="text-transparent bg-linear-to-r from-violet-400 to-cyan-400">{userName}</span>
                        </h1>
                        <p className="font-medium text-lg max-w-xl leading-relaxed">Let&apos;s build your portfolio today. Your AI agent has found new opportunities based on your skills.</p>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
                        <Link href="/dashboard/student/profile">
                            <Button className="rounded-2xl h-12 px-6 font-bold bg-white/10 hover:bg-white/20 text-white border border-(--border) backdrop-blur-md transition-all active:scale-95">
                                Refine AI Profile
                            </Button>
                        </Link>
                        <Link href="/dashboard/student/gigs">
                            <Button className="rounded-2xl h-12 px-6 font-bold bg-(--primary) hover:bg-(--primary-light) text-white shadow-lg transition-all active:scale-95" style={{ boxShadow: "0 0 28px rgba(124,58,237,0.35)" }}>
                                Explore Open Gigs
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── METRICS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: "Active Projects", value: activeProjects.length, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", glow: "group-hover:bg-emerald-500/20" },
                    { label: "Unread Messages", value: unreadMessagesCount, icon: MessageCircle, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", glow: "group-hover:bg-violet-500/20", badge: unreadMessagesCount > 0 ? "New" : null },
                    { label: "Pending Analytics", value: `₹${pendingPayments.toLocaleString()}`, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", glow: "group-hover:bg-purple-500/20", badge: pendingPayments > 0 ? "Escrow" : null },
                    { label: "Total Earnings", value: `₹${earnings.toLocaleString()}`, icon: Trophy, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", glow: "group-hover:bg-emerald-500/20" },
                ].map(({ label, value, icon: Icon, color, bg, glow, badge }) => (
                    <Card key={label} className={`p-6 rounded-3xl border border-(--border-subtle) bg-(--surface) shadow-xl hover:border-(--primary-light) transition-all group relative overflow-hidden`}>
                        <div className={`absolute -right-10 -top-10 w-32 h-32 blur-[50px] rounded-full transition-all duration-500 ${bg} ${glow}`} />
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className={`p-3 rounded-2xl ${bg}`}><Icon size={20} className={color}/></div>
                            {badge && <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${bg} ${color}`}><CircleDot size={8} className="animate-pulse" />{badge}</span>}
                        </div>
                        <h3 className="font-black text-white mb-1 relative z-10 tracking-tight">{value}</h3>
                        <p className="font-semibold text-slate-500 uppercase tracking-widest relative z-10">{label}</p>
                    </Card>
                ))}
            </div>

            {/* ── AI CAREER TOOLS NAVIGATION */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { title: "Internship Explorer", icon: Briefcase, href: "/dashboard/student/internships", gradient: "from-blue-600 to-violet-600" },
                    { title: "Gig Marketplace", icon: Users, href: "/dashboard/student/gigs", gradient: "from-purple-600 to-pink-600" },
                    { title: "AI Skill Builder", icon: Zap, href: "/dashboard/student/smartmatch", gradient: "from-emerald-500 to-teal-500" },
                    { title: "Resume Builder", icon: FileText, href: "/dashboard/student/profile", gradient: "from-violet-500 to-red-500" },
                    { title: "Leaderboard", icon: Trophy, href: "/leaderboard", gradient: "from-amber-500 to-orange-500" },
                    { title: "Career Roadmap", icon: TargetIcon, href: "/dashboard/student/skill-gap", gradient: "from-sky-500 to-blue-600" },
                    { title: "Interview Sim", icon: Brain, href: "/dashboard/student/interview-simulator", gradient: "from-rose-500 to-pink-600" },
                    { title: "AI Copilot", icon: Sparkles, href: "/dashboard/student/smartmatch", gradient: "from-indigo-500 to-violet-600" },
                    { title: "Refer & Earn", icon: Gift, href: "/refer", gradient: "from-pink-500 to-rose-500" },
                    { title: "Campus Captain", icon: Crown, href: "/ambassador", gradient: "from-violet-600 to-indigo-600" },
                ].map((tool, i) => (
                    <Link key={i} href={tool.href}>
                        <div className="bg-(--surface) border border-(--border) hover:border-(--primary-light) rounded-2xl p-4 flex items-center gap-4 transition-all group overflow-hidden relative cursor-pointer h-20 shadow-lg">
                            <div className={`absolute inset-0 bg-linear-to-r ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                            <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br ${tool.gradient} text-white shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                                <tool.icon size={20} />
                            </div>
                            <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{tool.title}</span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* ── GAMIFICATION ENGINE */}
            <section className="bg-(--surface) border border-(--border) rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 blur-[150px] rounded-full pointer-events-none" style={{ background: "rgba(124,58,237,0.06)" }} />
                <div className="relative z-10">
                    <GamificationDashboard />
                </div>
            </section>

            {/* ── MAIN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                {/* LEFT COLUMN: Feed & Opportunities */}
                <div className="lg:col-span-2 space-y-8">

                    {/* AI Career Insights */}
                    {insights.length > 0 && (
                        <AIInsightsPanel insights={insights} />
                    )}

                    {/* AI Opportunities Feed - Explainable AI */}
                    <section className="bg-(--surface) border border-(--border) rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-violet-500/5 blur-[100px] rounded-full pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                                <h2 className="font-black text-white flex items-center gap-3" style={{ fontFamily: "var(--font-display)" }}>
                                    Recommended For You <Sparkles size={20} className="text-violet-400" />
                                </h2>
                                <p className="text-slate-400 mt-1">Opportunities matched to your skills, goals, and behavior.</p>
                            </div>
                            <Link href="/dashboard/student/smartmatch">
                                <Button variant="outline" className="hidden sm:flex rounded-xl font-bold border-(--border) text-white hover:bg-white/5">
                                    Tune AI Model
                                </Button>
                            </Link>
                        </div>
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recommendations.length > 0 ? (
                                recommendations.map(rec => (
                                    <RecommendationCard key={rec.opportunity.id} recommendation={rec} />
                                ))
                            ) : (
                                <AIPersonalizedFeed />
                            )}
                        </div>
                    </section>

                    {/* Trending Startup Internships */}
                    {trendingInternships.length > 0 && (
                        <section className="bg-(--surface) border border-(--border) rounded-3xl p-6 md:p-8 shadow-2xl">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="font-black text-white flex items-center gap-3" style={{ fontFamily: "var(--font-display)" }}>
                                        <Rocket size={20} className="text-cyan-400" /> Hot Startups Hiring
                                    </h2>
                                    <p className="text-slate-400 mt-1">High-growth internships trending on campus.</p>
                                </div>
                                <Link href="/dashboard/student/internships?tab=trending" className="font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1">
                                    View all <ArrowRight size={14} />
                                </Link>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {trendingInternships.map((i: any) => {
                                    const tagList = i.tags ? i.tags.split(",").map((t: string) => t.trim()) : [];
                                    return (
                                        <Link key={i.id} href={`/dashboard/student/internships/${i.id}`}>
                                            <div className="group h-full flex flex-col justify-between p-5 rounded-2xl border border-(--border-subtle) bg-(--surface-2) hover:bg-white/5 hover:border-(--primary-light) hover:shadow-xl transition-all cursor-pointer">
                                                <div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-violet-500 to-rose-500 flex items-center justify-center font-black text-lg shadow-inner">
                                                            {i.company.charAt(0)}
                                                        </div>
                                                        <div className="px-2 py-1 rounded bg-violet-500/10 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                            <Users size={10} /> {i.applyCount}
                                                        </div>
                                                    </div>
                                                    <h3 className="font-bold text-base mb-1 group-hover:text-violet-400 transition-colors">{i.title}</h3>
                                                    <p className="text-slate-400 font-medium mb-4">{i.company}</p>
                                                </div>
                                                <div>
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {tagList.slice(0, 2).map((t: string) => (
                                                            <span key={t} className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-bold">{t}</span>
                                                        ))}
                                                    </div>
                                                    {i.stipend ? 
                                                        <p className="font-black text-emerald-400">₹{i.stipend.toLocaleString()}/mo</p> : 
                                                        <p className="font-black text-slate-500">Unpaid / Equity</p>
                                                    }
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* AI Career Roadmap */}
                    {roadmap && (
                        <CareerRoadmapTracker roadmap={roadmap} />
                    )}

                    {/* Active Projects Container */}
                    {activeProjects.length > 0 && (
                        <section className="bg-(--surface) border border-(--border) rounded-3xl p-6 md:p-8 shadow-2xl">
                             <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="font-black text-white flex items-center gap-3" style={{ fontFamily: "var(--font-display)" }}>
                                        <Activity size={20} className="text-emerald-400" /> Active Workspaces
                                    </h2>
                                    <p className="text-slate-400 mt-1">Projects currently in progress or escrow.</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {activeProjects.map((app: any) => (
                                    <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 transition-all gap-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-black text-lg shadow-inner uppercase">
                                                {app.gig.title.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white mb-1">{app.gig.title}</h4>
                                                <div className="flex items-center gap-3 text-xs font-bold">
                                                     <span className="text-emerald-400 flex items-center gap-1"><CircleDot size={10}/> Working</span>
                                                     <span className="text-slate-500">
                                                        Due {app.gig.deadline 
                                                          ? new Date(app.gig.deadline).toLocaleDateString() 
                                                          : "TBD"}
                                                     </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={`/gigs/${app.gig.id}`}>
                                            <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm h-10 px-6 font-bold shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]">
                                                Open Workspace
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* RIGHT COLUMN: Sidebar Tools */}
                <div className="space-y-6">

                    {/* AI Trending Sidebar */}
                    <TrendingSidebar />
                    
                    {/* AI Career Tracker / 4-D Reputation Ledger */}
                    <ReputationLedgerCard 
                        reliability={reliabilityScore}
                        execution={executionScore}
                        learning={learningScore}
                        community={communityScore}
                    />

                    {/* Skill Builder Focus */}
                    <Card className="p-7 rounded-3xl border border-(--border) bg-(--surface) shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-white flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                                <Brain size={18} className="text-emerald-400" /> Top Skills
                            </h3>
                            <Link href="/dashboard/student/profile" className="font-bold text-violet-400 hover:text-violet-300">
                                Edit
                            </Link>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {dbUser?.userSkills && dbUser.userSkills.length > 0 ? (
                                dbUser.userSkills.slice(0, 8).map((us: any) => (
                                    <span key={us.skillId} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-(--border) rounded-xl font-bold text-slate-300 hover:bg-white/10 transition-colors">
                                        <CheckCircle2 size={12} className="text-emerald-400" />{us.skill.name}
                                    </span>
                                ))
                            ) : (
                                <p className="bg-white/5 border border-(--border-subtle) p-4 rounded-xl w-full text-center font-medium">Launch your AI Skill Builder to get tailored skill recommendations.</p>
                            )}
                        </div>
                    </Card>

                    {/* Application Tracker */}
                    <Card className="p-7 rounded-3xl border border-(--border) bg-(--surface) shadow-xl">
                       <h3 className="font-black text-white mb-6 flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                            <TargetIcon size={18} className="text-violet-400" /> Recent Applications
                        </h3>
                        <div className="space-y-4">
                            {recentApps.length > 0 ? (
                                recentApps.map((app: any) => (
                                    <div key={app.id} className="group p-4 bg-(--surface-2) rounded-2xl border border-(--border-subtle) hover:border-(--primary-light) transition-all cursor-pointer">
                                        <h4 className="font-bold text-white line-clamp-1 mb-2">{app.gig.title}</h4>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500">{new Date(app.createdAt).toLocaleDateString()}</span>
                                            <span className={`px-2 py-0.5 rounded font-black tracking-wider uppercase ${app.status === 'PENDING' ? 'bg-cyan-500/10' : app.status === 'ACCEPTED' ? 'bg-emerald-500/10' : 'bg-white/5 text-slate-400'}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-4 font-medium">No active applications currently.</p>
                            )}
                        </div>
                        <Link href="/dashboard/student/applications" className="mt-4 block">
                            <Button className="w-full bg-white/5 hover:bg-white/10 rounded-xl h-10 border border-(--border) backdrop-blur-sm shadow-none font-bold text-sm transition-all">
                                View Application CRM
                            </Button>
                        </Link>
                    </Card>

                </div>
            </div>
        </div>
    )
}
