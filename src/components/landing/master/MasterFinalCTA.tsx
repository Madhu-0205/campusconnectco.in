"use client"

import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import React from "react"

import { Reveal } from "@/components/ui/motion/Reveal"


export function MasterFinalCTA() {
  return (
    <section className="w-full bg-white py-24 lg:py-32 relative overflow-hidden">
      
      {/* Background styling for the CTA block */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <div className="w-200 h-200 bg-[#1FA971]/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-300 relative z-10">
        
        <Reveal>
          <div className="bg-[#232B27] rounded-[40px] p-10 sm:p-16 lg:p-24 text-center relative overflow-hidden shadow-2xl">
            
            {/* Inner glow */}
            <div className="absolute top-[-20%] right-[-10%] w-125 h-125 bg-[#1FA971]/20 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold text-white mb-8">
                <Sparkles className="w-4 h-4 text-[#1FA971]" />
                Join the network
              </div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-8 leading-tight">
                Your next opportunity <br className="hidden sm:block"/>
                starts here.
              </h2>
              
              <p className="text-lg lg:text-xl text-gray-300 font-medium mb-12 max-w-2xl mx-auto">
                Join thousands of verified students and local founders already connecting on CampusConnect.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/join" 
                  className="w-full sm:w-auto px-8 h-16 rounded-xl bg-[#1FA971] hover:bg-[#199160] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_40px_-10px_rgba(31,169,113,0.5)] hover:shadow-[0_0_60px_-10px_rgba(31,169,113,0.6)] text-lg hover:-translate-y-1"
                >
                  Create verified profile
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/auth/founder" 
                  className="w-full sm:w-auto px-8 h-16 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold flex items-center justify-center transition-all text-lg hover:-translate-y-1"
                >
                  Post an opportunity
                </Link>
              </div>
            </div>

          </div>
        </Reveal>

      </div>
    </section>
  )
}
