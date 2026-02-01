"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { ArrowDownLeft, ArrowUpRight, Wallet, History, Clock, ShieldCheck, Zap } from "lucide-react"

export default function WalletPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#f0f9ff]/30 p-8 rounded-[3rem]">
            <div className="flex flex-col gap-2 mb-8">
                <div className="flex items-center gap-2">
                    <span className="w-8 h-1 bg-electric rounded-full" />
                    <span className="text-xs font-bold text-electric uppercase tracking-widest">Financial Hub</span>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Your <span className="brand-name italic">Finances</span></h2>
                        <p className="text-slate-500 font-medium">Manage your earnings, escrows, and payouts.</p>
                    </div>
                    <Button variant="outline" className="rounded-2xl font-bold bg-white/50 backdrop-blur-md border-slate-200 hover:bg-slate-50 transition-all px-6">
                        <History className="mr-2 h-4 w-4 text-electric" /> Transaction History
                    </Button>
                </div>
            </div>

            {/* Main Wallet Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Balance Card - Now larger and more vibrant */}
                <Card className="lg:col-span-2 bg-slate-950 text-white p-8 md:p-12 rounded-5xl border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                    {/* Abstract Shapes */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-electric/20 rounded-full blur-[80px] group-hover:bg-electric/30 transition-colors duration-700" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
                                    <Wallet className="text-electric" size={24} />
                                </div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">CampusConnect Wallet</p>
                            </div>

                            <div className="space-y-4">
                                <p className="text-slate-400 text-sm font-medium">Available for withdrawal</p>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">₹</span>
                                    <h3 className="text-7xl md:text-8xl font-black text-emerald-400 tracking-tighter drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">1,250.00</h3>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 mt-10">
                                <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-sm font-black text-emerald-400 shadow-inner">
                                    <ArrowDownLeft size={16} />
                                    <span>+₹4,500.00 this week</span>
                                </div>
                                <div className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl text-sm font-black text-cyan-400 shadow-inner relative group/fee">
                                    <Zap size={16} />
                                    <span>7-10% Service Tax Applied</span>
                                    <div className="absolute bottom-full left-0 mb-2 w-64 p-4 bg-slate-900 border border-slate-800 rounded-2xl hidden group-hover/fee:block z-50 shadow-2xl">
                                        <p className="text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Transparent Commission</p>
                                        <div className="space-y-1 text-xs text-white">
                                            <div className="flex justify-between"><span>Below ₹1,000</span> <span className="text-emerald-400">10%</span></div>
                                            <div className="flex justify-between"><span>₹1,000 - ₹5,000</span> <span className="text-emerald-400">8.5%</span></div>
                                            <div className="flex justify-between"><span>Above ₹5,000</span> <span className="text-emerald-400">7%</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 mt-14">
                            <Button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-8 px-12 rounded-4xl h-auto text-xl shadow-[0_20px_40px_-12px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.05] active:scale-[0.95]">
                                Withdraw Funds
                            </Button>
                            <Button variant="glass" className="text-white border-white/10 bg-white/5 hover:bg-white/10 font-black py-8 px-12 rounded-4xl h-auto backdrop-blur-md transition-all">
                                Payment Methods
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Quick Info Sidebar */}
                <div className="space-y-6">
                    <Card className="bg-linear-to-br from-emerald-600 to-teal-500 text-white border-none p-8 rounded-5xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 p-4 opacity-10 group-hover:scale-120 transition-transform duration-500">
                            <ShieldCheck size={120} />
                        </div>
                        <h4 className="font-black text-xl mb-6 flex items-center gap-3 relative z-10">
                            <ShieldCheck className="h-6 w-6 text-emerald-200" /> Escrow Security
                        </h4>
                        <p className="text-emerald-50 text-base leading-relaxed mb-8 relative z-10 font-medium">
                            Your payments are securely encrypted and held until project approval.
                        </p>
                        <div className="relative z-10">
                            <div className="text-5xl font-black text-white drop-shadow-lg mb-1">₹8,500</div>
                            <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Currently Protected</p>
                        </div>
                    </Card>

                    <Card className="p-8 rounded-5xl border-slate-100 shadow-xl bg-[#e0f2fe] backdrop-blur-xl group">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-black text-slate-900 text-lg">Network Trust</h4>
                            <div className="flex flex-col items-end">
                                <span className="text-2xl font-black text-emerald-600">4.9/5.0</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Rank</span>
                            </div>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full mb-4 overflow-hidden shadow-inner flex">
                            <div className="bg-emerald-500 h-full w-[85%] rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] group-hover:w-[88%] transition-all duration-1000" />
                        </div>
                        <div className="flex justify-between text-[11px] font-black text-slate-600 uppercase tracking-tighter">
                            <span className="flex items-center gap-1"><Zap size={12} className="text-emerald-500" /> Trust Score: 85%</span>
                            <span className="text-emerald-600">850 / 1000 Total XP</span>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="pt-12">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h3 className="font-black text-3xl text-slate-900 tracking-tight">Recent <span className="text-emerald-500">Activity</span></h3>
                        <p className="text-slate-500 font-medium">Your latest financial movements with numeric reliability.</p>
                    </div>
                    <button className="text-emerald-600 text-sm font-black hover:underline underline-offset-4" suppressHydrationWarning>View Full Statement</button>
                </div>
                <div className="grid gap-5">
                    {[
                        { id: 1, type: "Payment Received", from: "TechNova Inc", amount: "+₹5,000.00", status: "Verified 1.0", date: "Today, 2:30 PM", icon: ArrowDownLeft, color: "text-emerald-500", bg: "bg-emerald-50", amountColor: "text-emerald-600", category: "created" },
                        { id: 4, type: "Escrow Pending", from: "Beta Labs Project", amount: "+₹3,000.00", status: "Dual Confirmation: 50%", date: "Jan 20, 2026", icon: Clock, color: "text-amber-500", bg: "bg-amber-50", amountColor: "text-amber-600", category: "pending", breakdown: { gross: "3,000", fee: "255", net: "2,745", rate: "8.5%" } },
                        { id: 2, type: "Withdrawal", from: "To Bank Account ****4567", amount: "-₹2,000.00", status: "98% Syncing", date: "Yesterday", icon: ArrowUpRight, color: "text-orange-500", bg: "bg-orange-50", amountColor: "text-orange-600", category: "withdrawal" },
                        { id: 3, type: "System Fee", from: "CampusConnect Platform", amount: "-₹150.00", status: "Processed", date: "Yesterday", icon: ArrowUpRight, color: "text-red-500", bg: "bg-red-50", amountColor: "text-red-600", category: "debited" },
                    ].map((tx) => (
                        <Card key={tx.id} className="flex flex-col p-6 hover:shadow-2xl transition-all duration-500 border-slate-100 rounded-3xl group cursor-pointer bg-[#e0f2fe] gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 ${tx.bg} ${tx.color}`}>
                                        <tx.icon size={28} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-lg leading-tight">{tx.type}</p>
                                        <p className="text-sm text-slate-500 font-bold">{tx.from}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-2xl font-black ${tx.amountColor} tracking-tighter`}>{tx.amount}</p>
                                    <div className="flex items-center justify-end gap-3 mt-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${tx.category === 'created' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : tx.category === 'debited' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : tx.category === 'pending' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'} ${tx.category === 'pending' ? 'animate-pulse' : ''}`} />
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{tx.status}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {tx.category === 'pending' && tx.breakdown && (
                                <div className="mt-2 p-4 bg-white/40 rounded-2xl border border-white/20">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Earnings Breakdown</span>
                                        <span className="text-[10px] font-black text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Awaiting Dual Confirmation</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Gross</p>
                                            <p className="text-sm font-black text-slate-900">₹{tx.breakdown.gross}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Comm ({tx.breakdown.rate})</p>
                                            <p className="text-sm font-black text-rose-600">-₹{tx.breakdown.fee}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Net Pay</p>
                                            <p className="text-sm font-black text-emerald-600">₹{tx.breakdown.net}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
