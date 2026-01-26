"use client"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { CreditCard, Plus, Receipt, ExternalLink } from "lucide-react"

export default function ClientBillingPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Billing & Subscription</h2>
                    <p className="text-slate-500">Manage your payment methods and invoices.</p>
                </div>
                <Button className="gap-2">
                    <Plus size={18} /> Add Payment Method
                </Button>
            </div>

            {/* Active Plan */}
            <Card className="p-6 border-primary/20 bg-primary/5">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Active Plan</span>
                        <h3 className="text-2xl font-bold text-slate-900 mt-2">Professional Hiring</h3>
                        <p className="text-slate-600 text-sm mt-1">Next renewal: Feb 25, 2026</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-slate-900">₹4,999<span className="text-sm font-normal text-slate-500">/mo</span></p>
                        <Button variant="outline" size="sm" className="mt-3">Upgrade Plan</Button>
                    </div>
                </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Payment Methods */}
                <Card className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <CreditCard size={20} className="text-slate-400" /> Payment Methods
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-12 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold">VISA</div>
                                <div>
                                    <p className="text-sm font-medium">Visa ending in 4242</p>
                                    <p className="text-xs text-slate-400">Expires 12/28</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Primary</span>
                        </div>
                    </div>
                </Card>

                {/* Billing Summary */}
                <Card className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Receipt size={20} className="text-slate-400" /> Recent Billing
                    </h3>
                    <div className="space-y-3">
                        {[
                            { id: 1, date: "Jan 25, 2026", amount: "₹4,999.00" },
                            { id: 2, date: "Dec 25, 2025", amount: "₹4,999.00" },
                        ].map((inv) => (
                            <div key={inv.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0 font-medium">
                                <span className="text-slate-600">{inv.date}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-slate-900">{inv.amount}</span>
                                    <button className="text-primary hover:underline"><ExternalLink size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}
