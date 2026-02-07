"use client"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { CreditCard, Plus, Receipt, ExternalLink } from "lucide-react"

export default function ClientBillingPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Billing & <span className="text-electric italic">Subscription</span></h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your payment methods and invoices.</p>
                </div>
                <Button className="gap-2 rounded-xl bg-electric text-white hover:bg-blue-600 shadow-lg shadow-electric/20 font-bold h-12 px-6">
                    <Plus size={18} /> Add Payment Method
                </Button>
            </div>

            {/* Active Plan */}
            <Card className="p-8 border border-electric/20 bg-blue-50/50 dark:bg-blue-900/10 backdrop-blur-xl rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-electric/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
                    <div>
                        <span className="bg-electric text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider shadow-lg shadow-electric/20">Active Plan</span>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-4 tracking-tight">Professional Hiring</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 font-medium">Next renewal: <span className="text-slate-900 dark:text-white font-bold">Feb 25, 2026</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-4xl font-black text-slate-900 dark:text-white">₹4,999<span className="text-sm font-bold text-slate-500 dark:text-slate-400">/mo</span></p>
                        <Button variant="outline" size="sm" className="mt-4 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl h-10 px-6">
                            Upgrade Plan
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Payment Methods */}
                <Card className="p-8 border border-white/20 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm">
                    <h3 className="font-black text-lg mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
                        <CreditCard size={20} className="text-slate-400" /> Payment Methods
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-800/50 transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-14 bg-slate-100 dark:bg-slate-700/50 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">VISA</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Visa ending in 4242</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Expires 12/28</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-400/20">PRIMARY</span>
                        </div>
                    </div>
                </Card>

                {/* Billing Summary */}
                <Card className="p-8 border border-white/20 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm">
                    <h3 className="font-black text-lg mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
                        <Receipt size={20} className="text-slate-400" /> Recent Billing
                    </h3>
                    <div className="space-y-2">
                        {[
                            { id: 1, date: "Jan 25, 2026", amount: "₹4,999.00" },
                            { id: 2, date: "Dec 25, 2025", amount: "₹4,999.00" },
                        ].map((inv) => (
                            <div key={inv.id} className="flex items-center justify-between text-sm py-3 px-2 border-b border-slate-100 dark:border-slate-800 last:border-0 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer group">
                                <span className="text-slate-600 dark:text-slate-400 font-bold">{inv.date}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-slate-900 dark:text-white font-black">{inv.amount}</span>
                                    <button className="text-electric hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"><ExternalLink size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}
