"use client"

import { motion, useInView } from "framer-motion"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRef } from "react"

const WEEKS = [
    { week: "Week 01", title: "HTML & CSS Mastery",    status: "completed" },
    { week: "Week 02", title: "JavaScript Basics",     status: "completed" },
    { week: "Week 03", title: "React Fundamentals",    status: "current"   },
    { week: "Week 04", title: "State Management",      status: "locked"    },
    { week: "Week 05", title: "API Integration",       status: "locked"    },
    { week: "Week 06", title: "Final Project",         status: "locked"    },
]

const BULLETS = [
    "Personalised to your current skill level",
    "Curated links to the best free resources",
    "Built-in project milestones",
    "Prepares you for real startup internships",
]

export default function CCAIRoadmap() {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <section
            id="roadmap"
            className="py-32 px-6 overflow-hidden relative"
            style={{ background: "var(--bg)" }}
        >
            {/* Top divider */}
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)" }}
            />

            {/* Ambient blobs */}
            <div
                className="absolute -top-20 left-1/4 w-[400px] h-[400px] pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)",
                    filter: "blur(80px)",
                }}
            />
            <div
                className="absolute bottom-0 right-0 w-[350px] h-[350px] pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 70%)",
                    filter: "blur(80px)",
                }}
            />

            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center" ref={ref}>

                    {/* ── LEFT: Copy ────────────────────────────────── */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-6"
                            style={{
                                background: "rgba(124,58,237,0.08)",
                                border: "1px solid rgba(124,58,237,0.2)",
                                color: "var(--primary-light)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            ✦ Your personal mentor
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.1 }}
                            className="text-4xl sm:text-5xl mb-6 tracking-tight"
                            style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--text)" }}
                        >
                            AI Career{" "}
                            <span className="text-gradient">Roadmap</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.2 }}
                            className="text-lg mb-10 max-w-md"
                            style={{ color: "var(--text-2)" }}
                        >
                            Tell our AI where you are and where you want to be.
                            Get a custom, week-by-week plan with curated resources,
                            projects, and milestones.
                        </motion.p>

                        <motion.ul
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.3 }}
                            className="space-y-4 mb-10"
                        >
                            {BULLETS.map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle2
                                        className="w-5 h-5 shrink-0 mt-0.5"
                                        style={{ color: "var(--primary-light)" }}
                                    />
                                    <span className="text-base" style={{ color: "var(--text-2)" }}>
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </motion.ul>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.4 }}
                        >
                            <Link
                                href="/dashboard/student/career-copilot"
                                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-base transition-all hover:scale-105 active:scale-95"
                                style={{
                                    background: "var(--grad-brand)",
                                    boxShadow: "var(--shadow-glow-primary)",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-btn-hover)" }}
                                onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-glow-primary)" }}
                            >
                                Generate My Roadmap ✨
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </motion.div>
                    </div>

                    {/* ── RIGHT: Roadmap UI Mockup ───────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: 40 }}
                        animate={inView ? { opacity: 1, scale: 1, x: 0 } : {}}
                        transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="relative lg:ml-auto w-full max-w-md"
                    >
                        {/* Decorative orbs */}
                        <motion.div
                            animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-50 z-0 pointer-events-none"
                            style={{ background: "rgba(124,58,237,0.6)" }}
                        />
                        <motion.div
                            animate={{ y: [10, -10, 10], x: [-8, 8, -8] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -left-10 bottom-10 w-32 h-32 rounded-full blur-3xl opacity-25 z-0 pointer-events-none"
                            style={{ background: "rgba(6,182,212,0.7)" }}
                        />

                        {/* Card */}
                        <div
                            className="rounded-3xl p-8 relative z-10 overflow-hidden"
                            style={{
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                                boxShadow: "0 40px 100px -20px rgba(124,58,237,0.2)",
                            }}
                        >
                            {/* Inner glow */}
                            <div
                                className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-32 blur-[60px] pointer-events-none"
                                style={{ background: "rgba(124,58,237,0.15)" }}
                            />

                            {/* Goal row */}
                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div>
                                    <div
                                        className="text-[10px] uppercase tracking-[0.2em] font-bold mb-1"
                                        style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)" }}
                                    >
                                        Goal
                                    </div>
                                    <div
                                        className="text-lg font-bold"
                                        style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
                                    >
                                        Frontend Developer
                                    </div>
                                </div>
                                <div
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold"
                                    style={{
                                        background: "rgba(124,58,237,0.12)",
                                        border: "1px solid rgba(124,58,237,0.25)",
                                        color: "var(--primary-light)",
                                        fontFamily: "var(--font-mono)",
                                    }}
                                >
                                    12 Weeks
                                </div>
                            </div>

                            {/* Week list */}
                            <div className="relative">
                                {/* Track line */}
                                <div
                                    className="absolute left-[11px] top-4 bottom-4 w-px"
                                    style={{ background: "var(--border)" }}
                                />

                                <div className="space-y-5">
                                    {WEEKS.map((w, i) => (
                                        <motion.div
                                            key={i}
                                            className="flex items-center gap-4 relative z-10"
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={inView ? { opacity: 1, x: 0 } : {}}
                                            transition={{ delay: 0.5 + i * 0.09 }}
                                        >
                                            {/* Status circle */}
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                                                style={{
                                                    background:
                                                        w.status === "completed" ? "var(--success)"
                                                        : w.status === "current"   ? "transparent"
                                                        : "var(--surface-2)",
                                                    border: w.status === "current" ? "2px solid var(--primary-light)" : "none",
                                                    boxShadow: w.status === "current" ? "0 0 12px var(--primary-glow)" : "none",
                                                }}
                                            >
                                                {w.status === "completed" && (
                                                    <span className="text-[10px] font-black" style={{ color: "rgba(0,0,0,0.7)" }}>✓</span>
                                                )}
                                                {w.status === "current" && (
                                                    <motion.div
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ background: "var(--primary-light)" }}
                                                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    />
                                                )}
                                                {w.status === "locked" && (
                                                    <span className="text-[8px]" style={{ color: "var(--text-3)" }}>🔒</span>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div
                                                className="p-4 rounded-2xl flex-1 border transition-all"
                                                style={{
                                                    background: w.status === "current"
                                                        ? "rgba(124,58,237,0.1)"
                                                        : "rgba(255,255,255,0.02)",
                                                    borderColor: w.status === "current"
                                                        ? "rgba(124,58,237,0.3)"
                                                        : "var(--border)",
                                                    opacity: w.status === "locked" ? 0.45 : 1,
                                                }}
                                            >
                                                <div
                                                    className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
                                                    style={{
                                                        color: w.status === "current" ? "var(--primary-light)" : "var(--text-3)",
                                                        fontFamily: "var(--font-mono)",
                                                    }}
                                                >
                                                    {w.week}
                                                </div>
                                                <div
                                                    className="text-sm font-semibold"
                                                    style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
                                                >
                                                    {w.title}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
