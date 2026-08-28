"use client";

import { motion } from"framer-motion";
import { Search, SlidersHorizontal } from"lucide-react";

import FadeIn from"@/components/FadeIn";
import ServiceCard from"@/components/Marketplace/ServiceCard";

export default function Marketplace() {
 const services = [
 { title:"I will tutor you in Data Structures & Algorithms", provider:"Alex Johnson", rating: 4.9, reviews: 120, price:"3,000", category:"Tutoring" },
 { title:"Minimalist UI/UX Design for your Startup", provider:"Maria Garcia", rating: 5.0, reviews: 85, price:"12,000", category:"Design" },
 { title:"Full Stack React/Next.js Development", provider:"Kenji Sato", rating: 4.8, reviews: 200, price:"25,000", category:"Development" },
 { title:"Professional Resume & Cover Letter Writing", provider:"Emily Chen", rating: 4.7, reviews: 310, price:"1,500", category:"Writing" },
 { title:"Python Scripting & Automation", provider:"David Kim", rating: 4.9, reviews: 56, price:"5,000", category:"Development" },
 { title:"Social Media Marketing Strategy", provider:"Sarah Williams", rating: 4.6, reviews: 42, price:"8,000", category:"Marketing" },
 ];

 const container = {
 hidden: { opacity: 0 },
 show: {
 opacity: 1,
 transition: {
 staggerChildren: 0.1
 }
 }
 };

 const item = {
 hidden: { opacity: 0, y: 20 },
 show: { opacity: 1, y: 0 }
 };

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
 <FadeIn>
 <div className="mb-8">
 <h1 className="font-bold text-white mb-2" style={{ fontFamily:"var(--font-heading)" }}>
 Service Marketplace
 </h1>
 <p className="text-sm" style={{ color:"var(--text-2)" }}>
 Discover top talent from your campus network.
 </p>
 </div>
 </FadeIn>

 <FadeIn delay={0.1}>
 <div className="flex flex-col md:flex-row gap-4 mb-8">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color:"var(--text-3)" }} size={20} />
 <input
 type="text"
 placeholder="Search for services (e.g. 'Calculus Tutoring')"
 className="w-full border rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none transition-all focus:ring-2"
 style={{
 background:"var(--surface)",
 borderColor:"var(--border)",
 ['--tw-ring-color' as string]: 'var(--primary-light)',
 }}
 />
 </div>
 <button
 className="flex items-center gap-2 px-6 py-3 border rounded-xl text-white transition-all hover:shadow-lg"
 style={{
 background:"var(--surface)",
 borderColor:"var(--border)",
 boxShadow:"var(--shadow-card)",
 }}
 onMouseEnter={e => { e.currentTarget.style.borderColor ="var(--primary-light)" }}
 onMouseLeave={e => { e.currentTarget.style.borderColor ="var(--border)" }}
 suppressHydrationWarning
 >
 <SlidersHorizontal size={20} style={{ color:"var(--text-2)" }} />
 <span style={{ color:"var(--text)" }}>Filters</span>
 </button>
 </div>
 </FadeIn>

 <FadeIn delay={0.2}>
 <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
 {["All","Development","Design","Tutoring","Writing","Marketing","Video"].map((cat, i) => (
 <button
 key={cat}
 suppressHydrationWarning
 className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${i === 0 ? 'text-white' : ''}`}
 style={
 i === 0
 ? { background:"var(--grad-brand)", boxShadow:"var(--shadow-glow-primary)" }
 : { background:"var(--surface)", color:"var(--text-2)", border:"1px solid var(--border)" }
 }
 onMouseEnter={e => {
 if (i !== 0) {
 e.currentTarget.style.borderColor ="var(--primary-light)";
 e.currentTarget.style.color ="var(--text)";
 }
 }}
 onMouseLeave={e => {
 if (i !== 0) {
 e.currentTarget.style.borderColor ="var(--border)";
 e.currentTarget.style.color ="var(--text-2)";
 }
 }}
 >
 {cat}
 </button>
 ))}
 </div>
 </FadeIn>

 <motion.div
 variants={container}
 initial="hidden"
 animate="show"
 className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
 >
 {services.map((service, i) => (
 <motion.div key={i} variants={item}>
 <ServiceCard {...service} image="" />
 </motion.div>
 ))}
 </motion.div>
 </div>
 );
}
