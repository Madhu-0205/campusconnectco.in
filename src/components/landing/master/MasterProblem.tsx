"use client"

import { SearchX, UserX } from "lucide-react"
import React from "react"

import { Reveal } from "@/components/ui/motion/Reveal"

export function MasterProblem() {
  return (
    <section className="w-full bg-[#FAFCFA] py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-350">
        
        <Reveal>
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#232B27] tracking-tight mb-6 leading-tight">
              Finding an opportunity shouldn&apos;t feel like searching the entire internet.
            </h2>
            <p className="text-lg text-[#4A5550] font-medium">
              The gap between campus talent and local startups is real. Current platforms fail both sides.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 max-w-5xl mx-auto">
          {/* Problem for Students */}
          <Reveal delay={0.1}>
            <div className="bg-white p-8 lg:p-12 rounded-3xl border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[100px] -z-10 transition-colors group-hover:bg-[#1FA971]/5"></div>
              
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 border border-gray-100">
                <SearchX className="w-6 h-6 text-gray-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-[#232B27] mb-6">Students struggle with:</h3>
              <ul className="space-y-4 text-[#4A5550] font-medium">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1FA971] mt-2 shrink-0"></div>
                  <span>Scattered opportunities across generic job boards</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1FA971] mt-2 shrink-0"></div>
                  <span>No visibility into local, campus-specific roles</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1FA971] mt-2 shrink-0"></div>
                  <span>Uncertain trust and unresponsive recruiters</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1FA971] mt-2 shrink-0"></div>
                  <span>Difficult application tracking and zero feedback</span>
                </li>
              </ul>
            </div>
          </Reveal>

          {/* Problem for Founders */}
          <Reveal delay={0.2}>
            <div className="bg-white p-8 lg:p-12 rounded-3xl border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[100px] -z-10 transition-colors group-hover:bg-[#1FA971]/5"></div>
              
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 border border-gray-100">
                <UserX className="w-6 h-6 text-gray-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-[#232B27] mb-6">Founders struggle with:</h3>
              <ul className="space-y-4 text-[#4A5550] font-medium">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0"></div>
                  <span>Finding affordable, verified local talent quickly</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0"></div>
                  <span>Sifting through hundreds of irrelevant applications</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0"></div>
                  <span>Managing short-term gig payments securely</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0"></div>
                  <span>Communicating efficiently with student freelancers</span>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  )
}
