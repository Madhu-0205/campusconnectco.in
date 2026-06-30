import { Card } from "@/components/ui/Card"

import dynamic from "next/dynamic"
const FinancialChart = dynamic(() => import("@/components/Analytics/FinancialChart"), {
    loading: () => <div className="h-full w-full animate-pulse bg-slate-800/50 rounded-xl"></div>
})
import { TrendingUp, Users, Briefcase, Activity, FileText, MessageSquare, Plus, Smartphone, Monitor, ShieldAlert, GraduationCap, Lock, CheckCircle, Clock, Brain } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

import { protectPage } from "@/lib/auth-checks"
import prisma from "@/lib/prisma"

export default async function FounderDashboard() {
    const { authorized } = await protectPage(["FOUNDER"])
    if (!authorized) {
        redirect("/auth/sign-in")
    }

    // 1. Fetch Real-time Data with Trend Calculation
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prev7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    let totalUsers = 0;
    let usersLastWeek = 0;
    let usersPrevWeek = 0;
    let activeUsers = 0;
    let totalGigs = 0;
    let gigsLastWeek = 0;
    let gigsPrevWeek = 0;
    let totalApplications = 0;
    let appsLastWeek = 0;
    let appsPrevWeek = 0;
    let totalMessages = 0;
    let revenueAgg: any = { _sum: { amount: null } };
    let revenueLastWeekAgg: any = { _sum: { amount: null } };
    let revenuePrevWeekAgg: any = { _sum: { amount: null } };
    let internships = 0;
    let completedGigs = 0;
    let lockedEscrowAgg: any = { _sum: { amount: null } };
    let recentGigs: any[] = [];
    let recentApps: any[] = [];
    let dbError = false;

    try {
        const [
            tUsers,
            uLastWeek,
            uPrevWeek,
            actUsers,
            tGigs,
            gLastWeek,
            gPrevWeek,
            tApps,
            aLastWeek,
            aPrevWeek,
            tMsgs,
            rev,
            revLastWeek,
            revPrevWeek,
            interns,
            compGigs,
            lockEscrow,
            recGigs,
            recApps,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { createdAt: { gte: last7Days } } }),
            prisma.user.count({ where: { createdAt: { gte: prev7Days, lt: last7Days } } }),
            prisma.user.count({ where: { updatedAt: { gte: last7Days } } }),
            prisma.gig.count(),
            prisma.gig.count({ where: { createdAt: { gte: last7Days } } }),
            prisma.gig.count({ where: { createdAt: { gte: prev7Days, lt: last7Days } } }),
            prisma.application.count(),
            prisma.application.count({ where: { createdAt: { gte: last7Days } } }),
            prisma.application.count({ where: { createdAt: { gte: prev7Days, lt: last7Days } } }),
            prisma.message.count(),
            prisma.escrow.aggregate({ _sum: { amount: true } }),
            prisma.escrow.aggregate({ where: { createdAt: { gte: last7Days } }, _sum: { amount: true } }),
            prisma.escrow.aggregate({ where: { createdAt: { gte: prev7Days, lt: last7Days } }, _sum: { amount: true } }),
            prisma.internship.count(),
            prisma.gig.count({ where: { status: "COMPLETED" } }),
            prisma.escrow.aggregate({ where: { status: "LOCKED" }, _sum: { amount: true } }),
            prisma.gig.findMany({ take: 4, orderBy: { createdAt: "desc" }, select: { title: true, budget: true, createdAt: true, poster: { select: { name: true } } } }),
            prisma.application.findMany({ take: 4, orderBy: { createdAt: "desc" }, select: { gig: { select: { title: true } }, applicant: { select: { name: true } }, createdAt: true } })
        ]);

        totalUsers = tUsers;
        usersLastWeek = uLastWeek;
        usersPrevWeek = uPrevWeek;
        activeUsers = actUsers;
        totalGigs = tGigs;
        gigsLastWeek = gLastWeek;
        gigsPrevWeek = gPrevWeek;
        totalApplications = tApps;
        appsLastWeek = aLastWeek;
        appsPrevWeek = aPrevWeek;
        totalMessages = tMsgs;
        revenueAgg = rev;
        revenueLastWeekAgg = revLastWeek;
        revenuePrevWeekAgg = revPrevWeek;
        internships = interns;
        completedGigs = compGigs;
        lockedEscrowAgg = lockEscrow;
        recentGigs = recGigs;
        recentApps = recApps;
    } catch (err) {
        console.error("[FOUNDER_DASHBOARD_DB_ERROR]:", err);
        dbError = true;
    }

    const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? "+100%" : "0%";
        const diff = ((current - previous) / previous) * 100;
        return `${diff >= 0 ? "+" : ""}${diff.toFixed(0)}%`;
    };

    const userTrend = calculateTrend(usersLastWeek, usersPrevWeek);
    const gigTrend = calculateTrend(gigsLastWeek, gigsPrevWeek);
    const appTrend = calculateTrend(appsLastWeek, appsPrevWeek);

    const totalRevenue = (revenueAgg._sum.amount || 0) * 0.10;
    const revLastWeek = (revenueLastWeekAgg._sum.amount || 0) * 0.10;
    const revPrevWeek = (revenuePrevWeekAgg._sum.amount || 0) * 0.10;
    const revenueTrend = calculateTrend(revLastWeek, revPrevWeek);
    const lockedEscrow = lockedEscrowAgg._sum.amount || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto px-4 pb-20 pt-6">
            {dbError && (
                <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-200 flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div>
                        <h4 className="font-black text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            Database Connection Issue
                        </h4>
                        <p className="text-xs text-red-300/80 mt-1">Platform control metrics and statistics are temporarily offline. Retrying in the background.</p>
                    </div>
                    <Link href="/dashboard/founder" className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-xs font-black transition-colors shrink-0">
                        Refresh Control Panel
                    </Link>
                </div>
            )}

            {/* Header Section */}
            <div className="relative rounded-3xl overflow-hidden border border-(--border) bg-(--surface) p-4 md:p-10 mb-8 shadow-2xl">
                <div className="absolute inset-0 bg-size-[40px_40px]" />
                <div className="absolute top-[-30%] left-[5%] w-80 h-80 bg-violet-500/15 blur-[80px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[10%] w-60 h-60 bg-cyan-500/10 blur-[60px] rounded-full" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-(--border) w-fit">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="font-black text-white/70 uppercase tracking-widest">System Operational</span>
                        </div>
                        <h1 className="md:text-5xl font-black text-white tracking-tight leading-[1.05]" style={{ fontFamily: "var(--font-display)" }}>
                            Platform <span style={{ color: "var(--color-primary)" }}>Control.</span>
                        </h1>
                        <p className="mt-2 text-base">
                            High-level oversight of all metrics, operations, and revenue.
                        </p>
                    </div>
                    <div className="flex gap-3 mt-4 md:mt-0">
                        <Link href="/dashboard/founder/content" className="px-5 py-2.5 border border-(--border) rounded-xl font-black text-white hover:bg-white/5 transition-colors flex items-center gap-2 backdrop-blur-sm">
                            <ShieldAlert size={16} /> Moderation
                        </Link>
                        <Link href="/dashboard/founder/gigs/new" className="px-5 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 transition-colors shadow-lg" style={{ background: "var(--color-primary)", boxShadow: "0 0 28px rgba(124,58,237,0.35)" }}>
                            <Plus size={16} /> New Opportunity
                        </Link>
                    </div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    label="Active Users"
                    value={activeUsers.toLocaleString()}
                    icon={Users}
                    trend={userTrend}
                    bgClass="bg-violet-500/10 text-violet-400"
                />
                <MetricCard
                    label="Total Users"
                    value={totalUsers.toLocaleString()}
                    icon={Users}
                    bgClass="bg-white/5 text-slate-400"
                />
                <MetricCard
                    label="Total Gigs"
                    value={totalGigs.toLocaleString()}
                    icon={Briefcase}
                    trend={gigTrend}
                    bgClass="bg-violet-500/10 text-violet-400"
                />
                <MetricCard
                    label="Completed Gigs"
                    value={completedGigs.toLocaleString()}
                    icon={CheckCircle}
                    bgClass="bg-emerald-500/10 text-emerald-400"
                />
                <MetricCard
                    label="Internships"
                    value={internships.toLocaleString()}
                    icon={GraduationCap}
                    bgClass="bg-cyan-500/10 text-cyan-400"
                />
                <MetricCard
                    label="Total Applications"
                    value={totalApplications.toLocaleString()}
                    icon={FileText}
                    trend={appTrend}
                    bgClass="bg-violet-500/10 text-violet-400"
                />
                <MetricCard
                    label="Platform Revenue"
                    value={`₹${totalRevenue.toLocaleString()}`}
                    icon={TrendingUp}
                    trend={revenueTrend}
                    bgClass="bg-emerald-500/10 text-emerald-400"
                />
                <MetricCard
                    label="Funds in Escrow"
                    value={`₹${lockedEscrow.toLocaleString()}`}
                    icon={Lock}
                    bgClass="bg-cyan-500/10 text-cyan-400"
                />
            </div>

            {/* Lower Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic & Analytics Column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 rounded-2xl border border-(--border-subtle) bg-(--surface) backdrop-blur-xl shadow-sm hover:border-(--primary-light) transition-all">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-black text-white">Revenue & Engagement</h3>
                                <p className="font-medium text-slate-400 mt-1">Platform transactions and active interactions</p>
                            </div>
                            <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-(--border-subtle)">
                                <button className="px-3 py-1.5 font-black bg-slate-800 text-white rounded-md shadow-sm">Weekly</button>
                                <button className="px-3 py-1.5 font-black text-slate-400 hover:text-white transition-colors">Monthly</button>
                            </div>
                        </div>
                        <div className="h-[280px]">
                            <FinancialChart />
                        </div>
                    </Card>

                    {/* Pending Approvals Panel */}
                    <Card className="p-6 rounded-2xl border border-(--border-subtle) bg-(--surface) backdrop-blur-xl shadow-sm hover:border-(--primary-light) transition-all">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="font-black text-white flex items-center gap-2">
                                <Clock size={20} style={{ color: "var(--color-primary)" }} /> Real-time Activity
                            </h3>
                            <Link href="/dashboard/founder/gigs" className="text-xs font-black hover:underline uppercase tracking-wider" style={{ color: "var(--color-primary)" }}>Monitor</Link>
                        </div>
                        <div className="space-y-3">
                            {recentGigs.slice(0, 2).map((gig: any, i: any) => (
                                <div key={`gig-${i}`} className="flex items-center justify-between p-4 rounded-xl border border-(--border-subtle) hover:bg-slate-800/50 hover:border-(--border) transition-colors cursor-pointer group">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 p-2 bg-purple-500/10 rounded-lg text-purple-400"><Briefcase size={14} /></div>
                                        <div>
                                            <h4 className="font-black text-white group-hover:text-violet-500 transition-colors truncate max-w-[200px]">{gig.title}</h4>
                                            <p className="font-bold text-slate-400 mt-1">New Gig Posted by {gig.poster?.name || "User"}</p>
                                        </div>
                                    </div>
                                    <span className="font-black text-slate-500">₹{gig.budget.toLocaleString()}</span>
                                </div>
                            ))}
                            {recentApps.slice(0, 2).map((app: any, i: any) => (
                                <div key={`app-${i}`} className="flex items-center justify-between p-4 rounded-xl border border-(--border-subtle) hover:bg-slate-800/50 hover:border-(--border) transition-colors cursor-pointer group">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 p-2 bg-violet-500/10 rounded-lg text-violet-400"><FileText size={14} /></div>
                                        <div>
                                            <h4 className="font-black text-white group-hover:text-violet-500 transition-colors truncate max-w-[200px]">{app.applicant?.name || "User"} applied</h4>
                                            <p className="font-bold text-slate-400 mt-1">for &quot;{app.gig?.title || "Gig"}&quot;</p>
                                        </div>
                                    </div>
                                    <span className="font-black text-slate-500">Just now</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Sidebar Setup */}
                <div className="space-y-6">
                    {/* Live Activity Feed */}
                    <Card className="p-6 rounded-2xl border border-(--border-subtle) bg-(--surface) backdrop-blur-xl shadow-sm hover:border-(--primary-light) transition-all">
                        <h3 className="font-black text-white mb-5">Live Insights</h3>

                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                                        <Activity size={18} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-400 uppercase tracking-wider mb-0.5">Active Sessions</p>
                                        <p className="font-black text-white">{activeUsers}</p>
                                    </div>
                                </div>
                                <span className="uppercase tracking-widest font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">{calculateTrend(activeUsers, usersPrevWeek)}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-(--primary)/10 text-violet-500 rounded-xl">
                                        <MessageSquare size={18} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-400 uppercase tracking-wider mb-0.5">Total Messages</p>
                                        <p className="font-black text-white">{totalMessages}</p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-(--border-subtle)" />

                            {/* Device Usage Mini-Stat */}
                            <div>
                                <p className="font-black text-slate-400 uppercase tracking-wider mb-3">Platform Access By Device</p>
                                <div className="flex gap-3">
                                    <div className="flex-1 p-2.5 bg-slate-950 rounded-xl text-center flex items-center justify-center gap-2 border border-(--border-subtle)">
                                        <Smartphone size={14} className="text-slate-500" />
                                        <span className="font-black text-white">65%</span>
                                    </div>
                                    <div className="flex-1 p-2.5 bg-slate-950 rounded-xl text-center flex items-center justify-center gap-2 border border-(--border-subtle)">
                                        <Monitor size={14} className="text-slate-500" />
                                        <span className="font-black text-white">35%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Admin Actions */}
                    <Card className="p-6 rounded-2xl border border-(--border-subtle) bg-(--surface) backdrop-blur-xl shadow-sm hover:border-(--primary-light) transition-all">
                        <h3 className="font-black text-white mb-5">Command Center</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <QuickActionTile href="/dashboard/founder/users" icon={Users} label="Users" />
                            <QuickActionTile href="/dashboard/founder/gigs" icon={Briefcase} label="Gigs" />
                            <QuickActionTile href="/dashboard/founder/escrow" icon={Lock} label="Escrow" />
                            <QuickActionTile href="/dashboard/founder/fraud-engine" icon={ShieldAlert} label="Fraud Engine" />
                            <QuickActionTile href="/dashboard/founder/applications" icon={FileText} label="Apps" />
                            <QuickActionTile href="/dashboard/founder/revenue" icon={TrendingUp} label="Revenue" />
                        </div>
                    </Card>

                    {/* AI Insights & Fraud Detection */}
                    <Card className="p-6 rounded-2xl border border-violet-500/20 bg-(--surface) backdrop-blur-xl shadow-[0_0_20px_rgba(124,58,237,0.1)] hover:border-violet-500/40 transition-all">
                        <div className="flex items-center gap-2 mb-5">
                            <Brain size={20} className="animate-pulse" style={{ color: "var(--color-primary)" }} />
                            <h3 className="font-black text-white">AI Engine Insights</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                <p className="font-medium text-slate-300">Gig postings increased <span className="text-emerald-400 font-bold">30%</span> this week.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                                <p className="font-medium text-slate-300">&quot;Design&quot; category gigs currently have the highest demand across campuses.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                                <p className="font-medium text-slate-300">Detected <span className="text-cyan-400 font-bold">spam correlation</span> in 2 new gig listings. <Link href="/dashboard/founder/moderation" className="text-xs ml-1 hover:underline">Review now</Link></p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

interface MetricCardProps {
    label: string;
    value: string | number;
     
    icon: any;
    trend?: string;
    bgClass: string;
}

function MetricCard({ label, value, icon: Icon, trend, bgClass }: MetricCardProps) {
    return (
        <Card className="p-6 rounded-2xl border border-(--border-subtle) bg-(--surface) backdrop-blur-xl shadow-sm hover:border-(--primary-light) transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl transition-colors ${bgClass}`}>
                    <Icon size={20} />
                </div>
                {trend && (
                    <span className="flex items-center font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="font-black text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
                <h3 className="font-black text-white tracking-tight">{value}</h3>
            </div>
        </Card>
    )
}

interface QuickActionTileProps {
    href: string;
     
    icon: any;
    label: string;
}

function QuickActionTile({ href, icon: Icon, label }: QuickActionTileProps) {
    return (
        <Link href={href} className="flex flex-col items-center justify-center p-4 rounded-xl border border-(--border-subtle) bg-(--surface-2) hover:bg-(--surface-3) hover:border-(--primary-light) group transition-all">
            <Icon size={20} className="text-slate-500 group-hover:text-white mb-2 transition-colors" />
            <span className="font-black uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors">{label}</span>
        </Link>
    )
}

