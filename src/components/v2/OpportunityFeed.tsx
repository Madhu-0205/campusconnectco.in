"use client"

import { AnimatePresence } from "framer-motion"
import React from "react"

import { StaggerContainer as Stagger, StaggerItem } from "@/components/ui/motion/Stagger"
import { GigCard } from "@/components/v2/GigCard"
import { InternshipCard } from "@/components/v2/InternshipCard"

export interface Opportunity {
  id: string
  type: "gig" | "internship"
  title: string
  company: string
  location: string
  compensation?: string
  stipend?: string
  duration?: string
  workType?: string
  tags: string[]
  logoUrl?: string
  href: string
  isFeatured?: boolean
  isUrgent?: boolean
}

interface OpportunityFeedProps {
  opportunities: Opportunity[]
  emptyMessage?: string
  className?: string
}

export const OpportunityFeed = ({
  opportunities,
  emptyMessage = "No opportunities found.",
  className
}: OpportunityFeedProps) => {
  return (
    <div className={className}>
      <AnimatePresence mode="popLayout">
        {opportunities.length === 0 ? (
          <Stagger key="empty" staggerChildren={0.1}>
            <StaggerItem>
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface-2 p-12 text-center">
                <p className="text-muted-foreground font-medium">{emptyMessage}</p>
              </div>
            </StaggerItem>
          </Stagger>
        ) : (
          <Stagger key="feed" staggerChildren={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <StaggerItem key={opp.id}>
                {opp.type === "gig" ? (
                  <GigCard
                    title={opp.title}
                    company={opp.company}
                    location={opp.location}
                    compensation={opp.compensation || "Negotiable"}
                    duration={opp.duration || "Flexible"}
                    tags={opp.tags}
                    logoUrl={opp.logoUrl}
                    href={opp.href}
                    isFeatured={opp.isFeatured}
                    className="h-full"
                  />
                ) : (
                  <InternshipCard
                    role={opp.title}
                    company={opp.company}
                    location={opp.location}
                    type={opp.workType || "Full-time"}
                    stipend={opp.stipend || "Unpaid"}
                    tags={opp.tags}
                    logoUrl={opp.logoUrl}
                    href={opp.href}
                    isUrgent={opp.isUrgent}
                    className="h-full"
                  />
                )}
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </AnimatePresence>
    </div>
  )
}
