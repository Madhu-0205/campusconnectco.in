"use client"

import { Clock, CheckCircle2, XCircle, Loader2 } from"lucide-react"
import { useState, useEffect } from"react"

import { useToast } from"@/components/ToastProvider"
import { Card } from"@/components/ui/Card"

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
 const items = Array.isArray(data?.items)
 ? data.items
 : [];
 setApplications(items);
 } catch {
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
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({ gigId, action:"RELEASE" })
 });

 if (!res.ok) throw new Error("Failed to confirm");

 addToast("Completion confirmed!","success");
 fetchApplications();
 } catch {
 addToast("Failed to confirm completion","error");
 } finally {
 setProcessingId(null);
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center h-64">
 <Loader2 className="animate-spin text-muted-foreground" size={32} />
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div className="flex justify-between items-end">
 <div>
 <h2 className="font-black text-foreground tracking-tight">My Applications</h2>
 <p className="text-muted-foreground font-bold">Track and manage your gig journey.</p>
 </div>
 <div className="bg-primary/5 text-primary px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-primary/10">
 {applications.filter(a => a.status === 'ACCEPTED').length} Active Gigs
 </div>
 </div>

 <div className="grid gap-4">
 {applications.length > 0 ? applications.map((app) => (
 <Card key={app.id} className="p-4 md:p-8 flex flex-col md:flex-row md:items-center justify-between hover:shadow-card-hover transition-all duration-500 group border border-border rounded-5xl bg-surface shadow-card">
 <div className="flex items-center gap-6 mb-6 md:mb-0">
 <div className={`h-16 w-16 rounded-3xl flex items-center justify-center transition-all group-hover:scale-110 ${app.status === 'ACCEPTED' ? 'bg-primary/10 text-primary' : app.status === 'REJECTED' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-500' } shadow-sm`}>
 {app.status === 'ACCEPTED' ? <CheckCircle2 size={32} /> :
 app.status === 'REJECTED' ? <XCircle size={32} /> :
 <Clock size={32} />}
 </div>
 <div>
 <h3 className="font-black text-foreground tracking-tight mb-1">{app.gig.title}</h3>
 <div className="flex items-center gap-2 text-xs">
 <span className="font-bold text-muted-foreground border border-border px-2 py-0.5 rounded-md uppercase tracking-widest">{app.gig?.poster?.name || 'Client'}</span>
 <span className="font-bold text-muted-foreground">•</span>
 <span className="font-bold text-muted-foreground">Applied {new Date(app.createdAt).toLocaleDateString()}</span>
 </div>
 </div>
 </div>

 <div className="flex items-center justify-between md:justify-end gap-10">
 <div className="text-right">
 <p className="font-black text-foreground tracking-tighter">₹{app.gig.budget.toLocaleString()}</p>
 <p className="font-black text-muted-foreground text-xs uppercase tracking-widest">Fixed Budget</p>
 </div>

 {app.status === 'ACCEPTED' && app.gig.status !== 'COMPLETED' ? (
 <button
 onClick={() => handleConfirmCompletion(app.gig.id)}
 disabled={app.gig.studentConfirmed || processingId === app.gig.id}
 suppressHydrationWarning
 className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-sm ${app.gig.studentConfirmed ? 'bg-surface-2 text-muted-foreground cursor-not-allowed shadow-none' : 'bg-foreground text-background hover:bg-foreground/90 active:scale-95' }`}
 >
 {processingId === app.gig.id ? <Loader2 className="animate-spin" size={18} /> :
 app.gig.studentConfirmed ? 'Waiting for Client' : 'Confirm Completion'}
 </button>
 ) : (
 <div className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-[0.2em] border ${app.status === 'ACCEPTED' ? 'bg-primary/5 text-primary border-primary/10' : app.status === 'REJECTED' ? 'bg-destructive/5 text-destructive border-destructive/10' : 'bg-amber-500/5 text-amber-500 border-amber-500/10' }`}>
 {app.gig.status === 'COMPLETED' ? 'COMPLETED' : app.status}
 </div>
 )}
 </div>
 </Card>
 )) : (
 <div className="py-20 text-center bg-surface-2 rounded-5xl border border-border">
 <p className="text-muted-foreground font-bold">You haven&apos;t applied to any gigs yet.</p>
 </div>
 )}
 </div>
 </div>
 )
}
