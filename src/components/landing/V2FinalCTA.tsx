"use client"

import { motion } from "framer-motion"
import { ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import React from "react"

import { HoverMagnetic } from "@/components/ui/motion/HoverMagnetic"
import { Reveal } from "@/components/ui/motion/Reveal"
import { springSnappy } from "@/lib/motion"

export function V2FinalCTA() {
  return (
    <section className="relative py-32 overflow-hidden border-t border-white/5">
      
      {/* Deep Glow Background */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-150 bg-primary/20 rounded-full blur-[150px] opacity-30" />
      </div>

      <div className="container relative z-10 mx-auto px-6 max-w-4xl text-center flex flex-col items-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-text-3 mb-8">
            <Star className="w-3 h-3 text-gold fill-gold" />
            <span>Join the top 1% of students</span>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-b from-white to-white/50 leading-tight mb-8">
            Stop waiting for <br />
            graduation.
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="text-xl text-text-2 max-w-2xl mx-auto mb-12">
            Build your portfolio, earn real money, and secure your dream job before you even get your diploma.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <HoverMagnetic>
              <Link 
                href="/join"
                className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-white px-8 font-medium text-black transition-transform active:scale-95"
              >
                <div className="absolute inset-0 flex h-full w-full justify-center transform-[skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:transform-[skew(-12deg)_translateX(150%)]">
                  <div className="relative h-full w-8 bg-white/20" />
                </div>
                <span className="mr-2 text-lg">Get Started Free</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </HoverMagnetic>
            <p className="mt-4 sm:mt-0 sm:ml-4 text-sm text-text-3">
              Takes 30 seconds. <br className="hidden sm:block" /> No credit card required.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
