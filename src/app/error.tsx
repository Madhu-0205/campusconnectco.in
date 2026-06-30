'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCcw, Home } from "lucide-react"
import Link from 'next/link'
import { useEffect } from 'react'

import { Button } from "@/components/ui/Button"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Application Error:', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-size-[48px_48px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/8 blur-[100px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 max-w-md w-full text-center"
            >
                {/* Icon */}
                <motion.div
                    animate={{ rotate: [0, -5, 5, -5, 0] }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="w-20 h-20 bg-red-500/15 border border-red-500/20 text-red-400 rounded-3xl flex items-center justify-center mx-auto mb-8"
                >
                    <AlertTriangle size={36} />
                </motion.div>

                <h1 className="font-black text-white mb-3 tracking-tight">Something broke.</h1>
                <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                    An unexpected error occurred on our end. We&apos;ve been notified and are on it.
                </p>

                <div className="space-y-3 mb-8">
                    <Button
                        onClick={() => reset()}
                        className="w-full h-12 bg-electric hover:bg-blue-600 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-electric/20"
                    >
                        <RefreshCcw size={16} /> Try Again
                    </Button>
                    <Link href="/">
                        <Button
                            variant="ghost"
                            className="w-full h-12 text-slate-400 hover:text-white font-black rounded-xl flex items-center justify-center gap-2"
                        >
                            <Home size={16} /> Back to Home
                        </Button>
                    </Link>
                </div>

                {error.digest && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <p className="font-black text-slate-500 uppercase tracking-widest mb-1">Error ID</p>
                        <code className="text-slate-500 font-mono break-all">{error.digest}</code>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
