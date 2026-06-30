"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, LayoutDashboard } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState, useCallback } from "react"

import { createClient } from "@/lib/supabase/client"

const NAV_LINKS = [
    { label: "Campus Gigs", href: "#gigs" },
    { label: "Internships", href: "#internships" },
    { label: "AI Roadmap", href: "#roadmap" },
    { label: "How it Works", href: "#how-it-works" },
]

function NavLink({ href, label }: { href: string; label: string }) {
    const [hovered, setHovered] = useState(false)
    return (
        <Link
            href={href}
            className="relative group text-xs font-bold uppercase tracking-widest py-1 transition-colors"
            style={{ color: hovered ? "var(--text)" : "var(--text-2)", fontFamily: "var(--font-mono)" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <span className="relative z-10">{label}</span>
            <motion.span
                className="absolute bottom-0 left-0 h-[1.5px] origin-left"
                style={{ background: "var(--grad-brand)" }}
                animate={{ width: hovered ? "100%" : "0%" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
            />
        </Link>
    )
}

export default function CCNavbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const prevScroll = useRef(0)
    const [visible, setVisible] = useState(true)

    // Auth states
    const supabase = createClient()
    const [userId, setUserId] = useState<string | null>(null)
    const [userRole, setUserRole] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    const syncUser = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setUserId(null)
            setUserRole(null)
            return
        }
        setUserId(user.id)

        if (user.user_metadata?.role) {
            setUserRole(user.user_metadata.role)
        }
    }, [supabase])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)
        syncUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_IN") syncUser()
            if (event === "SIGNED_OUT") {
                setUserId(null)
                setUserRole(null)
            }
        })

        return () => subscription.unsubscribe()

    }, [syncUser, supabase])

    useEffect(() => {
        const onScroll = () => {
            const curr = window.scrollY
            setScrolled(curr > 40)
            if (curr > 300) {
                setVisible(curr < prevScroll.current)
            } else {
                setVisible(true)
            }
            prevScroll.current = curr
        }
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [mobileOpen])

    const dashboardUrl = userRole === "STUDENT" ? "/dashboard/student" : "/dashboard"

    return (
        <>
            {/* ── Desktop Navbar ─────────────────────────────────────── */}
            <motion.nav
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
                style={{
                    background: scrolled ? "rgba(8,8,15,0.85)" : "transparent",
                    backdropFilter: scrolled ? "blur(20px)" : "none",
                    WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
                    borderBottom: scrolled ? "1px solid rgba(139,92,246,0.12)" : "none",
                }}
            >
                {scrolled && (
                    <div
                        className="absolute top-0 left-0 right-0 h-px"
                        style={{ background: "var(--grad-brand)", opacity: 0.4 }}
                    />
                )}

                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                            <div className="relative w-8 h-8">
                                <Image src="/logo-v2.jpg" alt="CampusConnect" className="w-8 h-8 rounded-lg object-contain" width={32} height={32} priority />
                                <motion.div
                                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                                    style={{ background: "var(--accent)" }}
                                />
                            </div>
                            <span
                                className="text-lg"
                                style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--text)" }}
                            >
                                Campus<span className="text-gradient">Connect</span>
                            </span>
                        </Link>

                        {/* Desktop nav links */}
                        <nav className="hidden md:flex items-center gap-8">
                            {NAV_LINKS.map((l) => <NavLink key={l.href} {...l} />)}
                        </nav>

                        {/* Right CTAs */}
                        <div className="hidden md:flex items-center gap-3">
                            {!mounted ? (
                                <div className="w-24 h-9 rounded-xl bg-white/5 animate-pulse" />
                            ) : userId ? (
                                <Link
                                    href={dashboardUrl}
                                    className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
                                    style={{
                                        background: "var(--grad-brand)",
                                        boxShadow: "var(--shadow-glow-primary)",
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-btn-hover)" }}
                                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-glow-primary)" }}
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/auth/sign-in"
                                        className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                        style={{ border: "1px solid var(--border)", color: "var(--text-2)", fontFamily: "var(--font-mono)" }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"
                                            e.currentTarget.style.color = "var(--text)"
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = "var(--border)"
                                            e.currentTarget.style.color = "var(--text-2)"
                                        }}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/auth/sign-up"
                                        className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95"
                                        style={{
                                            background: "var(--grad-brand)",
                                            boxShadow: "var(--shadow-glow-primary)",
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.boxShadow = "var(--shadow-btn-hover)"
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.boxShadow = "var(--shadow-glow-primary)"
                                        }}
                                    >
                                        Join Free
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden p-2.5 rounded-xl transition-all"
                            style={{ color: "var(--text-2)", background: mobileOpen ? "rgba(124,58,237,0.1)" : "transparent" }}
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* ── Mobile Fullscreen Menu ─────────────────────────────── */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-40 flex flex-col"
                        style={{ background: "var(--bg)" }}
                    >
                        <div className="flex items-center justify-between h-16 px-6" style={{ borderBottom: "1px solid var(--border)" }}>
                            <Link
                                href="/"
                                className="text-lg font-bold"
                                style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
                                onClick={() => setMobileOpen(false)}
                            >
                                Campus<span className="text-gradient">Connect</span>
                            </Link>
                            <button
                                className="p-2.5 rounded-xl"
                                style={{ color: "var(--text-2)" }}
                                onClick={() => setMobileOpen(false)}
                                aria-label="Close menu"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6">
                            {NAV_LINKS.map((link, i) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.07 + 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <Link
                                        href={link.href}
                                        className="text-lg font-bold block text-center transition-colors"
                                        style={{ fontFamily: "var(--font-heading)", color: "var(--text-2)" }}
                                        onClick={() => setMobileOpen(false)}
                                        onMouseEnter={e => { e.currentTarget.style.color = "var(--text)" }}
                                        onMouseLeave={e => { e.currentTarget.style.color = "var(--text-2)" }}
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}

                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.42, duration: 0.4 }}
                                className="flex flex-col gap-3 mt-8 w-full max-w-xs"
                            >
                                {userId ? (
                                    <Link
                                        href={dashboardUrl}
                                        className="px-8 py-3.5 rounded-xl text-base font-bold text-center text-white"
                                        style={{ background: "var(--grad-brand)" }}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Go to Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/auth/sign-in"
                                            className="px-8 py-3.5 rounded-xl text-base font-semibold text-center"
                                            style={{ border: "1px solid var(--border)", color: "var(--text)" }}
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/auth/sign-up"
                                            className="px-8 py-3.5 rounded-xl text-base font-bold text-center"
                                            style={{ background: "var(--grad-brand)", boxShadow: "var(--shadow-glow-primary)" }}
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            Join Free
                                        </Link>
                                    </>
                                )}
                            </motion.div>
                        </div>

                        <div className="px-6 py-6 text-center" style={{ borderTop: "1px solid var(--border)" }}>
                            <p className="text-xs" style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                                India&apos;s student super-app
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

