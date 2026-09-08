"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { Briefcase, MapPin, GraduationCap, ArrowUpRight, Bookmark, Share2, Check, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { MouseEvent } from "react";

import { HoverMagnetic } from "@/components/ui/motion/HoverMagnetic";
import { useOpportunityEngagement } from "@/hooks/useOpportunityEngagement";
import { cn } from "@/lib/utils";

interface InternshipCardProps {
  id?: string;
  role: string;
  company: string;
  location: string;
  type: string;
  stipend: string;
  tags: string[];
  logoUrl?: string;
  href: string;
  className?: string;
  isUrgent?: boolean;
  collegeId?: string | null;
  distanceFormatted?: string;
  onQuickPreview?: () => void;
}

export const InternshipCard = ({
  id,
  role,
  company,
  location,
  type,
  stipend,
  tags,
  logoUrl,
  href,
  className,
  isUrgent,
  collegeId,
  distanceFormatted,
  onQuickPreview,
}: InternshipCardProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Extract ID from href if not provided
  const opportunityId = id || href.replace("/internships/", "");
  const { isSaved, isCopied, shareMessage, toggleSave, shareOpportunity } =
    useOpportunityEngagement({
      id: opportunityId,
      type: "internship",
      title: role,
    });

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface p-6 transition-all duration-300 hover:shadow-card-hover hover:border-primary/40 shadow-card border",
        isUrgent ? "border-error/30" : "border-border",
        className
      )}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
          radial-gradient(
            450px circle at ${mouseX}px ${mouseY}px,
            var(--color-primary) 0%,
            transparent 100%
          )
        `,
          opacity: 0.08,
        }}
      />
      {isUrgent ? (
        <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl bg-error/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-error">
          Urgent Hiring
        </div>
      ) : collegeId ? (
        <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
          <GraduationCap size={12} /> Campus Opportunity
        </div>
      ) : null}

      <div>
        <div className="flex gap-4 items-start justify-between">
          <div className="flex gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface border border-border shadow-xs overflow-hidden p-2">
              {logoUrl ? (
                <Image src={logoUrl} alt={company} fill className="object-contain p-2" />
              ) : (
                <span className="text-2xl font-bold text-foreground">
                  {company.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex flex-col justify-center min-w-0 pr-2">
              <Link href={href} className="hover:text-primary transition-colors">
                <h3 className="text-lg font-heading font-semibold tracking-wide text-foreground line-clamp-1">
                  {role}
                </h3>
              </Link>
              <p className="text-sm font-medium text-muted-foreground mt-0.5 truncate">
                {company}
              </p>
            </div>
          </div>

          {/* Action buttons: Bookmark, Share */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={shareOpportunity}
              title="Share internship"
              aria-label={`Share internship: ${role}`}
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
              title={isSaved ? "Saved" : "Save internship"}
              aria-label={isSaved ? `Unsave internship: ${role}` : `Save internship: ${role}`}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                isSaved
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-surface-2 text-muted-foreground hover:text-foreground"
              )}
            >
              <Bookmark size={14} className={isSaved ? "fill-current" : ""} />
            </button>

            <HoverMagnetic strength={0.2}>
              <Link
                href={href}
                aria-label={`View details for ${role}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs transition-transform hover:scale-105"
              >
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </HoverMagnetic>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{location}</span>
            {distanceFormatted && (
              <span className="text-primary font-bold text-[11px] bg-primary/10 px-1.5 py-0.5 rounded-md shrink-0">
                {distanceFormatted}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5 text-text-3" />
            <span className="truncate">{type}</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-text col-span-2">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            <span>{stipend}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium text-text-2"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="inline-flex items-center rounded-md bg-transparent px-1 py-0.5 text-xs font-medium text-muted-foreground">
              +{tags.length - 3}
            </span>
          )}
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
