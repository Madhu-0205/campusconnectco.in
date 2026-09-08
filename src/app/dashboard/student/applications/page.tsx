"use client"

import { Clock, CheckCircle2, XCircle, Loader2, Briefcase, ArrowRight, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

import { useToast } from "@/components/ToastProvider"
import { Card } from "@/components/ui/Card"

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
 const [error, setError] = useState<string | null>(null);
 const [processingId, setProcessingId] = useState<string | null>(null);

 const fetchApplications = async () => {
 setError(null);
 try {
 const res = await fetch("/api/applications");
 if (!res.ok) {
 throw new Error("Unable to load applications");
 }
 const data = await res.json();
 const items = Array.isArray(data?.items)
 ? data.items
 : [];
 setApplications(items);
 } catch {
 setError("Failed to load applications. Please verify your connection.");
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

 addToast("Milestone confirmed!", "success");
 fetchApplications();
 } catch {
 addToast("Failed to confirm milestone", "error");
 } finally {
 setProcessingId(null);
 }
 };

 if (loading) {
 return (
 <div className="space-y-6">
 <div className="flex justify-between items-end">
 <div className="space-y-2">
 <div className="h-7 w-48 bg-muted animate-pulse rounded-lg" />
 <div className="h-4 w-64 bg-muted/60 animate-pulse rounded-md" />
 </div>
 <div className="h-8 w-28 bg-muted animate-pulse rounded-2xl" />
 </div>
 <div className="grid gap-4">
 {[1, 2, 3].map((i) => (
 <Card key={i} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between border border-border rounded-3xl bg-surface animate-pulse">
 <div className="flex items-center gap-6 mb-4 md:mb-0">
 <div className="h-14 w-14 rounded-2xl bg-muted shrink-0" />
 <div className="space-y-2">
 <div className="h-5 w-56 bg-muted rounded-md" />
 <div className="h-3.5 w-36 bg-muted/70 rounded-md" />
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className="h-6 w-24 bg-muted rounded-lg" />
 <div className="h-8 w-28 bg-muted rounded-full" />
 </div>
 </Card>
 ))}
 </div>
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

 {error && (
 <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300 flex items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <AlertCircle size={20} className="text-red-500 shrink-0" />
 <p className="text-sm font-medium">{error}</p>
 </div>
 <button
 onClick={() => { setError(null); setLoading(true); fetchApplications(); }}
 className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-xs font-bold rounded-xl transition-colors shrink-0"
 >
 Retry
 </button>
 </div>
 )}

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
 <Link href={`/gigs/${app.gig.id}`} className="hover:text-primary transition-colors">
 <h3 className="font-black text-foreground tracking-tight mb-1 hover:underline">{app.gig.title}</h3>
 </Link>
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
 app.gig.studentConfirmed ? 'Waiting for Client Sign-off' : 'Confirm Deliverables Delivered'}
 </button>
 ) : (
 <div className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-[0.2em] border ${app.status === 'ACCEPTED' ? 'bg-primary/5 text-primary border-primary/10' : app.status === 'REJECTED' ? 'bg-destructive/5 text-destructive border-destructive/10' : 'bg-amber-500/5 text-amber-500 border-amber-500/10' }`}>
 {app.gig.status === 'COMPLETED' ? 'COMPLETED' : app.status}
 </div>
 )}
 </div>
 </Card>
 )) : (
 <div className="py-16 px-6 text-center bg-surface rounded-4xl border border-dashed border-border/80 flex flex-col items-center">
 <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
 <Briefcase size={26} />
 </div>
 <h3 className="font-bold text-lg text-foreground mb-1">No applications yet</h3>
 <p className="text-muted-foreground text-sm max-w-md mb-6">
 You haven&apos;t applied to any gigs or internships yet. Discover verified opportunities across Indian campuses.
 </p>
 <div className="flex flex-wrap items-center justify-center gap-3">
 <Link
 href="/opportunities"
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
 >
 Browse Opportunities
 <ArrowRight size={14} />
 </Link>
 <Link
 href="/get-gig"
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-background text-foreground font-bold text-xs uppercase tracking-wider hover:bg-accent transition-colors"
 >
 Find Gigs
 </Link>
 </div>
 </div>
 )}
 </div>
 </div>
 )
}
