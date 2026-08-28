"use client"

import { Shield, Sparkles, Map, Bell, Target, Users } from"lucide-react"
import React from"react"

import { Reveal } from"@/components/ui/motion/Reveal"

export function MasterFeatures() {
 const features = [
 {
 title:"Hyperlocal Discovery",
 desc:"Find opportunities right next to your campus. Filter by distance and location to find gigs you can actually commute to.",
 icon: Map,
 colSpan:"lg:col-span-8",
 bgClass:"bg-[#FAFCFA]"
 },
 {
 title:"Smart Matching",
 desc:"Our engine maps your skills to relevant startups instantly.",
 icon: Sparkles,
 colSpan:"lg:col-span-4",
 bgClass:"bg-white"
 },
 {
 title:"Secure Escrow",
 desc:"Funds are locked before you start working.",
 icon: Shield,
 colSpan:"lg:col-span-4",
 bgClass:"bg-white"
 },
 {
 title:"Instant Notifications",
 desc:"Get alerted the moment a relevant gig is posted nearby.",
 icon: Bell,
 colSpan:"lg:col-span-4",
 bgClass:"bg-white"
 },
 {
 title:"Verified Profiles",
 desc:"Stand out with .edu email verification.",
 icon: Target,
 colSpan:"lg:col-span-4",
 bgClass:"bg-white"
 }
 ]

 return (
 <section className="w-full bg-white py-24 lg:py-32 relative">
 <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-350">
 
 <Reveal>
 <div className="max-w-3xl mb-16">
 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#232B27] tracking-tight mb-6 leading-tight">
 Everything you need to <br className="hidden sm:block"/>
 <span className="text-[#1FA971]">stand out and get hired.</span>
 </h2>
 </div>
 </Reveal>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">
 {features.map((feat, idx) => (
 <Reveal key={idx} delay={idx * 0.1} className={feat.colSpan}>
 <div className={`h-full rounded-3xl border border-gray-100 p-8 lg:p-10 ${feat.bgClass} shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] transition-all duration-300 group`}>
 <div className="w-12 h-12 rounded-xl bg-[#E8F3EE] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
 <feat.icon className="w-6 h-6 text-[#1FA971]" />
 </div>
 <h3 className="text-2xl font-bold text-[#232B27] mb-4">{feat.title}</h3>
 <p className="text-[#4A5550] font-medium text-lg leading-relaxed">{feat.desc}</p>
 </div>
 </Reveal>
 ))}
 </div>

 </div>
 </section>
 )
}
