"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

import { Reveal } from "@/components/ui/motion/Reveal";
import { PremiumOpportunityCard } from "@/components/v2/PremiumOpportunityCard";

interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  budget?: string | number | null;
  type: "gig" | "internship" | "job";
  skills?: string[];
  createdAt: Date;
}

interface MasterLiveActivityProps {
  opportunities: Opportunity[];
}

export function MasterLiveActivity({ opportunities }: MasterLiveActivityProps) {
  if (!opportunities || opportunities.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#FAFCFA] py-20 lg:py-28 border-t border-slate-100 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 lg:mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1FA971]"></span>
                </span>
                <span className="text-xs font-bold text-[#1FA971] uppercase tracking-wider">
                  Live Opportunity Stream
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#232B27] tracking-tight">
                Latest verified listings
              </h2>
              <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
                Gigs and internships actively accepting student applications right now.
              </p>
            </div>
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1FA971] hover:text-[#199160] transition-colors group"
            >
              <span>Explore all opportunities</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.slice(0, 6).map((opp, idx) => {
            const detailHref = opp.type === "gig" ? `/gigs/${opp.id}` : `/internships/${opp.id}`;
            const formattedBudget =
              typeof opp.budget === "number"
                ? `₹${opp.budget.toLocaleString("en-IN")}`
                : opp.budget
                ? opp.budget.toString().startsWith("₹")
                  ? opp.budget.toString()
                  : `₹${opp.budget}`
                : undefined;

            return (
              <Reveal key={opp.id} delay={idx * 0.04}>
                <PremiumOpportunityCard
                  id={opp.id}
                  title={opp.title}
                  company={opp.company}
                  location={opp.location || "Remote"}
                  type={opp.type === "internship" ? "internship" : "gig"}
                  compensation={formattedBudget}
                  tags={opp.skills || []}
                  href={detailHref}
                  createdAt={opp.createdAt}
                  className="h-full"
                />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
