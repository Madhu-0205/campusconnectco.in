"use client"

import { Sparkles, ArrowRight, Briefcase } from"lucide-react"
import React from"react"

import { Reveal } from"@/components/ui/motion/Reveal"

export function MasterRecommendations() {
 return (
 <section className="w-full bg-white py-24 lg:py-32 border-t border-gray-100">
 <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-350">
 
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
 
 {/* Left Column: Recommendation Visual */}
 <div className="relative h-112.5 lg:h-137.5 rounded-3xl bg-[#FAFCFA] border border-gray-100 flex items-center justify-center overflow-hidden group shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)]">
 
 {/* Background Blob */}
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#1FA971]/10 rounded-full blur-[60px]" />

 {/* Profile Input */}
 <div className="absolute top-[15%] left-[10%] w-60 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 z-10 transform -rotate-6 transition-transform group-hover:rotate-0 group-hover:-translate-y-2">
 <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Your Profile</div>
 <div className="flex flex-wrap gap-2">
 <span className="px-2 py-1 bg-gray-100 text-[#232B27] text-xs rounded-md font-medium">React</span>
 <span className="px-2 py-1 bg-gray-100 text-[#232B27] text-xs rounded-md font-medium">TypeScript</span>
 <span className="px-2 py-1 bg-[#1FA971]/10 text-[#1FA971] text-xs rounded-md font-bold border border-[#1FA971]/20">UI Design</span>
 </div>
 </div>

 {/* Match Arrow */}
 <div className="absolute top-[35%] left-[45%] w-12 h-12 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center z-20">
 <ArrowRight className="w-5 h-5 text-[#1FA971]" />
 </div>

 {/* Output Recommendation */}
 <div className="absolute top-[45%] right-[10%] w-65 bg-white rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 p-5 z-30 transform rotate-3 transition-transform group-hover:rotate-0 group-hover:-translate-y-2">
 <div className="flex items-center gap-2 mb-3">
 <Sparkles className="w-4 h-4 text-[#1FA971]" />
 <div className="text-xs font-bold text-[#1FA971] uppercase tracking-wider">Perfect Match</div>
 </div>
 <div className="text-sm font-bold text-[#232B27]">Frontend Engineering Intern</div>
 <div className="text-xs text-gray-500 mt-1">Acme Startup • Bangalore</div>
 <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
 <div className="text-xs font-bold text-[#232B27]">₹20,000/mo</div>
 <button className="px-3 py-1.5 bg-[#1FA971] text-white text-xs font-bold rounded-lg hover:bg-[#199160] transition-colors">Apply</button>
 </div>
 </div>

 </div>

 {/* Right Column: Text */}
 <div className="flex flex-col items-start lg:pl-8">
 <Reveal>
 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#1FA971]/20 text-xs font-semibold text-[#1FA971] mb-6 shadow-sm">
 <Sparkles className="w-3.5 h-3.5" />
 Smart Recommendations
 </div>
 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#232B27] tracking-tight mb-6 leading-tight">
 Stop searching. <br/>
 <span className="text-[#1FA971]">Let opportunities find you.</span>
 </h2>
 <p className="text-lg text-[#4A5550] font-medium mb-8 leading-relaxed">
 Build your profile once. Our recommendation engine matches your skills, experience, and location with exact requirements from local startups.
 </p>
 
 <ul className="space-y-4 text-[#4A5550] font-medium">
 <li className="flex items-start gap-3">
 <div className="w-1.5 h-1.5 rounded-full bg-[#1FA971] mt-2 shrink-0"></div>
 <span>Matches based on your verified technical and soft skills.</span>
 </li>
 <li className="flex items-start gap-3">
 <div className="w-1.5 h-1.5 rounded-full bg-[#1FA971] mt-2 shrink-0"></div>
 <span>Location-aware filtering prioritizes roles near your campus.</span>
 </li>
 <li className="flex items-start gap-3">
 <div className="w-1.5 h-1.5 rounded-full bg-[#1FA971] mt-2 shrink-0"></div>
 <span>Receive direct invites from founders who need your exact profile.</span>
 </li>
 </ul>
 </Reveal>
 </div>

 </div>

 </div>
 </section>
 )
}
