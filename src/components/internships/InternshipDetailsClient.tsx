"use client";

import { 
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 Building2, MapPin, Clock, DollarSign, Calendar, 
 ArrowLeft, Share2, Bookmark, CheckCircle2, ShieldCheck,
 TrendingUp, ExternalLink, Briefcase
} from"lucide-react";
import Link from"next/link";

import { Badge } from"@/components/ui/Badge";
import { Button } from"@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/Card";

interface InternshipRecord {
 company?: string | null;
 title?: string | null;
 remote?: boolean | null;
 location?: string | null;
 duration?: string | null;
 stipend?: number | null;
 description?: string | null;
 
 skills?: any;
 applicationLink?: string | null;
}

interface InternshipDetailsClientProps {
 internship: InternshipRecord;
}

export default function InternshipDetailsClient({ internship }: InternshipDetailsClientProps) {
 return (
 <div className="min-h-screen text-slate-900 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
 <div className="max-w-5xl mx-auto px-4 pt-4 sm:pt-6">
 <Link href="/dashboard/student/internships" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 :text-white transition-colors mb-8 group">
 <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
 <span className="font-bold uppercase tracking-widest text-xs">Back to all internships</span>
 </Link>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
 {/* Main Content */}
 <div className="lg:col-span-2 space-y-8">
 <header className="space-y-6">
 <div className="flex items-start justify-between gap-4">
 <div className="flex items-center gap-4">
 <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-primary to-primary-light flex items-center justify-center font-black text-white shadow-lg">
 {internship.company?.charAt(0)}
 </div>
 <div>
 <h1 className="md:text-4xl font-black tracking-tight text-slate-900">{internship.title}</h1>
 <p className="font-bold text-lg">{internship.company}</p>
 </div>
 </div>
 <div className="hidden sm:flex gap-3">
 <Button variant="ghost" className="rounded-2xl border border-slate-200 hover:bg-slate-100 :bg-(--surface-2) h-12 w-12 p-0 text-slate-600">
 <Share2 size={20} />
 </Button>
 <Button variant="ghost" className="rounded-2xl border border-slate-200 hover:bg-slate-100 :bg-(--surface-2) h-12 w-12 p-0 text-slate-600">
 <Bookmark size={20} />
 </Button>
 </div>
 </div>

 <div className="flex flex-wrap gap-3">
 <Badge className="bg-slate-100 (--surface-2) border-slate-200 text-slate-700 px-4 py-2 rounded-xl flex items-center gap-2">
 <MapPin size={14} className="text-primary" /> {internship.remote ?"Remote" : internship.location ||"Office"}
 </Badge>
 <Badge className="bg-slate-100 (--surface-2) border-slate-200 text-slate-700 px-4 py-2 rounded-xl flex items-center gap-2">
 <Clock size={14} className="text-primary" /> {internship.duration}
 </Badge>
 {internship.stipend && (
 <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 px-4 py-2 rounded-xl flex items-center gap-2">
 <DollarSign size={14} /> ₹{internship.stipend?.toLocaleString()}/mo
 </Badge>
 )}
 <Badge className="bg-slate-100 (--surface-2) border-slate-200 text-slate-700 px-4 py-2 rounded-xl flex items-center gap-2">
 <Calendar size={14} className="text-primary" /> Posted recently
 </Badge>
 </div>
 </header>

 <div className="h-px bg-slate-200" />

 <section className="space-y-4">
 <h2 className="font-black flex items-center gap-2 text-slate-900">
 <Briefcase size={20} className="text-primary" /> Role Overview
 </h2>
 <p className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
 {internship.description}
 </p>
 </section>

 {internship.skills && (
 <section className="space-y-4">
 <h2 className="font-black flex items-center gap-2 text-slate-900">
 <CheckCircle2 size={20} className="text-primary" /> Core Requirements
 </h2>
 <div className="flex flex-wrap gap-2">
 {(internship.skills?.split(",") || []).map((skill: string) => (
 <span key={skill} className="px-4 py-2 rounded-xl border border-slate-200 bg-background (--surface-2) text-sm font-bold">
 {skill.trim()}
 </span>
 ))}
 </div>
 </section>
 )}
 </div>

 {/* Sidebar */}
 <div className="space-y-6">
 <Card className="bg-white (--surface) border-slate-200 rounded-[32px] p-6 sm:p-8 shadow-xl">
 <CardHeader className="p-0 mb-6">
 <CardTitle className="text-xl font-black">Ready to apply?</CardTitle>
 </CardHeader>
 <CardContent className="p-0 space-y-6">
 <div className="space-y-4">
 <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary border border-primary">
 <ShieldCheck className="text-primary" size={24} />
 <div className="text-left">
 <p className="text-slate-900 font-bold">Escrow Protected</p>
 <p className="text-slate-500">Stipend secured in CampusConnect Vault.</p>
 </div>
 </div>
 </div>
 <a href={internship.applicationLink ||"#"} target={internship.applicationLink ?"_blank" : undefined} rel="noreferrer">
 <Button className="w-full bg-primary hover:bg-primary py-8 rounded-[24px] font-black text-lg shadow-xl shadow-primary/20 group transition-all mt-4">
 Submit Application
 <ExternalLink size={20} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
 </Button>
 </a>
 <p className="text-slate-500 font-medium">
 Average response time: 48 hours
 </p>
 </CardContent>
 </Card>

 <div className="p-6 sm:p-8 rounded-[32px] bg-linear-to-br from-primary to-transparent border border-slate-200 relative overflow-hidden text-left">
 <div className="absolute top-0 right-0 p-4">
 <TrendingUp className="text-primary/20" size={60} />
 </div>
 <h4 className="font-black text-lg mb-2 relative z-10">Market Insight</h4>
 <p className="text-sm font-medium leading-relaxed relative z-10">
 Competitiveness: High. This role is trending in the top 5% for your branch.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
