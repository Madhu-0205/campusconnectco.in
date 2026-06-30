"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

const STEPS = [
    {
        num: "01",
        icon: "📍",
        title: "Allow location",
        desc: "Open CampusConnect and allow location access. Instantly see students with skills within 3–5 km of you.",
    },
    {
        num: "02",
        icon: "📋",
        title: "Post or find a gig",
        desc: "Need a poster for your fest? Post it in 30 seconds. Have a skill? List it and start getting hired today.",
    },
    {
        num: "03",
        icon: "💬",
        title: "Chat and agree",
        desc: "Message privately. Agree on price and deadline. Payment goes into secure escrow — protected for both sides.",
    },
    {
        num: "04",
        icon: "✅",
        title: "Work and get paid",
        desc: "Deliver the work. Buyer approves. Payment releases instantly. Your portfolio and reputation grow with every gig.",
    },
]

export default function CCHowItWorks() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"],
    })
    const scaleY = useTransform(scrollYProgress, [0, 0.9], [0, 1])

    return (
        <section
            id="how-it-works"
            className="py-32 px-6 relative overflow-hidden"
            style={{ background: "var(--bg)" }}
        >
            {/* Top divider */}
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.35), transparent)" }}
            />

            {/* Background glow */}
            <div
                className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)",
                    filter: "blur(60px)",
                }}
            />

            <div className="max-w-5xl mx-auto relative" ref={containerRef} style={{ position: "relative" }}>
                <div className="text-center mb-24">
                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-6"
                        style={{
                            background: "rgba(6,182,212,0.08)",
                            border: "1px solid rgba(6,182,212,0.2)",
                            color: "var(--accent)",
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        Simple process
                    </div>
                    <h2
                        className="text-4xl sm:text-5xl mb-6 tracking-tight"
                        style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--text)" }}
                    >
                        How it works
                    </h2>
                    <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-2)" }}>
                        A seamless, secure way to hire or get hired on campus.
                    </p>
                </div>

                <div className="relative">
                    {/* Track line */}
                    <div
                        className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px transform md:-translate-x-1/2"
                        style={{ background: "var(--border)" }}
                    />
                    {/* Animated fill line */}
                    <motion.div
                        className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px transform md:-translate-x-1/2 origin-top"
                        style={{
                            scaleY,
                            background: "var(--grad-brand)",
                            boxShadow: "0 0 12px var(--primary-glow)",
                        }}
                    />

                    <div className="space-y-16">
                        {STEPS.map((step, i) => (
                            <div
                                key={i}
                                className={`flex w-full ${i % 2 === 0 ? "md:justify-start" : "md:justify-end"} relative pl-16 md:pl-0`}
                            >
                                {/* Node dot */}
                                <div className="absolute left-6 md:left-1/2 top-10 transform -translate-x-1/2 -translate-y-1/2 z-10">
                                    <div
                                        className="w-3 h-3 rounded-full border-2 flex items-center justify-center"
                                        style={{ background: "var(--bg)", borderColor: "var(--border)" }}
                                    >
                                        <motion.div
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ background: "var(--primary-light)" }}
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true, margin: "-200px" }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </div>

                                {/* Card */}
                                <div className="w-full md:w-[45%]">
                                    <motion.div
                                        initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: "-80px" }}
                                        transition={{ duration: 0.6, delay: 0.1 }}
                                        className="group relative rounded-3xl p-8 overflow-hidden transition-all duration-300"
                                        style={{
                                            background: "var(--surface)",
                                            border: "1px solid var(--border)",
                                            boxShadow: "var(--shadow-card)",
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"
                                            e.currentTarget.style.boxShadow = "0 8px 40px rgba(0,0,0,0.5)"
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = "var(--border)"
                                            e.currentTarget.style.boxShadow = "var(--shadow-card)"
                                        }}
                                    >
                                        {/* Background faded number */}
                                        <div
                                            className="absolute -right-4 -bottom-8 font-black pointer-events-none opacity-[0.04] group-hover:opacity-[0.08] transition-opacity"
                                            style={{
                                                fontFamily: "var(--font-heading)",
                                                fontSize: "140px",
                                                lineHeight: 1,
                                                color: "var(--primary-light)",
                                            }}
                                        >
                                            {step.num}
                                        </div>

                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-6"
                                            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
                                        >
                                            {step.icon}
                                        </div>

                                        <h3
                                            className="text-xl mb-3"
                                            style={{ fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--text)" }}
                                        >
                                            {step.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
                                            {step.desc}
                                        </p>
                                    </motion.div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
