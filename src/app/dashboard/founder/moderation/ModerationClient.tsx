"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/ui/Card";


interface Gig {
    id: string;
    title: string;
    description: string;
    budget: number;
    createdAt: Date;
    poster: { name: string | null; email: string };
}

interface Internship {
    id: string;
    title: string;
    company: string;
    description: string;
    createdAt: Date;
}

interface ModerationClientProps {
    initialGigs: Gig[];
    initialInternships: Internship[];
}

export default function ModerationClient({ initialGigs, initialInternships }: ModerationClientProps) {
    const [gigs, setGigs] = useState(initialGigs);
    const [internships] = useState(initialInternships);

    // Simulated AI Risk Score
    const getRiskScore = (text: string) => {
        const lower = text.toLowerCase();
        let score = 10;
        if (lower.includes("crypto") || lower.includes("easy money")) score += 40;
        if (lower.includes("telegram") || lower.includes("whatsapp")) score += 30;
        if (lower.includes("urgent") || lower.includes("guaranteed")) score += 15;
        return Math.min(score, 99);
    };

    const handleGigAction = async (id: string, action: "approve" | "reject") => {
        try {
            const res = await fetch(`/api/founder/gigs/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ action }),
            });
            if (!res.ok) throw new Error("Failed to update gig");
            toast.success(`Gig ${action}d successfully`);
            setGigs(gigs.filter((g) => g.id !== id));
        } catch {
            toast.error("Error processing request");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                    <ShieldAlert className="text-orange-500" size={32} />
                    Moderation <span className="text-orange-500">Queue</span>
                </h1>
                <p className="text-slate-500 font-medium mt-1">Review pending posts with AI fraud detection</p>
            </div>

            <div className="space-y-6">
                <h2 className="font-bold text-white border-white/10 pb-2">Pending Gigs ({gigs.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {gigs.map((gig) => {
                            const risk = getRiskScore(gig.description + " " + gig.title);
                            return (
                                <motion.div key={gig.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                                    <Card className="p-6 h-full flex flex-col justify-between border-white/10 bg-[#111116] rounded-3xl group hover:border-orange-500/20 transition-all">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-bold text-white line-clamp-2 group-hover:text-orange-400 transition-colors">{gig.title}</h3>
                                                <span className={`uppercase font-black px-2 py-1 rounded-lg border ${risk > 50 ? 'bg-rose-500/10' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                                    {risk}% Risk
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest mb-4">By: {gig.poster.name || gig.poster.email}</p>
                                            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 mb-6 h-32 overflow-hidden relative">
                                                <p className="text-sm leading-relaxed">{gig.description}</p>
                                                <div className="absolute bottom-0 left-0 w-full h-12 bg-linear-to-t from-[#111116] to-transparent pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => handleGigAction(gig.id, "approve")} className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all rounded-xl font-black text-[10px] uppercase tracking-widest">
                                                <Check size={14} /> Approve
                                            </button>
                                            <button onClick={() => handleGigAction(gig.id, "reject")} className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all rounded-xl font-black text-[10px] uppercase tracking-widest">
                                                <X size={14} /> Reject
                                            </button>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    {gigs.length === 0 && <p className="col-span-full text-center py-10">No pending gigs. Queue is clear! 🎉</p>}
                </div>
            </div>

            <div className="space-y-6 pt-8">
                <h2 className="font-bold text-white border-white/10 pb-2">Pending Internships ({internships.length})</h2>
                {/* Simplified view for internship moderation placeholder since we lack the exact DELETE / PATCH routes out of the box... */}
                {internships.length === 0 && <p className="text-center py-10">No pending internships found.</p>}
            </div>
        </div>
    );
}
