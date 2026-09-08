"use client";

import { X, MapPin, Briefcase, Bookmark, Share2, Check, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";

import { useOpportunityEngagement } from "@/hooks/useOpportunityEngagement";

export interface QuickPreviewOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "gig" | "internship";
  budget?: string | number | null;
  description?: string;
  skills?: string[];
  workMode?: string;
}

interface OpportunityQuickPreviewModalProps {
  opportunity: QuickPreviewOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OpportunityQuickPreviewModal({
  opportunity,
  isOpen,
  onClose,
}: OpportunityQuickPreviewModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !opportunity) return null;

  return (
    <div
      role="dialog"
      aria-label={`Quick preview for ${opportunity.title}`}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-[0_24px_64px_rgba(0,0,0,0.2)] p-6 sm:p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <QuickPreviewContent opportunity={opportunity} onClose={onClose} />
      </div>
    </div>
  );
}

function QuickPreviewContent({
  opportunity,
  onClose,
}: {
  opportunity: QuickPreviewOpportunity;
  onClose: () => void;
}) {
  const { isSaved, isCopied, shareMessage, toggleSave, shareOpportunity } =
    useOpportunityEngagement({
      id: opportunity.id,
      type: opportunity.type,
      title: opportunity.title,
    });

  const detailHref = opportunity.type === "gig" ? `/gigs/${opportunity.id}` : `/internships/${opportunity.id}`;
  const formattedBudget =
    typeof opportunity.budget === "number"
      ? `₹${opportunity.budget.toLocaleString("en-IN")}`
      : opportunity.budget
      ? String(opportunity.budget)
      : null;

  return (
    <div>
      {/* Top Bar */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
              opportunity.type === "gig"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {opportunity.type === "gig" ? "Gig" : "Internship"}
          </span>
          {opportunity.workMode && (
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md capitalize">
              {opportunity.workMode}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={shareOpportunity}
            title="Share opportunity"
            aria-label="Share opportunity"
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer relative"
          >
            {isCopied ? <Check size={16} className="text-[#1FA971]" /> : <Share2 size={16} />}
            {shareMessage && (
              <span className="absolute -top-7 right-0 text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md shadow-xs whitespace-nowrap">
                {shareMessage}
              </span>
            )}
          </button>

          <button
            onClick={toggleSave}
            title={isSaved ? "Saved" : "Save opportunity"}
            aria-label={isSaved ? "Unsave opportunity" : "Save opportunity"}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isSaved
                ? "bg-emerald-50 text-[#1FA971] dark:bg-emerald-950/50"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800"
            }`}
          >
            <Bookmark size={16} className={isSaved ? "fill-current" : ""} />
          </button>

          <button
            onClick={onClose}
            title="Close modal"
            aria-label="Close modal"
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Title & Organization */}
      <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight mb-1">
        {opportunity.title}
      </h3>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">
        {opportunity.company}
      </p>

      {/* Meta Pills */}
      <div className="flex flex-wrap items-center gap-3 py-3 border-y border-slate-100 dark:border-slate-800 mb-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1.5">
          <MapPin size={13} className="text-slate-400" />
          <span>{opportunity.location || "Remote"}</span>
        </span>
        {formattedBudget && (
          <>
            <span className="text-slate-300">•</span>
            <span className="text-[#1FA971] font-bold flex items-center gap-1">
              <Briefcase size={13} />
              <span>{formattedBudget}</span>
            </span>
          </>
        )}
      </div>

      {/* Description */}
      <div className="space-y-3 mb-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <p className="line-clamp-6 whitespace-pre-wrap">
          {opportunity.description ||
            "Verified opportunity posted by vetted organization on CampusConnect. Check full details for application guidelines, milestone schedules, and skill criteria."}
        </p>

        {opportunity.skills && opportunity.skills.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Required Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {opportunity.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <Link
          href={detailHref}
          className="flex-1 h-11 bg-[#1FA971] hover:bg-[#199160] text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm transition-all shadow-md shadow-[#1FA971]/20 hover:-translate-y-0.5"
        >
          <span>Apply on CampusConnect</span>
          <ArrowRight size={14} />
        </Link>
        <Link
          href={detailHref}
          className="h-11 px-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <span>Full Details</span>
          <ExternalLink size={13} />
        </Link>
      </div>
    </div>
  );
}
