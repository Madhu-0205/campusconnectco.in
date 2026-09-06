"use client"

import { AnimatePresence, motion } from "framer-motion"
import { LayoutGrid, List, ChevronRight } from "lucide-react"
import Image from "next/image"
import React, { useState } from "react"

import { GigCard } from "@/components/v2/GigCard"
import { InternshipCard } from "@/components/v2/InternshipCard"
import { useMapContext } from "@/components/v2/maps/MapContext"

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

function useSafeMapContext() {
  try {
    return useMapContext()
  } catch {
    return null
  }
}

export const OpportunityFeed = ({
  opportunities,
  emptyMessage = "No opportunities found.",
  className
}: OpportunityFeedProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const mapContext = useSafeMapContext()

  return (
    <div className={className}>
      {opportunities.length > 0 && (
        <div className="flex justify-end mb-6">
          <div className="bg-surface rounded-xl p-1 inline-flex gap-1">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-surface-2 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-surface-2 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
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
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface-2 p-12 text-center">
              <p className="text-muted-foreground font-medium">{emptyMessage}</p>
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
              const isSelected = mapContext?.selectedId === opp.id
              const isHovered = mapContext?.hoveredId === opp.id

              return (
                <motion.div 
                  key={opp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className={`relative transition-all duration-200 rounded-2xl ${
                    isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg' : ''
                  } ${isHovered ? 'scale-[1.01]' : ''}`}
                  onMouseEnter={() => mapContext?.setHoveredId(opp.id)}
                  onMouseLeave={() => mapContext?.setHoveredId(null)}
                  onClick={() => mapContext?.setSelectedId(opp.id)}
                >
                  {/* Type badge */}
                  <div className={`absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${opp.type === 'gig' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'}`}>
                    {opp.type === 'gig' ? 'Gig' : 'Internship'}
                  </div>
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
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <motion.div 
            key="list" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="flex flex-col rounded-2xl bg-background overflow-hidden"
          >
            {opportunities.map((opp, i) => {
              const isSelected = mapContext?.selectedId === opp.id
              const isHovered = mapContext?.hoveredId === opp.id

              return (
                <motion.a
                  key={opp.id}
                  href={opp.href}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02, duration: 0.15 }}
                  className={`flex items-center justify-between p-4 group hover:bg-surface-2 transition-colors cursor-pointer ${
                    i !== opportunities.length - 1 ? 'border-b border-border' : ''
                  } ${isSelected ? 'bg-primary/10 border-l-4 border-l-primary' : ''} ${isHovered ? 'bg-surface-2' : ''}`}
                  onMouseEnter={() => mapContext?.setHoveredId(opp.id)}
                  onMouseLeave={() => mapContext?.setHoveredId(null)}
                  onClick={() => mapContext?.setSelectedId(opp.id)}
                >
                  <div className="flex items-center gap-4">
                    {opp.logoUrl ? (
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                        <Image src={opp.logoUrl} alt={opp.company} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                        {opp.company.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm group-hover:text-primary transition-colors flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${opp.type === 'gig' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-600'}`}>
                          {opp.type === 'gig' ? 'Gig' : 'Internship'}
                        </span>
                        {opp.title}
                        {opp.isUrgent && <span className="w-2 h-2 rounded-full bg-destructive" />}
                        {opp.isFeatured && <span className="w-2 h-2 rounded-full bg-warning" />}
                      </h4>
                      <p className="text-xs text-muted-foreground font-medium">{opp.company} &middot; {opp.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                    <span className="hidden sm:inline-block">
                      {opp.type === "gig" 
                        ? `${opp.compensation} • ${opp.duration}`
                        : `${opp.stipend} • ${opp.workType}`
                      }
                    </span>
                    <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary -translate-x-2 group-hover:translate-x-0 transform" />
                  </div>
                </motion.a>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
