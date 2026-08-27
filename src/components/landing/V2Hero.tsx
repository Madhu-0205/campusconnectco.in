"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import React from "react"

import { StaggerContainer as Stagger, StaggerItem } from "@/components/ui/motion/Stagger"

export function V2Hero() {
  const handleOpenCommandCenter = () => {
    document.dispatchEvent(new CustomEvent('open-command-center'))
  }

  return (
    <section className="relative min-h-[calc(100vh-100px)] lg:min-h-200 flex items-center justify-center pt-24 pb-16 overflow-hidden bg-[#FAFCFA]">
      
      {/* Background Decorators - Pale Green/Beige Large Circles */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Top Left Beige/Cream */}
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-[#F2EDE4]/60 rounded-full blur-[80px]" />
        
        {/* Right Green */}
        <div className="absolute top-[10%] right-[-10%] w-[50vw] h-[50vw] bg-[#EAF5EF]/80 rounded-full blur-[100px]" />
        
        {/* Bottom Left Greenish */}
        <div className="absolute bottom-[-20%] left-[10%] w-[40vw] h-[40vw] bg-[#E8F3EE]/60 rounded-full blur-[100px]" />
      </div>

      <div className="container relative z-20 mx-auto px-6 lg:px-12 max-w-350">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text & CTA */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <Stagger staggerChildren={0.15}>
              
              <StaggerItem>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F3EE] text-xs font-bold text-[#1FA971] mb-6 tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1FA971]"></span>
                  Your career earning on autopilot
                </div>
              </StaggerItem>

              <StaggerItem>
                <h1 className="text-[2.75rem] leading-[1.1] sm:text-6xl lg:text-[4.5rem] lg:leading-[1.05] font-extrabold text-[#232B27] mb-6 tracking-tight">
                  Start your career, <br className="hidden sm:block" />
                  with opportunities that <span className="text-[#1FA971]">come to you.</span>
                </h1>
              </StaggerItem>

              <StaggerItem>
                <p className="text-lg md:text-xl text-gray-600 max-w-lg mb-10 font-medium leading-relaxed">
                  Support, networking, applications, and gigs with artificial intelligence, in a single place. <span className="font-bold text-gray-800">No juggling five different platforms, no need to send cold emails.</span>
                </p>
              </StaggerItem>

              <StaggerItem>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <Link 
                    href="/join" 
                    className="w-full sm:w-auto px-8 h-14 rounded-xl bg-[#1FA971] hover:bg-[#199160] text-white font-bold flex items-center justify-center transition-colors shadow-lg shadow-green-500/20 text-lg"
                  >
                    Join the free network
                  </Link>
                  <button 
                    onClick={handleOpenCommandCenter}
                    className="w-full sm:w-auto px-8 h-14 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm text-lg"
                  >
                    See how it works
                  </button>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="mt-8 flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1FA971]"></span>
                  Official launch: August 31, 2026, at 7pm (IST)
                </div>
              </StaggerItem>

            </Stagger>
          </div>

          {/* Right Column: Visual Mascot & Cards */}
          <div className="lg:col-span-6 relative h-125 lg:h-175 w-full flex items-center justify-center">
            {/* The Mascot */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative z-10 w-full max-w-100 lg:max-w-125 aspect-3/4"
            >
                {/* 
                  Normally there would be a mascot image here. 
                  We use a placeholder gradient circle and mock interface elements to simulate the visual weight of the Mascot.
                */}
                <div className="absolute inset-0 bg-linear-to-tr from-[#1FA971] to-[#35C489] rounded-[40px] opacity-10 shadow-2xl rotate-3"></div>
                <div className="absolute inset-0 bg-white rounded-[40px] shadow-xl border border-gray-100 flex flex-col items-center justify-center overflow-hidden">
                    <div className="w-32 h-32 bg-[#E8F3EE] rounded-full flex items-center justify-center mb-8">
                        <Sparkles className="w-16 h-16 text-[#1FA971]" />
                    </div>
                    <div className="space-y-4 w-3/4">
                        <div className="h-4 bg-gray-100 rounded-full w-full"></div>
                        <div className="h-4 bg-gray-100 rounded-full w-5/6"></div>
                        <div className="h-4 bg-[#1FA971]/20 rounded-full w-4/6"></div>
                    </div>
                </div>
            </motion.div>

            {/* Floating Card 1 - Top Right */}
            <motion.div 
              initial={{ opacity: 0, x: 20, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute top-[10%] right-[-5%] lg:right-[-10%] z-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-55"
            >
                <div className="text-sm font-bold text-gray-900 mb-1">+128 new gigs</div>
                <div className="text-xs text-gray-500">posted this week</div>
            </motion.div>

            {/* Floating Card 2 - Mid Left */}
            <motion.div 
              initial={{ opacity: 0, x: -20, y: 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute top-[40%] left-[-5%] lg:left-[-10%] z-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-50"
            >
                <div className="text-sm font-bold text-[#1FA971] mb-1">Matched in 4 sec</div>
                <div className="text-xs text-gray-500">AI Resume Scanner</div>
            </motion.div>

            {/* Floating Card 3 - Bottom Right */}
            <motion.div 
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="absolute bottom-[20%] right-[-5%] lg:right-[0%] z-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-50"
            >
                <div className="text-sm font-bold text-gray-900 mb-1">Automatic follow-up</div>
                <div className="text-xs text-gray-500">32 applications tracked</div>
            </motion.div>

            {/* Floating Card 4 - Bottom Left */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="absolute bottom-[5%] left-[5%] lg:left-[10%] z-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-55"
            >
                <div className="text-sm font-bold text-gray-900 mb-1">135 messages sent</div>
                <div className="text-xs text-gray-500">in network this week</div>
            </motion.div>

          </div>

        </div>
      </div>

    </section>
  )
}
