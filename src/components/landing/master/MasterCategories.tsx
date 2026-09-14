"use client"

import { Code2, PenTool, TrendingUp, BookOpen, Database, FlaskConical, Briefcase, Zap, Search, Globe } from "lucide-react"
import Link from "next/link"
import React from "react"

import { Reveal } from "@/components/ui/motion/Reveal"

const categories = [
  { name: "Software Development", icon: Code2, href: "/opportunities?q=software" },
  { name: "Design", icon: PenTool, href: "/opportunities?q=design" },
  { name: "Marketing", icon: TrendingUp, href: "/opportunities?q=marketing" },
  { name: "Content", icon: BookOpen, href: "/opportunities?q=content" },
  { name: "Data & AI", icon: Database, href: "/opportunities?q=data" },
  { name: "Research", icon: FlaskConical, href: "/opportunities?q=research" },
  { name: "Internships", icon: Briefcase, href: "/opportunities?type=internship" },
  { name: "Campus Gigs", icon: Zap, href: "/opportunities?type=gig" },
  { name: "Freelance", icon: Search, href: "/opportunities?type=gig&q=freelance" },
  { name: "Remote", icon: Globe, href: "/opportunities?q=remote" },
]

export function MasterCategories() {
  return (
    <section className="w-full bg-[#FAFCFA] py-20 lg:py-28 relative border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-350">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#232B27] tracking-tight mb-3">
                Explore by category
              </h2>
              <p className="text-sm text-slate-500 font-medium max-w-xl">
                Discover verified opportunities in the most in-demand fields.
              </p>
            </div>
            <Link 
              href="/opportunities" 
              className="inline-flex items-center justify-center h-10 px-6 rounded-xl bg-white border border-gray-200 text-sm font-bold text-[#232B27] hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              Browse all categories
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category, idx) => (
            <Reveal key={category.name} delay={idx * 0.05}>
              <Link
                href={category.href}
                className="group flex flex-col p-5 bg-white rounded-2xl border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(31,169,113,0.08)] hover:border-[#1FA971]/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-[#E8F3EE] transition-colors">
                  <category.icon className="w-5 h-5 text-slate-500 group-hover:text-[#1FA971] transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-[#232B27] group-hover:text-[#1FA971] transition-colors mb-1">
                  {category.name}
                </h3>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
