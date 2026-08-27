"use client"

import { motion } from "framer-motion"
import { Briefcase, MapPin, CheckCircle, Search, Sparkles } from "lucide-react"
import Link from "next/link"
import React from "react"

import { StaggerContainer as Stagger, StaggerItem } from "@/components/ui/motion/Stagger"

export function MasterHero() {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center pt-24 pb-20 overflow-hidden bg-[#FAFCFA]">
      {/* Background Decorators - Soft Green Atmospheric Blobs */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex justify-center">
        {/* Soft green glow top right */}
        <div className="absolute top-[-5%] right-[-5%] w-150 h-150 bg-[#1FA971]/5 rounded-full blur-[120px]" />
        {/* Warm white glow top left */}
        <div className="absolute top-[10%] left-[-10%] w-125 h-125 bg-[#F2EDE4]/40 rounded-full blur-[100px]" />
        {/* Subtle green bottom center */}
        <div className="absolute bottom-[-10%] left-[20%] w-200 h-100 bg-[#E8F3EE]/60 rounded-[100%] blur-[120px]" />
      </div>

      <div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8 max-w-350">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          
          {/* Left Column: Text & CTA */}
          <div className="lg:col-span-6 flex flex-col items-start text-left lg:pr-8">
            <Stagger staggerChildren={0.15}>
              <StaggerItem>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#1FA971]/20 text-xs font-semibold text-[#1FA971] mb-6 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Find the right opportunity around you
                </div>
              </StaggerItem>

              <StaggerItem>
                <h1 className="text-[2.75rem] sm:text-[3.5rem] lg:text-[4.5rem] leading-[1.1] font-extrabold text-[#232B27] mb-6 tracking-tight">
                  Your career network, <br className="hidden lg:block" />
                  <span className="text-[#1FA971]">built for students.</span>
                </h1>
              </StaggerItem>

              <StaggerItem>
                <p className="text-lg md:text-xl text-[#4A5550] max-w-lg mb-10 font-medium leading-relaxed">
                  CampusConnect connects you with local internships, campus gigs, and startup jobs. Build your verified profile, track applications, and get paid securely.
                </p>
              </StaggerItem>

              <StaggerItem>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <Link 
                    href="/join" 
                    className="w-full sm:w-auto px-8 h-14 rounded-xl bg-[#1FA971] hover:bg-[#199160] text-white font-bold flex items-center justify-center transition-all shadow-lg shadow-[#1FA971]/20 text-lg hover:-translate-y-0.5"
                  >
                    Explore Opportunities
                  </Link>
                  <Link 
                    href="/auth/founder"
                    className="w-full sm:w-auto px-8 h-14 rounded-xl bg-white border border-gray-200 text-[#232B27] font-semibold flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm text-lg hover:-translate-y-0.5"
                  >
                    I&apos;m hiring talent
                  </Link>
                </div>
              </StaggerItem>
              
              <StaggerItem>
                 <div className="mt-8 flex items-center gap-2 text-sm text-[#4A5550] font-medium">
                  <CheckCircle className="w-4 h-4 text-[#1FA971]" />
                  Verified profiles
                  <span className="mx-2 text-gray-300">•</span>
                  <CheckCircle className="w-4 h-4 text-[#1FA971]" />
                  Secure escrow
                </div>
              </StaggerItem>
            </Stagger>
          </div>

          {/* Right Column: Visual Product Demonstration */}
          <div className="lg:col-span-6 relative h-125 lg:h-162.5 w-full flex items-center justify-center perspective-1000">
            {/* The main UI mock - Search / Map concept */}
            <motion.div 
              initial={{ opacity: 0, y: 40, rotateX: 5 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute z-10 w-full max-w-120 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100/80 overflow-hidden"
            >
                {/* Mock Header */}
                <div className="h-14 border-b border-gray-100 flex items-center px-6 bg-[#FAFCFA]/50">
                    <div className="w-full h-8 bg-white border border-gray-100 rounded-lg flex items-center px-3 gap-2 text-gray-400">
                        <Search className="w-4 h-4" />
                        <span className="text-sm">Software Engineering in Bangalore...</span>
                    </div>
                </div>
                {/* Mock Content */}
                <div className="p-6 space-y-4 bg-white">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-bold text-[#232B27]">Nearby Opportunities</div>
                        <div className="text-xs text-[#1FA971] font-semibold">View map</div>
                    </div>
                    {/* Mock Job 1 */}
                    <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#E8F3EE] flex items-center justify-center shrink-0">
                            <Briefcase className="w-5 h-5 text-[#1FA971]" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold text-[#232B27]">Frontend Developer Intern</div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> HSR Layout • 2.5 km away
                            </div>
                        </div>
                    </div>
                    {/* Mock Job 2 */}
                     <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                            <Briefcase className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold text-[#232B27]">React Native Freelance</div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Koramangala • 4.1 km away
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Floating Card 1 - Application Status */}
            <motion.div 
              initial={{ opacity: 0, x: 20, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute top-[10%] right-[-5%] lg:right-[5%] z-20 bg-white rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 p-5 w-60"
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#1FA971]/10 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-[#1FA971]" />
                    </div>
                    <div className="text-sm font-bold text-[#232B27]">Under Review</div>
                </div>
                <div className="text-xs text-gray-500 font-medium">UI/UX Design Gig</div>
                <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#1FA971] w-1/2 h-full rounded-full"></div>
                </div>
            </motion.div>

            {/* Floating Card 2 - Recommendation */}
            <motion.div 
              initial={{ opacity: 0, x: -20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute bottom-[20%] left-[-5%] lg:left-[0%] z-20 bg-[#1FA971] rounded-2xl shadow-[0_15px_40px_-10px_rgba(31,169,113,0.3)] p-5 w-55 text-white"
            >
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-white/90" />
                    <div className="text-xs font-bold text-white/90 uppercase tracking-wider">Top Match</div>
                </div>
                <div className="text-sm font-bold text-white mt-2 leading-tight">Product Marketing Intern</div>
                <div className="text-xs text-white/80 mt-1">Matches your &quot;Marketing&quot; skill</div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  )
}
