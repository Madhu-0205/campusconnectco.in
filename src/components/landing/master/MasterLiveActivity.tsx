"use client"

import { Briefcase, MapPin, IndianRupee, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"
import React from "react"

import { Reveal } from "@/components/ui/motion/Reveal"

interface Opportunity {
  id: string
  title: string
  company: string
  location: string
  budget?: string | number | null
  type: 'gig' | 'internship' | 'job'
  createdAt: Date
}

interface MasterLiveActivityProps {
  opportunities: Opportunity[]
}

export function MasterLiveActivity({ opportunities }: MasterLiveActivityProps) {
  
  if (!opportunities || opportunities.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#FAFCFA] py-24 lg:py-32 border-t border-gray-100 relative">
      <div className="absolute top-[10%] left-[5%] w-100 h-100 bg-[#E8F3EE]/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-350 relative z-10">
        
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1FA971] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1FA971]"></span>
                </span>
                <span className="text-sm font-bold text-[#1FA971] uppercase tracking-wider">Live Now</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#232B27] tracking-tight">
                Latest Opportunities
              </h2>
            </div>
            <Link 
              href="/opportunities" 
              className="inline-flex items-center gap-2 text-[#1FA971] hover:text-[#199160] font-bold transition-colors"
            >
              View all opportunities
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.slice(0, 6).map((opp, idx) => (
            <Reveal key={opp.id} delay={idx * 0.05}>
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-[0_5px_20px_-10px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.06)] hover:border-[#1FA971]/30 transition-all group flex flex-col h-full cursor-pointer">
                
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#E8F3EE] transition-colors shrink-0">
                    <Briefcase className="w-6 h-6 text-gray-400 group-hover:text-[#1FA971] transition-colors" />
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                    opp.type === 'gig' ? 'bg-blue-50 text-blue-600' :
                    opp.type === 'internship' ? 'bg-purple-50 text-purple-600' :
                    'bg-orange-50 text-orange-600'
                  }`}>
                    {opp.type}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#232B27] mb-2 line-clamp-2">{opp.title}</h3>
                <div className="text-sm text-gray-500 font-medium mb-6">{opp.company}</div>

                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-2 text-sm text-[#4A5550] font-medium">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {opp.location || "Remote"}
                  </div>
                  {opp.budget && (
                    <div className="flex items-center gap-2 text-sm text-[#4A5550] font-medium">
                      <IndianRupee className="w-4 h-4 text-gray-400" />
                      ₹{opp.budget}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mt-4 pt-4 border-t border-gray-50">
                    <Clock className="w-3 h-3" />
                    Posted recently
                  </div>
                </div>

              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}
