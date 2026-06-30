"use client"
import { motion } from "framer-motion"
import { useState } from "react"
import { FileText, Crosshair, Briefcase, AlertCircle } from "lucide-react"

const problems = [
  {
    icon: FileText,
    title: "Resume Black Hole",
    desc: "You apply to dozens of internships, only to be ghosted by ATS bots that never saw your true potential.",
    accentColor: "var(--primary-light)",
    borderBase: "rgba(139,92,246,0.15)",
    borderHover: "rgba(139,92,246,0.45)",
    glowHover: "rgba(139,92,246,0.12)",
  },
  {
    icon: Crosshair,
    title: "Directionless Learning",
    desc: "You're learning skills, but are they the right ones? The gap between college syllabus and startup demands is massive.",
    accentColor: "var(--accent)",
    borderBase: "rgba(6,182,212,0.15)",
    borderHover: "rgba(6,182,212,0.45)",
    glowHover: "rgba(6,182,212,0.12)",
  },
  {
    icon: Briefcase,
    title: "Catch-22 of Experience",
    desc: "You need experience to get a job, but you need a job to get experience. An impossible loop — until now.",
    accentColor: "var(--gold)",
    borderBase: "rgba(245,158,11,0.15)",
    borderHover: "rgba(245,158,11,0.45)",
    glowHover: "rgba(245,158,11,0.12)",
  },
  {
    icon: AlertCircle,
    title: "Exploitative Unpaid Gigs",
    desc: "No security. Fake promises. You work for free and get ghosted. The exploitation of student talent ends here.",
    accentColor: "var(--error)",
    borderBase: "rgba(239,68,68,0.15)",
    borderHover: "rgba(239,68,68,0.45)",
    glowHover: "rgba(239,68,68,0.12)",
  },
]

export default function LandingProblem() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section className="py-28 px-4 sm:px-6 relative" id="problems">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(124,58,237,0.02), transparent)" }}
      />
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "var(--error)",
              fontFamily: "var(--font-mono)",
            }}
          >
            ● The Problem
          </div>
          <h2
            className="text-4xl sm:text-5xl mb-5 tracking-tight"
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            The student employment system is broken —
            <br />
            <span className="text-gradient-gold">and you know it.</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-2)" }}>
            Every ambitious Indian student faces the same barriers. We&apos;ve experienced them firsthand, so we built the developer-focused platform to bypass them.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {problems.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              whileHover={{ y: -6 }}
              className="rounded-3xl p-7 cursor-default transition-all duration-300 backdrop-blur-sm relative overflow-hidden"
              style={{
                background: "var(--surface)",
                border: `1px solid ${hovered === i ? p.borderHover : p.borderBase}`,
                boxShadow: hovered === i ? `0 8px 32px ${p.glowHover}` : "var(--shadow-card)",
              }}
            >
              {/* Corner coordinates grid motif */}
              <div 
                className="absolute top-2 right-3 text-[9px] select-none opacity-20 font-mono tracking-wider"
                style={{ color: "var(--text-3)" }}
              >
                [0{i+1}:cc_node]
              </div>

              {hovered === i && (
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none"
                  style={{ background: `${p.accentColor}12` }}
                />
              )}
              <motion.div
                animate={hovered === i ? { rotate: [0, -6, 6, -3, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative"
                style={{ background: `rgba(255,255,255,0.02)`, border: "1px solid var(--border)" }}
              >
                <p.icon size={24} style={{ color: p.accentColor }} />
              </motion.div>
              <h3 
                className="text-lg font-bold mb-3"
                style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
              >
                {p.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Transition Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 text-center"
        >
          <div
            className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl backdrop-blur-sm"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(6,182,212,0.06) 100%)",
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            <span
              className="text-xl sm:text-2xl"
              style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--text)" }}
            >
              We built the engineering fix.
            </span>
            <span className="text-2xl animate-bounce">⚡</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

