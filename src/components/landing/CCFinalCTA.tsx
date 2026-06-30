"use client"

import { motion, useInView } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRef } from "react"

export default function CCFinalCTA() {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: "-100px" })

    return (
        <section
            className="py-40 px-6 relative overflow-hidden"
            style={{ background: "var(--bg-subtle)" }}
        >
            {/* Grain */}
            <div className="absolute inset-0 noise-bg opacity-[0.025] pointer-events-none" />

            {/* Top divider */}
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)" }}
            />

            {/* Animated ambient blob */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.12, 1], rotate: [0, 6, 0], opacity: [0.5, 0.75, 0.5] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                    className="w-[80vw] max-w-[900px] h-[500px]"
                    style={{
                        background: "radial-gradient(ellipse at center, rgba(124,58,237,0.18) 0%, rgba(6,182,212,0.06) 50%, transparent 70%)",
                        filter: "blur(70px)",
                    }}
                />
            </div>

            <div className="max-w-4xl mx-auto text-center relative z-10" ref={ref}>
                <motion.div
                    initial={{ opacity: 0, y: 32, scale: 0.96 }}
                    animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Badge */}
                    <div
                        className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-10"
                        style={{
                            background: "rgba(124,58,237,0.08)",
                            border: "1px solid rgba(124,58,237,0.2)",
                            color: "var(--primary-light)",
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        <Sparkles className="w-3 h-3" />
                        Now live across India — join free
                    </div>

                    {/* Headline */}
                    <h2
                        className="text-5xl sm:text-7xl mb-8 tracking-tight"
                        style={{
                            fontFamily: "var(--font-heading)",
                            fontWeight: 700,
                            color: "var(--text)",
                            lineHeight: 1.05,
                        }}
                    >
                        Your campus{" "}
                        <br />
                        <span className="text-gradient">is waiting.</span>
                    </h2>

                    <p
                        className="text-xl max-w-2xl mx-auto mb-12 font-light"
                        style={{ color: "var(--text-2)" }}
                    >
                        Stop waiting for opportunities to come to you. Log in, find students near you,
                        and start building your real-world portfolio today.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href="/auth/sign-up"
                            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-base transition-all hover:scale-105 active:scale-95"
                            style={{
                                background: "var(--grad-brand)",
                                boxShadow: "var(--shadow-glow-primary)",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-btn-hover)" }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-glow-primary)" }}
                        >
                            Create Free Account
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            href="/auth/sign-up?role=client"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all hover:scale-105 active:scale-95"
                            style={{
                                border: "1px solid var(--border)",
                                color: "var(--text-2)",
                                background: "rgba(17,17,39,0.5)",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"
                                e.currentTarget.style.color = "var(--text)"
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = "var(--border)"
                                e.currentTarget.style.color = "var(--text-2)"
                            }}
                        >
                            Post a Gig
                        </Link>
                    </div>

                    <div
                        className="mt-8 text-xs font-medium uppercase tracking-widest"
                        style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)" }}
                    >
                        Free forever for students · No credit card needed
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
