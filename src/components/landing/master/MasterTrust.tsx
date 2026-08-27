"use client"

import { ShieldCheck, Mail, Lock } from "lucide-react"
import React from "react"

import { Reveal } from "@/components/ui/motion/Reveal"

export function MasterTrust() {
  return (
    <section className="w-full bg-[#FAFCFA] py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-350">
        
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            <div className="p-10 lg:p-12 flex flex-col justify-center">
              <Reveal>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F3EE] text-xs font-semibold text-[#1FA971] mb-6">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Trust & Safety
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#232B27] tracking-tight mb-4 leading-tight">
                  A network built on <br/>
                  <span className="text-[#1FA971]">real identity.</span>
                </h2>
                <p className="text-lg text-[#4A5550] font-medium mb-8">
                  We don&apos;t allow anonymous profiles. CampusConnect ensures that every student and founder on the platform is exactly who they claim to be.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#1FA971]" />
                    <span className="font-bold text-[#232B27]">.edu Email Verification</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-[#1FA971]" />
                    <span className="font-bold text-[#232B27]">Secure Escrow System</span>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="bg-[#1FA971] p-10 lg:p-12 text-white relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <Reveal delay={0.2}>
                <h3 className="text-2xl font-bold mb-4">How Escrow Works</h3>
                <ol className="space-y-5 text-white/90 font-medium">
                  <li className="flex gap-3">
                    <span className="font-bold bg-white/20 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">1</span>
                    Founder deposits funds before the gig starts.
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold bg-white/20 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">2</span>
                    Student completes and submits the work.
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold bg-white/20 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm">3</span>
                    Founder approves, funds are released instantly.
                  </li>
                </ol>
              </Reveal>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
