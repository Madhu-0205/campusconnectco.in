"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    CheckCircle, XCircle, GraduationCap, Briefcase,
    AlertTriangle, Users, ChevronDown, ChevronUp,
    UserCheck, Shield
} from "lucide-react";

type LucideIcon = React.ComponentType<{ size?: number; className?: string }>;

interface PendingGig {
    id: string;
    title: string;
    description: string;
    budget: number;
    tags: string | null;
    posterName: string;
    createdAt: string;
}

interface PendingInternship {
    id: string;
    title: string;
    company: string;
    location: string | null;
    stipend: number | null;
    skills: string | null;
    createdAt: string;
}

interface PendingUser {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
}

type Tab = "gigs" | "internships" | "users";

export default function ApprovalsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("gigs");
    const [gigs, setGigs] = useState<PendingGig[]>([]);
    const [internships, setInternships] = useState<PendingInternship[]>([]);
    const [users, setUsers] = useState<PendingUser[]>([]);
    const [totalPending, setTotalPending] = useState(0);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/founder/approvals");
                if (!res.ok) throw new Error("Failed");
                const data = await res.json();
                setGigs(data.pendingGigs || []);
                setInternships(data.pendingInternships || []);
                setUsers(data.pendingUsers || []);
                setTotalPending((data.pendingGigs?.length || 0) + (data.pendingInternships?.length || 0) + (data.pendingUsers?.length || 0));
            } catch {
                toast.error("Failed to load approvals");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleGigAction = async (id: string, action: "approve" | "reject") => {
        setProcessing(id);
        try {
            const res = await fetch(`/api/founder/gigs/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            if (!res.ok) throw new Error("Failed");
            toast.success(action === "approve" ? "Gig approved ✓" : "Gig rejected");
            setGigs((prev) => prev.filter((g) => g.id !== id));
            setTotalPending((n) => n - 1);
        } catch {
            toast.error("Action failed");
        } finally {
            setProcessing(null);
        }
    };

    const handleInternshipAction = async (id: string, action: "approve" | "reject") => {
        setProcessing(id);
        try {
            const res = await fetch(`/api/founder/internships/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            if (!res.ok) throw new Error("Failed");
            toast.success(action === "approve" ? "Internship approved ✓" : "Internship rejected");
            setInternships((prev) => prev.filter((i) => i.id !== id));
            setTotalPending((n) => n - 1);
        } catch {
            toast.error("Action failed");
        } finally {
            setProcessing(null);
        }
    };

    const handleVerifyUser = async (id: string) => {
        setProcessing(id);
        try {
            const res = await fetch(`/api/founder/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "verify" }),
            });
            if (!res.ok) throw new Error("Failed");
            toast.success("User verified ✓");
            setUsers((prev) => prev.filter((u) => u.id !== id));
            setTotalPending((n) => n - 1);
        } catch {
            toast.error("Verification failed");
        } finally {
            setProcessing(null);
        }
    };

    const tabs: { id: Tab; label: string; count: number; icon: LucideIcon }[] = [
        { id: "gigs", label: "Gigs", count: gigs.length, icon: Briefcase },
        { id: "internships", label: "Internships", count: internships.length, icon: GraduationCap },
        { id: "users", label: "Users", count: users.length, icon: Users },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        <Shield className="text-amber-500" size={32} />
                        Pending <span className="text-amber-500">Approvals</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Review and approve gigs, internships, and user verifications.</p>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                    <AlertTriangle size={18} className="text-amber-500" />
                    <span className="font-black text-amber-400">
                        {loading ? "..." : totalPending} items awaiting review
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white/5 p-1 rounded-2xl w-fit">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${activeTab === tab.id ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300" }`}
                        >
                            <Icon size={15} />
                            {tab.label}
                            {tab.count > 0 && (
                                <span className="ml-1 px-2 py-0.5 bg-amber-500 text-[10px] font-black rounded-full">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Loading skeleton */}
            {loading && (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            )}

            {/* Content */}
            {!loading && (
                <AnimatePresence mode="wait">
                    {activeTab === "gigs" && (
                        <motion.div key="gigs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                            {gigs.length === 0 ? (
                                <EmptyState icon={Briefcase} message="No pending gig approvals" />
                            ) : gigs.map((gig) => (
                                <ApprovalCard
                                    key={gig.id}
                                    id={gig.id}
                                    title={gig.title}
                                    subtitle={`By ${gig.posterName} · ₹${gig.budget.toLocaleString()}`}
                                    description={gig.description}
                                    createdAt={gig.createdAt}
                                    isExpanded={expanded === gig.id}
                                    isProcessing={processing === gig.id}
                                    onToggle={() => setExpanded(expanded === gig.id ? null : gig.id)}
                                    onApprove={() => handleGigAction(gig.id, "approve")}
                                    onReject={() => handleGigAction(gig.id, "reject")}
                                />
                            ))}
                        </motion.div>
                    )}
                    {activeTab === "internships" && (
                        <motion.div key="internships" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                            {internships.length === 0 ? (
                                <EmptyState icon={GraduationCap} message="No pending internship approvals" />
                            ) : internships.map((i) => (
                                <ApprovalCard
                                    key={i.id}
                                    id={i.id}
                                    title={i.title}
                                    subtitle={`${i.company}${i.location ? ` · ${i.location}` : ""}${i.stipend ? ` · ₹${i.stipend.toLocaleString()}/mo` : ""}`}
                                    description={i.skills || "No skills listed"}
                                    createdAt={i.createdAt}
                                    isExpanded={expanded === i.id}
                                    isProcessing={processing === i.id}
                                    onToggle={() => setExpanded(expanded === i.id ? null : i.id)}
                                    onApprove={() => handleInternshipAction(i.id, "approve")}
                                    onReject={() => handleInternshipAction(i.id, "reject")}
                                />
                            ))}
                        </motion.div>
                    )}
                    {activeTab === "users" && (
                        <motion.div key="users" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                            {users.length === 0 ? (
                                <EmptyState icon={Users} message="No pending user verifications" />
                            ) : users.map((user) => (
                                <div key={user.id} className="bg-[#111116] rounded-2xl border border-white/10 p-5 flex items-center justify-between gap-4 hover:border-amber-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            <Users size={18} className="text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{user.name || "Unnamed User"}</p>
                                            <p className="text-slate-500">{user.email} · <span className="uppercase font-bold text-orange-500">{user.role}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-slate-400 hidden md:block">{new Date(user.createdAt).toLocaleDateString()}</p>
                                        <button
                                            onClick={() => handleVerifyUser(user.id)}
                                            disabled={processing === user.id}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                                        >
                                            <UserCheck size={15} /> Verify
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
}

function ApprovalCard({
    title, subtitle, description, createdAt,
    isExpanded, isProcessing, onToggle, onApprove, onReject
}: {
    id: string; title: string; subtitle: string; description: string;
    createdAt: string; isExpanded: boolean; isProcessing: boolean;
    onToggle: () => void; onApprove: () => void; onReject: () => void;
}) {
    return (
        <div className="bg-[#111116] rounded-2xl border border-white/10 overflow-hidden hover:border-amber-500/30 transition-all shadow-sm">
            <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-black text-white">{title}</h3>
                        <span className="px-2 py-0.5 bg-amber-500/10 rounded-full text-[10px] font-black">
                            Pending
                        </span>
                    </div>
                    <p className="text-slate-500 font-medium">{subtitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <p className="text-slate-400 hidden md:block">{new Date(createdAt).toLocaleDateString()}</p>
                    <button
                        onClick={onApprove}
                        disabled={isProcessing}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                    >
                        <CheckCircle size={13} /> Approve
                    </button>
                    <button
                        onClick={onReject}
                        disabled={isProcessing}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                    >
                        <XCircle size={13} /> Reject
                    </button>
                    <button
                        onClick={onToggle}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"
                    >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
            </div>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 pt-0 border-white/5">
                            <p className="text-slate-400 mt-4 leading-relaxed">{description}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
    return (
        <div className="bg-[#111116] rounded-3xl border border-white/5 py-20 text-center">
            <Icon size={48} className="mx-auto text-slate-700 mb-3" />
            <p className="font-bold text-white">{message}</p>
            <p className="text-slate-400 mt-1">All clear — nothing needs your attention here.</p>
        </div>
    );
}
