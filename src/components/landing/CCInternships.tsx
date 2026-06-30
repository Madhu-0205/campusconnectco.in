"use client"

import { motion } from "framer-motion"
import { Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const INTERNSHIPS = [
    {
        logo: "🚀",
        company: "Acme AI Studio",
        role: "Frontend Developer Intern",
        tags: ["React", "Remote", "3 months"],
        match: "94%",
        price: "₹8,000/mo",
        matchHue: "var(--success)",
    },
    {
        logo: "📊",
        company: "DataStack India",
        role: "Data Science Intern",
        tags: ["Python", "Hybrid", "6 months"],
        match: "88%",
        price: "₹12,000/mo",
        matchHue: "var(--accent)",
    },
    {
        logo: "🎨",
        company: "DesignLab Co.",
        role: "UI/UX Design Intern",
        tags: ["Figma", "Remote", "2 months"],
        match: "91%",
        price: "₹6,000/mo",
        matchHue: "var(--primary-light)",
    },
];

// Deterministic pseudo-random number generator
const pseudoRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

const STATIC_PARTICLES = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    top:   pseudoRandom(i * 1.1) * 100,
    left:  pseudoRandom(i * 2.2) * 100,
    size:  pseudoRandom(i * 3.3) * 2.5 + 1,
    dur:   pseudoRandom(i * 4.4) * 18 + 10,
    delay: pseudoRandom(i * 5.5) * 8,
    right: pseudoRandom(i * 6.6) > 0.5,
}));

/* Particle cloud — static deterministic */
function ParticleCloud() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {STATIC_PARTICLES.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        top: `${p.top}%`,
                        left: `${p.left}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        background: "rgba(139,92,246,0.6)",
                    }}
                    animate={{ y: [0, -90], x: p.right ? [0, 24] : [0, -24], opacity: [0, 0.5, 0] }}
                    transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "linear" }}
                />
            ))}
        </div>
    )
}

export default function CCInternships() {
    return (
        <section
            id="internships"
            className="py-32 px-6 relative overflow-hidden"
            style={{ background: "var(--bg-subtle)" }}
        >
            {/* Top divider */}
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.4), transparent)" }}
            />

            <ParticleCloud />

            {/* Ambient glow */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)",
                    filter: "blur(60px)",
                }}
            />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-6"
                        style={{
                            background: "rgba(6,182,212,0.08)",
                            border: "1px solid rgba(6,182,212,0.2)",
                            color: "var(--accent)",
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        <Sparkles className="w-3 h-3" />
                        Beyond Campus
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-5xl mb-5 tracking-tight"
                        style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--text)" }}
                    >
                        Real startup{" "}
                        <span className="text-gradient">internships</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg max-w-xl mx-auto"
                        style={{ color: "var(--text-2)" }}
                    >
                        AI-matched to your skills. One-click apply. No resume needed to start.
                    </motion.p>
                </div>

                {/* Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {INTERNSHIPS.map((job, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            whileHover={{ y: -6, transition: { duration: 0.2 } }}
                            className="group relative rounded-3xl p-7 transition-all duration-300"
                            style={{
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                                boxShadow: "var(--shadow-card)",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = "rgba(139,92,246,0.35)"
                                e.currentTarget.style.boxShadow = "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.2)"
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = "var(--border)"
                                e.currentTarget.style.boxShadow = "var(--shadow-card)"
                            }}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                                    style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
                                >
                                    {job.logo}
                                </div>

                                {/* Match badge */}
                                <div
                                    className="group/tip relative text-[10px] font-bold px-2.5 py-1.5 rounded-full cursor-help flex items-center gap-1.5"
                                    style={{
                                        background: "rgba(16,185,129,0.1)",
                                        border: "1px solid rgba(16,185,129,0.25)",
                                        color: "var(--success)",
                                        fontFamily: "var(--font-mono)",
                                    }}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--success)" }} />
                                    {job.match} match
                                    {/* Tooltip */}
                                    <div
                                        className="absolute opacity-0 group-hover/tip:opacity-100 transition-opacity bottom-full mb-2 right-0 w-max max-w-[180px] text-[10px] px-2.5 py-2 rounded-xl pointer-events-none z-10"
                                        style={{
                                            background: "var(--surface-2)",
                                            border: "1px solid var(--border)",
                                            color: "var(--text-2)",
                                            boxShadow: "var(--shadow-card)",
                                        }}
                                    >
                                        AI-matched based on your skills
                                    </div>
                                </div>
                            </div>

                            <div
                                className="uppercase tracking-[0.15em] text-[10px] mb-1.5 font-bold"
                                style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)" }}
                            >
                                {job.company}
                            </div>

                            <h3
                                className="text-xl mb-4 leading-tight"
                                style={{ fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--text)" }}
                            >
                                {job.role}
                            </h3>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {job.tags.map((t) => (
                                    <span
                                        key={t}
                                        className="text-[11px] px-2.5 py-1 rounded-lg"
                                        style={{
                                            background: "rgba(139,92,246,0.08)",
                                            border: "1px solid rgba(139,92,246,0.15)",
                                            color: "var(--text-2)",
                                            fontFamily: "var(--font-mono)",
                                        }}
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>

                            <div className="h-px w-full mb-5" style={{ background: "var(--border)" }} />

                            <div className="flex items-center justify-between">
                                <span
                                    className="text-lg font-bold"
                                    style={{ fontFamily: "var(--font-heading)", color: "var(--gold)" }}
                                >
                                    {job.price}
                                </span>
                                <button
                                    className="font-bold px-4 py-2 rounded-xl text-white transition-all hover:scale-105"
                                    style={{
                                        background: "var(--grad-brand)",
                                        boxShadow: "var(--shadow-glow-primary)",
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-btn-hover)" }}
                                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-glow-primary)" }}
                                >
                                    Apply Now
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center">
                    <Link
                        href="/dashboard/student/internships"
                        className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-base transition-all hover:scale-105 active:scale-95"
                        style={{
                            border: "1px solid rgba(6,182,212,0.3)",
                            color: "var(--accent)",
                            background: "rgba(6,182,212,0.06)",
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = "rgba(6,182,212,0.1)"
                            e.currentTarget.style.borderColor = "rgba(6,182,212,0.5)"
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = "rgba(6,182,212,0.06)"
                            e.currentTarget.style.borderColor = "rgba(6,182,212,0.3)"
                        }}
                    >
                        View All Internships
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
