"use client";

import { 
  MapPin, Clock, DollarSign, Calendar, 
  ArrowLeft, Share2, Bookmark, CheckCircle2, ShieldCheck,
  ExternalLink, Briefcase, Check
} from "lucide-react";
import Link from "next/link";
import React from "react";

import OpportunityOwnerControls from "@/components/opportunities/OpportunityOwnerControls";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useOpportunityEngagement } from "@/hooks/useOpportunityEngagement";
import { createClient } from "@/lib/supabase/client";

interface InternshipRecord {
  id?: string;
  company?: string | null;
  title?: string | null;
  remote?: boolean | null;
  location?: string | null;
  duration?: string | null;
  stipend?: number | null;
  description?: string | null;
  skills?: any;
  applicationLink?: string | null;
  posted_by?: string | null;
  status?: string | null;
}

interface InternshipDetailsClientProps {
  internship: InternshipRecord;
}

export default function InternshipDetailsClient({ internship }: InternshipDetailsClientProps) {
  const supabase = createClient();
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, [supabase]);

  const isOwner = Boolean(currentUserId && internship.posted_by && currentUserId === internship.posted_by);
  const isInactive = internship.status === "INACTIVE";
  const isCompleted = internship.status === "COMPLETED";

  const { isSaved, isCopied, shareMessage, toggleSave, shareOpportunity } =
    useOpportunityEngagement({
      id: internship.id || "",
      type: "internship",
      title: internship.title || "Internship Opportunity",
    });

  return (
    <div className="min-h-screen text-slate-900 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-5xl mx-auto px-4 pt-4 sm:pt-6">
        <Link href="/opportunities?type=internship" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-xs">Back to all opportunities</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Owner Lifecycle Management Controls */}
            {isOwner && internship.id && (
              <OpportunityOwnerControls
                opportunityId={internship.id}
                opportunityType="internship"
                currentStatus={internship.status || "OPEN"}
                initialData={{
                  title: internship.title || "",
                  description: internship.description || "",
                  stipend: internship.stipend,
                  duration: internship.duration,
                  location: internship.location,
                  tags: typeof internship.skills === "string" ? internship.skills : undefined,
                }}
                redirectOnDelete={true}
              />
            )}

            {!isOwner && (isInactive || isCompleted) && (
              <div className={`p-4 rounded-2xl border text-sm flex items-center gap-2.5 ${
                isInactive ? "border-amber-500/30 bg-amber-500/10 text-amber-700" : "border-sky-500/30 bg-sky-500/10 text-sky-700"
              }`}>
                {isInactive ? <Clock className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}
                <span>
                  {isInactive
                    ? "This internship opportunity is currently paused or inactive."
                    : "This internship position has been completed and filled."}
                </span>
              </div>
            )}

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
                <div className="hidden sm:flex gap-3 relative">
                  <Button 
                    variant="ghost" 
                    onClick={shareOpportunity}
                    aria-label="Share internship"
                    className="rounded-2xl border border-slate-200 hover:bg-slate-100 h-12 w-12 p-0 text-slate-600 cursor-pointer"
                  >
                    {isCopied ? <Check size={20} className="text-[#1FA971]" /> : <Share2 size={20} />}
                  </Button>
                  {shareMessage && (
                    <span className="absolute -top-8 left-0 text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded shadow-xs whitespace-nowrap">
                      {shareMessage}
                    </span>
                  )}
                  <Button 
                    variant="ghost" 
                    onClick={toggleSave}
                    aria-label={isSaved ? "Unsave internship" : "Save internship"}
                    className={`rounded-2xl border border-slate-200 h-12 w-12 p-0 transition-colors cursor-pointer ${
                      isSaved ? "bg-emerald-50 text-[#1FA971] border-emerald-300" : "hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Bookmark size={20} className={isSaved ? "fill-current" : ""} />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge className="bg-slate-100 border-slate-200 text-slate-700 px-4 py-2 rounded-xl flex items-center gap-2">
                  <MapPin size={14} className="text-primary" /> {internship.remote ? "Remote" : internship.location || "Office"}
                </Badge>
                <Badge className="bg-slate-100 border-slate-200 text-slate-700 px-4 py-2 rounded-xl flex items-center gap-2">
                  <Clock size={14} className="text-primary" /> {internship.duration}
                </Badge>
                {internship.stipend && (
                  <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 px-4 py-2 rounded-xl flex items-center gap-2">
                    <DollarSign size={14} /> ₹{internship.stipend?.toLocaleString()}/mo
                  </Badge>
                )}
                <Badge className="bg-slate-100 border-slate-200 text-slate-700 px-4 py-2 rounded-xl flex items-center gap-2">
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
                <h2 className="font-black text-slate-900">Required Competencies</h2>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(internship.skills) ? (
                    internship.skills.map((s: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="bg-white px-3 py-1.5 rounded-lg border-slate-200 text-slate-700 font-medium">
                        {s}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="bg-white px-3 py-1.5 rounded-lg border-slate-200 text-slate-700 font-medium">
                      {String(internship.skills)}
                    </Badge>
                  )}
                </div>
              </section>
            )}

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4">
              <ShieldCheck size={32} className="text-primary shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900">Verified Opportunity</h3>
                <p className="text-slate-500 text-sm">Direct company application with confirmed terms and milestone-based sign-offs.</p>
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-6">
            <Card className="rounded-3xl border-slate-200 shadow-xl shadow-slate-100 sticky top-28">
              <CardHeader>
                <CardTitle className="text-xl font-black">Application Hub</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</div>
                  {isInactive ? (
                    <div className="flex items-center gap-2 text-amber-600 font-bold">
                      <Clock size={16} /> Paused / Inactive
                    </div>
                  ) : isCompleted ? (
                    <div className="flex items-center gap-2 text-sky-600 font-bold">
                      <CheckCircle2 size={16} /> Position Completed
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-600 font-bold">
                      <CheckCircle2 size={16} /> Open & Accepting Applications
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Compensation</div>
                  <div className="text-2xl font-black text-slate-900">
                    {internship.stipend ? `₹${internship.stipend.toLocaleString()}/mo` : "Standard Academic Credit / Stipend"}
                  </div>
                </div>

                {isInactive || isCompleted ? (
                  <Button disabled className="w-full h-14 rounded-2xl text-base font-bold bg-slate-100 text-slate-400 cursor-not-allowed">
                    {isInactive ? "Applications Paused" : "Opportunity Closed"}
                  </Button>
                ) : internship.applicationLink ? (
                  <Button asChild className="w-full h-14 rounded-2xl text-base font-black bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
                    <a href={internship.applicationLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                      Apply on Company Site <ExternalLink size={18} />
                    </a>
                  </Button>
                ) : (
                  <Button asChild className="w-full h-14 rounded-2xl text-base font-black bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
                    <Link href={`/auth/sign-up?returnUrl=/internships/${internship.id || ""}`}>
                      Apply with Profile
                    </Link>
                  </Button>
                )}

                <p className="text-[11px] text-center text-slate-400 leading-tight">
                  By applying, you agree to follow the CampusConnectCo Student Honor Code.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
