"use client"

import { motion, AnimatePresence } from"framer-motion"
import { ChevronLeft, ChevronRight, Quote } from"lucide-react"
import React, { useState } from"react"

import { Card } from"@/components/ui/Card"
import Image from"@/components/ui/ResilientImage"
import { ActivityFeed } from"@/components/v2/ActivityFeed"
import { getLocalAvatar } from"@/lib/avatar"

const testimonials = [
 {
 name:"Arjun S.",
 college:"Engineering Student",
 branch:"Computer Science, 3rd Year",
 quote:"CampusConnect is exactly what every ambitious student needed. The escrow system means I never worry about getting scammed. I got my first gig within a week of signing up.",
 avatar: getLocalAvatar("Arjun S","7C3AED"),
 gig:"First gig in week 1 · Payments via Escrow",
 },
 {
 name:"Priya N.",
 college:"Tech Student",
 branch:"Computer Science, 4th Year",
 quote:"I used to apply to dozens of internships and get ghosted. On CampusConnect, my AI roadmap told me exactly what to build. Startups are reaching out to ME now.",
 avatar: getLocalAvatar("Priya N","0EA5E9"),
 gig:"Internship offers via AI matching · No cold applications",
 },
 {
 name:"Rohan K.",
 college:"Engineering Student",
 branch:"ECE, 2nd Year",
 quote:"As a 2nd-year student I had zero experience. CampusConnect gave me my first paid gigs fast. The AI roadmap was a game-changer — it told me exactly what to learn next.",
 avatar: getLocalAvatar("Rohan K","10B981"),
 gig:"Multiple gigs completed · Verified portfolio built",
 },
]

const liveActivity = [
 { id: 1, title:"A student accepted a ₹800 design gig", description:"Design Gig matching completed", timestamp:"Just now", isDone: true },
 { id: 2, title:"New startup internship posted", description:"Frontend Developer role at Stealth", timestamp:"2m ago", isDone: false },
 { id: 3, title:"Escrow payment released", description:"Gig completed successfully", timestamp:"5m ago", isDone: true },
 { id: 4, title:"Gig completed with 5-stars", description:"Client left positive feedback", timestamp:"12m ago", isDone: true },
 { id: 5, title:"3 new React gigs posted", description:"Urgent hiring matching activated", timestamp:"1h ago", isDone: false },
]

export function V2Testimonials() {
 const [current, setCurrent] = useState(0)

 const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
 const next = () => setCurrent((c) => (c + 1) % testimonials.length)

 return (
 <section className="py-32 px-4 sm:px-6 relative bg-bg" id="testimonials">
 <div className="absolute top-0 left-0 right-0 h-px bg-border" />
 <div className="max-w-7xl mx-auto">
 
 <div className="text-center mb-16">
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-semibold uppercase tracking-widest mb-6 bg-surface-2 border border-border text-foreground">
 ★ Student Stories
 </div>
 <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
 Real students. <span className="text-muted-foreground">Real results.</span>
 </h2>
 </div>

 <div className="grid lg:grid-cols-5 gap-8 items-start">
 
 {/* Testimonial Carousel */}
 <div className="lg:col-span-3">
 <div className="relative">
 <AnimatePresence mode="wait">
 <motion.div
 key={current}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 transition={{ type:"spring", stiffness: 300, damping: 30 }}
 >
 <Card className="p-8 md:p-12 relative overflow-hidden">
 <Quote className="absolute top-8 right-8 w-16 h-16 opacity-5 text-foreground" />
 
 <p className="text-xl md:text-2xl leading-relaxed mb-10 font-medium text-foreground tracking-tight">
 &ldquo;{testimonials[current].quote}&rdquo;
 </p>
 
 <div className="flex items-center gap-5">
 <Image
 src={testimonials[current].avatar}
 alt={testimonials[current].name}
 className="w-16 h-16 rounded-full object-cover border border-border"
 width={64}
 height={64}
 isAvatar={true}
 />
 <div>
 <div className="text-foreground font-bold text-base">{testimonials[current].name}</div>
 <div className="text-sm text-muted-foreground mt-0.5">
 {testimonials[current].college} · {testimonials[current].branch}
 </div>
 <div className="text-[11px] font-bold mt-3 text-muted-foreground uppercase tracking-widest bg-surface-2 inline-block px-2.5 py-1 rounded-md border border-border">
 {testimonials[current].gig}
 </div>
 </div>
 </div>
 </Card>
 </motion.div>
 </AnimatePresence>

 {/* Controls */}
 <div className="flex items-center justify-between mt-8">
 <div className="flex gap-2.5">
 {testimonials.map((_, i) => (
 <button
 key={i}
 onClick={() => setCurrent(i)}
 className="h-1.5 rounded-full transition-all duration-300 ease-out"
 style={{
 background: i === current ?"hsl(var(--foreground))" :"hsl(var(--muted-foreground) / 0.3)",
 width: i === current ?"32px" :"8px",
 }}
 aria-label={`Go to slide ${i + 1}`}
 />
 ))}
 </div>
 <div className="flex gap-3">
 <button
 onClick={prev}
 className="w-12 h-12 rounded-full flex items-center justify-center transition-colors bg-surface border border-border hover:bg-surface-2 text-foreground"
 aria-label="Previous testimonial"
 >
 <ChevronLeft size={20} />
 </button>
 <button
 onClick={next}
 className="w-12 h-12 rounded-full flex items-center justify-center transition-colors bg-surface border border-border hover:bg-surface-2 text-foreground"
 aria-label="Next testimonial"
 >
 <ChevronRight size={20} />
 </button>
 </div>
 </div>
 </div>
 </div>

 {/* Live Activity Feed */}
 <div className="lg:col-span-2">
 <Card className="p-6 md:p-8">
 <div className="flex items-center gap-2 mb-8">
 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
 <span className="font-semibold text-[11px] uppercase tracking-widest text-muted-foreground">
 Live Platform Activity
 </span>
 </div>

 <ActivityFeed items={liveActivity} />
 </Card>
 </div>
 
 </div>
 </div>
 </section>
 )
}
