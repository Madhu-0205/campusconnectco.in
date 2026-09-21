"use client";

import {
  MapPin,
  ShieldCheck,
  Bell,
  CheckCircle2,
  Building,
  ArrowUpRight,
  Compass,
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import React from "react";

import { Reveal } from "@/components/ui/motion/Reveal";

export function MasterFeatures() {
  return (
    <section className="w-full bg-white py-20 lg:py-28 relative border-t border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Heading */}
        <Reveal>
          <div className="max-w-3xl mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-semibold mb-3.5">
              <Compass className="w-3.5 h-3.5 text-[#1FA971]" />
              <span>Platform Pillars</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#232B27] tracking-tight mb-4 leading-tight">
              Everything students need to <br className="hidden sm:block" />
              <span className="text-[#1FA971]">discover, build, and earn.</span>
            </h2>
            <p className="text-base sm:text-lg text-[#4A5550] font-medium leading-relaxed max-w-2xl">
              Engineered specifically for university students and early-stage founders: truthful opportunities, verified profiles, and deliverable transparency.
            </p>
          </div>
        </Reveal>

        {/* 12-Column Responsive Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* Bento Item 1: Hyperlocal Discovery (8 cols) */}
          <Reveal className="lg:col-span-8">
            <div className="h-full rounded-3xl border border-slate-200/80 p-7 sm:p-9 bg-[#FAFCFA] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-[#1FA971] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full uppercase tracking-wider">
                    Hyperlocal Engine
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-[#232B27] mb-3">
                  Campus-Radius Opportunity Discovery
                </h3>
                <p className="text-[#4A5550] text-base leading-relaxed max-w-xl mb-6">
                  Find paid gigs, startup internships, and campus roles within walking or commuting distance. Filter by exact radius or explore fully remote roles.
                </p>
              </div>

              {/* Visual Distance Pills Simulation */}
              <div className="pt-4 border-t border-slate-200/60 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 mr-1">Available Hubs:</span>
                {["Bengaluru (Electronic City / Koramangala)", "Hyderabad (HITEC City)", "Pune (Hinjewadi)", "NCR / Remote"].map((hub) => (
                  <span
                    key={hub}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-2xs"
                  >
                    <MapPin size={11} className="text-[#1FA971]" />
                    {hub}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Bento Item 2: Milestone Deliverable Protection (4 cols) */}
          <Reveal delay={0.1} className="lg:col-span-4">
            <div className="h-full rounded-3xl border border-slate-200/80 p-7 sm:p-9 bg-white shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#232B27] mb-2">
                  Milestone Deliverable Protection
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Scope, timelines, and milestones are documented upfront before work begins, eliminating vague expectations.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <FileCheck size={14} /> Clear Deliverable Checkpoints
                </div>
                <div className="text-[11px] text-slate-500">
                  Agreed deadlines &middot; Transparent reviews
                </div>
              </div>
            </div>
          </Reveal>

          {/* Bento Item 3: Verified .edu Identity (4 cols) */}
          <Reveal delay={0.15} className="lg:col-span-4">
            <div className="h-full rounded-3xl border border-slate-200/80 p-7 sm:p-9 bg-white shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100/70 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#232B27] mb-2">
                  Verified Student Profiles
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Stand out with genuine university email verification and a clean portfolio showcasing real project code.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-2 rounded-xl border border-purple-100">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>Zero fake credentials allowed</span>
              </div>
            </div>
          </Reveal>

          {/* Bento Item 4: Direct Founder Access (4 cols) */}
          <Reveal delay={0.2} className="lg:col-span-4">
            <div className="h-full rounded-3xl border border-slate-200/80 p-7 sm:p-9 bg-white shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-amber-700 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Building className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#232B27] mb-2">
                  Direct Founder Contact
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Skip third-party agency spam. Communicate directly with startup founders and engineering teams looking for talent.
                </p>
              </div>

              <Link
                href="/opportunities"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-[#1FA971] transition-colors"
              >
                <span>Browse live opportunities</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </Reveal>

          {/* Bento Item 5: SmartMatch Alerts (4 cols) */}
          <Reveal delay={0.25} className="lg:col-span-4">
            <div className="h-full rounded-3xl border border-slate-200/80 p-7 sm:p-9 bg-white shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-[#1FA971] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#232B27] mb-2">
                  Skill-Based Match Alerts
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Receive relevant opportunities matched directly to your tech stack (React, Python, Node, UI/UX) without noise.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                <Bell size={14} className="shrink-0 text-[#1FA971]" />
                <span>Instant notifications for matching gigs</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
