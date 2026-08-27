import { Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import React from "react"

import { HoverMagnetic } from "@/components/ui/motion/HoverMagnetic"
import { DesignNode } from "@/components/v2/inspector/DesignNode"

interface OpportunityMatch {
  id: string
  title: string
  company: string
  matchScore: number
  type: "GIG" | "INTERNSHIP"
}

interface OpportunitiesWidgetProps {
  opportunities: OpportunityMatch[]
}

export const OpportunitiesWidget = ({ opportunities }: OpportunitiesWidgetProps) => {
  return (
    <DesignNode
      metadata={{
        name: "OpportunitiesWidget",
        tokens: ['bg-surface-2', 'border-border', 'rounded-2xl'],
        typography: "Inter (Sans)",
        motionPreset: "HoverMagnetic on items",
        borderRadius: "rounded-2xl",
        elevation: "shadow-sm",
        colors: "surface-2, foreground",
        spacing: "p-6, space-y-4",
        accessibilityNotes: "List format for opportunities"
      }}
    >
      <div className="rounded-2xl bg-surface border border-border p-6 flex flex-col h-full shadow-card hover:border-primary/30 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-foreground flex items-center gap-2">
            <Sparkles size={18} className="text-primary" /> Top Matches
          </h2>
          <Link href="/dashboard/student/smartmatch" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-1">
            Discover <ArrowRight size={12} />
          </Link>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          {opportunities.length > 0 ? (
            opportunities.map((opp) => (
              <HoverMagnetic key={opp.id} strength={0.03}>
                <Link href={opp.type === 'GIG' ? `/gigs/${opp.id}` : `/internships/${opp.id}`} className="block">
                  <div className="p-4 rounded-xl bg-surface-2 border border-transparent hover:border-primary/50 transition-all group flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center font-black text-foreground shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                      {opp.company.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">{opp.title}</h4>
                      <p className="text-xs font-medium text-muted-foreground truncate">{opp.company}</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end">
                      <span className="text-xs font-black text-success bg-success/10 px-2 py-1 rounded-md">{opp.matchScore}% Match</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{opp.type}</span>
                    </div>
                  </div>
                </Link>
              </HoverMagnetic>
            ))
          ) : (
             <div className="flex flex-col items-center justify-center flex-1 py-8 text-center bg-surface-2 rounded-xl border border-dashed border-border">
              <Sparkles size={24} className="text-muted-foreground/50 mb-2" />
              <p className="text-sm font-bold text-muted-foreground">No matches found</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Update your skills to get AI matches.</p>
            </div>
          )}
        </div>
      </div>
    </DesignNode>
  )
}
