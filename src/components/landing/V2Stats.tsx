"use client"

import { motion } from"framer-motion"
import React from"react"

export function V2Stats({
 studentsCount,
 opportunitiesCount,
 connectionsCount
}: {
 studentsCount: number;
 opportunitiesCount: number;
 connectionsCount: number;
}) {
 // Format numbers (e.g., 1000 -> 1,000)
 const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

 return (
 <section className="w-full bg-white py-16 md:py-24 border-b border-gray-100 relative z-20">
 <div className="max-w-350 mx-auto px-6 lg:px-12">
 
 {/* Eyebrow */}
 <div className="text-center mb-16">
 <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] uppercase text-gray-500">
 Why trust CampusConnect
 </span>
 </div>

 {/* Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0">
 
 {/* Stat 1 */}
 <div className="flex flex-col items-center justify-center text-center px-4">
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.8 }}
 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-extrabold text-[#1FA971] tracking-tighter mb-4"
 >
 {formatNumber(studentsCount)}
 </motion.div>
 <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">
 Verified Students
 </div>
 </div>

 {/* Stat 2 */}
 <div className="flex flex-col items-center justify-center text-center px-4 md:border-l md:border-r border-gray-200">
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.8, delay: 0.2 }}
 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-extrabold text-[#232B27] tracking-tighter mb-4"
 >
 {formatNumber(opportunitiesCount)}
 </motion.div>
 <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">
 Active Opportunities
 </div>
 </div>

 {/* Stat 3 */}
 <div className="flex flex-col items-center justify-center text-center px-4">
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.8, delay: 0.4 }}
 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-extrabold text-[#232B27] tracking-tighter mb-4"
 >
 {formatNumber(connectionsCount)}
 </motion.div>
 <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">
 Successful Connections
 </div>
 </div>

 </div>

 </div>
 </section>
 )
}
