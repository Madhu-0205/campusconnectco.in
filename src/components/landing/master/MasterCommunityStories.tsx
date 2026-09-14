"use client"

import React from "react"
import { Reveal } from "@/components/ui/motion/Reveal"

export function MasterCommunityStories() {
  return (
    <section className="w-full bg-white py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-350 text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAFCFA] border border-gray-100 text-sm font-semibold text-slate-500 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-400"></span>
            </span>
            Community Stories Coming Soon
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#232B27] tracking-tight mb-4">
            Real outcomes from real students
          </h2>
          <p className="text-lg text-[#4A5550] font-medium max-w-2xl mx-auto">
            We are collecting verified testimonials from the first cohort of students and founders building on CampusConnectCo. Check back soon for their stories.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
