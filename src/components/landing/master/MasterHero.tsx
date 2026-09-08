"use client";

import { motion } from "framer-motion";
import { Briefcase, MapPin, CheckCircle, Search, Sparkles, Navigation, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { StaggerContainer as Stagger, StaggerItem } from "@/components/ui/motion/Stagger";

const POPULAR_SKILLS = ["React", "Python", "UI/UX", "Marketing", "Content"];

export function MasterHero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "gig" | "internship">("all");
  const [isLocating, setIsLocating] = useState(false);

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
                  CampusConnectCo connects you with local internships, campus gigs, and startup jobs. Build your verified profile, track applications, and get paid securely.
                </p>
              </StaggerItem>

              <StaggerItem>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <Link 
                    href="/opportunities" 
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
                  Verified student profiles
                  <span className="mx-2 text-gray-300">•</span>
                  <CheckCircle className="w-4 h-4 text-[#1FA971]" />
                  Milestone deliverable protection
                </div>
              </StaggerItem>
            </Stagger>
          </div>

          {/* Right Column: Interactive Quick Discovery Widget */}
          <div className="lg:col-span-6 relative h-125 lg:h-162.5 w-full flex items-center justify-center perspective-1000">
            {/* The main UI - Interactive Search / Filter Widget */}
            <motion.div 
              initial={{ opacity: 0, y: 40, rotateX: 5 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute z-10 w-full max-w-120 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-gray-100/90 overflow-hidden"
            >
              {/* Interactive Search Header */}
              <div className="p-5 border-b border-gray-100 bg-[#FAFCFA]/70">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="hero-search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search roles, tech skills, colleges…"
                      className="w-full h-10 pl-9.5 pr-3 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#1FA971] focus:ring-2 focus:ring-[#1FA971]/20 text-slate-800 placeholder:text-slate-400 transition-all"
                    />
                  </div>
                  <button
                    id="hero-search-submit"
                    type="submit"
                    className="h-10 px-4 bg-[#1FA971] hover:bg-[#199160] text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-sm"
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
                    <Navigation className={`w-3 h-3 text-[#1FA971] ${isLocating ? "animate-spin" : ""}`} />
                    <span>{isLocating ? "Locating…" : "Near Me"}</span>
                  </button>
                </div>

                {/* Skill Chips */}
                <div className="flex items-center gap-1.5 mt-2.5 pt-1 overflow-x-auto scrollbar-none">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">Popular:</span>
                  {POPULAR_SKILLS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillClick(skill)}
                      className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[11px] font-medium text-slate-600 hover:text-[#1FA971] hover:border-[#1FA971]/40 transition-colors cursor-pointer shrink-0"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="p-5 space-y-3 bg-white">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Live Discovery Preview</span>
                  <Link href="/opportunities" className="text-xs text-[#1FA971] font-bold hover:underline flex items-center gap-0.5">
                    Full Catalog &rarr;
                  </Link>
                </div>

                {/* Job 1 */}
                <Link href="/opportunities?type=internship" className="p-3.5 rounded-2xl border border-gray-100 bg-slate-50/50 hover:bg-white hover:border-[#1FA971]/40 shadow-xs flex gap-3.5 transition-all group">
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
                    <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">Bengaluru, Hyderabad, Pune & Remote</span>
                    </div>
                  </div>
                </Link>

                {/* Job 2 */}
                <Link href="/opportunities?type=gig" className="p-3.5 rounded-2xl border border-gray-100 bg-slate-50/50 hover:bg-white hover:border-[#1FA971]/40 shadow-xs flex gap-3.5 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
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
                    <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">University Regions & Digital Tasks</span>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* Floating Card 1 - Application Status */}
            <motion.div 
              initial={{ opacity: 0, x: 20, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute top-[8%] right-[-5%] lg:right-[4%] z-20 bg-white rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 p-4.5 w-56 pointer-events-none"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-full bg-[#1FA971]/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-[#1FA971]" />
                </div>
                <div className="text-xs font-bold text-[#232B27]">Deliverable Submitted</div>
              </div>
              <div className="text-[11px] text-gray-500 font-medium">UI/UX Design Gig</div>
              <div className="mt-2.5 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#1FA971] w-2/3 h-full rounded-full"></div>
              </div>
            </motion.div>

            {/* Floating Card 2 - Recommendation */}
            <motion.div 
              initial={{ opacity: 0, x: -20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute bottom-[16%] left-[-5%] lg:left-[0%] z-20 bg-[#1FA971] rounded-2xl shadow-[0_15px_40px_-10px_rgba(31,169,113,0.3)] p-4.5 w-54 text-white pointer-events-none"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-white/90" />
                <div className="text-[10px] font-bold text-white/90 uppercase tracking-wider">Top Match</div>
              </div>
              <div className="text-xs sm:text-sm font-bold text-white mt-1.5 leading-tight">Product Marketing Intern</div>
              <div className="text-[11px] text-white/80 mt-1">Matches your &quot;Marketing&quot; skill</div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}
