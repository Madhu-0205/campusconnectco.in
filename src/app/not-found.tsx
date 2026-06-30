"use client"

import { motion } from "framer-motion"
import { Home, Search, Compass } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        background:  "var(--color-background)",
        color:       "var(--color-text)",
        fontFamily:  "var(--font-body)",
      }}
    >
      {/* Noise grain */}
      <div className="absolute inset-0 noise-bg opacity-[0.025] pointer-events-none" />

      {/* Orange radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,77,28,0.12) 0%, transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center max-w-lg"
      >
        {/* 404 number */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-[140px] md:text-[180px] font-black leading-none tracking-tighter select-none mb-4"
          style={{
            fontFamily: "var(--font-display)",
            background: "linear-gradient(135deg, #ff4d1c 0%, #ffb800 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            opacity: 0.65,
          }}
        >
          404
        </motion.div>

        {/* Floating icon */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-8 -mt-6"
          style={{
            background: "rgba(255,77,28,0.10)",
            border:     "1px solid rgba(255,77,28,0.20)",
          }}
        >
          <Compass size={30} style={{ color: "var(--color-primary)" }} />
        </motion.div>

        <h1
          className="text-3xl md:text-4xl font-black mb-4 tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
        >
          Page not found
        </h1>
        <p
          className="text-lg leading-relaxed mb-10 max-w-sm mx-auto"
          style={{ color: "var(--color-text-muted)" }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link href="/">
            <button
              className="h-11 px-7 text-white rounded-full font-black flex items-center gap-2 transition-all active:scale-95 hover:-translate-y-0.5"
              style={{
                background:  "var(--color-primary)",
                boxShadow:   "var(--shadow-btn-primary)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-btn-hover)" }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-btn-primary)" }}
            >
              <Home size={15} /> Go Home
            </button>
          </Link>
          <Link href="/gigs/find">
            <button
              className="h-11 px-7 rounded-full font-black flex items-center gap-2 transition-all hover:bg-white/10"
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                color:  "var(--color-text)",
              }}
            >
              <Search size={15} /> Browse Gigs
            </button>
          </Link>
        </div>

        {/* Popular pages */}
        <div className="pt-8" style={{ borderTop: "1px solid var(--color-border)" }}>
          <p
            className="text-xs font-black uppercase tracking-widest mb-4"
            style={{ color: "var(--color-text-muted)" }}
          >
            Popular pages
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: "Sign Up",              href: "/auth/sign-up" },
              { label: "Browse Opportunities", href: "/gigs/find" },
              { label: "Our Story",            href: "/about" },
              { label: "Manifesto",            href: "/manifesto" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  color:       "var(--color-text-muted)",
                  border:      "1px solid var(--color-border)",
                  background:  "transparent",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.color       = "var(--color-primary)"
                  el.style.borderColor = "rgba(255,77,28,0.35)"
                  el.style.background  = "rgba(255,77,28,0.08)"
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.color       = "var(--color-text-muted)"
                  el.style.borderColor = "var(--color-border)"
                  el.style.background  = "transparent"
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
