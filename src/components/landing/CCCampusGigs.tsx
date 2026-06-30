"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MapPin, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import Image from "@/components/ui/ResilientImage"
import { getLocalAvatar } from "@/lib/avatar"

const CATEGORIES = ["All", "Design", "Coding", "Notes", "Events", "Content"]

const CAT_COLORS: Record<string, { color: string; bg: string; border: string }> = {
    Design:  { color: "var(--primary-light)", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.3)"  },
    Coding:  { color: "var(--accent)",        bg: "rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.3)"   },
    Notes:   { color: "var(--gold)",          bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)"  },
    Events:  { color: "#f472b6",              bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.3)" },
    Content: { color: "var(--success)",       bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.3)"  },
}

const GIGS = [
    {
        id: 1,
        title: "Poster for Strides Tech Fest 2025",
        cat: "Design",
        price: "₹200",
        dist: "220m",
        meta: "A4 size · 2 revisions · Deliver in 1 day",
        student: "Aditya, 3rd yr",
        avatar: getLocalAvatar("Aditya", "7C3AED"),
    },
    {
        id: 2,
        title: "Debug my Python mini project (DBMS)",
        cat: "Coding",
        price: "₹150",
        dist: "380m",
        meta: "~2 hrs · Explain the solution too",
        student: "Meera, 2nd yr",
        avatar: getLocalAvatar("Meera", "0EA5E9"),
    },
    {
        id: 3,
        title: "DBMS Unit 3 handwritten notes",
        cat: "Notes",
        price: "₹80",
        dist: "100m",
        meta: "Clear handwriting · ~15 pages",
        student: "Ravi, 2nd yr",
        avatar: getLocalAvatar("Ravi", "10B981"),
    },
    {
        id: 4,
        title: "Photographer for cultural night",
        cat: "Events",
        price: "₹500",
        dist: "500m",
        meta: "3 hours · Bulk edited photos delivered",
        student: "Cultural Club",
        avatar: getLocalAvatar("Cultural Club", "F59E0B"),
    },
    {
        id: 5,
        title: "Write dept newsletter for February",
        cat: "Content",
        price: "₹120",
        dist: "280m",
        meta: "500 words · English · 2 days",
        student: "CSE Department",
        avatar: getLocalAvatar("CSE Department", "EC4899"),
    },
    {
        id: 6,
        title: "PPT for project presentation (10 slides)",
        cat: "Design",
        price: "₹180",
        dist: "430m",
        meta: "Professional theme · Icons included",
        student: "Sai, 3rd yr ECE",
        avatar: getLocalAvatar("Sai", "6366F1"),
    },
]

export default function CCCampusGigs() {
    const [activeTab, setActiveTab] = useState("All")
    const filtered = GIGS.filter((g) => activeTab === "All" || g.cat === activeTab)

    return (
        <section id="gigs" className="py-28 px-6 relative" style={{ background: "var(--bg)" }}>
            {/* Top divider */}
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)" }}
            />

            {/* ambient glow */}
            <div
                className="absolute top-0 right-0 w-[500px] h-[300px] pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 70%)",
                    filter: "blur(60px)",
                }}
            />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-6"
                        style={{
                            background: "rgba(139,92,246,0.08)",
                            border: "1px solid rgba(139,92,246,0.2)",
                            color: "var(--primary-light)",
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--primary-light)" }} />
                        Live right now
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-5xl mb-5 tracking-tight"
                        style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--text)" }}
                    >
                        Campus gigs{" "}
                        <span className="text-gradient">near you</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg max-w-xl mx-auto"
                        style={{ color: "var(--text-2)" }}
                    >
                        Real work. Real students. Real money. Posted by peers near you.
                    </motion.p>
                </div>

                {/* Filter tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {CATEGORIES.map((cat) => {
                        const isActive = activeTab === cat
                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className="relative px-5 py-2 rounded-full text-sm font-semibold transition-all"
                                style={{
                                    color: isActive ? "#fff" : "var(--text-2)",
                                    background: isActive ? "transparent" : "var(--surface)",
                                    border: isActive ? "1px solid transparent" : "1px solid var(--border)",
                                }}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="gig-tab-bubble"
                                        className="absolute inset-0 rounded-full"
                                        style={{ background: "var(--grad-brand)" }}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.55 }}
                                    />
                                )}
                                <span className="relative z-10">{cat}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Gig cards */}
                <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((g, i) => {
                            const cc = CAT_COLORS[g.cat] ?? { color: "var(--text-2)", bg: "rgba(255,255,255,0.04)", border: "var(--border)" }
                            return (
                                <motion.div
                                    key={g.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.92, y: 20 }}
                                    transition={{ duration: 0.3, delay: i * 0.04 }}
                                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                    className="group rounded-2xl p-6 transition-all duration-300 cursor-default"
                                    style={{
                                        background: "var(--surface)",
                                        border: "1px solid var(--border)",
                                        boxShadow: "var(--shadow-card)",
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = cc.border
                                        e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${cc.border}`
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = "var(--border)"
                                        e.currentTarget.style.boxShadow = "var(--shadow-card)"
                                    }}
                                >
                                    {/* Top row — category + distance */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span
                                            className="text-xs font-bold px-3 py-1 rounded-full"
                                            style={{ background: cc.bg, color: cc.color, border: `1px solid ${cc.border}`, fontFamily: "var(--font-mono)" }}
                                        >
                                            {g.cat}
                                        </span>
                                        <span
                                            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                                            style={{ background: "rgba(6,182,212,0.1)", color: "var(--accent)", border: "1px solid rgba(6,182,212,0.2)" }}
                                        >
                                            <MapPin className="w-3 h-3" />
                                            {g.dist}
                                        </span>
                                    </div>

                                    <h3
                                        className="text-[15px] mb-2 leading-snug"
                                        style={{ fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--text)" }}
                                    >
                                        {g.title}
                                    </h3>
                                    <p
                                        className="text-xs mb-5 pb-5"
                                        style={{ color: "var(--text-3)", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-mono)" }}
                                    >
                                        {g.meta}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <Image
                                                src={g.avatar}
                                                alt={g.student}
                                                className="w-8 h-8 rounded-full"
                                                style={{ border: "2px solid var(--border)" }}
                                                width={32}
                                                height={32}
                                                isAvatar={true}
                                            />
                                            <span className="text-xs font-medium" style={{ color: "var(--text-2)" }}>
                                                {g.student}
                                            </span>
                                        </div>
                                        <div
                                            className="text-lg"
                                            style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--text)" }}
                                        >
                                            {g.price}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </motion.div>

                <div className="text-center">
                    <Link
                        href="/gigs/find"
                        className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-base transition-all hover:scale-105 active:scale-95"
                        style={{
                            border: "1px solid var(--border)",
                            color: "var(--text-2)",
                            background: "var(--surface)",
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
                        Browse All Gigs
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
