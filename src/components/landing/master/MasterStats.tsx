"use client"

import { motion } from"framer-motion"
import React from"react"

import { Reveal } from"@/components/ui/motion/Reveal"

interface MasterStatsProps {
 studentsCount: number
 opportunitiesCount: number
 connectionsCount: number
 foundersCount: number
}

export function MasterStats({ 
 studentsCount, 
 opportunitiesCount, 
 connectionsCount,
 foundersCount
}: MasterStatsProps) {
 
 const stats = [
 {
 label:"Registered Students",
 value: studentsCount > 0 ? new Intl.NumberFormat('en-IN').format(studentsCount) :"-",
 subtext:"building their verified profiles"
 },
 {
 label:"Active Opportunities",
 value: opportunitiesCount > 0 ? new Intl.NumberFormat('en-IN').format(opportunitiesCount) :"-",
 subtext:"jobs, internships & gigs"
 },
 {
 label:"Startup Founders",
 value: foundersCount > 0 ? new Intl.NumberFormat('en-IN').format(foundersCount) :"-",
 subtext:"hiring local talent"
 },
 {
 label:"Successful Connections",
 value: connectionsCount > 0 ? new Intl.NumberFormat('en-IN').format(connectionsCount) :"-",
 subtext:"applications accepted"
 }
 ]

 return (
 <section className="w-full bg-white border-y border-gray-100 py-16 lg:py-24">
 <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-350">
 <Reveal>
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
 {stats.map((stat, i) => (
 <div key={i} className="flex flex-col items-start border-l-2 border-[#1FA971]/20 pl-6 lg:pl-8">
 <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#232B27] tracking-tight mb-2">
 {stat.value}
 </div>
 <div className="text-sm sm:text-base font-bold text-[#1FA971] mb-1">
 {stat.label}
 </div>
 <div className="text-xs sm:text-sm text-gray-500 font-medium">
 {stat.subtext}
 </div>
 </div>
 ))}
 </div>
 </Reveal>
 </div>
 </section>
 )
}
