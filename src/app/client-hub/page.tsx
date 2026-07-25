import {
    PlusCircle, Users, CheckCircle, Briefcase, ArrowRight,
    TrendingUp, Zap, Brain,
    CircleDot, ShieldCheck, Sparkles, Building2, FileText, Target,
    Star, ChevronRight, Award, MessageSquare
} from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

import { KanbanBoard, TopApplicants } from "@/components/client-hub/ClientDashboardClient"
import { Card } from "@/components/ui/Card"
import { protectPage } from "@/lib/auth-checks"
import prisma from "@/lib/prisma"

export default async function ClientDashboard() {
    const { authorized, user } = await protectPage(["CLIENT", "STARTUP"])
    if (!authorized) {
        redirect("/auth/sign-in")
    }

    const orgMembership = await prisma.member.findFirst({ where: { userId: user?.id } })
    if (!orgMembership) {
        redirect("/client-hub/onboarding")
    }

    let activeGigsCount = 0;
    let applicationsCount = 0;
    let completedGigsCount = 0;
    let escrowData: any = { _sum: { amount: null } };
    let recentGigs: any[] = [];
    let topApplicants: any[] = [];
    let dbError = false;

    try {
        const [actGigs, apps, compGigs, escrow, recGigs, topApps] = await Promise.all([
            prisma.gig.count({ where: { posted_by: user?.id, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
            prisma.application.count({ where: { gig: { posted_by: user?.id } } }),
            prisma.gig.count({ where: { posted_by: user?.id, status: "COMPLETED" } }),
            prisma.escrow.aggregate({ where: { clientId: user?.id || "", status: "LOCKED" }, _sum: { amount: true } }),
            prisma.gig.findMany({
                where: { posted_by: user?.id },
                include: {
                    _count: { select: { applications: true } },
                    escrows: { take: 1, select: { status: true, amount: true } },
                    applications: {
                        take: 1,
                        where: { status: { in: ["ACCEPTED", "PENDING"] } },
                        select: { status: true }
                    }
                },
                take: 6,
                orderBy: { createdAt: "desc" }
            }),
            prisma.application.findMany({
                where: { gig: { posted_by: user?.id }, status: "PENDING" },
                include: {
                    applicant: { select: { name: true, email: true, id: true } },
                    gig: { select: { title: true, budget: true } }
                },
                take: 4,
                orderBy: { createdAt: "desc" }
            }),
        ]);

        activeGigsCount = actGigs;
        applicationsCount = apps;
        completedGigsCount = compGigs;
        escrowData = escrow;
        recentGigs = recGigs;
        topApplicants = topApps;
    } catch (err) {
        console.error("[CLIENT_HUB_DASHBOARD_DB_ERROR]:", err);
        dbError = true;
    }

    const escrowAmount = escrowData._sum.amount || 0;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const kanbanColumns = [
        {
            id: "OPEN",
            label: "Open",
            color: "text-[#0EA5E9]",
            bg: "bg-[#0EA5E9]/10",
            border: "border-[#0EA5E9]/20",
            dot: "bg-[#0EA5E9]",
            gigs: recentGigs.filter((g: any) => g.status === "OPEN"),
        },
        {
            id: "IN_PROGRESS",
            label: "In Progress",
            color: "text-[#F59E0B]",
            bg: "bg-[#F59E0B]/10",
            border: "border-[#F59E0B]/20",
            dot: "bg-[#F59E0B]",
            gigs: recentGigs.filter((g: any) => g.status === "IN_PROGRESS"),
        },
        {
            id: "COMPLETED",
            label: "Completed",
            color: "text-[#10B981]",
            bg: "bg-(--accent)/10",
            border: "border-[#10B981]/20",
            dot: "bg-[#10B981]",
            gigs: recentGigs.filter((g: any) => g.status === "COMPLETED"),
        },
    ];

    return (
        <div className="min-h-screen text-slate-100" style={{ background: "var(--color-background)", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute -top-40 right-1/4 w-96 h-96 blur-[120px] rounded-full" style={{ background: "rgba(255,184,0,0.1)" }} />
                <div className="absolute top-20 left-1/4 w-96 h-96 blur-[120px] rounded-full" style={{ background: "rgba(255,77,28,0.08)" }} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
                {dbError && (
                    <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-200 flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300 font-sans">
                        <div>
                            <h4 className="font-black text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                Database Connection Issue
                            </h4>
                            <p className="text-xs text-red-300/80 mt-1">Platform client metrics and roles statistics are temporarily offline. Retrying in the background.</p>
                        </div>
                        <Link href="/client-hub" className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-xs font-black transition-colors shrink-0">
                            Refresh Hub
                        </Link>
                    </div>
                )}

                {/* —— HEADER ———————————————————————————————————————————————— */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-[#F59E0B]" />
                        </div>
                        <div>
                            <h1 className="font-heading font-bold text-white">Client Hub</h1>
                            <p className="text-sm">Hire top student talent</p>
                        </div>
                    </div>
                    <Link href="/client-hub/post-gig">
                        <button className="rounded-xl text-xs font-black px-4 py-2 flex items-center gap-2 transition-all active:scale-95" style={{ background: "var(--color-primary)", boxShadow: "0 4px 16px rgba(255,77,28,0.25)" }}>
                            <PlusCircle className="w-4 h-4" />
                            Post Opportunity
                        </button>
                    </Link>
                </div>

                {/* â”€â”€ STATS GRID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        {
                            label: "Active Roles",
                            value: activeGigsCount,
                            icon: Briefcase,
                            color: "text-[#0EA5E9]",
                            stroke: "#0EA5E9",
                            bg: "bg-[#0EA5E9]/10 border-[#0EA5E9]/20",
                            trend: "+2 this month",
                            data: [2, 3, 2, 4, 3, 5, activeGigsCount > 0 ? activeGigsCount : 1]
                        },
                        {
                            label: "Applications",
                            value: applicationsCount,
                            icon: Users,
                            color: "text-[#7C3AED]",
                            stroke: "#7C3AED",
                            bg: "bg-[#7C3AED]/10 border-[#7C3AED]/20",
                            trend: applicationsCount > 0 ? `${applicationsCount} pending review` : "No pending",
                            badge: applicationsCount > 0 ? "New" : null,
                            data: [5, 8, 12, 10, 15, 20, applicationsCount > 0 ? applicationsCount : 2]
                        },
                        {
                            label: "Successful Hires",
                            value: completedGigsCount,
                            icon: CheckCircle,
                            color: "text-[#10B981]",
                            stroke: "#10B981",
                            bg: "bg-(--accent)/10 border-[#10B981]/20",
                            trend: "All escrow-protected",
                            data: [1, 2, 2, 3, 3, 4, completedGigsCount > 0 ? completedGigsCount : 1]
                        },
                        {
                            label: "Funds in Escrow",
                            value: `â‚¹${escrowAmount.toLocaleString("en-IN")}`,
                            icon: ShieldCheck,
                            color: "text-[#F59E0B]",
                            stroke: "#F59E0B",
                            bg: "bg-[#F59E0B]/10 border-[#F59E0B]/20",
                            trend: "Protected by Razorpay",
                            data: [1000, 2000, 1500, 3000, 2500, 4000, escrowAmount > 0 ? escrowAmount : 1000]
                        },
                    ].map(({ label, value, icon: Icon, color, bg, trend, badge, data, stroke }) => {
                        const max = Math.max(...data);
                        const min = Math.min(...data);
                        const range = max - min || 1;
                        const sparklinePoints = data.map((d, i) => {
                            const x = (i / (data.length - 1)) * 60;
                            const y = 20 - ((d - min) / range) * 20;
                            return `${x},${y}`;
                        }).join(" ");
                        
                        return (
                        <Card key={label} className="p-6 rounded-3xl shadow-xl transition-all duration-300 relative overflow-hidden group" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                            <div className={`absolute -right-8 -top-8 w-24 h-24 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${bg}`} />
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-5">
                                    <div className={`p-2.5 rounded-2xl border ${bg}`}>
                                        <Icon size={20} className={color} />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {badge && (
                                            <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${bg} ${color}`}>
                                                <CircleDot size={8} className="animate-pulse" /> {badge}
                                            </span>
                                        )}
                                        <svg width="60" height="20" className="opacity-70 group-hover:opacity-100 transition-opacity drop-shadow-lg">
                                            <polyline 
                                                points={sparklinePoints} 
                                                fill="none" 
                                                stroke={stroke} 
                                                strokeWidth="2" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <p className="font-black text-white mb-1 tracking-tight">{value}</p>
                                <p className="font-bold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
                                <p className="text-slate-600">{trend}</p>
                            </div>
                        </Card>
                    )})}
                </div>


                {/* â”€â”€ MAIN GRID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT 2/3: Kanban Pipeline + Top Applicants */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* â”€ KANBAN PIPELINE â”€ */}
                        <section className="rounded-3xl p-6 shadow-xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-black text-white flex items-center gap-2" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
                                    Hiring Pipeline
                                    <span className="font-bold px-2.5 py-1 bg-(--surface-2) border border-white/10 text-slate-400 rounded-full">Kanban</span>
                                </h2>
                                <Link href="/client-hub/post-gig" className="flex items-center gap-1.5 font-bold text-(--primary-light) hover:text-white transition-colors">
                                    <PlusCircle size={14} /> Add Role
                                </Link>
                            </div>

                            <KanbanBoard recentGigs={recentGigs} />
                        </section>

                        {/* â”€ TOP APPLICANTS â”€ */}
                        <section className="rounded-3xl p-6 shadow-xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-black text-white flex items-center gap-2" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
                                    <Star size={18} className="text-[#F59E0B]" /> Top Applicants
                                </h2>
                                <Link href="/client-hub/applicants" className="flex items-center gap-1 font-bold text-(--primary-light) hover:text-white transition-colors">
                                    View All <ChevronRight size={14} />
                                </Link>
                            </div>

                            <TopApplicants applicants={topApplicants} />
                        </section>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="space-y-5">

                        {/* â”€ AI Sourcing Copilot â”€ */}
                        <Card className="p-6 rounded-3xl shadow-xl relative overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid rgba(255,77,28,0.2)" }}>
                            <div className="absolute -right-10 -top-10 opacity-5">
                                <Brain size={160} className="text-[#7C3AED]" />
                            </div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--primary)/15 border border-[#7C3AED]/25 text-[10px] font-black uppercase tracking-widest mb-4">
                                    <Sparkles size={12} /> AI Powered
                                </div>
                                <h3 className="font-black text-white mb-5" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
                                    Sourcing Copilot
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { icon: FileText, label: "AI JD Generator", desc: "Auto-write perfect listings", color: "text-[#0EA5E9]", bg: "bg-[#0EA5E9]/10 border-[#0EA5E9]/20" },
                                        { icon: Target, label: "Smart Filter", desc: "Auto-rank applicants by fit", color: "text-[#7C3AED]", bg: "bg-[#7C3AED]/10 border-[#7C3AED]/20" },
                                        { icon: ShieldCheck, label: "Skill Verifier", desc: "Verify GitHub & code quality", color: "text-[#10B981]", bg: "bg-(--accent)/10 border-[#10B981]/20" },
                                    ].map(({ icon: Icon, label, desc, color, bg }) => (
                                        <div key={label} className="flex gap-3 p-3.5 rounded-2xl border border-white/5 bg-white/2 hover:bg-(--surface-2) hover:border-white/10 transition-all cursor-pointer group">
                                            <div className={`w-9 h-9 rounded-xl ${bg} ${color} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                                                <Icon size={16} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{label}</p>
                                                <p className="text-slate-500">{desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* â”€ AI Match Preview â”€ */}
                        <Card className="p-6 rounded-3xl shadow-xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                            <h3 className="font-black text-white mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
                                <Zap size={16} className="text-[#F59E0B]" /> Curated Talent Match
                            </h3>
                            <div className="bg-white/3 border border-white/8 rounded-2xl p-4 hover:border-[#7C3AED]/30 transition-all">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-linear-to-br from-(--primary) to-(--accent) rounded-xl flex items-center justify-center font-black text-base shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                                        AJ
                                    </div>
                                    <div>
                                        <p className="font-black text-sm flex items-center gap-2">
                                            Arjun J.
                                            <span className="bg-[#10B981]/15 border border-[#10B981]/20 text-[#10B981] px-1.5 py-0.5 rounded font-black">VERIFIED</span>
                                        </p>
                                        <p className="text-slate-400 mt-0.5">Full Stack React Expert Â· â˜… 4.9</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    {["React", "TypeScript", "Next.js"].map(s => (
                                        <span key={s} className="font-bold px-2 py-0.5 bg-(--primary)/15 text-(--primary-light) rounded-full">{s}</span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black">94% match score</span>
                                    <button className="font-bold px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all">
                                        View Profile â†’
                                    </button>
                                </div>
                            </div>
                        </Card>

                        {/* â”€ Quick Actions â”€ */}
                        <Card className="p-6 rounded-3xl shadow-xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                            <h3 className="font-black text-white mb-4" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
                                Quick Actions
                            </h3>
                            <div className="space-y-2">
                                {[
                                    { label: "Post New Gig", href: "/client-hub/post-gig", icon: PlusCircle, color: "text-(--primary-light)" },
                                    { label: "AI Talent Search", href: "/employer/talent-search", icon: Brain, color: "text-[#7C3AED]" },
                                    { label: "Campus Drives", href: "/employer/drives", icon: Target, color: "text-[#10B981]" },
                                    { label: "Message Students", href: "/messages", icon: MessageSquare, color: "text-[#F59E0B]" },
                                    { label: "Company Profile", href: "/employer/profile", icon: Building2, color: "text-slate-400" },
                                    { label: "Upgrade Plan", href: "/employer/upgrade", icon: Sparkles, color: "text-[#F59E0B]" },
                                ].map(({ label, href, icon: I, color }) => (
                                    <Link key={label} href={href}>
                                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-(--surface-2) transition-colors group cursor-pointer border border-transparent hover:border-white/8 active:scale-[0.98]">
                                            <I size={15} className={color} />
                                            <span className="font-bold text-slate-300 group-hover:text-white">{label}</span>
                                            <ArrowRight size={13} className="ml-auto text-slate-600 group-hover:text-white transition-colors" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </Card>

                        {/* â”€ Platform Stats â”€ */}
                        <Card className="p-6 rounded-3xl shadow-xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                            <h3 className="font-black text-white mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
                                <Award size={16} className="text-[#F59E0B]" /> Why CampusConnect?
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { label: "Verified Students", value: "Verified", color: "text-[#0EA5E9]" },
                                    { label: "Gigs Completed", value: "Active", color: "text-[#10B981]" },
                                    { label: "Avg Time to Hire", value: "< 48 hrs", color: "text-[#F59E0B]" },
                                    { label: "Escrow Protected", value: "100%", color: "text-(--primary-light)" },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">{label}</span>
                                        <span className={`text-sm font-black ${color}`}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
