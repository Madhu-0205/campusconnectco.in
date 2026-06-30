"use client";

import { Bell, ShieldAlert, UserX, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function NotificationsPage() {
    // Simulated system notification logs based on the prompt's requirements
    const [alerts] = useState([
        { id: 1, type: "fraud", icon: ShieldAlert, color: "text-red-500 bg-red-500/10", title: "Suspicious Payment Pattern", time: "10 mins ago", desc: "User 4092 rapidly engaged 4 high-value escrow locks within 15 minutes." },
        { id: 2, type: "report", icon: UserX, color: "text-orange-500 bg-orange-500/10", title: "Reported User Account", time: "1 hr ago", desc: "A gig creator was reported 3 times today for potentially fraudulent &apos;Crypto&apos; gigs." },
        { id: 3, type: "dispute", icon: AlertTriangle, color: "text-amber-500 bg-amber-500/10", title: "Payment Dispute Triggered", time: "3 hrs ago", desc: "Escrow funds locked. Client &apos;Acme Corp&apos; disputes completion with Worker &apos;ajay&apos;." },
        { id: 4, type: "system", icon: Bell, color: "text-blue-500 bg-blue-500/10", title: "Scheduled Maintenance Window", time: "Yesterday", desc: "Database replica will be indexed at 3 AM tonight. Expected downtime: < 1 minute." }
    ]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="md:text-4xl font-black text-white tracking-tight flex items-center gap-3" style={{ fontFamily: "var(--font-display)" }}>
                    <Bell style={{ color: "var(--color-primary)" }} size={32} />
                    System <span style={{ color: "var(--color-primary)" }}>Alerts</span>
                </h1>
                <p className="text-slate-500 font-medium mt-1">Real-time alerts for disputes, reported users, and flagged events.</p>
            </div>

            <div className="rounded-3xl shadow-sm border p-6 md:p-8" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
                <div className="flex justify-between items-center border-b pb-4 mb-6" style={{ borderColor: "var(--color-border)" }}>
                    <h2 className="font-black text-white">Admin Queue</h2>
                    <span className="px-3 py-1 rounded-full font-bold text-slate-500 uppercase tracking-widest" style={{ background: "var(--color-background)" }}>{alerts.length} New Alerts</span>
                </div>

                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="flex gap-4 p-4 rounded-2xl transition-colors border border-transparent cursor-pointer group" style={{ background: "var(--color-background)" }}>
                            <div className={`p-3 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center ${alert.color}`}>
                                <alert.icon size={18} />
                            </div>
                            <div className="flex-1 w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-black text-white truncate group-hover:text-primary transition-colors">{alert.title}</h4>
                                    <span className="font-bold text-slate-400 whitespace-nowrap ml-2">{alert.time}</span>
                                </div>
                                <p className="text-slate-400 mt-1 mr-4">{alert.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
