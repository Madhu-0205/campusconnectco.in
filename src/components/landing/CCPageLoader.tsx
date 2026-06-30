"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const BOOT_LOGS = [
    { text: "$ init --cluster=india --verbose", type: "cmd" },
    { text: "[OK] Core service layer booted", type: "success" },
    { text: "[OK] Hyperspatial matching index loaded (r = 5km)", type: "success" },
    { text: "[OK] Escrow payment protocol verified (256-bit SSL)", type: "success" },
    { text: "[OK] AI Copilot graph nodes resolved (v6.2.1)", type: "success" },
    { text: "[OK] Synchronizing campus clusters...", type: "info" },
    { text: "⚡ System online. Redirecting to viewport...", type: "cmd" }
]

export default function CCPageLoader({ isBot = false }: { isBot?: boolean }) {
    const [loading, setLoading] = useState(!isBot)
    const [visibleLogs, setVisibleLogs] = useState<string[]>([])
    const [logIdx, setLogIdx] = useState(0)

    useEffect(() => {
        if (isBot) return
        if (typeof window !== "undefined") {
            const hasVisited = sessionStorage.getItem("cc_visited") === "true"
            if (hasVisited) {
                setTimeout(() => {
                    setLoading(false)
                }, 0)
            }
        }
    }, [isBot])

    useEffect(() => {
        if (!loading) return
        if (logIdx < BOOT_LOGS.length) {
            const delay = logIdx === 0 ? 150 : logIdx === BOOT_LOGS.length - 1 ? 200 : 80
            const timer = setTimeout(() => {
                setVisibleLogs((prev) => [...prev, BOOT_LOGS[logIdx].text])
                setLogIdx((idx) => idx + 1)
            }, delay)
            return () => clearTimeout(timer)
        } else {
            const timer = setTimeout(() => {
                setLoading(false)
                try {
                    sessionStorage.setItem("cc_visited", "true")
                } catch (e) {
                    // Ignore storage errors in incognito/private modes
                }
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [logIdx, loading])

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-[#08080F]"
                >
                    {/* Subtle grid backdrop */}
                    <div className="absolute inset-0 mesh-grid pointer-events-none opacity-20" />
                    
                    {/* Glow background */}
                    <div 
                        className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none"
                        style={{
                            background: "radial-gradient(circle, var(--primary-light) 0%, transparent 70%)"
                        }}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-md px-6 z-10"
                    >
                        {/* Terminal Window Header */}
                        <div 
                            className="flex items-center justify-between px-4 py-3 rounded-t-2xl border-t border-x"
                            style={{
                                background: "rgba(17, 17, 39, 0.9)",
                                borderColor: "var(--border)"
                            }}
                        >
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-[#EF4444]/40" />
                                <span className="w-3 h-3 rounded-full bg-[#F59E0B]/40" />
                                <span className="w-3 h-3 rounded-full bg-[#10B981]/40" />
                            </div>
                            <span 
                                className="text-[10px] font-bold tracking-widest uppercase"
                                style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)" }}
                            >
                                cc-compiler.log
                            </span>
                        </div>

                        {/* Terminal Body */}
                        <div 
                            className="p-5 min-h-[190px] rounded-b-2xl border flex flex-col justify-start gap-2.5 font-mono text-xs select-none backdrop-blur-md"
                            style={{
                                background: "rgba(8, 8, 15, 0.82)",
                                borderColor: "var(--border)"
                            }}
                        >
                            {visibleLogs.map((log, i) => {
                                const isCmd = log.startsWith("$") || log.startsWith("⚡")
                                const isSuccess = log.includes("[OK]")
                                return (
                                    <div 
                                        key={i} 
                                        className="leading-relaxed"
                                        style={{
                                            color: isCmd 
                                                ? "var(--accent)" 
                                                : isSuccess 
                                                    ? "var(--success)" 
                                                    : "var(--text-2)"
                                        }}
                                    >
                                        {log}
                                    </div>
                                )
                            })}
                            
                            {logIdx < BOOT_LOGS.length && (
                                <motion.span 
                                    animate={{ opacity: [1, 0, 1] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                    className="w-1.5 h-4 inline-block align-middle"
                                    style={{ background: "var(--accent)" }}
                                />
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

