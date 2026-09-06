"use client";

import {
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 Briefcase,
 DollarSign,
 Clock,
 MapPin,
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 User,
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 Mail,
 ExternalLink,
 Calendar,
 Users,
 CheckCircle,
 XCircle,
 AlertCircle,
 ArrowLeft,
 Send,
 Github,
 Linkedin,
 ShieldCheck,
 FileText,
 Sparkles,
 Brain,
 Loader2,
} from"lucide-react";
import Link from"next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Button } from"@/components/ui/Button";
import { Card } from"@/components/ui/Card";
import { VerificationBadge } from"@/components/ui/VerificationBadge";
import { createClient } from"@/lib/supabase/client";

interface GigDetailProps {
 gig: {
 id: string;
 title: string;
 description: string;
 budget: number;
 deadline: Date | null;
 status: string;
 tags: string | null;
 latitude: number | null;
 longitude: number | null;
 createdAt: Date;
 poster: {
 id: string;
 name: string | null;
 email: string;
 image: string | null;
 bio: string | null;
 skills: string | null;
 portfolio: string | null;
 linkedin: string | null;
 github: string | null;
 latitude: number | null;
 longitude: number | null;
 isVerified?: boolean;
 };
 applications: Array<{
 id: string;
 status: string;
 coverLetter: string | null;
 createdAt: Date;
 applicant: {
 id: string;
 name: string | null;
 email: string;
 image: string | null;
 skills: string | null;
 isVerified?: boolean;
 };
 }>;
 _count: {
 applications: number;
 };
 };
}

export default function GigDetailClient({ gig }: GigDetailProps) {
 const router = useRouter();
 const supabase = createClient();

 const [isApplying, setIsApplying] = useState(false);
 const [showApplicationForm, setShowApplicationForm] = useState(false);
 const [coverLetter, setCoverLetter] = useState("");
 const [error, setError] = useState("");
 const [success, setSuccess] = useState("");
 const [currentUserId, setCurrentUserId] = useState<string | null>(null);
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 const [userRole, setUserRole] = useState<string | null>(null);

 // Get current user
 useEffect(() => {
   const fetchUser = async () => {
     const { data: { session } } = await supabase.auth.getSession();
     if (session?.user) {
       setCurrentUserId(session.user.id);
       // Fetch user role from database
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const userData = await response.json();
          setUserRole(userData.role);
        }
      }
    };
    fetchUser();
  }, [supabase]);

  // Phase 6 Puter AI: Smart Match Explanation & Opportunity Summary
  const [matchExplanation, setMatchExplanation] = useState<any>(null);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const fetchMatchExplanation = async () => {
    if (!currentUserId || loadingMatch) return;
    setLoadingMatch(true);
    try {
      const res = await fetch("/api/ai/match-explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gigId: gig.id })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMatchExplanation(data.data);
      }
    } catch {
      // Graceful degradation
    } finally {
      setLoadingMatch(false);
    }
  };

  const fetchAiSummary = async () => {
    if (loadingSummary) return;
    setLoadingSummary(true);
    try {
      const res = await fetch("/api/ai/opportunity-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gigId: gig.id })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiSummary(data.data);
      }
    } catch {
      // Graceful degradation
    } finally {
      setLoadingSummary(false);
    }
  };

 const userApplication = gig.applications.find(
   (app) => app.applicant.id === currentUserId
 );

 const isOwner = currentUserId === gig.poster.id;
 const hasApplied = !!userApplication;
 const canApply = currentUserId && !isOwner && !hasApplied && gig.status === "OPEN";

 const handleApply = async (e: React.FormEvent) => {
   e.preventDefault();

   if (!currentUserId) {
     router.push(`/auth/sign-in?returnUrl=/gigs/${gig.id}`);
     return;
   }

 setIsApplying(true);
 setError("");
 setSuccess("");

 try {
 const response = await fetch("/api/applications/apply", {
 method:"POST",
 headers: {
"Content-Type":"application/json",
 },
 body: JSON.stringify({
 gigId: gig.id,
 coverLetter: coverLetter.trim() || null,
 }),
 });

 if (!response.ok) {
 const data = await response.json();
 throw new Error(data.error ||"Failed to submit application");
 }

 setSuccess("Application submitted successfully!");
 setShowApplicationForm(false);
 setCoverLetter("");

 // Refresh the page to show updated application status
 router.refresh();
 } catch (err) {
 setError(err instanceof Error ? err.message :"Failed to submit application");
 } finally {
 setIsApplying(false);
 }
 };

 const handleUpdateApplicationStatus = async (applicationId: string, newStatus: string) => {
 try {
 const response = await fetch(`/api/applications/${applicationId}`, {
 method:"PATCH",
 headers: {
"Content-Type":"application/json",
 },
 body: JSON.stringify({ status: newStatus }),
 });

 if (!response.ok) {
 throw new Error("Failed to update application status");
 }

 router.refresh();
 } catch (err) {
 setError(err instanceof Error ? err.message :"Failed to update status");
 }
 };

 const getStatusColor = (status: string) => {
 switch (status.toUpperCase()) {
 case"PENDING":
 return"text-yellow-600 bg-yellow-50";
 case"ACCEPTED":
 return"text-green-600 bg-green-50";
 case"REJECTED":
 return"text-red-600 bg-red-50";
 default:
 return"text-gray-600 bg-gray-50";
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status.toUpperCase()) {
 case"PENDING":
 return <AlertCircle size={16} />;
 case"ACCEPTED":
 return <CheckCircle size={16} />;
 case"REJECTED":
 return <XCircle size={16} />;
 default:
 return <AlertCircle size={16} />;
 }
 };

 return (
 <div className="min-h-screen bg-background pt-24 pb-12">
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
 {/* Back Button */}
 <Link
 href="/get-gig"
 className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
 >
 <ArrowLeft size={20} />
 Back to Gigs
 </Link>

 <div className="grid lg:grid-cols-3 gap-8">
 {/* Main Content */}
 <div className="lg:col-span-2 space-y-6">
 {/* Gig Header */}
 <Card className="p-8">
 <div className="flex items-start justify-between mb-4">
 <div className="flex-1">
 <h1 className="font-heading text-3xl md:text-4xl font-black text-foreground mb-2 tracking-tight">
 {gig.title}
 </h1>
 <div className="flex flex-wrap gap-4 text-muted-foreground">
 <span className="flex items-center gap-1">
 <Calendar size={16} />
 Posted {new Date(gig.createdAt).toLocaleDateString()}
 </span>
 <span className="flex items-center gap-1">
 <Users size={16} />
 {gig._count.applications} applicant{gig._count.applications !== 1 ?"s" :""}
 </span>
 </div>
 </div>
 <span
 className={`px-3 py-1 rounded-full font-semibold ${gig.status ==="OPEN" ?"bg-green-100" :"bg-gray-100 text-gray-700" }`}
 >
 {gig.status}
 </span>
 </div>

 {/* Key Info */}
 <div className="grid sm:grid-cols-2 gap-4 mb-6">
 <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
 <div className="p-2 bg-primary/20 rounded-lg">
 <DollarSign className="text-primary" size={24} />
 </div>
 <div>
 <p className="text-muted-foreground">Budget</p>
 <p className="font-bold text-foreground">
 ₹{gig.budget.toLocaleString()}
 </p>
 </div>
 </div>

 {gig.deadline && (
 <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
 <div className="p-2 bg-primary/10 rounded-lg">
 <Clock className="text-primary" size={24} />
 </div>
 <div>
 <p className="text-muted-foreground">Deadline</p>
 <p className="font-bold text-foreground">
 {new Date(gig.deadline).toLocaleDateString()}
 </p>
 </div>
 </div>
 )}
 </div>

 {/* Tags */}
 {gig.tags && (
 <div className="flex flex-wrap gap-2 mb-6">
 {gig.tags.split(",").map((tag, idx) => (
 <span
 key={idx}
 className="px-3 py-1 bg-accent text-muted-foreground text-sm font-medium rounded-lg"
 >
 {tag.trim()}
 </span>
 ))}
 </div>
 )}

 {/* Description */}
 <div>
 <h2 className="font-bold text-foreground mb-3">
 Description
 </h2>
 <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
 {gig.description}
 </p>
 </div>
 </Card>

        {/* Phase 6: Smart Match Explanation (Authenticated Students) */}
        {currentUserId && !isOwner && (
          <Card className="p-6 border-primary/20 bg-primary/2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-foreground">Why this matches you</h3>
                <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Puter AI</span>
              </div>
              <a
                href="https://developer.puter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Powered by Puter
              </a>
            </div>

            {matchExplanation ? (
              <div className="space-y-3 text-sm">
                <p className="text-foreground font-medium bg-background p-3 rounded-xl border border-border/60">
                  {matchExplanation.summary}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 bg-background rounded-lg border border-border/40">
                    <span className="font-bold text-foreground block mb-1">🎯 Skills</span>
                    <span className="text-muted-foreground">{matchExplanation.scoreBreakdown?.skillMatchExplanation}</span>
                  </div>
                  <div className="p-2.5 bg-background rounded-lg border border-border/40">
                    <span className="font-bold text-foreground block mb-1">📍 Proximity</span>
                    <span className="text-muted-foreground">{matchExplanation.scoreBreakdown?.locationExplanation}</span>
                  </div>
                  <div className="p-2.5 bg-background rounded-lg border border-border/40">
                    <span className="font-bold text-foreground block mb-1">⏱️ Freshness</span>
                    <span className="text-muted-foreground">{matchExplanation.scoreBreakdown?.freshnessExplanation}</span>
                  </div>
                </div>
                {matchExplanation.suggestedAction && (
                  <p className="text-xs text-primary font-medium flex items-center gap-1.5 pt-1">
                    <span>💡 Suggestion:</span> {matchExplanation.suggestedAction}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-muted-foreground">
                  Get an AI breakdown of how your skills and location align with this opportunity.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchMatchExplanation}
                  disabled={loadingMatch}
                  className="shrink-0 ml-3"
                >
                  {loadingMatch ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-3.5 w-3.5 mr-1.5 text-primary" />
                      Explain Match
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Phase 6: AI Opportunity Summary */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-foreground">AI Opportunity Summary</h3>
              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Puter AI</span>
            </div>
            <a
              href="https://developer.puter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Powered by Puter
            </a>
          </div>

          {aiSummary ? (
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-2">What you&apos;ll do</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {aiSummary.whatYouWillDo?.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/40 text-xs">
                <div>
                  <span className="font-bold text-foreground block mb-1">Ideal Candidate:</span>
                  <span className="text-muted-foreground">{aiSummary.whoThisSuits}</span>
                </div>
                <div>
                  <span className="font-bold text-foreground block mb-1">Preparation Tips:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                    {aiSummary.preparationTips?.slice(0, 2).map((tip: string, i: number) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-muted-foreground">
                Get an objective, structured summary of deliverables, required skills, and preparation tips.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAiSummary}
                disabled={loadingSummary}
                className="shrink-0 ml-3"
              >
                {loadingSummary ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    Quick Breakdown
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>

 {/* Application Status or Form */}
 {hasApplied && userApplication && (
 <Card className="p-6">
 <div className="flex items-start gap-4">
 <div className={`p-2 rounded-lg ${getStatusColor(userApplication.status)}`}>
 {getStatusIcon(userApplication.status)}
 </div>
 <div className="flex-1">
 <h3 className="font-bold text-foreground mb-1">
 Your Application
 </h3>
 <p className="text-muted-foreground mb-2">
 Status:{""}
 <span className={`font-semibold ${getStatusColor(userApplication.status)}`}>
 {userApplication.status}
 </span>
 </p>
 {userApplication.coverLetter && (
 <div className="mt-3 p-3 bg-background rounded-lg">
 <p className="font-medium text-muted-foreground mb-1">
 Your Cover Letter:
 </p>
 <p className="text-muted-foreground">
 {userApplication.coverLetter}
 </p>
 </div>
 )}
 <p className="text-muted-foreground mt-2">
 Applied on {new Date(userApplication.createdAt).toLocaleDateString()}
 </p>
 </div>
 </div>
 </Card>
 )}

 {canApply && !showApplicationForm && (
 <Card className="p-6">
 <Button
 onClick={() => setShowApplicationForm(true)}
 className="w-full"
 size="lg"
 >
 <Send size={20} className="mr-2" />
 Apply for this Gig
 </Button>
 </Card>
 )}

 {showApplicationForm && (
 <Card className="p-6">
 <h3 className="font-bold text-foreground mb-4">
 Submit Your Application
 </h3>
 <form onSubmit={handleApply} className="space-y-4">
 <div>
 <label className="block font-medium text-muted-foreground mb-2">
 Cover Letter (Optional)
 </label>
 <textarea
 value={coverLetter}
 onChange={(e) => setCoverLetter(e.target.value)}
 placeholder="Tell the poster why you're the best fit for this gig..."
 className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary/50 outline-none min-h-30"
 maxLength={1000}
 />
 <p className="text-muted-foreground mt-1">
 {coverLetter.length}/1000 characters
 </p>
 </div>

 {error && (
 <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
 <p className="text-red-600">{error}</p>
 </div>
 )}

 {success && (
 <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
 <p className="text-green-600">{success}</p>
 </div>
 )}

 <div className="flex gap-3">
 <Button type="submit" disabled={isApplying} className="flex-1">
 {isApplying ?"Submitting..." :"Submit Application"}
 </Button>
 <Button
 type="button"
 variant="outline"
 onClick={() => setShowApplicationForm(false)}
 disabled={isApplying}
 >
 Cancel
 </Button>
 </div>
 </form>
 </Card>
 )}

 {/* Applications List (for poster only) */}
 {isOwner && gig.applications.length > 0 && (
 <Card className="p-6">
 <h3 className="font-bold text-foreground mb-4">
 Applications ({gig.applications.length})
 </h3>
 <div className="space-y-4">
 {gig.applications.map((application) => (
 <div
 key={application.id}
 className="p-4 bg-background rounded-xl"
 >
 <div className="flex items-start justify-between mb-3">
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center">
 {application.applicant.name?.slice(0, 2).toUpperCase() ||
 application.applicant.email.slice(0, 2).toUpperCase()}
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <p className="font-semibold text-foreground">
 {application.applicant.name || application.applicant.email}
 </p>
 <VerificationBadge isVerified={!!application.applicant.isVerified} />
 </div>
 <p className="text-muted-foreground mt-0.5">
 {application.applicant.email}
 </p>
 </div>
 </div>
 <span
 className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${getStatusColor( application.status )}`}
 >
 {getStatusIcon(application.status)}
 {application.status}
 </span>
 </div>

 {application.coverLetter && (
 <p className="text-muted-foreground mb-3">
 {application.coverLetter}
 </p>
 )}

 {application.applicant.skills && (
 <div className="flex flex-wrap gap-2 mb-3">
 {application.applicant.skills
 .split(",")
 .slice(0, 5)
 .map((skill, idx) => (
 <span
 key={idx}
 className="px-2 py-0.5 bg-accent text-muted-foreground text-xs rounded"
 >
 {skill.trim()}
 </span>
 ))}
 </div>
 )}

 {application.status ==="PENDING" && (
 <div className="flex gap-2 mt-3">
 <Button
 size="sm"
 onClick={() =>
 handleUpdateApplicationStatus(application.id,"ACCEPTED")
 }
 className="flex-1"
 >
 <CheckCircle size={16} className="mr-1" />
 Accept
 </Button>
 <Button
 size="sm"
 variant="outline"
 onClick={() =>
 handleUpdateApplicationStatus(application.id,"REJECTED")
 }
 className="flex-1"
 >
 <XCircle size={16} className="mr-1" />
 Reject
 </Button>
 </div>
 )}
 </div>
 ))}
 </div>
 </Card>
 )}
 </div>

 {/* Sidebar */}
 <div className="space-y-6">
 {/* Poster Info */}
 <Card className="p-6">
 <h3 className="font-bold text-foreground mb-4">
 Posted By
 </h3>
 <div className="flex items-center gap-3 mb-4">
 <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-lg shadow-glow-primary">
 {gig.poster.name?.slice(0, 2).toUpperCase() ||
 gig.poster.email.slice(0, 2).toUpperCase()}
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <p className="font-semibold text-foreground">
 {gig.poster.name ||"Anonymous"}
 </p>
 <VerificationBadge isVerified={!!gig.poster.isVerified} />
 </div>
 <p className="text-muted-foreground mt-0.5">
 {gig.poster.email}
 </p>
 </div>
 </div>

 {gig.poster.bio && (
 <p className="text-muted-foreground mb-4">
 {gig.poster.bio}
 </p>
 )}

 {gig.poster.skills && (
 <div className="mb-4">
 <p className="font-medium text-muted-foreground mb-2">
 Skills:
 </p>
 <div className="flex flex-wrap gap-2">
 {gig.poster.skills
 .split(",")
 .slice(0, 5)
 .map((skill, idx) => (
 <span
 key={idx}
 className="px-2 py-1 bg-accent text-muted-foreground text-xs rounded"
 >
 {skill.trim()}
 </span>
 ))}
 </div>
 </div>
 )}

 <div className="space-y-2">
 {gig.poster.portfolio && (
 <a
 href={gig.poster.portfolio}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-2 text-primary hover:underline"
 >
 <ExternalLink size={16} />
 Portfolio
 </a>
 )}
 {gig.poster.linkedin && (
 <a
 href={gig.poster.linkedin}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-2 text-primary hover:underline"
 >
 <Linkedin size={16} />
 LinkedIn
 </a>
 )}
 {gig.poster.github && (
 <a
 href={gig.poster.github}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-2 text-primary hover:underline"
 >
 <Github size={16} />
 GitHub
 </a>
 )}
 </div>
 </Card>

 {/* Escrow Payment Timeline */}
 <Card className="p-6">
 <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
 <ShieldCheck size={20} className="text-success" />
 Payment Protection
 </h3>
 <div className="relative border-border ml-3 space-y-6 pt-2 pb-2">
 <div className="relative">
 <div className={`absolute -left-5.25 p-1 rounded-full ${gig.status !== 'OPEN' ? 'bg-emerald-500' : 'bg-accent'}`}>
 <CheckCircle size={12} className="text-foreground" />
 </div>
 <div className="pl-6">
 <h4 className="font-bold text-foreground">Payment deposited</h4>
 <p className="text-muted-foreground mt-1">Client secures funds into escrow.</p>
 </div>
 </div>
 <div className="relative">
 <div className={`absolute -left-5.25 p-1 rounded-full ${['IN_PROGRESS', 'COMPLETED'].includes(gig.status) ? 'bg-emerald-500' : 'bg-accent'}`}>
 <Clock size={12} className="text-foreground" />
 </div>
 <div className="pl-6">
 <h4 className="font-bold text-foreground">Work in progress</h4>
 <p className="text-muted-foreground mt-1">Student begins working.</p>
 </div>
 </div>
 <div className="relative">
 <div className={`absolute -left-5.25 p-1 rounded-full ${gig.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-accent'}`}>
 <FileText size={12} className="text-foreground" />
 </div>
 <div className="pl-6">
 <h4 className="font-bold text-foreground">Work submitted</h4>
 <p className="text-muted-foreground mt-1">Client reviews the delivery.</p>
 </div>
 </div>
 <div className="relative">
 <div className={`absolute -left-5.25 p-1 rounded-full ${gig.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-accent'}`}>
 <DollarSign size={12} className="text-foreground" />
 </div>
 <div className="pl-6">
 <h4 className="font-bold text-foreground">Payment released</h4>
 <p className="text-muted-foreground mt-1">Funds transferred to student.</p>
 </div>
 </div>
 </div>
 <div className="mt-5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
 <p className="text-emerald-800 font-medium">
 <strong>CampusConnect Payment Protection</strong> – funds are held securely until the work is completed.
 </p>
 </div>
 </Card>

 {/* Location */}
 {(gig.latitude || gig.poster.latitude) && (
 <Card className="p-6">
 <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
 <MapPin size={20} className="text-primary" />
 Location
 </h3>
 <p className="text-muted-foreground">
 {gig.latitude && gig.longitude
 ? `Lat: ${gig.latitude.toFixed(4)}, Long: ${gig.longitude.toFixed(4)}`
 :"Location-based gig"}
 </p>
 </Card>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
