"use client"

import { motion } from "framer-motion"
import { Search, Sparkles } from "lucide-react"
import React from "react"

import { HoverMagnetic } from "@/components/ui/motion/HoverMagnetic"
import { StaggerContainer as Stagger, StaggerItem } from "@/components/ui/motion/Stagger"
import { springSnappy } from "@/lib/motion"

export function V2Hero() {
  const handleOpenCommandCenter = () => {
    document.dispatchEvent(new CustomEvent('open-command-center'))
  }

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-16 overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-200 h-150 bg-white/5 rounded-full blur-[120px] opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[50vh] bg-linear-to-b from-transparent via-bg to-bg z-10" />
      </div>

      <div className="container relative z-20 mx-auto px-6 max-w-5xl text-center flex flex-col items-center">
        
        <Stagger staggerChildren={0.15}>
          
          <StaggerItem>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={springSnappy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-text-2 mb-8 backdrop-blur-md cursor-pointer hover:bg-white/10 hover:text-text transition-colors"
            >
              <Sparkles className="w-4 h-4 text-gold" />
              <span>CampusConnect V2 is live</span>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-b from-white to-white/50 leading-tight mb-8">
              Your career starts <br className="hidden md:block" />
              before graduation.
            </h1>
          </StaggerItem>

          <StaggerItem>
            <p className="text-lg md:text-xl text-text-2 max-w-2xl mx-auto mb-12 font-medium">
              Join the premium network for ambitious students. Find internships, freelance gigs, and connect with top founders instantly.
            </p>
          </StaggerItem>

          <StaggerItem>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg mx-auto">
              <HoverMagnetic className="w-full">
                <div 
                  onClick={handleOpenCommandCenter}
                  className="w-full relative group cursor-pointer"
                >
                  <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-primary/30 to-accent/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex items-center h-16 w-full rounded-2xl border border-white/10 bg-surface/50 backdrop-blur-xl px-6 shadow-card hover:bg-surface/80 transition-all duration-300">
                    <Search className="w-5 h-5 text-text-3 mr-4" />
                    <span className="text-text-3 text-lg">Try &quot;Find Internships&quot;</span>
                    <div className="ml-auto hidden sm:flex items-center gap-1">
                      <kbd className="inline-flex h-6 items-center justify-center rounded border border-border bg-bg/50 px-2 text-[11px] font-medium text-text-2 font-mono">⌘</kbd>
                      <kbd className="inline-flex h-6 items-center justify-center rounded border border-border bg-bg/50 px-2 text-[11px] font-medium text-text-2 font-mono">K</kbd>
                    </div>
                  </div>
                </div>
              </HoverMagnetic>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-text-3">
              <span>Trusted by students at</span>
              <div className="flex items-center gap-4 grayscale opacity-50">
                <span className="font-semibold text-text">Stanford</span>
                <span className="font-semibold text-text">MIT</span>
                <span className="font-semibold text-text">Berkeley</span>
              </div>
            </div>
          </StaggerItem>
        </Stagger>
      </div>

    </section>
  )
}
