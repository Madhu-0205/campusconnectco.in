"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { ArrowDownLeft, ArrowUpRight, Wallet, History, Clock, ShieldCheck, Zap, Plus, Loader2, Receipt } from "lucide-react"
import WithdrawalModal from "@/components/payments/WithdrawalModal"
import PaymentModal from "@/components/Payments-Modal"
import { AnimatePresence } from "framer-motion"

export default function WalletPage() {
    const [loading, setLoading] = useState(true)
    const [walletData, setWalletData] = useState<{ balance: number, lockedInEscrow: number, transactions: any[] } | null>(null)
    const [showWithdraw, setShowWithdraw] = useState(false)
    const [showPayment, setShowPayment] = useState(false)

    const fetchWallet = async () => {
        try {
            const res = await fetch("/api/user/wallet")
            if (res.ok) {
                const data = await res.json()
                setWalletData(data)
            }
        } catch (error) {
            console.error("Wallet fetch error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWallet()
    }, [])

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400 font-bold">
                <Loader2 className="animate-spin h-10 w-10 text-primary" />
                <p className="uppercase tracking-widest text-xs">Syncing secured transactions...</p>
            </div>
        )
    }

    const availableBalance = walletData?.balance || 0
    const lockedInEscrow = walletData?.lockedInEscrow || 0
    const transactions = walletData?.transactions || []

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-2 mb-8">
                <div className="flex items-center gap-2">
                    <span className="w-8 h-1 bg-electric rounded-full" />
                    <span className="text-xs font-bold text-electric uppercase tracking-widest">Financial Hub</span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Your <span className="text-electric italic">Finances</span></h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your earnings, escrows, and payouts.</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Button
                            onClick={() => setShowPayment(true)}
                            className="rounded-2xl font-black bg-electric text-white hover:bg-blue-600 shadow-xl shadow-electric/20 px-6 h-12 flex-1 md:flex-none"
                        >
                            <Plus className="mr-2 h-5 w-5" /> Add Funds
                        </Button>
                        <Button variant="outline" className="rounded-2xl font-bold bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all px-6 h-12 flex-1 md:flex-none text-slate-900 dark:text-white">
                            <History className="mr-2 h-4 w-4 text-electric" /> Full History
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Wallet Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Balance Card */}
                <Card className="lg:col-span-2 bg-slate-900 dark:bg-slate-950 text-white p-8 md:p-12 rounded-[2.5rem] border border-slate-800 dark:border-slate-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-electric/20 rounded-full blur-[80px]" />
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/50 to-transparent" />

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 text-electric">
                                    <Wallet size={24} />
                                </div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Balance Available</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-emerald-400">₹</span>
                                    <h3 className="text-7xl md:text-8xl font-black text-white tracking-tighter">
                                        {availableBalance.toLocaleString()}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 mt-14">
                            <Button
                                onClick={() => setShowWithdraw(true)}
                                disabled={availableBalance <= 0}
                                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-6 px-8 rounded-2xl h-auto text-lg shadow-[0_20px_40px_-12px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.02] flex-1"
                            >
                                Withdraw Funds
                            </Button>
                            <Button variant="ghost" className="text-white border border-white/10 bg-white/5 hover:bg-white/10 font-bold py-6 px-8 rounded-2xl h-auto backdrop-blur-md flex-1">
                                Secure Topup
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Quick Info Sidebar */}
                <div className="space-y-6">
                    <Card className="bg-linear-to-br from-indigo-600 to-purple-600 text-white border-none p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 p-4 opacity-10 rotate-12 transition-transform duration-700 group-hover:rotate-0">
                            <ShieldCheck size={120} />
                        </div>
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <h4 className="font-black text-xl mb-6 flex items-center gap-3 relative z-10">
                            <ShieldCheck className="h-6 w-6 text-indigo-200" /> Escrow Safe
                        </h4>
                        <div className="relative z-10">
                            <div className="text-5xl font-black text-white mb-1">₹{lockedInEscrow.toLocaleString()}</div>
                            <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em]">Currently In Escrow</p>
                        </div>
                    </Card>

                    <Card className="p-8 rounded-[2.5rem] border border-white/20 dark:border-slate-800 shadow-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
                        <div className="flex justify-between items-start mb-6">
                            <h4 className="font-black text-slate-900 dark:text-white text-lg">Platform XP</h4>
                            <div className="text-right">
                                <span className="text-2xl font-black text-electric">850</span>
                                <span className="text-[10px] block font-black text-slate-400 uppercase tracking-widest">Trust Points</span>
                            </div>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
                            <div className="bg-electric h-full w-[85%] rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                        </div>
                    </Card>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="pt-12">
                <h3 className="font-black text-3xl text-slate-900 dark:text-white tracking-tight mb-8 px-2 flex items-center gap-3">
                    <Receipt className="text-slate-400" /> Financial <span className="text-electric italic">Ledger</span>
                </h3>
                <div className="grid gap-4">
                    {transactions.length > 0 ? transactions.map((tx: any) => (
                        <Card key={tx.id} className="p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-800 rounded-[2rem] hover:shadow-xl transition-all group hover:bg-white/80 dark:hover:bg-slate-800/80">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${tx.type === 'DEPOSIT' || tx.type === 'ESCROW_RELEASE'
                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                        }`}>
                                        {tx.type === 'DEPOSIT' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white text-lg">{tx.type.replace('_', ' ')}</p>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${tx.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                {tx.status}
                                            </span>
                                            <span className="text-xs text-slate-400 font-bold">• {new Date(tx.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-2xl font-black ${tx.type === 'DEPOSIT' || tx.type === 'ESCROW_RELEASE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                                        }`}>
                                        {tx.type === 'DEPOSIT' || tx.type === 'ESCROW_RELEASE' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )) : (
                        <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <History className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
                            <p className="text-slate-400 dark:text-slate-500 font-black text-lg">No transactions recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showWithdraw && (
                    <WithdrawalModal
                        onClose={() => { setShowWithdraw(false); fetchWallet(); }}
                        availableBalance={availableBalance}
                    />
                )}
                {showPayment && (
                    <PaymentModal
                        onClose={() => { setShowPayment(false); fetchWallet(); }}
                        method="razorpay"
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
