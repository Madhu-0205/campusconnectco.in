"use client"

import { MapPin } from "lucide-react"
import dynamic from "next/dynamic"
import React from "react"

import { Reveal } from "@/components/ui/motion/Reveal"
import { MapProvider } from "@/components/v2/maps/MapContext"

// Import the real map component dynamically
const ContextualMap = dynamic(() => import("@/components/v2/maps/ContextualMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-3xl border border-gray-100">
      <div className="w-8 h-8 rounded-full border-2 border-[#1FA971] border-t-transparent animate-spin"></div>
    </div>
  )
})

export function MasterMapSection() {
  return (
    <section className="w-full bg-[#FAFCFA] py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-350">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5 flex flex-col items-start text-left lg:pr-8">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#1FA971]/20 text-xs font-semibold text-[#1FA971] mb-6 shadow-sm">
                <MapPin className="w-3.5 h-3.5" />
                Hyperlocal Discovery
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#232B27] tracking-tight mb-6 leading-tight">
                Opportunities <br/>
                <span className="text-[#1FA971]">around you.</span>
              </h2>
              <p className="text-lg text-[#4A5550] font-medium mb-8 leading-relaxed">
                Why apply to remote jobs with 10,000 applicants when local founders are hiring right next to your campus? CampusConnect puts local gigs and internships on the map.
              </p>
              
              <ul className="space-y-4 text-[#4A5550] font-medium w-full">
                <li className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F3EE] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#1FA971]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#232B27]">Local Startups</div>
                    <div className="text-xs text-gray-500">Find founders near your college</div>
                  </div>
                </li>
                <li className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                   <div className="w-10 h-10 rounded-xl bg-[#E8F3EE] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#1FA971]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#232B27]">Campus Gigs</div>
                    <div className="text-xs text-gray-500">Short-term work within walking distance</div>
                  </div>
                </li>
              </ul>
            </Reveal>
          </div>

          <div className="lg:col-span-7 h-125 lg:h-175 relative rounded-3xl overflow-hidden border border-gray-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
             <MapProvider>
               <ContextualMap />
             </MapProvider>
          </div>
        </div>

      </div>
    </section>
  )
}
