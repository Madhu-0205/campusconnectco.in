"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import React from "react"

import { HoverMagnetic } from "@/components/ui/motion/HoverMagnetic"
import { Reveal } from "@/components/ui/motion/Reveal"
import { GigCard } from "@/components/v2/GigCard"
import { InternshipCard } from "@/components/v2/InternshipCard"

export function V2LiveOpportunities() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6 max-w-6xl">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <Reveal>
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Real opportunities.<br/>
                <span className="text-text-3">No fake postings.</span>
              </h2>
              <p className="text-text-2 text-lg">
                Every gig and internship is vetted. Direct connections to founders.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/freelance-jobs" className="group flex items-center gap-2 text-primary font-medium hover:text-white transition-colors">
              <span>View all opportunities</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <Reveal delay={0.1}>
            <GigCard
              title="Build a Waitlist Landing Page"
              company="Acme AI"
              location="Remote"
              compensation="$800 total"
              duration="1 week"
              tags={["React", "Tailwind", "Next.js"]}
              href="/freelance-jobs/1"
              isFeatured
            />
          </Reveal>

          <Reveal delay={0.2}>
            <InternshipCard
              role="Product Design Intern"
              company="Linear"
              location="San Francisco, CA"
              type="In-person"
              stipend="$4,000/mo"
              tags={["Figma", "Prototyping", "UX"]}
              href="/internships/1"
              isUrgent
            />
          </Reveal>

          <Reveal delay={0.3}>
            <GigCard
              title="Social Media Automation Script"
              company="CreatorOS"
              location="Remote"
              compensation="$450 total"
              duration="3 days"
              tags={["Python", "APIs"]}
              href="/freelance-jobs/2"
            />
          </Reveal>

          <Reveal delay={0.4}>
            <InternshipCard
              role="Frontend Engineering Intern"
              company="Vercel"
              location="Remote"
              type="Remote"
              stipend="$5,000/mo"
              tags={["React", "TypeScript", "Performance"]}
              href="/internships/2"
            />
          </Reveal>

          <Reveal delay={0.5} className="md:col-span-2 lg:col-span-2">
            <div className="h-full w-full rounded-2xl border border-white/5 bg-surface/30 backdrop-blur-md p-8 flex flex-col items-center justify-center text-center gap-4 group hover:bg-surface/50 transition-colors cursor-pointer shadow-card">
              <h3 className="text-xl font-bold">And 400+ more live today.</h3>
              <p className="text-text-2">Join to see the full board and apply instantly.</p>
              <HoverMagnetic>
                <Link href="/join" className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
                  Create your profile
                </Link>
              </HoverMagnetic>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  )
}
