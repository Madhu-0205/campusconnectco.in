import { ArrowLeft, TrendingUp, DollarSign, Percent, ShieldCheck, Activity } from"lucide-react";
import Link from"next/link";
import React from"react";

import prisma from"@/lib/prisma";

export const dynamic ="force-dynamic";

export default async function RevenuePage() {
 let totalRevenue = 0;
 let lockedCommission = 0;
 let completedPayoutsVolume = 0;
 let recentTransactions: any[] = [];

 try {
 // Fetch completed escrows to calculate released revenue (platformFee)
 const escrows = await prisma.escrow.findMany({
 include: {
 client: { select: { name: true, email: true } },
 worker: { select: { name: true, email: true } },
 gig: { select: { title: true } }
 },
 take: 100,
 orderBy: { createdAt:"desc" }
 });

 // Fetch general transactions
 const transactions = await prisma.transaction.findMany({
 include: {
 buyer: { select: { name: true, email: true } }
 },
 take: 100,
 orderBy: { createdAt:"desc" }
 });

 // Compute metrics
 escrows.forEach((esc: any) => {
 if (esc.status ==="RELEASED") {
 totalRevenue += esc.platformFee;
 completedPayoutsVolume += esc.payout;
 } else if (esc.status ==="LOCKED") {
 lockedCommission += esc.platformFee;
 }
 });

 transactions.forEach((tx: any) => {
 if (tx.status ==="RELEASED" || tx.status ==="COMPLETED") {
 totalRevenue += Number(tx.platformFee);
 }
 });

 // Compile combined recent transactions/fees list
 recentTransactions = [
 ...escrows.map((esc: any) => ({
 id: esc.id,
 date: esc.createdAt,
 title: esc.gig?.title ||"Escrow Contract",
 type:"Escrow Platform Fee",
 user: esc.client?.name || esc.client?.email ||"Unknown Client",
 amount: esc.amount,
 fee: esc.platformFee,
 status: esc.status
 })),
 ...transactions.map((tx: any) => ({
 id: tx.id,
 date: tx.createdAt,
 title: tx.description ||"Direct Transaction",
 type:"Direct Payout Fee",
 user: tx.buyer?.name || tx.buyer?.email ||"Unknown Buyer",
 amount: Number(tx.amount),
 fee: Number(tx.platformFee),
 status: tx.status
 }))
 ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

 } catch (error) {
 console.error("[Revenue Dashboard Query Failed]:", error);
 }

 return (
 <div className="min-h-screen text-slate-100 p-6 md:p-12" style={{ background:"var(--color-background)", fontFamily:"var(--font-body)" }}>
 <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
 
 {/* Back button & Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <Link href="/dashboard/founder" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold mb-3">
 <ArrowLeft size={16} />
 Back to Command Center
 </Link>
 <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
 Revenue <span className="text-emerald-400">Command Center</span>
 </h1>
 <p className="text-slate-500 font-medium mt-1">Platform earnings, commission logs, and transactional fees audits.</p>
 </div>
 </div>

 {/* Metrics Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {[
 { label:"Total Revenue Earned", value: `₹${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, desc:"Collected platform fees (10%)", color:"text-emerald-400" },
 { label:"Locked Commissions", value: `₹${lockedCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, desc:"Held in active escrows", color:"text-blue-400" },
 { label:"Commission Rate", value:"10.0%", icon: Percent, desc:"Flat platform commission", color:"text-amber-400" },
 { label:"Payouts Settled", value: `₹${completedPayoutsVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: ShieldCheck, desc:"Total funds successfully released", color:"text-primary" },
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

 {/* Recent Logs Table */}
 <div className="bg-[#111116] border border-white/5 rounded-2xl p-6 shadow-sm">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-2">
 <Activity size={18} className="text-emerald-400" />
 <h2 className="text-xl font-black text-white">Recent Earnings Ledger</h2>
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-white/5 text-slate-400 text-xs font-black uppercase tracking-widest">
 <th className="pb-3 font-black">Date</th>
 <th className="pb-3 font-black">Source</th>
 <th className="pb-3 font-black">Type</th>
 <th className="pb-3 font-black">User</th>
 <th className="pb-3 font-black text-right">Volume</th>
 <th className="pb-3 font-black text-right text-emerald-400">Fee Earned</th>
 <th className="pb-3 font-black text-center">Status</th>
 </tr>
 </thead>
 <tbody>
 {recentTransactions.length === 0 ? (
 <tr>
 <td colSpan={7} className="text-center text-slate-500 py-8 font-bold">
 No recent transactions found on the database.
 </td>
 </tr>
 ) : (
 recentTransactions.map((tx) => (
 <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm text-slate-300">
 <td className="py-3.5 font-medium">{new Date(tx.date).toLocaleDateString()}</td>
 <td className="py-3.5 font-black text-white">{tx.title}</td>
 <td className="py-3.5 font-medium text-slate-400">{tx.type}</td>
 <td className="py-3.5 font-medium">{tx.user}</td>
 <td className="py-3.5 text-right font-black">₹{tx.amount.toLocaleString()}</td>
 <td className="py-3.5 text-right font-black text-emerald-400">₹{tx.fee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
 <td className="py-3.5 text-center">
 <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
 tx.status ==="RELEASED" || tx.status ==="COMPLETED"
 ?"bg-emerald-500/20 text-emerald-400"
 : tx.status ==="LOCKED" || tx.status ==="PAID"
 ?"bg-blue-500/20 text-blue-400"
 :"bg-amber-500/20 text-amber-400"
 }`}>
 {tx.status}
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
