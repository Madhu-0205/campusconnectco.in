"use client"

import { ShieldCheck, Zap, Briefcase, Users, BrainCircuit } from "lucide-react"
import React from "react"

import { Reveal } from "@/components/ui/motion/Reveal"
import { MetricCard } from "@/components/v2/MetricCard"

export function V2BentoFeatures({
  opportunitiesCount,
  foundersCount
}: {
  opportunitiesCount: number;
  foundersCount: number;
}) {
  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  return (
    <section className="py-24 relative overflow-hidden">
      
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-tight mb-4">
              Everything you need to <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary-light">stand out.</span>
            </h2>
            <p className="text-text-2 text-lg max-w-2xl mx-auto">
              We stripped away the noise to give you the ultimate unfair advantage in your career journey.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-75">
          
          {/* Large Feature 1 */}
          <Reveal className="md:col-span-2 md:row-span-2">
            <div className="relative h-full w-full rounded-3xl border border-border bg-surface p-8 overflow-hidden group shadow-card hover:shadow-card-hover transition-all duration-500">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                    <BrainCircuit className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-2">AI Career Copilot</h3>
                  <p className="text-text-2 max-w-sm">
                    Upload your resume and let our AI engine instantly match you with perfect internships and gigs based on your exact skillset.
                  </p>
                </div>
                
                {/* Mock UI Element */}
                <div className="mt-8 relative -mx-8 -mb-8 pt-8 px-8 bg-linear-to-t from-bg to-transparent">
                  <div className="rounded-t-2xl border border-border border-b-0 bg-surface shadow-2xl p-4 flex flex-col gap-3 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-2 w-24 bg-border rounded-full" />
                        <div className="h-2 w-16 bg-border/50 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Metric 1 */}
          <Reveal delay={0.1}>
            <MetricCard
              title="Verified Opportunities"
              value={`${formatNumber(opportunitiesCount)}+`}
              trend={{ value: 15, label: "this week", isPositive: true }}
              icon={<Briefcase className="w-5 h-5" />}
              className="h-full border-border bg-surface"
            />
          </Reveal>

          {/* Small Feature 1 */}
          <Reveal delay={0.2}>
            <div className="relative h-full w-full rounded-3xl border border-border bg-surface p-6 flex flex-col gap-4 group shadow-card hover:shadow-card-hover transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold mb-1">Escrow Payments</h3>
                <p className="text-sm text-text-2">
                  Never work for free again. Funds are secured before you write a single line of code.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Metric 2 */}
          <Reveal delay={0.3}>
            <MetricCard
              title="Active Founders"
              value={`${formatNumber(foundersCount)}+`}
              trend={{ value: 5, label: "this month", isPositive: true }}
              icon={<Users className="w-5 h-5" />}
              className="h-full border-border bg-surface"
            />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
