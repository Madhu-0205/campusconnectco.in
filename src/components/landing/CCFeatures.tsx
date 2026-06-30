"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const FEATURES = [
    {
        icon: "📍",
        title: "Campus Gigs",
        desc: "Hire students near you for posters, code, events, photography. Or list your skill and start earning today.",
        tag: "Student → Student",
        color: "var(--primary-light)",
        tagBg: "rgba(139,92,246,0.1)",
        borderColor: "rgba(139,92,246,0.35)",
    },
    {
        icon: "🏢",
        title: "Startup Internships",
        desc: "Real internships from verified Indian startups. AI-matched to your profile. Apply in one click.",
        tag: "AI Matched",
        color: "var(--accent)",
        tagBg: "rgba(6,182,212,0.1)",
        borderColor: "rgba(6,182,212,0.3)",
    },
    {
        icon: "🧠",
        title: "AI Career Roadmap",
        desc: "Tell us your goal. Get a week-by-week personalised plan — DSA, projects, skills — to land your dream role.",
        tag: "Personalised",
        color: "var(--gold)",
        tagBg: "rgba(245,158,11,0.1)",
        borderColor: "rgba(245,158,11,0.3)",
    },
    {
        icon: "🔒",
        title: "Secure Escrow",
        desc: "Payment held safely until work is approved. No ghosting. No 'kal dunga.' Get paid every time, guaranteed.",
        tag: "Zero Risk",
        color: "var(--success)",
        tagBg: "rgba(16,185,129,0.1)",
        borderColor: "rgba(16,185,129,0.3)",
    },
    {
        icon: "💬",
        title: "Private Messaging",
        desc: "Chat safely without sharing your phone number. All gig communication tracked in one thread.",
        tag: "Safe & Private",
        color: "var(--primary-light)",
        tagBg: "rgba(139,92,246,0.08)",
        borderColor: "rgba(139,92,246,0.25)",
    },
    {
        icon: "🌐",
        title: "Campus Network",
        desc: "Build real connections through work, not follow requests. Every gig completed is a verified relationship.",
        tag: "Location-Based",
        color: "var(--accent)",
        tagBg: "rgba(6,182,212,0.08)",
        borderColor: "rgba(6,182,212,0.25)",
    },
]

export default function CCFeatures() {
    const headerRef = useRef(null)
    const headerInView = useInView(headerRef, { once: true, margin: "-80px" })

    return (
        <section
            id="features"
            className="py-28 px-6 relative"
            style={{ background: "var(--bg-subtle)" }}
        >
            {/* Subtle top divider gradient */}
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)" }}
            />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div ref={headerRef} className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={headerInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <div
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-6"
                            style={{
                                background: "rgba(124,58,237,0.08)",
                                border: "1px solid rgba(124,58,237,0.2)",
                                color: "var(--primary-light)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            Everything in one place
                        </div>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 24 }}
                        animate={headerInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-4xl sm:text-5xl mb-5 tracking-tight"
                        style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--text)" }}
                    >
                        The complete{" "}
                        <span className="text-gradient">student super-app</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={headerInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg max-w-2xl mx-auto"
                        style={{ color: "var(--text-2)" }}
                    >
                        Six powerful features. One platform. Built for every student in India — from metros to tier-3 cities.
                    </motion.p>
                </div>

                {/* Feature cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.6, delay: i * 0.08 }}
                            whileHover={{ y: -6, transition: { duration: 0.2 } }}
                            className="group relative rounded-3xl p-7 overflow-hidden cursor-default transition-all duration-300"
                            style={{
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                                boxShadow: "var(--shadow-card)",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = f.borderColor
                                e.currentTarget.style.boxShadow = `0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px ${f.borderColor}`
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = "var(--border)"
                                e.currentTarget.style.boxShadow = "var(--shadow-card)"
                            }}
                        >
                            {/* Top color reveal bar */}
                            <motion.div
                                className="absolute top-0 left-0 right-0 h-[2px] origin-left"
                                style={{ background: `linear-gradient(90deg, ${f.color}, transparent)`, scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.08 + 0.3 }}
                            />

                            {/* Icon */}
                            <div
                                className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl mb-6 transition-transform group-hover:scale-110"
                                style={{ background: f.tagBg }}
                            >
                                {f.icon}
                            </div>

                            <h3
                                className="text-xl mb-3"
                                style={{ fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--text)" }}
                            >
                                {f.title}
                            </h3>
                            <p
                                className="text-sm leading-relaxed mb-6"
                                style={{ color: "var(--text-2)" }}
                            >
                                {f.desc}
                            </p>

                            {/* Tag pill */}
                            <span
                                className="inline-block text-xs font-bold px-3 py-1.5 rounded-full"
                                style={{
                                    background: f.tagBg,
                                    color: f.color,
                                    fontFamily: "var(--font-mono)",
                                    border: `1px solid ${f.borderColor}`,
                                }}
                            >
                                {f.tag}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
