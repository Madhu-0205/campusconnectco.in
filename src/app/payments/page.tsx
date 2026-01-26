"use client";

import { useState, useEffect } from "react";
import FinancialChart from "@/components/Analytics/FinancialChart";
import MonthlyComparison from "@/components/Analytics/MonthlyComparison";
import PaymentModal from "@/components/Payments-Modal";
import WithdrawalModal from "@/components/payments/WithdrawalModal";
import { ArrowUpRight, ArrowDownLeft, CreditCard, DollarSign, Wallet, Smartphone, Building2, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

interface Transaction {
    id: string;
    amount: number;
    type: string;
    status: string;
    description: string;
    createdAt: string;
}

interface Stats {
    totalEarnings: number;
    pendingPayouts: number;
    availableBalance: number;
}

export default function Payments() {
    const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking' | 'razorpay' | null>(null);
    const [showWithdrawal, setShowWithdrawal] = useState(false);
    const [data, setData] = useState<{ transactions: Transaction[], stats: Stats } | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/transactions");
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error("Failed to fetch payments data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const stats = data?.stats || { totalEarnings: 0, pendingPayouts: 0, availableBalance: 0 };
    const transactions = data?.transactions || [];

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-12 pb-20 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatePresence>
                    {selectedMethod && (
                        <PaymentModal
                            onClose={() => setSelectedMethod(null)}
                            method={selectedMethod}
                        />
                    )}
                    {showWithdrawal && (
                        <WithdrawalModal
                            onClose={() => {
                                setShowWithdrawal(false);
                                fetchData();
                            }}
                            availableBalance={stats.availableBalance}
                        />
                    )}
                </AnimatePresence>

                <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Secure Payments</span>
                            <div className="h-1 w-1 bg-slate-300 rounded-full" />
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">v2.1.0</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight">Financial <span className="text-slate-400">Hub</span></h1>
                        <p className="text-slate-500 font-bold">Manage your ecosystem earnings and instant payouts.</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <button
                            onClick={() => setSelectedMethod('upi')}
                            className="flex-1 md:flex-none bg-white hover:bg-slate-50 text-slate-900 px-8 py-5 rounded-[2rem] font-black transition-all active:scale-95 shadow-xl shadow-slate-200/50 flex items-center justify-center gap-3 border border-slate-200"
                        >
                            <ArrowUpRight size={20} className="text-emerald-500" />
                            Add Funds
                        </button>
                        <button
                            onClick={() => setShowWithdrawal(true)}
                            className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 text-white px-8 py-5 rounded-[2rem] font-black transition-all active:scale-95 shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 border border-slate-800"
                        >
                            <ArrowDownLeft size={20} className="text-rose-400" />
                            Withdraw Funds
                        </button>
                    </div>
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatCard
                        label="Total Earnings"
                        amount={`₹${stats.totalEarnings.toLocaleString()}`}
                        change="+12.5%"
                        icon={DollarSign}
                        color="bg-emerald-500"
                        loading={loading}
                    />
                    <StatCard
                        label="Available Balance"
                        amount={`₹${stats.availableBalance.toLocaleString()}`}
                        change="Ready to payout"
                        icon={ShieldCheck}
                        color="bg-slate-900"
                        loading={loading}
                    />
                    <StatCard
                        label="Pending Payouts"
                        amount={`₹${stats.pendingPayouts.toLocaleString()}`}
                        change="Processing"
                        icon={Clock}
                        color="bg-amber-500"
                        loading={loading}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Revenue Analytics</h2>
                            <div className="flex gap-2">
                                <span className="p-2 bg-slate-50 rounded-xl text-slate-400"><Clock size={16} /></span>
                            </div>
                        </div>
                        <div className="h-[350px] w-full">
                            <FinancialChart />
                        </div>
                    </div>
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Monthly Growth</h2>
                        <div className="h-[350px] w-full">
                            <MonthlyComparison />
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex justify-between items-center mb-8 px-2">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Activity</h2>
                        <button className="text-slate-400 text-xs font-black hover:text-slate-900 uppercase tracking-widest transition-colors">Export CSV</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="pb-4 pl-4 font-black text-xs text-slate-400 uppercase tracking-widest">Transaction</th>
                                    <th className="pb-4 font-black text-xs text-slate-400 uppercase tracking-widest">Type</th>
                                    <th className="pb-4 font-black text-xs text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="pb-4 font-black text-xs text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                    <th className="pb-4 pr-4 font-black text-xs text-slate-400 uppercase tracking-widest text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan={5} className="py-8 text-center text-slate-400 font-bold">Loading transactions...</td></tr>
                                ) : transactions.length === 0 ? (
                                    <tr><td colSpan={5} className="py-8 text-center text-slate-400 font-bold">No transactions yet</td></tr>
                                ) : (
                                    transactions.map((tx) => {
                                        const isCredit = ["DEPOSIT", "ESCROW_RELEASE"].includes(tx.type);
                                        return (
                                            <tr key={tx.id} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="py-5 pl-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-3 rounded-2xl ${isCredit ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                                            {isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 text-sm">{tx.description || tx.type.replace("_", " ")}</p>
                                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{tx.id.slice(-8)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-5">
                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${tx.type.includes("ESCROW") ? "bg-indigo-50 text-indigo-500" :
                                                            tx.type === "WITHDRAWAL" ? "bg-amber-50 text-amber-500" : "bg-slate-100 text-slate-500"
                                                        }`}>
                                                        {tx.type.replace("_", " ")}
                                                    </span>
                                                </td>
                                                <td className="py-5 text-sm font-bold text-slate-500">
                                                    {new Date(tx.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className={`py-5 text-right font-black text-sm ${isCredit ? 'text-emerald-500' : 'text-slate-900'}`}>
                                                    {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                                </td>
                                                <td className="py-5 pr-4 text-right">
                                                    <div className="flex justify-end">
                                                        {tx.status === "COMPLETED" ? (
                                                            <CheckCircle2 size={18} className="text-emerald-500" />
                                                        ) : (
                                                            <Clock size={18} className="text-amber-500" />
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, amount, change, icon: Icon, color, loading }: any) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-[1.5rem] ${color} text-white shadow-xl shadow-slate-900/20`}>
                    <Icon size={24} />
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Growth</span>
                    <span className="text-emerald-500 font-black text-xs">{change}</span>
                </div>
            </div>
            <div>
                <p className="text-slate-500 font-black text-xs uppercase tracking-widest mb-1">{label}</p>
                {loading ? (
                    <div className="h-10 w-32 bg-slate-100 animate-pulse rounded-lg" />
                ) : (
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{amount}</h3>
                )}
            </div>
        </motion.div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
        PENDING: "bg-amber-50 text-amber-600 border-amber-100",
        FAILED: "bg-rose-50 text-rose-600 border-rose-100",
    };

    return (
        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border uppercase tracking-widest ${styles[status] || styles.PENDING}`}>
            {status}
        </span>
    );
}
