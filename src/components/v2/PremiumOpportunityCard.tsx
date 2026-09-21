"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import {
  MapPin,
  DollarSign,
  ArrowUpRight,
  GraduationCap,
  Bookmark,
  Share2,
  Check,
  Eye,
  Clock,
  Briefcase,
  Flame,
  Globe,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { MouseEvent } from "react";

import { HoverMagnetic } from "@/components/ui/motion/HoverMagnetic";
import { useOpportunityEngagement } from "@/hooks/useOpportunityEngagement";
import { cn } from "@/lib/utils";

export interface PremiumOpportunityCardProps {
  id?: string;
  title: string;
  company: string;
  location: string;
  type?: "gig" | "internship";
  compensation?: string;
  stipend?: string;
  duration?: string;
  workMode?: string;
  tags?: string[];
  logoUrl?: string;
  href: string;
  className?: string;
  isFeatured?: boolean;
  isUrgent?: boolean;
  collegeId?: string | null;
  distanceFormatted?: string;
  source?: string;
  createdAt?: Date | string;
  onQuickPreview?: () => void;
}

export function PremiumOpportunityCard({
  id,
  title,
  company,
  location,
  type = "gig",
  compensation,
  stipend,
  duration,
  workMode,
  tags = [],
  logoUrl,
  href,
  className,
  isFeatured,
  isUrgent,
  collegeId,
  distanceFormatted,
  source,
  onQuickPreview,
}: PremiumOpportunityCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const opportunityId = id || href.replace(/^\/(gigs|internships)\//, "");
  const { isSaved, isCopied, shareMessage, toggleSave, shareOpportunity } =
    useOpportunityEngagement({
      id: opportunityId,
      type,
      title,
    });

  const pay = compensation || stipend || "Negotiable";
  const displayTags = tags.slice(0, 3);
  const remainingTagsCount = Math.max(0, tags.length - 3);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Consistent brand monogram palette based on company name
  const companyChar = (company || "C").trim().charAt(0).toUpperCase();

  return (
    <motion.article
      onMouseMove={handleMouseMove}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 transition-all duration-200 shadow-sm hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.08)] hover:border-emerald-500/40 focus-within:ring-2 focus-within:ring-emerald-500",
        isUrgent && "border-rose-300/80 hover:border-rose-400",
        isFeatured && "border-emerald-400/80 bg-linear-to-b from-emerald-50/20 to-white",
        className
      )}
    >
      {/* Subtle cursor spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              360px circle at ${mouseX}px ${mouseY}px,
              rgba(31, 169, 113, 0.08) 0%,
              transparent 80%
            )
          `,
        }}
      />

      {/* Top Banner Badges (Urgent / Campus / Source) */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider",
              type === "gig"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                : "bg-blue-50 text-blue-700 border border-blue-200/60"
            )}
          >
            {type === "gig" ? (
              <>
                <Briefcase size={11} className="shrink-0" /> Campus Gig
              </>
            ) : (
              <>
                <GraduationCap size={11} className="shrink-0" /> Internship
              </>
            )}
          </span>

          {isUrgent && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/60">
              <Flame size={10} className="shrink-0" /> Urgent
            </span>
          )}

          {collegeId && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/60">
              <GraduationCap size={10} className="shrink-0" /> College Exclusive
            </span>
          )}
        </div>

        {source && (
          <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 shrink-0">
            {source}
          </span>
        )}
      </div>

      {/* Header: Company Avatar + Title + Actions */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden font-bold text-slate-700 text-lg">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={company}
                  fill
                  sizes="44px"
                  className="object-contain p-1"
                />
              ) : (
                <span>{companyChar}</span>
              )}
            </div>

            <div className="min-w-0">
              <Link
                href={href}
                className="group-hover:text-emerald-700 transition-colors focus:outline-hidden"
              >
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight line-clamp-1 leading-snug">
                  {title}
                </h3>
              </Link>
              <p className="text-xs sm:text-sm font-medium text-slate-500 truncate mt-0.5">
                {company}
              </p>
            </div>
          </div>

          {/* Action Buttons: Share, Bookmark, View Details */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={shareOpportunity}
              title="Share opportunity"
              aria-label={`Share: ${title}`}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors relative cursor-pointer"
            >
              {isCopied ? <Check size={15} className="text-emerald-600" /> : <Share2 size={15} />}
              {shareMessage && (
                <span className="absolute -top-7 right-0 text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded shadow-sm whitespace-nowrap z-20">
                  {shareMessage}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={toggleSave}
              title={isSaved ? "Saved" : "Save opportunity"}
              aria-label={isSaved ? `Unsave: ${title}` : `Save: ${title}`}
              className={cn(
                "p-2 rounded-lg transition-colors cursor-pointer",
                isSaved
                  ? "bg-emerald-50 text-emerald-600"
                  : "hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              )}
            >
              <Bookmark size={15} className={isSaved ? "fill-current" : ""} />
            </button>

            <HoverMagnetic strength={0.15}>
              <Link
                href={href}
                aria-label={`View details for ${title}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all hover:bg-emerald-600 hover:text-white"
              >
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </HoverMagnetic>
          </div>
        </div>

        {/* Primary Metadata Row: Location, Compensation, Work Mode/Duration */}
        <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-3 text-xs font-medium text-slate-600">
          <div className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="truncate max-w-[140px] sm:max-w-none">{location || "Remote"}</span>
            {distanceFormatted && (
              <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded-md">
                {distanceFormatted}
              </span>
            )}
          </div>

          <div className="inline-flex items-center gap-1 font-semibold text-slate-800">
            <DollarSign className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>{pay}</span>
          </div>

          {workMode && (
            <div className="inline-flex items-center gap-1 text-slate-500">
              <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="capitalize">{workMode}</span>
            </div>
          )}

          {duration && (
            <div className="inline-flex items-center gap-1 text-slate-500">
              <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{duration}</span>
            </div>
          )}
        </div>

        {/* Skill Tags */}
        {tags.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5 items-center">
            {displayTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200/60"
              >
                {tag}
              </span>
            ))}
            {remainingTagsCount > 0 && (
              <span className="text-[10px] font-semibold text-slate-400 px-1">
                +{remainingTagsCount} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quick Preview trigger */}
      {onQuickPreview && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickPreview();
            }}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-700 font-semibold transition-colors cursor-pointer"
          >
            <Eye size={13} />
            <span>Quick Preview</span>
          </button>

          <Link
            href={href}
            className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline text-[11px]"
          >
            Full Details &rarr;
          </Link>
        </div>
      )}
    </motion.article>
  );
}
