import {
 PlusCircle, Users, CheckCircle, Briefcase, ArrowRight,
 Zap, Brain,
 CircleDot, ShieldCheck, Sparkles, Building2, FileText, Target,
 Star, ChevronRight, Award, MessageSquare
} from"lucide-react"
import Link from"next/link"
import { redirect } from"next/navigation"

import { KanbanBoard, TopApplicants } from "@/components/client-hub/ClientDashboardClient"
import MyPostsManager from "@/components/dashboard/MyPostsManager"
import { Card } from "@/components/ui/Card"
import { protectPage } from"@/lib/auth-checks"
import prisma from"@/lib/prisma"

export default async function ClientDashboard() {
 const { authorized, user } = await protectPage(["CLIENT", "STARTUP", "FOUNDER", "ADMIN"])
 if (!authorized) {
 redirect("/auth/sign-in?returnUrl=/client-hub")
 }

 const orgMembership = await prisma.member.findFirst({ where: { userId: user?.id } })
 if (!orgMembership) {
 redirect("/client-hub/onboarding")
 }

 let activeGigsCount = 0;
 let applicationsCount = 0;
 let completedGigsCount = 0;
 let totalAgreedBudget = 0;
 let recentGigs: any[] = [];
 let topApplicants: any[] = [];
 let userInternships: any[] = [];
 let dbError = false;

 try {
    const [actGigs, apps, compGigs, budgetAgg, recGigs, topApps, internships] = await Promise.all([
      prisma.gig.count({ where: { posted_by: user?.id, status: { in: ["OPEN", "active", "IN_PROGRESS"] }, deletedAt: null } }),
      prisma.application.count({ where: { gig: { posted_by: user?.id } } }),
      prisma.gig.count({ where: { posted_by: user?.id, status: "COMPLETED", deletedAt: null } }),
      prisma.gig.aggregate({ where: { posted_by: user?.id, deletedAt: null }, _sum: { budget: true } }),
      prisma.gig.findMany({
        where: { posted_by: user?.id, deletedAt: null },
        include: {
          _count: { select: { applications: true } },
          escrows: { take: 1, select: { status: true, amount: true } },
          applications: {
            take: 1,
            where: { status: { in: ["ACCEPTED","PENDING"] } },
            select: { status: true }
          }
        },
        take: 20,
        orderBy: { createdAt:"desc" }
      }),
      prisma.application.findMany({
        where: { gig: { posted_by: user?.id }, status:"PENDING" },
        include: {
          applicant: { select: { name: true, email: true, id: true } },
          gig: { select: { title: true, budget: true } }
        },
        take: 4,
        orderBy: { createdAt:"desc" }
      }),
      prisma.internship.findMany({
        where: { posted_by: user?.id, deletedAt: null },
        take: 20,
        orderBy: { createdAt: "desc" }
      })
    ]);

    activeGigsCount = actGigs;
    applicationsCount = apps;
    completedGigsCount = compGigs;
    totalAgreedBudget = budgetAgg._sum.budget || 0;
    recentGigs = recGigs;
    topApplicants = topApps;
    userInternships = internships;
 } catch (err) {
 console.error("[CLIENT_HUB_DASHBOARD_DB_ERROR]:", err);
 dbError = true;
 }

 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 const kanbanColumns = [
 {
 id:"OPEN",
 label:"Open",
 color:"text-[#0EA5E9]",
 bg:"bg-[#0EA5E9]/10",
 border:"border-[#0EA5E9]/20",
 dot:"bg-[#0EA5E9]",
 gigs: recentGigs.filter((g: any) => g.status ==="OPEN"),
 },
 {
 id:"IN_PROGRESS",
 label:"In Progress",
 color:"text-[#F59E0B]",
 bg:"bg-[#F59E0B]/10",
 border:"border-[#F59E0B]/20",
 dot:"bg-[#F59E0B]",
 gigs: recentGigs.filter((g: any) => g.status ==="IN_PROGRESS"),
 },
 {
 id:"COMPLETED",
 label:"Completed",
 color:"text-[#10B981]",
 bg:"bg-(--accent)/10",
 border:"border-[#10B981]/20",
 dot:"bg-[#10B981]",
 gigs: recentGigs.filter((g: any) => g.status ==="COMPLETED"),
 },
 ];

 return (
 <div className="min-h-screen text-slate-100" style={{ background:"var(--color-background)", fontFamily:"var(--font-body, 'DM Sans', sans-serif)" }}>
 {/* Ambient Background */}
 <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
 <div className="absolute -top-40 right-1/4 w-96 h-96 blur-[120px] rounded-full" style={{ background:"rgba(255,184,0,0.1)" }} />
 <div className="absolute top-20 left-1/4 w-96 h-96 blur-[120px] rounded-full" style={{ background:"rgba(255,77,28,0.08)" }} />
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
 <button className="rounded-xl text-xs font-black px-4 py-2 flex items-center gap-2 transition-all active:scale-95" style={{ background:"var(--color-primary)", boxShadow:"0 4px 16px rgba(255,77,28,0.25)" }}>
 <PlusCircle className="w-4 h-4" />
 Post Opportunity
 </button>
 </Link>
 </div>

 {/* —— STATS GRID ─────────────────────────────────────────── */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {[
 {
 label: "Active Roles",
 value: activeGigsCount,
 icon: Briefcase,
 color: "text-[#0EA5E9]",
 bg: "bg-[#0EA5E9]/10 border-[#0EA5E9]/20",
 statusText: activeGigsCount > 0 ? "Currently hiring" : "Ready to post",
 badge: activeGigsCount > 0 ? "Active" : null,
 },
 {
 label: "Applications",
 value: applicationsCount,
 icon: Users,
 color: "text-[#1FA971]",
 bg: "bg-[#1FA971]/10 border-[#1FA971]/20",
 statusText: applicationsCount > 0 ? `${applicationsCount} received` : "No pending",
 badge: applicationsCount > 0 ? "New" : null,
 },
 {
 label: "Completed Roles",
 value: completedGigsCount,
 icon: CheckCircle,
 color: "text-[#10B981]",
 bg: "bg-(--accent)/10 border-[#10B981]/20",
 statusText: completedGigsCount > 0 ? "Deliverables verified" : "No completions yet",
 badge: null,
 },
 {
 label: "Milestones Tracked",
 value: `₹${totalAgreedBudget.toLocaleString("en-IN")}`,
 icon: ShieldCheck,
 color: "text-[#F59E0B]",
 bg: "bg-[#F59E0B]/10 border-[#F59E0B]/20",
 statusText: "Direct settlement tracking",
 badge: null,
 },
 ].map(({ label, value, icon: Icon, color, bg, statusText, badge }) => (
 <Card key={label} className="p-6 rounded-3xl shadow-xl transition-all duration-300 relative overflow-hidden group" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
 <div className={`absolute -right-8 -top-8 w-24 h-24 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${bg}`} />
 <div className="relative z-10">
 <div className="flex justify-between items-start mb-5">
 <div className={`p-2.5 rounded-2xl border ${bg}`}>
 <Icon size={20} className={color} />
 </div>
 {badge && (
 <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${bg} ${color}`}>
 <CircleDot size={8} className="animate-pulse" /> {badge}
 </span>
 )}
 </div>
 <p className="font-black text-white mb-1 tracking-tight">{value}</p>
 <p className="font-bold text-slate-500 uppercase tracking-widest mb-1 text-xs">{label}</p>
 <p className="text-xs text-slate-400">{statusText}</p>
 </div>
 </Card>
 ))}
 </div>

 {/* —— MAIN GRID ———————————————————————————————————————————————— */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

 {/* LEFT 2/3: Kanban Pipeline + Top Applicants */}
 <div className="lg:col-span-2 space-y-6">

 {/* â”€ KANBAN PIPELINE â”€ */}
 <section className="rounded-3xl p-6 shadow-xl" style={{ background:"var(--color-surface)", border:"1px solid var(--color-border)" }}>
 <div className="flex items-center justify-between mb-6">
 <h2 className="font-black text-white flex items-center gap-2" style={{ fontFamily:"var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
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
 <section className="rounded-3xl p-6 shadow-xl" style={{ background:"var(--color-surface)", border:"1px solid var(--color-border)" }}>
 <div className="flex items-center justify-between mb-5">
 <h2 className="font-black text-white flex items-center gap-2" style={{ fontFamily:"var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
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
 <Card className="p-6 rounded-3xl shadow-xl relative overflow-hidden" style={{ background:"var(--color-surface)", border:"1px solid rgba(255,77,28,0.2)" }}>
 <div className="absolute -right-10 -top-10 opacity-5">
 <Brain size={160} className="text-[#1FA971]" />
 </div>
 <div className="relative z-10">
 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--primary)/15 border border-[#1FA971]/25 text-[10px] font-black uppercase tracking-widest mb-4">
 <Sparkles size={12} /> AI Powered
 </div>
 <h3 className="font-black text-white mb-5" style={{ fontFamily:"var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
 Sourcing Copilot
 </h3>
 <div className="space-y-3">
 {[
 { icon: FileText, label:"AI JD Generator", desc:"Auto-write perfect listings", color:"text-[#0EA5E9]", bg:"bg-[#0EA5E9]/10 border-[#0EA5E9]/20" },
 { icon: Target, label:"Smart Filter", desc:"Auto-rank applicants by fit", color:"text-[#1FA971]", bg:"bg-[#1FA971]/10 border-[#1FA971]/20" },
 { icon: ShieldCheck, label:"Skill Verifier", desc:"Verify GitHub & code quality", color:"text-[#10B981]", bg:"bg-(--accent)/10 border-[#10B981]/20" },
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

 {/* ── Candidate Match ── */}
 <Card className="p-6 rounded-3xl shadow-xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
 <h3 className="font-black text-white mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
 <Zap size={16} className="text-[#F59E0B]" /> Recent Applicant
 </h3>
 {topApplicants.length > 0 ? (
 <div className="bg-white/3 border border-white/8 rounded-2xl p-4 hover:border-[#1FA971]/30 transition-all">
 <div className="flex items-center gap-3 mb-3">
 <div className="w-12 h-12 bg-linear-to-br from-(--primary) to-(--accent) rounded-xl flex items-center justify-center font-black text-base shadow-[0_0_15px_rgba(31,169,113,0.3)]">
 {topApplicants[0].applicant?.name?.charAt(0) || "S"}
 </div>
 <div>
 <p className="font-black text-sm flex items-center gap-2">
 {topApplicants[0].applicant?.name || "Student Candidate"}
 <span className="bg-[#10B981]/15 border border-[#10B981]/20 text-[#10B981] px-1.5 py-0.5 rounded font-black text-[10px]">PENDING REVIEW</span>
 </p>
 <p className="text-slate-400 text-xs mt-0.5">Role: {topApplicants[0].gig?.title}</p>
 </div>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-xs text-slate-400">Budget: ₹{topApplicants[0].gig?.budget?.toLocaleString("en-IN")}</span>
 <Link href="/client-hub/applicants" className="text-xs font-bold px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all">
 Review Candidate →
 </Link>
 </div>
 </div>
 ) : (
 <div className="bg-white/3 border border-dashed border-white/10 rounded-2xl p-6 text-center">
 <Users size={28} className="text-slate-500 mx-auto mb-2" />
 <p className="font-bold text-sm text-slate-300">No applicants yet</p>
 <p className="text-xs text-slate-500 mt-1">When students apply to your open gigs, applicant details will appear here.</p>
 </div>
 )}
 </Card>

 {/* ── Quick Actions ── */}
 <Card className="p-6 rounded-3xl shadow-xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
 <h3 className="font-black text-white mb-4" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
 Quick Actions
 </h3>
 <div className="space-y-2">
 {[
 { label: "Post New Gig", href: "/client-hub/post-gig", icon: PlusCircle, color: "text-(--primary-light)" },
 { label: "AI Talent Search", href: "/employer/talent-search", icon: Brain, color: "text-[#1FA971]" },
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

 {/* ── Platform Stats ── */}
 <Card className="p-6 rounded-3xl shadow-xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
 <h3 className="font-black text-white mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
 <Award size={16} className="text-[#F59E0B]" /> Why CampusConnectCo?
 </h3>
 <div className="space-y-3">
 {[
 { label: "Verified Students", value: "Verified", color: "text-[#0EA5E9]" },
 { label: "Gigs Completed", value: "Active", color: "text-[#10B981]" },
 { label: "Avg Time to Hire", value: "< 48 hrs", color: "text-[#F59E0B]" },
 { label: "Milestone Tracking", value: "Active", color: "text-(--primary-light)" },
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

 {/* ── MY POSTS LIFECYCLE MANAGER ── */}
 <div className="mt-10 pt-8 border-t border-white/10">
   <MyPostsManager
     initialOpportunities={[
       ...recentGigs.map((g: any) => ({
         id: g.id,
         type: "gig" as const,
         title: g.title,
         description: g.description,
         status: g.status,
         location: g.work_mode || g.city || "Remote",
         compensation: g.budget,
         createdAt: g.createdAt,
         updatedAt: g.updatedAt,
         applicationsCount: g._count?.applications || 0,
         tags: g.tags,
       })),
       ...(userInternships || []).map((i: any) => ({
         id: i.id,
         type: "internship" as const,
         title: i.title,
         description: i.description,
         status: i.status,
         location: i.location || i.city || "Remote",
         compensation: i.stipend,
         createdAt: i.createdAt,
         updatedAt: i.updatedAt,
         applicationsCount: i.applyCount || 0,
         tags: i.tags,
       })),
     ]}
   />
 </div>
 </div>
 </div>
 )
}
