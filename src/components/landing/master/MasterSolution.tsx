"use client"

import { Search, Compass, MessageCircle, FileText, CheckCircle, IndianRupee } from"lucide-react"
import React from"react"

import { Reveal } from"@/components/ui/motion/Reveal"

export function MasterSolution() {
 const steps = [
 { icon: Search, label:"Discover", desc:"Find gigs & internships" },
 { icon: Compass, label:"Match", desc:"AI-driven recommendations" },
 { icon: MessageCircle, label:"Connect", desc:"Chat with founders directly" },
 { icon: FileText, label:"Apply", desc:"1-click verified applications" },
 { icon: CheckCircle, label:"Work", desc:"Collaborate on projects" },
 { icon: IndianRupee, label:"Get Paid", desc:"Secure escrow payments" },
 ]

 return (
 <section className="w-full bg-white py-24 lg:py-32 border-b border-gray-100 relative overflow-hidden">
 {/* Background Decorators */}
 <div className="absolute top-[20%] left-[-10%] w-125 h-125 bg-[#E8F3EE]/40 rounded-full blur-[100px] pointer-events-none" />
 <div className="absolute bottom-[-10%] right-[-5%] w-100 h-100 bg-[#1FA971]/5 rounded-full blur-[120px] pointer-events-none" />

 <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-350 relative z-10">
 
 <Reveal>
 <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-24">
 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#232B27] tracking-tight mb-6 leading-tight">
 One connected platform. <br className="hidden sm:block"/>
 <span className="text-[#1FA971]">Zero friction.</span>
 </h2>
 <p className="text-lg text-[#4A5550] font-medium">
 We&apos;ve replaced the fragmented job hunt with a single, seamless ecosystem designed for verified campus talent.
 </p>
 </div>
 </Reveal>

 <Reveal delay={0.2}>
 {/* Desktop Flow */}
 <div className="hidden lg:flex items-center justify-between relative bg-[#FAFCFA] p-8 rounded-3xl border border-gray-100 shadow-sm">
 {/* Connecting Line */}
 <div className="absolute top-1/2 left-12 right-12 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
 <div className="absolute top-1/2 left-12 w-1/3 h-0.5 bg-linear-to-r from-[#1FA971] to-transparent -translate-y-1/2 z-0 opacity-50" />
 
 {steps.map((step, idx) => (
 <div key={idx} className="relative z-10 flex flex-col items-center gap-4 group">
 <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:border-[#1FA971] group-hover:shadow-[0_10px_30px_-10px_rgba(31,169,113,0.3)]">
 <step.icon className="w-6 h-6 text-[#232B27] group-hover:text-[#1FA971] transition-colors" />
 </div>
 <div className="text-center">
 <div className="text-sm font-bold text-[#232B27] mb-1">{step.label}</div>
 <div className="text-xs text-gray-500 font-medium max-w-30 leading-tight">{step.desc}</div>
 </div>
 </div>
 ))}
 </div>

 {/* Mobile Flow */}
 <div className="lg:hidden flex flex-col gap-6">
 {steps.map((step, idx) => (
 <div key={idx} className="flex items-center gap-6 relative">
 {idx !== steps.length - 1 && (
 <div className="absolute top-14 -bottom-6 left-8 w-0.5 bg-gray-100 z-0" />
 )}
 <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0 relative z-10">
 <step.icon className="w-6 h-6 text-[#1FA971]" />
 </div>
 <div>
 <div className="text-lg font-bold text-[#232B27] mb-1">{step.label}</div>
 <div className="text-sm text-gray-500 font-medium">{step.desc}</div>
 </div>
 </div>
 ))}
 </div>
 </Reveal>

 </div>
 </section>
 )
}
