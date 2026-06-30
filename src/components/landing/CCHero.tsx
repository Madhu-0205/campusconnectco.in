"use client"

import { useRef, useState, useEffect, Suspense } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"

// Lazy-load 3D map
const CampusMap3D = dynamic(() => import("./CampusMap3D"), {
    ssr: false,
    loading: () => (
        <div
            className="w-full h-full rounded-3xl flex items-center justify-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", minHeight: 480 }}
        >
            <div className="w-10 h-10 rounded-full shimmer" />
        </div>
    ),
})

// ── Count-up animation hook ───────────────────────────────────────────────────
function useCountUp(target: number, duration = 2000, enabled = false) {
    const [val, setVal] = useState(0)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!enabled || target === 0) { setVal(target); return }
        let start = 0

        const stepTime = 16
        const steps = duration / stepTime
        const increment = target / steps
        const timer = setInterval(() => {
            start += increment
            if (start >= target) { setVal(target); clearInterval(timer) }
            else setVal(Math.round(start))
        }, stepTime)
        return () => clearInterval(timer)
    }, [target, duration, enabled])

    return val
}

// ── Stat item with count-up ───────────────────────────────────────────────────
function StatItem({
    value, suffix, label, isText, enabled
}: {
    value: number; suffix: string; label: string; isText?: boolean; enabled: boolean
}) {
    const displayVal = useCountUp(value, 2000, enabled)

    return (
        <div>
            <div
                className="mb-0.5 text-gradient"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 700 }}
            >
                {isText
                    ? suffix
                    : value === 0
                        ? <span style={{ color: "var(--text-3)" }}>—</span>
                        : <>{displayVal.toLocaleString("en-IN")}{suffix}</>
                }
            </div>
            <div
                className="text-xs font-medium"
                style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)" }}
            >
                {label}
            </div>
        </div>
    )
}

interface PlatformStats {
    users: number
    gigs: number
    activeGigs: number
    colleges: number
}

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]
const entry = (i: number) => ({ duration: 0.7, delay: i * 0.12, ease: EASE })
const wordAnim = (i: number) => ({ duration: 0.55, delay: i * 0.05 + 0.3, ease: EASE })

export default function CCHero() {
    const containerRef = useRef<HTMLDivElement>(null)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const springX = useSpring(mouseX, { stiffness: 80, damping: 20 })
    const springY = useSpring(mouseY, { stiffness: 80, damping: 20 })

    const [stats, setStats] = useState<PlatformStats>({ users: 0, gigs: 0, activeGigs: 0, colleges: 0 })
    const [statsLoaded, setStatsLoaded] = useState(false)
    const [statsVisible, setStatsVisible] = useState(false)
    const statsRef = useRef<HTMLDivElement>(null)

    // Fetch real stats
    useEffect(() => {
        fetch('/api/stats')
            .then(r => r.json())
            .then((data: PlatformStats) => {
                setStats(data)
                setStatsLoaded(true)
            })
            .catch(() => setStatsLoaded(true))
    }, [])

    // Trigger count-up when stats section enters viewport
    useEffect(() => {
        if (!statsLoaded) return
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
            { threshold: 0.5 }
        )
        if (statsRef.current) observer.observe(statsRef.current)
        return () => observer.disconnect()
    }, [statsLoaded])

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (!containerRef.current) return
            const rect = containerRef.current.getBoundingClientRect()
            mouseX.set(((e.clientX - rect.left) / rect.width - 0.5) * 16)
            mouseY.set(((e.clientY - rect.top)  / rect.height - 0.5) * 16)
        }
        const el = containerRef.current
        el?.addEventListener("mousemove", onMove, { passive: true })
        return () => el?.removeEventListener("mousemove", onMove)
    }, [mouseX, mouseY])

    const h1Lines = [
        { words: ["Your", "next"],          gradient: false },
        { words: ["opportunity"],           gradient: true  },
        { words: ["is", "500m", "away."],   gradient: false },
    ]

    // Determine what stats to show
    const hasRealData = statsLoaded && stats.users > 0
    const isLaunching = statsLoaded && stats.users === 0

    // Build dynamic stat rows
    const displayStats = hasRealData
        ? [
            { value: stats.colleges, suffix: "+", label: "Colleges", isText: false },
            { value: stats.users,    suffix: "+", label: "Students",  isText: false },
            { value: 0,              suffix: "Free", label: "For students", isText: true },
          ]
        : null // will show founding-batch message instead

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex items-center overflow-hidden"
            style={{ background: "var(--bg)", paddingTop: "5rem" }}
            id="home"
        >
            {/* Mesh grid */}
            <div className="absolute inset-0 mesh-grid pointer-events-none opacity-60" />

            {/* Ambient hero glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 70% 55% at 60% 40%, rgba(124,58,237,0.14) 0%, rgba(6,182,212,0.06) 50%, transparent 70%)",
                }}
            />

            {/* Grain texture */}
            <div className="absolute inset-0 noise-bg pointer-events-none opacity-[0.025]" />

            <div className="max-w-7xl mx-auto px-6 w-full py-16">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* ── LEFT: Copy ──────────────────────────────────── */}
                    <div>
                        {/* Launch badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={entry(0)}
                            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8"
                            style={{
                                background: "rgba(124,58,237,0.08)",
                                border: "1px solid rgba(124,58,237,0.2)",
                            }}
                        >
                            <motion.span
                                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }}
                                transition={{ duration: 1.8, repeat: Infinity }}
                                className="w-2 h-2 rounded-full"
                                style={{ background: "var(--accent)" }}
                            />
                            <span
                                className="text-xs font-semibold tracking-wide"
                                style={{ color: "var(--text-2)", fontFamily: "var(--font-mono)" }}
                            >
                                Hyperlocal · Any college · Any city in India
                            </span>
                        </motion.div>

                        {/* H1 — word-by-word reveal */}
                        <h1
                            className="mb-6 leading-none"
                            style={{
                                fontFamily: "var(--font-heading)",
                                fontWeight: 700,
                                fontSize: "clamp(44px, 6vw, 72px)",
                                letterSpacing: "-0.025em",
                            }}
                        >
                            {h1Lines.map((line, li) => (
                                <span key={li} className="block">
                                    {line.words.map((word_str, wi) => (
                                        <motion.span
                                            key={wi}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={wordAnim(li * 4 + wi)}
                                            className="inline-block mr-[0.22em]"
                                            style={{
                                                color: line.gradient ? "transparent" : "var(--text)",
                                                background: line.gradient ? "var(--grad-brand)" : undefined,
                                                WebkitBackgroundClip: line.gradient ? "text" : undefined,
                                                backgroundClip: line.gradient ? "text" : undefined,
                                                WebkitTextFillColor: line.gradient ? "transparent" : undefined,
                                            }}
                                        >
                                            {word_str}
                                        </motion.span>
                                    ))}
                                    {li === 1 && (
                                        <motion.span
                                            className="block h-[3px] rounded-full mt-1 mb-3"
                                            style={{ background: "var(--grad-brand)", transformOrigin: "left" }}
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ delay: 0.9, duration: 0.7, ease: EASE }}
                                        />
                                    )}
                                </span>
                            ))}
                        </h1>

                        {/* Sub-headline */}
                        <motion.p
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={entry(4)}
                            className="text-lg leading-relaxed mb-10 max-w-md"
                            style={{ color: "var(--text-2)", fontWeight: 300 }}
                        >
                            Find students near you to hire, collaborate with, or work for.
                            Campus gigs, startup internships, AI career roadmap —
                            everything a student needs, in one place.{" "}
                            <strong style={{ color: "var(--text)", fontWeight: 500 }}>
                                Any college. Any city. Anywhere in India.
                            </strong>
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={entry(5)}
                            className="flex flex-wrap gap-4 mb-14"
                        >
                            <Link
                                href="/auth/sign-up"
                                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-base transition-all hover:scale-105 active:scale-95"
                                style={{
                                    background: "var(--grad-brand)",
                                    boxShadow: "var(--shadow-glow-primary)",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-btn-hover)" }}
                                onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-glow-primary)" }}
                            >
                                <MapPin className="w-4 h-4" />
                                Find Students Near Me
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href="/auth/sign-up?role=client"
                                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base transition-all hover:scale-105 active:scale-95"
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
                        </motion.div>

                        {/* ── Stats / Social proof row ── */}
                        <div className="min-h-[60px] flex items-center">
                            <motion.div
                                ref={statsRef}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={entry(6)}
                                className="flex items-center gap-0 flex-wrap"
                            >
                                {/* Real data → animated counters */}
                                {statsLoaded && hasRealData && displayStats && displayStats.map((stat, i) => (
                                    <div key={i} className="flex items-center">
                                        <div className={`px-6 ${i === 0 ? "pl-0" : ""}`}>
                                            <StatItem
                                                value={stat.value}
                                                suffix={stat.suffix}
                                                label={stat.label}
                                                isText={stat.isText}
                                                enabled={statsVisible}
                                            />
                                        </div>
                                        {i < displayStats.length - 1 && (
                                            <div className="h-10 w-px" style={{ background: "var(--border)" }} />
                                        )}
                                    </div>
                                ))}

                                {/* Zero users → founding batch message */}
                                {statsLoaded && isLaunching && (
                                    <div
                                        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                                        style={{
                                            background: "rgba(124,58,237,0.06)",
                                            border: "1px solid rgba(124,58,237,0.18)",
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <motion.span
                                                animate={{ scale: [1, 1.4, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="w-2 h-2 rounded-full"
                                                style={{ background: "var(--accent)" }}
                                            />
                                            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                                                🚀 Now launching across India
                                            </span>
                                        </div>
                                        <div className="h-4 w-px" style={{ background: "var(--border)" }} />
                                        <span className="text-xs font-medium" style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                                            Free forever for students
                                        </span>
                                    </div>
                                )}

                                {/* Loading skeleton — avoid layout shift */}
                                {!statsLoaded && (
                                    <div className="flex items-center gap-8">
                                        {[0,1,2].map(i => (
                                            <div key={i} className="space-y-2">
                                                <div className="h-7 w-16 rounded shimmer" />
                                                <div className="h-3 w-12 rounded shimmer" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>

                    {/* ── RIGHT: 3D Map ──────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, x: 48, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
                        style={{ rotateX: springY, rotateY: springX }}
                        className="relative"
                    >
                        <div
                            className="relative overflow-hidden rounded-3xl"
                            style={{
                                boxShadow: "0 0 80px rgba(124,58,237,0.15), 0 40px 120px rgba(0,0,0,0.5)",
                                minHeight: "480px",
                                border: "1px solid var(--border)",
                            }}
                        >
                            <Suspense fallback={
                                <div
                                    className="w-full h-[480px] rounded-3xl flex items-center justify-center"
                                    style={{ background: "var(--surface)" }}
                                >
                                    <div className="w-10 h-10 rounded-full shimmer" />
                                </div>
                            }>
                                <CampusMap3D />
                            </Suspense>
                        </div>

                        {/* Floating: active gigs badge — shows real count or hides if zero */}
                        {hasRealData && stats.activeGigs > 0 && (
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -bottom-4 -left-4 px-4 py-3 rounded-2xl"
                                style={{
                                    background: "rgba(8,8,15,0.92)",
                                    border: "1px solid rgba(6,182,212,0.3)",
                                    backdropFilter: "blur(20px)",
                                    boxShadow: "0 0 24px rgba(6,182,212,0.12)",
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-2 h-2 rounded-full animate-breathe"
                                        style={{ background: "var(--accent)" }}
                                    />
                                    <span className="text-xs font-bold" style={{ color: "var(--text)" }}>
                                        {stats.activeGigs} live gigs right now
                                    </span>
                                </div>
                                <div className="text-[10px] mt-0.5" style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                                    Updated in real time
                                </div>
                            </motion.div>
                        )}

                        {/* Floating: AI match badge — illustrative, always shown */}
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className="absolute -top-3 -right-3 px-4 py-2.5 rounded-2xl"
                            style={{
                                background: "rgba(8,8,15,0.92)",
                                border: "1px solid rgba(124,58,237,0.3)",
                                backdropFilter: "blur(20px)",
                                boxShadow: "0 0 24px rgba(124,58,237,0.15)",
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xs" style={{ fontFamily: "var(--font-mono)", color: "var(--primary-light)" }}>✦</span>
                                <span className="text-xs font-bold" style={{ color: "var(--text)" }}>
                                    AI-powered matching
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom fade */}
            <div
                className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                style={{ background: "linear-gradient(to bottom, transparent, var(--bg))" }}
            />
        </section>
    )
}
