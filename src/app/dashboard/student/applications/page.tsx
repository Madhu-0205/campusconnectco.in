"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/Card"
import { Clock, CheckCircle2, XCircle, ChevronRight, Loader2 } from "lucide-react"
import { useToast } from "@/components/ToastProvider"

interface Application {
    id: string;
    status: string;
    createdAt: string;
    gig: {
        id: string;
        title: string;
        budget: number;
        status: string;
        ownerConfirmed: boolean;
        studentConfirmed: boolean;
        poster: {
            name: string;
        }
    }
}

export default function StudentApplicationsPage() {
    const { addToast } = useToast();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchApplications = async () => {
        try {
            const res = await fetch("/api/applications");
            const data = await res.json();
            setApplications(data);
        } catch (error) {
            console.error("Failed to fetch applications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleConfirmCompletion = async (gigId: string) => {
        setProcessingId(gigId);
        try {
            const res = await fetch("/api/escrow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gigId, action: "RELEASE" })
            });

            if (!res.ok) throw new Error("Failed to confirm");

            addToast("Completion confirmed!", "success");
            fetchApplications();
        } catch (error) {
            addToast("Failed to confirm completion", "error");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Applications</h2>
                    <p className="text-slate-500 font-bold">Track and manage your gig journey.</p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-emerald-100">
                    {applications.filter(a => a.status === 'ACCEPTED').length} Active Gigs
                </div>
            </div>

            <div className="grid gap-4">
                {applications.length > 0 ? applications.map((app) => (
                    <Card key={app.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between hover:shadow-2xl transition-all duration-500 group border-none rounded-[2.5rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="flex items-center gap-6 mb-6 md:mb-0">
                            <div className={`h-16 w-16 rounded-3xl flex items-center justify-center transition-all group-hover:scale-110 ${app.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 shadow-emerald-100/50' :
                                app.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 shadow-rose-100/50' :
                                    'bg-amber-50 text-amber-600 shadow-amber-100/50'
                                } shadow-lg`}>
                                {app.status === 'ACCEPTED' ? <CheckCircle2 size={32} /> :
                                    app.status === 'REJECTED' ? <XCircle size={32} /> :
                                        <Clock size={32} />}
                            </div>
                            <div>
                                <h3 className="font-black text-2xl text-slate-900 tracking-tight mb-1">{app.gig.title}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400 border border-slate-100 px-2 py-0.5 rounded-md uppercase tracking-widest">{app.gig?.poster?.name || 'Client'}</span>
                                    <span className="text-xs font-bold text-slate-400">•</span>
                                    <span className="text-xs font-bold text-slate-400">Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-10">
                            <div className="text-right">
                                <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{app.gig.budget.toLocaleString()}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fixed Budget</p>
                            </div>

                            {app.status === 'ACCEPTED' && app.gig.status !== 'COMPLETED' ? (
                                <button
                                    onClick={() => handleConfirmCompletion(app.gig.id)}
                                    disabled={app.gig.studentConfirmed || processingId === app.gig.id}
                                    suppressHydrationWarning
                                    className={`px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg ${app.gig.studentConfirmed
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                        : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95 shadow-slate-900/20'
                                        }`}
                                >
                                    {processingId === app.gig.id ? <Loader2 className="animate-spin" size={18} /> :
                                        app.gig.studentConfirmed ? 'Waiting for Client' : 'Confirm Completion'}
                                </button>
                            ) : (
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${app.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    app.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                        'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                    {app.gig.status === 'COMPLETED' ? 'COMPLETED' : app.status}
                                </div>
                            )}
                        </div>
                    </Card>
                )) : (
                    <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold">You haven&apos;t applied to any gigs yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
