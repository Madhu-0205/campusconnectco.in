"use client"

import { Building2, FileEdit, Users, MousePointerClick, ShieldCheck } from"lucide-react"
import Link from"next/link"
import React from"react"

import { Reveal } from"@/components/ui/motion/Reveal"

export function MasterFounderValue() {
 const features = [
 {
 icon: FileEdit,
 title:"Post in minutes",
 desc:"Create job listings, internships, or short-term gigs tailored to students."
 },
 {
 icon: Users,
 title:"Discover talent",
 desc:"Browse verified student profiles and invite them to apply directly."
 },
 {
 icon: MousePointerClick,
 title:"Review & accept",
 desc:"Manage applications in one dashboard. No messy email threads."
 },
 {
 icon: ShieldCheck,
 title:"Secure payments",
 desc:"Fund gig payments via escrow. Release only when work is approved."
 }
 ]

 return (
 <section className="w-full bg-white py-24 lg:py-32 border-b border-gray-100">
 <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-350">
 
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
 
 {/* Left Column: Content */}
 <div className="lg:col-span-5 flex flex-col items-start lg:pr-8 order-2 lg:order-1">
 <Reveal>
 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-[#232B27] mb-6 shadow-sm">
 <Building2 className="w-3.5 h-3.5" />
 For Founders & Recruiters
 </div>
 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#232B27] tracking-tight mb-6 leading-tight">
 Hire hungry talent, <br/>
 <span className="text-[#1FA971]">locally.</span>
 </h2>
 <p className="text-lg text-[#4A5550] font-medium mb-10 leading-relaxed">
 Why compete with tech giants on generic boards? CampusConnect gives you direct access to verified, ambitious students right in your city.
 </p>
 
 <Link 
 href="/auth/founder" 
 className="px-8 h-14 rounded-xl bg-[#232B27] hover:bg-[#1a201d] text-white font-bold flex items-center justify-center transition-all shadow-md text-lg hover:-translate-y-0.5"
 >
 Start hiring today
 </Link>
 </Reveal>
 </div>

 {/* Right Column: Grid */}
 <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 order-1 lg:order-2">
 {features.map((feat, idx) => (
 <Reveal key={idx} delay={idx * 0.1}>
 <div className="bg-[#FAFCFA] rounded-3xl border border-gray-100 p-8 h-full shadow-[0_5px_30px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.06)] transition-all">
 <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center mb-6 shadow-sm">
 <feat.icon className="w-6 h-6 text-[#232B27]" />
 </div>
 <h3 className="text-xl font-bold text-[#232B27] mb-3">{feat.title}</h3>
 <p className="text-[#4A5550] font-medium leading-relaxed text-sm">
 {feat.desc}
 </p>
 </div>
 </Reveal>
 ))}
 </div>

 </div>

 </div>
 </section>
 )
}
