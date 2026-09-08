"use client"

import { Briefcase, MapPin, ArrowRight, Clock } from "lucide-react"
import Link from"next/link"
import React from"react"

import { Reveal } from"@/components/ui/motion/Reveal"

interface Opportunity {
  id: string
  title: string
  company: string
  location: string
  budget?: string | number | null
  type: 'gig' | 'internship' | 'job'
  skills?: string[]
  createdAt: Date
}

interface MasterLiveActivityProps {
  opportunities: Opportunity[]
}

function getRelativeTime(date: Date | string) {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHrs / 24)
  if (diffHrs < 1) return 'Posted just now'
  if (diffHrs < 24) return `Posted ${diffHrs}h ago`
  if (diffDays === 1) return 'Posted yesterday'
  if (diffDays < 30) return `Posted ${diffDays}d ago`
  return 'Recently posted'
}

export function MasterLiveActivity({ opportunities }: MasterLiveActivityProps) {
  if (!opportunities || opportunities.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#FAFCFA] py-20 lg:py-28 border-t border-gray-100 relative">
      <div className="absolute top-[10%] left-[5%] w-100 h-100 bg-[#E8F3EE]/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-350 relative z-10">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 lg:mb-14 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1FA971] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1FA971]"></span>
                </span>
                <span className="text-xs font-bold text-[#1FA971] uppercase tracking-wider">Live Opportunities</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#232B27] tracking-tight">
                Latest from verified founders
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Real gigs and internships currently accepting student applications.
              </p>
            </div>
            <Link 
              href="/opportunities" 
              className="inline-flex items-center gap-2 text-sm font-bold text-[#1FA971] hover:text-[#199160] transition-colors group"
            >
              Explore all opportunities
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.slice(0, 6).map((opp, idx) => {
            const detailHref = opp.type === 'gig' ? `/gigs/${opp.id}` : `/internships/${opp.id}`
            const formattedBudget = typeof opp.budget === 'number' 
              ? `₹${opp.budget.toLocaleString('en-IN')}` 
              : (opp.budget ? (opp.budget.toString().startsWith('₹') ? opp.budget : `₹${opp.budget}`) : null)

            return (
              <Reveal key={opp.id} delay={idx * 0.04}>
                <Link
                  href={detailHref}
                  className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(31,169,113,0.12)] hover:border-[#1FA971]/30 transition-all duration-300 group flex flex-col h-full hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#E8F3EE] transition-colors shrink-0">
                      <Briefcase className="w-5 h-5 text-gray-400 group-hover:text-[#1FA971] transition-colors" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      opp.type === 'gig' 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                    }`}>
                      {opp.type === 'gig' ? 'Gig' : 'Internship'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#232B27] mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                    {opp.title}
                  </h3>
                  <div className="text-sm text-gray-500 font-medium mb-4">{opp.company}</div>

                  <div className="mt-auto space-y-2.5 pt-3 border-t border-gray-100/80">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-slate-600 truncate">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{opp.location || "Remote"}</span>
                      </span>
                      {formattedBudget && (
                        <span className="text-primary font-bold shrink-0 ml-2">
                          {formattedBudget}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {getRelativeTime(opp.createdAt)}
                      </span>
                      <span className="text-primary group-hover:underline font-bold text-xs">
                        View details &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>

      </div>
    </section>
  )
}
