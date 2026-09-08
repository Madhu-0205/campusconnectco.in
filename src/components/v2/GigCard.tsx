"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { Clock, MapPin, DollarSign, ArrowRight, GraduationCap, Bookmark, Share2, Check, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { MouseEvent } from "react";

import { HoverMagnetic } from "@/components/ui/motion/HoverMagnetic";
import { useOpportunityEngagement } from "@/hooks/useOpportunityEngagement";
import { cn } from "@/lib/utils";

interface GigCardProps {
  id?: string;
  title: string;
  company: string;
  location: string;
  compensation: string;
  duration: string;
  tags: string[];
  logoUrl?: string;
  href: string;
  className?: string;
  isFeatured?: boolean;
  collegeId?: string | null;
  distanceFormatted?: string;
  onQuickPreview?: () => void;
}

export const GigCard = ({
  id,
  title,
  company,
  location,
  compensation,
  duration,
  tags,
  logoUrl,
  href,
  className,
  isFeatured,
  collegeId,
  distanceFormatted,
  onQuickPreview,
}: GigCardProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Extract ID from href if not provided
  const opportunityId = id || href.replace("/gigs/", "");
  const { isSaved, isCopied, shareMessage, toggleSave, shareOpportunity } =
    useOpportunityEngagement({
      id: opportunityId,
      type: "gig",
      title,
    });

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface p-6 transition-all duration-300 hover:shadow-card-hover hover:border-primary/40 shadow-card border",
        isFeatured ? "border-primary/30" : "border-border",
        className
      )}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
          radial-gradient(
            400px circle at ${mouseX}px ${mouseY}px,
            var(--color-primary) 0%,
            transparent 100%
          )
        `,
          opacity: 0.1,
        }}
      />

      {/* Glow Effect for Featured */}
      {isFeatured && (
        <div className="absolute -right-20 -top-20 -z-10 h-40 w-40 rounded-full bg-primary/20 blur-[60px]" />
      )}

      {collegeId && (
        <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
          <GraduationCap size={12} /> Campus Opportunity
        </div>
      )}

      <div>
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2 overflow-hidden">
              {logoUrl ? (
                <Image src={logoUrl} alt={company} fill className="object-cover" />
              ) : (
                <span className="text-xl font-bold text-muted-foreground">
                  {company.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0 pr-2">
              <Link href={href} className="hover:text-primary transition-colors">
                <h3 className="text-lg font-heading font-semibold tracking-wide text-foreground line-clamp-1">
                  {title}
                </h3>
              </Link>
              <p className="text-sm font-medium text-muted-foreground truncate">
                {company}
              </p>
            </div>
          </div>

          {/* Action buttons: Bookmark, Share, Navigate */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={shareOpportunity}
              title="Share gig"
              aria-label={`Share gig: ${title}`}
              className="p-1.5 rounded-lg hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-colors relative cursor-pointer"
            >
              {isCopied ? <Check size={14} className="text-primary" /> : <Share2 size={14} />}
              {shareMessage && (
                <span className="absolute -top-7 right-0 text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                  {shareMessage}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={toggleSave}
              title={isSaved ? "Saved" : "Save gig"}
              aria-label={isSaved ? `Unsave gig: ${title}` : `Save gig: ${title}`}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                isSaved
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-surface-2 text-muted-foreground hover:text-foreground"
              )}
            >
              <Bookmark size={14} className={isSaved ? "fill-current" : ""} />
            </button>

            <HoverMagnetic strength={0.1}>
              <Link
                href={href}
                aria-label={`View details for ${title}`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            </HoverMagnetic>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{location}</span>
            {distanceFormatted && (
              <span className="text-primary font-bold text-[11px] bg-primary/10 px-1.5 py-0.5 rounded-md">
                {distanceFormatted}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-text">
            <DollarSign className="h-3.5 w-3.5 text-primary" />
            {compensation}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {duration}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-2"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Preview trigger */}
      {onQuickPreview && (
        <div className="mt-4 pt-3 border-t border-border/40 flex justify-between items-center text-xs">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickPreview();
            }}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary font-semibold transition-colors cursor-pointer"
          >
            <Eye size={13} />
            <span>Quick Preview</span>
          </button>

          <Link
            href={href}
            className="font-bold text-primary hover:underline text-[11px]"
          >
            Full Details &rarr;
          </Link>
        </div>
      )}
    </motion.div>
  );
};
