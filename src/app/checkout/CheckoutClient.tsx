"use client";

import { ShieldCheck, Clock, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

interface GigDetails {
  id: string;
  title: string;
  budget: number;
}

interface ApplicationDetails {
  id: string;
  applicant: {
    name: string;
  };
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gigId = searchParams.get("gigId");
  const pkg = searchParams.get("package") || "Basic";

  const [gig, setGig] = useState<GigDetails | null>(null);
  const [app, setApp] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gigId) {
      toast.error("Missing gig parameter");
      router.push("/client-hub");
      return;
    }

    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push(`/auth/sign-in?returnUrl=/checkout?gigId=${gigId}`);
          return;
        }

        // Fetch gig details
        const gigRes = await fetch(`/api/gigs?id=${gigId}`);
        if (!gigRes.ok) throw new Error("Failed to fetch gig details");
        const gigData = await gigRes.json();
        setGig(gigData);

        // Fetch application accepted for this gig
        const appRes = await fetch(`/api/client-hub/applicants?gigId=${gigId}`);
        if (appRes.ok) {
          const appData = await appRes.json();
          const acceptedApp = appData.applicants?.find((a: any) => a.status === "ACCEPTED" || a.status === "PENDING");
          if (acceptedApp) {
            setApp({
              id: acceptedApp.id,
              applicant: { name: acceptedApp.applicant?.name || "Student" }
            });
          }
        }
      } catch (err) {
        console.error("Checkout details loading error:", err);
        toast.error("Error loading checkout details");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [gigId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading checkout details...</p>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md w-full text-center bg-surface-2 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-red-500 mb-2">Checkout Error</h2>
          <p className="text-slate-400 mb-6">Gig details could not be found or verified.</p>
          <button 
            onClick={() => router.push("/client-hub")} 
            className="px-6 py-2 bg-surface-3 hover:bg-slate-700 text-white rounded-full transition-colors"
          >
            Return to Hub
          </button>
        </div>
      </div>
    );
  }

  const platformFee = gig.budget * 0.10;
  const total = gig.budget + platformFee;

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Back navigation */}
        <Link 
          href="/client-hub"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Client Hub
        </Link>

        {/* Header & Status Banner */}
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-linear-to-r from-white via-slate-200 to-primary-light bg-clip-text text-transparent">
              Project Milestone &amp; Settlement
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock size={12} />
              Payments Coming Soon
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Review milestone configuration and project details for this assignment.
          </p>
        </div>

        {/* Coming Soon Notice Card */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-sm text-amber-200/90 leading-relaxed flex items-start gap-3">
          <Clock size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-300 mb-1">
              Online Payments and Escrow Settlements are Coming Soon
            </p>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Platform-secured payment gateways, escrow milestone funding, and automated payouts are currently in development. Deliverable tracking and milestone sign-off remain fully active on CampusConnectCo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Summary & Worker Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-surface-2/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">
                Gig Information
              </h2>
              <div className="space-y-3">
                <p className="text-xl font-bold text-white leading-snug">{gig.title}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    Package: {pkg}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    ID: {gig.id.substring(0, 8)}
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned Worker */}
            <div className="bg-surface-2/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4">
                Assigned Student Worker
              </h2>
              {app ? (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white text-sm">
                    {app.applicant.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{app.applicant.name}</p>
                    <p className="text-xs text-slate-400">
                      Deliverables and milestones can be tracked directly in the student dashboard
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-amber-400 text-sm">
                  No worker is currently assigned to this checkout instance.
                </p>
              )}
            </div>

            {/* Active Features */}
            <div className="bg-surface-2/40 border border-slate-800/80 rounded-2xl p-6">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3">
                Currently Live on CampusConnectCo
              </h2>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-primary shrink-0" />
                  <span>Applicant review, candidate shortlisting, and messaging</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-primary shrink-0" />
                  <span>Mutual deliverable submission and project completion sign-off</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-primary shrink-0" />
                  <span>Verified student profiles and institutional accreditation tracking</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Payment Card — Disabled Coming Soon */}
          <div className="bg-surface-2 border border-slate-800 rounded-2xl p-6 h-fit space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Billing Estimate</h2>
              <ShieldCheck size={18} className="text-primary" />
            </div>
            
            <div className="space-y-3 text-sm border-b border-slate-800 pb-4">
              <div className="flex justify-between text-slate-400">
                <span>Base Budget</span>
                <span className="text-white">₹{gig.budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Platform Fee (10%)</span>
                <span className="text-white">₹{platformFee.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-lg font-extrabold text-white">
              <span>Total Value</span>
              <span className="text-primary">₹{total.toLocaleString()}</span>
            </div>

            {/* Genuinely non-actionable Coming Soon button */}
            <div className="space-y-3">
              <button
                type="button"
                disabled={true}
                aria-disabled="true"
                className="w-full py-3.5 px-4 bg-slate-800/80 border border-slate-700/60 text-slate-400 font-bold rounded-xl text-sm cursor-not-allowed opacity-90 transition-none flex items-center justify-center gap-2 shadow-inner"
              >
                <Clock size={16} className="text-amber-400" />
                Payments Coming Soon
              </button>
              <p className="text-center text-xxs text-slate-400 leading-relaxed">
                Online payment transactions are not active yet. No charges will occur.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <Link
                href="/client-hub"
                className="block text-center w-full py-2.5 px-4 bg-surface-3 hover:bg-slate-700/70 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Return to Client Hub
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutClient({ nonce }: { nonce?: string }) {
  void nonce;
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">Loading Checkout...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
