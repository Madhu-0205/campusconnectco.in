"use client"

import React from"react"

import { Reveal } from"@/components/ui/motion/Reveal"

export function MasterHowItWorks() {
 const steps = [
 {
 num:"01",
 title:"Create your profile",
 desc:"Sign up with your .edu email. Add your skills, portfolio, and what you&apos;re looking for."
 },
 {
 num:"02",
 title:"Discover opportunities",
 desc:"Browse the map or let our recommendation engine push relevant gigs to your dashboard."
 },
 {
 num:"03",
 title:"Apply in one click",
 desc:"Forget long cover letters. Your verified profile is your resume."
 },
 {
 num:"04",
 title:"Work securely",
 desc:"Communicate on-platform and get paid safely through our escrow system."
 }
 ]

 return (
 <section className="w-full bg-white py-24 lg:py-32">
 <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-350">
 
 <Reveal>
 <div className="text-center mb-16 lg:mb-24">
 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#232B27] tracking-tight mb-4">
 How it works
 </h2>
 <p className="text-lg text-[#4A5550] font-medium">
 From sign-up to your first payment, in four simple steps.
 </p>
 </div>
 </Reveal>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
 {steps.map((step, idx) => (
 <Reveal key={idx} delay={idx * 0.1}>
 <div className="flex flex-col items-center text-center">
 <div className="text-[5rem] lg:text-[7rem] font-black text-[#FAFCFA] drop-shadow-sm stroke-gray-200" style={{ WebkitTextStroke:"2px #E8F3EE" }}>
 {step.num}
 </div>
 <div className="relative -mt-12 lg:-mt-16 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm w-full h-full min-h-45">
 <h3 className="text-xl font-bold text-[#232B27] mb-3">{step.title}</h3>
 <p className="text-[#4A5550] text-sm font-medium leading-relaxed">
 {step.desc}
 </p>
 </div>
 </div>
 </Reveal>
 ))}
 </div>

 </div>
 </section>
 )
}
