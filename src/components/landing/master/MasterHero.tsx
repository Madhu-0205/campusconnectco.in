"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import {
  Briefcase,
  MapPin,
  CheckCircle,
  Search,
  Sparkles,
  Navigation,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, MouseEvent } from "react";

import { StaggerContainer as Stagger, StaggerItem } from "@/components/ui/motion/Stagger";

const POPULAR_SKILLS = ["React", "Python", "UI/UX", "Marketing", "Content", "AI/ML"];

export function MasterHero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "gig" | "internship">("all");
  const [isLocating, setIsLocating] = useState(false);

  const cardMouseX = useMotionValue(0);
  const cardMouseY = useMotionValue(0);

  const handleMouseMove = ({ currentTarget, clientX, clientY }: MouseEvent) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    cardMouseX.set(clientX - left);
    cardMouseY.set(clientY - top);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedType !== "all") params.set("type", selectedType);
    const targetUrl = `/opportunities?${params.toString()}`;
    if (typeof window !== "undefined") {
      window.location.assign(targetUrl);
    } else {
      router.push(targetUrl);
    }
  };

  const handleSkillClick = (skill: string) => {
    const params = new URLSearchParams();
    params.set("q", skill);
    if (selectedType !== "all") params.set("type", selectedType);
    const targetUrl = `/opportunities?${params.toString()}`;
    if (typeof window !== "undefined") {
      window.location.assign(targetUrl);
    } else {
      router.push(targetUrl);
    }
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      if (typeof window !== "undefined") {
        window.location.assign("/opportunities");
      } else {
        router.push("/opportunities");
      }
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        const targetUrl = `/opportunities?lat=${lat}&lng=${lng}&radius=50`;
        if (typeof window !== "undefined") {
          window.location.assign(targetUrl);
        } else {
          router.push(targetUrl);
        }
      },
      () => {
        setIsLocating(false);
        if (typeof window !== "undefined") {
          window.location.assign("/opportunities");
        } else {
          router.push("/opportunities");
        }
      },
      { timeout: 8000 }
    );
  };

  return (
    <section className="relative w-full min-h-[75vh] flex items-center justify-center pt-12 sm:pt-16 pb-16 overflow-hidden bg-[#FAFCFA]">
      {/* Background Decorators - Subtle Green Atmospheric Glows */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden flex justify-center">
        <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] bg-[#1FA971]/6 rounded-full blur-[100px]" />
        <div className="absolute top-[10%] left-[-10%] w-[450px] h-[450px] bg-amber-100/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[300px] bg-[#E8F3EE]/50 rounded-[100%] blur-[100px]" />
      </div>

      <div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start text-left lg:pr-6">
            <Stagger staggerChildren={0.12}>
              <StaggerItem>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#1FA971]/25 text-xs font-semibold text-[#1FA971] mb-5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#1FA971]" />
                  <span>The student opportunity network</span>
                </div>
              </StaggerItem>

              <StaggerItem>
                <h1 className="text-[2.6rem] sm:text-[3.5rem] lg:text-[4.2rem] leading-[1.08] font-extrabold text-[#232B27] mb-5 tracking-tight">
                  Your career network, <br className="hidden sm:block" />
                  <span className="text-[#1FA971]">built for students.</span>
                </h1>
              </StaggerItem>

              <StaggerItem>
                <p className="text-base sm:text-lg md:text-xl text-[#4A5550] max-w-xl mb-7 font-medium leading-relaxed">
                  Discover verified internships, campus gigs, and startup opportunities tailored to your real skills—with zero spam and transparent milestones.
                </p>
              </StaggerItem>

              <StaggerItem>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
                  <Link
                    href="/opportunities"
                    className="px-8 h-13 rounded-xl bg-[#1FA971] hover:bg-[#199160] text-white font-bold flex items-center justify-center transition-all shadow-md shadow-[#1FA971]/20 text-base hover:-translate-y-0.5 text-center"
                  >
                    Explore Opportunities
                  </Link>
                  <Link
                    href="/auth/founder"
                    className="px-7 h-13 rounded-xl bg-white border border-slate-200 text-[#232B27] font-semibold flex items-center justify-center hover:bg-slate-50 transition-all shadow-2xs text-base hover:-translate-y-0.5 text-center"
                  >
                    Post an Opportunity
                  </Link>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="mt-8 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-[#4A5550] font-medium">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-[#1FA971]" />
                    Verified student profiles
                  </span>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#1FA971]" />
                    Milestone deliverable protection
                  </span>
                </div>
              </StaggerItem>
            </Stagger>
          </div>

          {/* Right Column: Interactive Quick Discovery Showcase */}
          <div className="lg:col-span-6 relative w-full flex items-center justify-center py-4">
            <motion.div
              onMouseMove={handleMouseMove}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] border border-slate-200/90 overflow-hidden"
            >
              {/* Subtle spotlight effect on card */}
              <motion.div
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 hover:opacity-100"
                style={{
                  background: useMotionTemplate`
                    radial-gradient(
                      380px circle at ${cardMouseX}px ${cardMouseY}px,
                      rgba(31, 169, 113, 0.09) 0%,
                      transparent 80%
                    )
                  `,
                }}
              />

              {/* Interactive Search Header */}
              <div className="p-5 border-b border-slate-100 bg-[#FAFCFA]/90">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="hero-search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search roles, tech skills, colleges…"
                      className="w-full h-10 pl-9.5 pr-3 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#1FA971] focus:ring-2 focus:ring-[#1FA971]/20 text-slate-800 placeholder:text-slate-400 transition-all"
                    />
                  </div>
                  <button
                    id="hero-search-submit"
                    type="submit"
                    className="h-10 px-4 bg-[#1FA971] hover:bg-[#199160] text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Type Filter Pills & Near Me */}
                <div className="flex items-center justify-between mt-3 pt-1 gap-2 overflow-x-auto scrollbar-none">
                  <div className="flex items-center gap-1.5">
                    {(["all", "gig", "internship"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedType(type)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize cursor-pointer ${
                          selectedType === type
                            ? "bg-[#1FA971] text-white shadow-2xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                        }`}
                      >
                        {type === "all" ? "All Types" : type === "gig" ? "Gigs" : "Internships"}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleNearMe}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <Navigation
                      className={`w-3 h-3 text-[#1FA971] ${isLocating ? "animate-spin" : ""}`}
                    />
                    <span>{isLocating ? "Locating…" : "Near Me"}</span>
                  </button>
                </div>

                {/* Skill Chips */}
                <div className="flex items-center gap-1.5 mt-2.5 pt-1 overflow-x-auto scrollbar-none">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
                    Popular:
                  </span>
                  {POPULAR_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillClick(skill)}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-600 hover:text-[#1FA971] hover:border-[#1FA971]/40 transition-colors cursor-pointer shrink-0"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="p-5 space-y-3 bg-white">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Discovery Shortcuts
                  </span>
                  <Link
                    href="/opportunities"
                    className="text-xs text-[#1FA971] font-bold hover:underline flex items-center gap-0.5"
                  >
                    Browse All &rarr;
                  </Link>
                </div>

                {/* Card 1 */}
                <Link
                  href="/opportunities?type=internship"
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-[#1FA971]/40 shadow-2xs flex gap-3.5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#E8F3EE] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Briefcase className="w-5 h-5 text-[#1FA971]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-[#232B27] truncate group-hover:text-[#1FA971] transition-colors">
                        Engineering & Tech Internships
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase shrink-0 border border-emerald-200/50 ml-2">
                        Active
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">Bengaluru, Hyderabad, Pune & Remote</span>
                    </div>
                  </div>
                </Link>

                {/* Card 2 */}
                <Link
                  href="/opportunities?type=gig"
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-[#1FA971]/40 shadow-2xs flex gap-3.5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Briefcase className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-[#232B27] truncate group-hover:text-[#1FA971] transition-colors">
                        Campus Ambassador & Freelance Gigs
                      </span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase shrink-0 border border-blue-200/50 ml-2">
                        Active
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">University Regions & Digital Tasks</span>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
