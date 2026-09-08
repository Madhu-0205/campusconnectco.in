"use client"

import { MapPin, ArrowRight, Sparkles } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import React, { useRef, useEffect } from "react"

import { Reveal } from "@/components/ui/motion/Reveal"
import { MapProvider, useMapContext, MarkerData } from "@/components/v2/maps/MapContext"
import { MapDataSync } from "@/components/v2/maps/MapDataSync"

// Dynamically import ContextualMap
const ContextualMap = dynamic(() => import("@/components/v2/maps/ContextualMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#FAFCFA] flex items-center justify-center rounded-3xl border border-gray-100 min-h-95">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#1FA971] border-t-transparent animate-spin"></div>
        <span className="text-xs text-slate-500 font-medium">Loading interactive map...</span>
      </div>
    </div>
  )
})

export interface MapOpportunity {
  id: string
  title: string
  company: string
  location: string
  budget?: string | number | null
  type: 'gig' | 'internship' | 'job'
  lat?: number | null
  lng?: number | null
  href?: string
}

interface MasterMapSectionProps {
  opportunities?: MapOpportunity[]
}

function SynchronizedDiscoveryContent({ opportunities = [] }: { opportunities: MapOpportunity[] }) {
  const { selectedId, setSelectedId, hoveredId, setHoveredId } = useMapContext()
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Filter opportunities with coordinates for markers
  const oppsWithCoords = opportunities.filter(o => o.lat && o.lng && Number.isFinite(o.lat) && Number.isFinite(o.lng))
  const displayOpps = oppsWithCoords.length > 0 ? oppsWithCoords : opportunities.slice(0, 6)

  const markers: MarkerData[] = oppsWithCoords.map(o => ({
    id: o.id,
    type: o.type === 'gig' ? 'gig' : 'internship',
    lat: o.lat!,
    lng: o.lng!,
    title: o.title,
    subtitle: o.company,
    location: o.location,
    compensation: typeof o.budget === 'number' ? `₹${o.budget.toLocaleString('en-IN')}` : (o.budget ? String(o.budget) : undefined),
    url: o.href || (o.type === 'gig' ? `/gigs/${o.id}` : `/internships/${o.id}`)
  }))

  // Auto-scroll selected card into view
  useEffect(() => {
    if (selectedId && cardRefs.current.has(selectedId)) {
      const el = cardRefs.current.get(selectedId)
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedId])

  return (
    <>
      <MapDataSync markers={markers} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Interactive Opportunity List */}
        <div className="lg:col-span-5 flex flex-col items-start text-left">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#1FA971]/20 text-xs font-semibold text-[#1FA971] mb-4 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-[#1FA971]" />
              Hyperlocal Discovery
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#232B27] tracking-tight mb-3 leading-tight">
              Opportunities <br />
              <span className="text-[#1FA971]">around India.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#4A5550] font-medium mb-6 leading-relaxed">
              Explore real campus gigs and startup internships mapped across tech hubs and university regions. Select any role to spotlight it on the map.
            </p>
          </Reveal>

          {/* Scrollable list of active opportunity cards */}
          <div className="w-full max-h-115 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {displayOpps.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 text-slate-500 text-sm">
                No nearby opportunities found. Check back shortly.
              </div>
            ) : (
              displayOpps.map(opp => {
                const isSelected = selectedId === opp.id
                const isHovered = hoveredId === opp.id
                const detailHref = opp.href || (opp.type === 'gig' ? `/gigs/${opp.id}` : `/internships/${opp.id}`)
                const formattedBudget = typeof opp.budget === 'number' 
                  ? `₹${opp.budget.toLocaleString('en-IN')}` 
                  : (opp.budget ? (opp.budget.toString().startsWith('₹') ? opp.budget : `₹${opp.budget}`) : null)

                return (
                  <div
                    key={opp.id}
                    ref={el => {
                      if (el) cardRefs.current.set(opp.id, el)
                      else cardRefs.current.delete(opp.id)
                    }}
                    onClick={() => setSelectedId(opp.id)}
                    onMouseEnter={() => setHoveredId(opp.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                      isSelected 
                        ? 'bg-emerald-50/40 border-[#1FA971] ring-2 ring-[#1FA971]/20 shadow-md scale-[1.01]' 
                        : isHovered 
                        ? 'bg-white border-[#1FA971]/50 shadow-sm' 
                        : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          opp.type === 'gig' 
                            ? 'bg-primary/10 text-primary border border-primary/20' 
                            : 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                        }`}>
                          {opp.type === 'gig' ? 'Gig' : 'Internship'}
                        </span>
                        {opp.location && (
                          <span className="text-xs text-slate-500 flex items-center gap-1 truncate max-w-45">
                            <MapPin size={11} className="text-slate-400 shrink-0" />
                            <span className="truncate">{opp.location}</span>
                          </span>
                        )}
                      </div>
                      {formattedBudget && (
                        <span className="text-xs font-bold text-primary shrink-0">
                          {formattedBudget}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 truncate mb-1">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-slate-500 truncate mb-3">
                      {opp.company}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs">
                      <span className="text-[11px] text-slate-400">
                        {opp.lat && opp.lng ? 'Mapped location' : 'Remote'}
                      </span>
                      <Link
                        href={detailHref}
                        onClick={e => e.stopPropagation()}
                        className="font-bold text-primary hover:text-primary-dark hover:underline flex items-center gap-1"
                      >
                        View details
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="mt-4 pt-2 w-full">
            <Link
              href="/opportunities"
              className="text-xs font-bold text-slate-600 hover:text-primary flex items-center gap-1.5 transition-colors"
            >
              <Sparkles size={13} className="text-primary" />
              View full opportunity catalog with radius filters &rarr;
            </Link>
          </div>
        </div>

        {/* Right Column: Working MapLibre Map */}
        <div className="lg:col-span-7 w-full h-110 sm:h-120 lg:h-135 relative rounded-3xl overflow-hidden border border-gray-200 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.06)] bg-surface">
          <ContextualMap />
        </div>

      </div>
    </>
  )
}

export function MasterMapSection({ opportunities = [] }: MasterMapSectionProps) {
  return (
    <section className="w-full bg-[#FAFCFA] py-20 lg:py-28 border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-350">
        <MapProvider>
          <SynchronizedDiscoveryContent opportunities={opportunities} />
        </MapProvider>
      </div>
    </section>
  )
}

