"use client"

import { Card } from "@/components/ui/Card"
import { ShieldCheck, Lock, Unlock, AlertCircle, Search, Filter, ArrowRight, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"

export default function EscrowLogicPage() {
    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <span className="w-8 h-1 bg-blue-500 rounded-full" />
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Platform Trust</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Escrow <span className="brand-name italic text-blue-600">Logic</span></h2>
                <p className="text-slate-500 font-medium">Monitoring secured payments and release conditions for all active gigs.</p>
            </div>

            {/* Shield Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden"
            >
                <div className="absolute right-0 top-0 p-10 opacity-10">
                    <ShieldCheck size={200} />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center mb-6">
                        <Lock size={20} className="text-white" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4">Secure Milestone System</h3>
                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                        Our escrow logic ensures that funds are locked the moment a gig is accepted, and only released when the student submits the proof of work and the client approves.
                    </p>
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={18} className="text-emerald-400" />
                            <span className="text-sm font-bold">₹12.4L Total Locked</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={18} className="text-emerald-400" />
                            <span className="text-sm font-bold">0.1% Dispute Rate</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Escrows */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Live Transactions</h3>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by ID..."
                                    className="pl-10 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 outline-none w-48"
                                />
                            </div>
                            <Button variant="outline" size="sm" className="rounded-xl">
                                <Filter size={14} className="mr-2" /> Filters
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {[
                            { id: "TX-9042", user: "Rahul S.", amount: "₹4,500", status: "Locked", project: "E-commerce UI" },
                            { id: "TX-8921", user: "Sneha P.", amount: "₹12,000", status: "Disputed", project: "React Dashboard" },
                            { id: "TX-9055", user: "Amit K.", amount: "₹2,800", status: "Locked", project: "API Integration" },
                            { id: "TX-9012", user: "Priya M.", amount: "₹7,500", status: "Releasing", project: "Logo Set" },
                        ].map((tx, i) => (
                            <Card key={i} className="p-6 border-none bg-white shadow-xl hover:shadow-2xl transition-all group rounded-3xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${tx.status === 'Disputed' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                            {tx.status === 'Locked' ? <Lock size={20} /> : tx.status === 'Disputed' ? <AlertCircle size={20} /> : <Unlock size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{tx.id}</p>
                                            <h4 className="font-bold text-slate-900">{tx.project}</h4>
                                            <p className="text-[10px] font-medium text-slate-500">Student: {tx.user}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-slate-900">{tx.amount}</p>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${tx.status === 'Locked' ? 'bg-blue-50 text-blue-600' :
                                                tx.status === 'Disputed' ? 'bg-red-50 text-red-600' :
                                                    'bg-emerald-50 text-emerald-600'
                                            }`}>
                                            {tx.status}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Automation Rules */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Platform Rules</h3>
                    <Card className="p-8 border-none bg-white shadow-xl rounded-[2.5rem]">
                        <div className="space-y-8">
                            {[
                                { title: "Auto-Lock", desc: "Lock 100% of gig value on acceptance.", active: true },
                                { title: "Verification Lag", desc: "48-hour hold after delivery approval.", active: true },
                                { title: "Dispute Pause", desc: "Immediate freeze on dispute flag.", active: true },
                                { title: "Tiered Cut", desc: "Apply 7-10% fee on release.", active: true },
                            ].map((rule, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="mt-1 h-5 w-5 rounded-full border-2 border-blue-500 flex items-center justify-center shrink-0">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">{rule.title}</h4>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{rule.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button className="w-full mt-10 rounded-2xl h-14 font-black shadow-lg shadow-blue-500/20">
                            Configure Rules <ArrowRight size={18} className="ml-2" />
                        </Button>
                    </Card>

                    <Card className="p-8 border-none bg-amber-50 rounded-[2.5rem] mt-6">
                        <div className="flex items-center gap-3 mb-4 text-amber-700">
                            <AlertCircle size={20} />
                            <h4 className="font-bold">Pending Disputes</h4>
                        </div>
                        <p className="text-xs text-amber-600 font-medium leading-relaxed mb-6">
                            There are currently 3 transactions flagged for manual review by the platform team.
                        </p>
                        <Button variant="outline" className="w-full rounded-2xl border-amber-200 text-amber-700 hover:bg-amber-100 font-bold">
                            Resolve Disputes
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    )
}
