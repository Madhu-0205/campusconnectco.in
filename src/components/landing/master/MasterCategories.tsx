"use client";

import {
  Code2,
  PenTool,
  TrendingUp,
  BookOpen,
  Database,
  Briefcase,
  Zap,
  Globe,
  Compass,
  Building2,
} from "lucide-react";
import Link from "next/link";
import React from "react";

import { Reveal } from "@/components/ui/motion/Reveal";

const categories = [
  {
    name: "Engineering & Tech",
    description: "Frontend, backend, mobile & DevOps",
    icon: Code2,
    href: "/opportunities?category=engineering",
  },
  {
    name: "UI/UX & Product Design",
    description: "Wireframing, prototyping & user research",
    icon: PenTool,
    href: "/opportunities?category=design",
  },
  {
    name: "Growth & Marketing",
    description: "Social, performance & community",
    icon: TrendingUp,
    href: "/opportunities?category=marketing",
  },
  {
    name: "Content & Copywriting",
    description: "Technical writing, blogs & storytelling",
    icon: BookOpen,
    href: "/opportunities?category=content",
  },
  {
    name: "Data & AI Systems",
    description: "Data pipelines, analytics & ML models",
    icon: Database,
    href: "/opportunities?category=data",
  },
  {
    name: "Sales & Business Dev",
    description: "Outreach, lead gen & campus ops",
    icon: Building2,
    href: "/opportunities?category=sales",
  },
  {
    name: "Paid Internships",
    description: "Part-time & full-time structured roles",
    icon: Briefcase,
    href: "/opportunities?type=internship",
  },
  {
    name: "Campus Gigs",
    description: "Deliverable-based tasks & campus projects",
    icon: Zap,
    href: "/opportunities?type=gig",
  },
  {
    name: "Remote Opportunities",
    description: "Work from your campus hostel or room",
    icon: Globe,
    href: "/opportunities?workMode=remote",
  },
  {
    name: "Local & Commutable",
    description: "Nearby physical offices & university hubs",
    icon: Compass,
    href: "/opportunities?workMode=on-site",
  },
];

export function MasterCategories() {
  return (
    <section className="w-full bg-[#FAFCFA] py-20 lg:py-28 relative border-t border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-semibold mb-3">
                <span>Explore by Domain</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#232B27] tracking-tight mb-2">
                Discover by category
              </h2>
              <p className="text-sm sm:text-base text-slate-500 font-medium max-w-xl">
                Browse verified opportunities across high-impact student domains.
              </p>
            </div>
            <Link
              href="/opportunities"
              className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-[#232B27] hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap shrink-0"
            >
              Browse entire catalog &rarr;
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((category, idx) => (
            <Reveal key={category.name} delay={idx * 0.03}>
              <Link
                href={category.href}
                className="group flex flex-col p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 hover:-translate-y-0.5 h-full focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3.5 group-hover:bg-emerald-50 transition-colors">
                  <category.icon className="w-5 h-5 text-slate-600 group-hover:text-[#1FA971] transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-[#232B27] group-hover:text-[#1FA971] transition-colors mb-1">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                  {category.description}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
