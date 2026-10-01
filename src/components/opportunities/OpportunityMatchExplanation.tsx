"use client";

import React from "react";
import { CheckCircle2, Sparkles, AlertCircle, ArrowUpRight } from "lucide-react";

export interface MatchExplanationProps {
  matchScore: number;
  matchReasons: string[];
  missingSkills?: string[];
  unmetRequirements?: string[];
  summary?: string;
  className?: string;
}

export function OpportunityMatchExplanation({
  matchScore,
  matchReasons,
  missingSkills = [],
  unmetRequirements = [],
  summary,
  className = ""
}: MatchExplanationProps) {
  const getBadgeColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    if (score >= 60) return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  };

  return (
    <div
      className={`rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md p-5 shadow-sm transition-all hover:shadow-md ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base">
              Why this opportunity matches you
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Personalized AI alignment based on your student profile
            </p>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full border text-xs font-bold ${getBadgeColor(matchScore)}`}>
          {matchScore}% Match
        </div>
      </div>

      {summary && (
        <p className="text-xs text-neutral-600 dark:text-neutral-300 mb-4 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
          {summary}
        </p>
      )}

      {/* Match Reasons */}
      {matchReasons.length > 0 && (
        <div className="space-y-2 mb-4">
          <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
            Key Alignments
          </div>
          <ul className="space-y-1.5">
            {matchReasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Skills (Growth opportunities) */}
      {missingSkills.length > 0 && (
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Recommended Skills to Learn</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missingSkills.slice(0, 5).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
