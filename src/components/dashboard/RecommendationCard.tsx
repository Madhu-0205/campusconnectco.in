import { Sparkles, MapPin, Briefcase, Tag } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useAnalytics } from "@/components/Analytics/AnalyticsProvider";

import { ScoredRecommendation } from "@/lib/recommendation-engine";

interface RecommendationCardProps {
  recommendation: ScoredRecommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { opportunity, explanation, matchMetrics } = recommendation;
  const { track } = useAnalytics();
  
  // Choose link based on opportunity type
  const href = opportunity.type === "gig" ? `/gigs/${opportunity.id}` : `/internships/${opportunity.id}`;

  const handleRecommendationClick = () => {
    track("recommendation_click", {
      opportunityId: opportunity.id,
      opportunityType: opportunity.type,
      company: opportunity.company,
      matchedSkills: opportunity.requiredSkills.filter((s: string, i: number) => i < matchMetrics.skillsMatchCount),
      explanation: explanation,
      applied: false // Will be updated on actual application
    });
  };

  return (
    <Link 
      href={href}
      onClick={handleRecommendationClick}
      className="block bg-[#111127]/60 border border-white/5 rounded-3xl p-6 hover:border-violet-500/30 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2 block">
            {opportunity.company}
          </span>
          <h3 className="font-bold text-lg leading-snug group-hover:text-violet-300 transition-colors">
            {opportunity.title}
          </h3>
        </div>
        <div className="bg-violet-600/10 border border-violet-500/20 text-violet-400 p-2 rounded-xl">
          <Sparkles size={16} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6 text-sm text-slate-400">
        <span className="flex items-center gap-1">
          <Briefcase size={14} /> 
          {opportunity.type === "gig" ? "Freelance Gig" : "Internship"}
        </span>
        {opportunity.isRemote ? (
          <span className="flex items-center gap-1">
            <MapPin size={14} /> Remote
          </span>
        ) : opportunity.location ? (
          <span className="flex items-center gap-1">
            <MapPin size={14} /> {opportunity.location}
          </span>
        ) : null}
        {opportunity.salary && (
          <span className="flex items-center gap-1">
            <Tag size={14} /> {opportunity.type === "gig" ? `₹${opportunity.salary}` : `₹${opportunity.salary}/mo`}
          </span>
        )}
      </div>

      {/* Explainable AI Banner */}
      <div className="bg-linear-to-r from-violet-600/10 to-cyan-500/5 rounded-2xl p-4 border border-violet-500/10 mt-auto">
        <p className="text-xs text-slate-300 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>{explanation}</span>
        </p>
        
        {matchMetrics.skillsMatchCount > 0 && (
          <div className="mt-3 flex gap-1.5 flex-wrap">
            {opportunity.requiredSkills.slice(0, 3).map(skill => (
              <span key={skill} className="px-2 py-1 bg-black/40 rounded-md text-[10px] text-slate-400 border border-white/5 uppercase tracking-wider">
                {skill}
              </span>
            ))}
            {opportunity.requiredSkills.length > 3 && (
              <span className="px-2 py-1 bg-black/40 rounded-md text-[10px] text-slate-500 border border-white/5 uppercase tracking-wider">
                +{opportunity.requiredSkills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
