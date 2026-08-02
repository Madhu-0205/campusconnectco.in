import { ArrowLeft, Lock, ShieldCheck, RefreshCw, Activity } from "lucide-react";
import Link from "next/link";
import React from "react";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EscrowPage() {
    let lockedVolume = 0;
    let releasedVolume = 0;
    let refundedVolume = 0;
    let escrowsList: any[] = [];

    try {
        const escrows = await prisma.escrow.findMany({
            include: {
                client: { select: { name: true, email: true } },
                worker: { select: { name: true, email: true } },
                gig: { select: { title: true } }
            },
            take: 100,
            orderBy: { createdAt: "desc" }
        });

        escrowsList = escrows;

        escrows.forEach((esc: any) => {
            if (esc.status === "LOCKED") {
                lockedVolume += esc.amount;
            } else if (esc.status === "RELEASED") {
                releasedVolume += esc.amount;
            } else if (esc.status === "REFUNDED") {
                refundedVolume += esc.amount;
            }
        });

    } catch (error) {
        console.error("[Escrow Dashboard Query Failed]:", error);
    }

    return (
        <div className="min-h-screen text-slate-100 p-6 md:p-12" style={{ background: "var(--color-background)", fontFamily: "var(--font-body)" }}>
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Back button & Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link href="/dashboard/founder" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold mb-3">
                            <ArrowLeft size={16} />
                            Back to Command Center
                        </Link>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
                            Escrow <span className="text-violet-400">Liquidity Ledger</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Monitor locked gig balances, dispute locks, and completed milestones.</p>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Active Locked Liquidity", value: `₹${lockedVolume.toLocaleString()}`, icon: Lock, desc: "Secured funds for in-progress work", color: "text-violet-400" },
                        { label: "Total Released", value: `₹${releasedVolume.toLocaleString()}`, icon: ShieldCheck, desc: "Successfully settled transactions", color: "text-emerald-400" },
                        { label: "Refunded Volume", value: `₹${refundedVolume.toLocaleString()}`, icon: RefreshCw, desc: "Returned to clients on cancels/disputes", color: "text-rose-400" },
                        { label: "Total Escrow Contracts", value: String(escrowsList.length), icon: Activity, desc: "Cumulative active & closed escrows", color: "text-blue-400" },
                    ].map((card, idx) => (
                        <div key={idx} className="bg-[#111116] border border-white/5 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                            <div className="flex items-start justify-between">
                                <span className="text-slate-400 text-sm font-black uppercase tracking-wider">{card.label}</span>
                                <card.icon size={22} className={card.color} />
                            </div>
                            <div className="mt-4">
                                <span className="text-2xl md:text-3xl font-black text-white">{card.value}</span>
                                <p className="text-slate-500 text-xs mt-1.5 font-bold">{card.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Escrow Contract Table */}
                <div className="bg-[#111116] border border-white/5 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Lock size={18} className="text-violet-400" />
                            <h2 className="text-xl font-black text-white">Escrow Liquidity Ledger</h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-slate-400 text-xs font-black uppercase tracking-widest">
                                    <th className="pb-3 font-black">Date</th>
                                    <th className="pb-3 font-black">Gig Title</th>
                                    <th className="pb-3 font-black">Client (Depositor)</th>
                                    <th className="pb-3 font-black">Student (Payee)</th>
                                    <th className="pb-3 font-black text-right">Locked Amount</th>
                                    <th className="pb-3 font-black text-right text-violet-400">Fee Split</th>
                                    <th className="pb-3 font-black text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {escrowsList.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center text-slate-500 py-8 font-bold">
                                            No active escrow contracts found on the database.
                                        </td>
                                    </tr>
                                ) : (
                                    escrowsList.map((esc) => (
                                        <tr key={esc.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm text-slate-300">
                                            <td className="py-3.5 font-medium">{new Date(esc.createdAt).toLocaleDateString()}</td>
                                            <td className="py-3.5 font-black text-white">{esc.gig?.title || "Gig Contract"}</td>
                                            <td className="py-3.5 font-medium">{esc.client?.name || esc.client?.email || "Unknown Client"}</td>
                                            <td className="py-3.5 font-medium">{esc.worker?.name || esc.worker?.email || "Unknown Student"}</td>
                                            <td className="py-3.5 text-right font-black">₹{esc.amount.toLocaleString()}</td>
                                            <td className="py-3.5 text-right font-black text-violet-400">₹{esc.platformFee.toLocaleString()}</td>
                                            <td className="py-3.5 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    esc.status === "RELEASED"
                                                        ? "bg-emerald-500/20 text-emerald-400"
                                                        : esc.status === "LOCKED"
                                                        ? "bg-violet-500/20 text-violet-400"
                                                        : "bg-rose-500/20 text-rose-400"
                                                }`}>
                                                    {esc.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
