"use client"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { useState, useEffect } from "react"

import Image from "@/components/ui/ResilientImage"
import { getLocalAvatar } from "@/lib/avatar"

const testimonials = [
  {
    name: "Arjun S.",
    college: "Engineering Student",
    branch: "Computer Science, 3rd Year",
    quote: "CampusConnect is exactly what every ambitious student needed. The escrow system means I never worry about getting scammed. I got my first gig within a week of signing up.",
    avatar: getLocalAvatar("Arjun S", "7C3AED"),
    gig: "First gig in week 1 · Payments via Escrow",
  },
  {
    name: "Priya N.",
    college: "Tech Student",
    branch: "Computer Science, 4th Year",
    quote: "I used to apply to dozens of internships and get ghosted. On CampusConnect, my AI roadmap told me exactly what to build. Startups are reaching out to ME now.",
    avatar: getLocalAvatar("Priya N", "0EA5E9"),
    gig: "Internship offers via AI matching · No cold applications",
  },
  {
    name: "Rohan K.",
    college: "Engineering Student",
    branch: "ECE, 2nd Year",
    quote: "As a 2nd-year student I had zero experience. CampusConnect gave me my first paid gigs fast. The AI roadmap was a game-changer — it told me exactly what to learn next.",
    avatar: getLocalAvatar("Rohan K", "10B981"),
    gig: "Multiple gigs completed · Verified portfolio built",
  },
]

const liveActivity = [
  "🎯 A student accepted a ₹800 design gig",
  "🚀 New startup internship posted — apply now",
  "💰 Escrow payment released after gig completion",
  "⭐ Gig completed with a 5-star review",
  "🔥 3 new React gigs posted this hour",
]

export default function LandingTestimonials() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [activityIdx, setActivityIdx] = useState(0)

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setCurrent((c) => (c + 1) % testimonials.length), 4500)
    return () => clearInterval(t)
  }, [paused])

  useEffect(() => {
    const t = setInterval(() => setActivityIdx((i) => (i + 1) % liveActivity.length), 3000)
    return () => clearInterval(t)
  }, [])

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
  const next = () => setCurrent((c) => (c + 1) % testimonials.length)

  return (
    <section className="py-28 px-4 sm:px-6 relative" id="testimonials">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(6,182,212,0.02), transparent)" }}
      />
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
              color: "var(--gold)",
              fontFamily: "var(--font-mono)",
            }}
          >
            ★ Student Stories
          </div>
          <h2
            className="text-4xl sm:text-5xl mb-5 tracking-tight"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--text)" }}
          >
            Real students. Real results.
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Testimonial Carousel */}
          <div className="lg:col-span-3">
            <div
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              className="relative"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-3xl p-8 shadow-2xl backdrop-blur-md relative overflow-hidden"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <Quote className="absolute top-6 right-8 w-12 h-12 opacity-5" style={{ color: "var(--primary-light)" }} />
                  
                  <p className="text-lg leading-relaxed mb-8 font-medium" style={{ color: "var(--text)" }}>
                    &ldquo;{testimonials[current].quote}&rdquo;
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <Image
                      src={testimonials[current].avatar}
                      alt={testimonials[current].name}
                      className="w-14 h-14 rounded-full object-cover border-2"
                      style={{ borderColor: "rgba(139,92,246,0.3)" }}
                      width={56}
                      height={56}
                      isAvatar={true}
                    />
                    <div>
                      <div className="text-white font-bold" style={{ fontFamily: "var(--font-heading)" }}>{testimonials[current].name}</div>
                      <div className="text-xs" style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                        {testimonials[current].college} · {testimonials[current].branch}
                      </div>
                      <div className="text-xs font-bold mt-1.5" style={{ color: "var(--accent)" }}>
                        {testimonials[current].gig}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Controls */}
              <div className="flex items-center justify-between mt-5">
                <div className="flex gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        background: i === current ? "var(--primary-light)" : "rgba(255,255,255,0.18)",
                        width: i === current ? "24px" : "6px",
                      }}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={prev}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-white/5 border hover:bg-white/10"
                    style={{ borderColor: "var(--border)", color: "var(--text-2)" }}
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={next}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-white/5 border hover:bg-white/10"
                    style={{ borderColor: "var(--border)", color: "var(--text-2)" }}
                    aria-label="Next testimonial"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="lg:col-span-2">
            <div
              className="rounded-3xl p-6 backdrop-blur-md"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--success)" }} />
                <span className="font-bold text-xs uppercase tracking-widest" style={{ color: "var(--text-2)", fontFamily: "var(--font-mono)" }}>
                  Live Platform Activity
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activityIdx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl p-4 mb-4 text-sm font-medium border"
                  style={{
                    background: "rgba(6,182,212,0.08)",
                    borderColor: "rgba(6,182,212,0.18)",
                    color: "var(--text)",
                  }}
                >
                  {liveActivity[activityIdx]}
                </motion.div>
              </AnimatePresence>

              <div className="space-y-2 mt-2">
                {liveActivity.filter((_, i) => i !== activityIdx).slice(0, 4).map((item, i) => (
                  <div
                    key={i}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium border border-transparent"
                    style={{ background: "rgba(255,255,255,0.01)", color: "var(--text-3)" }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

