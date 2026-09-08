"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, List, ChevronRight, SearchX, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

import { GigCard } from "@/components/v2/GigCard";
import { InternshipCard } from "@/components/v2/InternshipCard";
import { useMapContext } from "@/components/v2/maps/MapContext";
import {
  OpportunityQuickPreviewModal,
  QuickPreviewOpportunity,
} from "@/components/v2/OpportunityQuickPreviewModal";

export interface Opportunity {
  id: string;
  type: "gig" | "internship";
  title: string;
  company: string;
  location: string;
  compensation?: string;
  stipend?: string;
  duration?: string;
  workType?: string;
  tags: string[];
  logoUrl?: string;
  href: string;
  isFeatured?: boolean;
  isUrgent?: boolean;
  distanceMeters?: number;
  distanceFormatted?: string;
  distanceLabel?: string;
  isApproximateDistance?: boolean;
  locationType?: "PRECISE" | "APPROXIMATE_CITY" | "REMOTE";
  description?: string;
}

interface OpportunityFeedProps {
  opportunities: Opportunity[];
  emptyMessage?: string;
  className?: string;
  onResetFilters?: () => void;
}

function useSafeMapContext() {
  try {
    return useMapContext();
  } catch {
    return null;
  }
}

export const OpportunityFeed = ({
  opportunities,
  emptyMessage = "No opportunities found.",
  className,
  onResetFilters,
}: OpportunityFeedProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [previewOpp, setPreviewOpp] = useState<QuickPreviewOpportunity | null>(null);
  const mapContext = useSafeMapContext();
  const selectedId = mapContext?.selectedId;

  // Synchronize list with map selection: smoothly scroll card into view when marker is clicked
  React.useEffect(() => {
    if (selectedId) {
      const cardEl = document.getElementById(`opportunity-card-${selectedId}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedId]);

  const handleOpenPreview = (opp: Opportunity) => {
    setPreviewOpp({
      id: opp.id,
      title: opp.title,
      company: opp.company,
      location: opp.location,
      type: opp.type,
      budget: opp.type === "gig" ? opp.compensation : opp.stipend,
      description: opp.description,
      skills: opp.tags,
      workMode: opp.workType,
    });
  };

  return (
    <div className={className}>
      {opportunities.length > 0 && (
        <div className="flex justify-end mb-6">
          <div className="bg-surface rounded-xl p-1 inline-flex gap-1 border border-border/60">
            <button 
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-surface-2 text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-surface-2 text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {opportunities.length === 0 ? (
          <motion.div 
            key="empty" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface-2/60 p-12 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                <SearchX className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1">No matching opportunities</h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-5 max-w-xs">{emptyMessage}</p>
              {onResetFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Clear all filters</span>
                </button>
              )}
            </div>
          </motion.div>
        ) : viewMode === "grid" ? (
          <motion.div 
            key="grid" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {opportunities.map((opp, i) => {
              const isSelected = mapContext?.selectedId === opp.id;
              const isHovered = mapContext?.hoveredId === opp.id;

              return (
                <motion.div 
                  key={opp.id}
                  id={`opportunity-card-${opp.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.2 }}
                  className={`relative transition-all duration-200 rounded-2xl ${
                    isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg" : ""
                  } ${isHovered ? "scale-[1.01]" : ""}`}
                  onMouseEnter={() => mapContext?.setHoveredId(opp.id)}
                  onMouseLeave={() => mapContext?.setHoveredId(null)}
                  onClick={() => mapContext?.setSelectedId(opp.id)}
                >
                  {/* Type badge */}
                  <div className={`absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    opp.type === "gig" ? "bg-primary/10 text-primary border border-primary/20" : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                  }`}>
                    {opp.type === "gig" ? "Gig" : "Internship"}
                  </div>
                  {opp.type === "gig" ? (
                    <GigCard
                      id={opp.id}
                      title={opp.title}
                      company={opp.company}
                      location={opp.location}
                      compensation={opp.compensation || "Negotiable"}
                      duration={opp.duration || "Flexible"}
                      tags={opp.tags}
                      logoUrl={opp.logoUrl}
                      href={opp.href}
                      isFeatured={opp.isFeatured}
                      distanceFormatted={opp.distanceFormatted}
                      onQuickPreview={() => handleOpenPreview(opp)}
                      className="h-full"
                    />
                  ) : (
                    <InternshipCard
                      id={opp.id}
                      role={opp.title}
                      company={opp.company}
                      location={opp.location}
                      type={opp.workType || "Full-time"}
                      stipend={opp.stipend || "Unpaid"}
                      tags={opp.tags}
                      logoUrl={opp.logoUrl}
                      href={opp.href}
                      isUrgent={opp.isUrgent}
                      distanceFormatted={opp.distanceFormatted}
                      onQuickPreview={() => handleOpenPreview(opp)}
                      className="h-full"
                    />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            key="list" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="flex flex-col rounded-2xl bg-background overflow-hidden border border-border divide-y divide-border"
          >
            {opportunities.map((opp) => {
              const isSelected = mapContext?.selectedId === opp.id;
              const isHovered = mapContext?.hoveredId === opp.id;

              return (
                <motion.div
                  key={opp.id}
                  id={`opportunity-card-${opp.id}`}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4.5 gap-4 transition-colors ${
                    isSelected ? "bg-primary/5" : isHovered ? "bg-surface-2" : "bg-surface hover:bg-surface-2"
                  }`}
                  onMouseEnter={() => mapContext?.setHoveredId(opp.id)}
                  onMouseLeave={() => mapContext?.setHoveredId(null)}
                  onClick={() => mapContext?.setSelectedId(opp.id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {opp.logoUrl ? (
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-border">
                        <Image src={opp.logoUrl} alt={opp.company} fill className="object-contain" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase shrink-0">
                        {opp.company.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <Link href={opp.href} className="hover:text-primary transition-colors">
                        <h4 className="font-bold text-sm text-foreground truncate flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                            opp.type === "gig" ? "bg-primary/10 text-primary" : "bg-blue-500/10 text-blue-600"
                          }`}>
                            {opp.type === "gig" ? "Gig" : "Internship"}
                          </span>
                          <span className="truncate">{opp.title}</span>
                          {opp.isUrgent && <span className="w-2 h-2 rounded-full bg-destructive shrink-0" />}
                          {opp.isFeatured && <span className="w-2 h-2 rounded-full bg-warning shrink-0" />}
                        </h4>
                      </Link>
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span>{opp.company} &middot; {opp.location}</span>
                        {opp.distanceFormatted && (
                          <span className="text-primary font-bold bg-primary/10 px-1.5 py-0.2 rounded text-[10px]">
                            {opp.distanceFormatted}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-medium text-muted-foreground shrink-0">
                    <span>
                      {opp.type === "gig" 
                        ? `${opp.compensation} • ${opp.duration}`
                        : `${opp.stipend} • ${opp.workType}`
                      }
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(opp)}
                      className="px-2.5 py-1 rounded-lg bg-surface-2 hover:bg-surface-3 text-xs font-semibold text-foreground transition-colors cursor-pointer"
                    >
                      Preview
                    </button>
                    <Link
                      href={opp.href}
                      className="p-1 text-muted-foreground hover:text-primary transition-colors"
                      aria-label={`Open details for ${opp.title}`}
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Preview Modal */}
      <OpportunityQuickPreviewModal
        opportunity={previewOpp}
        isOpen={Boolean(previewOpp)}
        onClose={() => setPreviewOpp(null)}
      />
    </div>
  );
};
