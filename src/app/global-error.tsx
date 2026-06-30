'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCcw } from "lucide-react"
import { useEffect } from 'react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Root Layout Error:', error)
    }, [error])

    return (
        <html lang="en">
            <body className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden font-sans text-white">
                <div className="absolute inset-0 bg-size-[48px_48px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/8 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-red-500/15 border border-red-500/20 text-red-400 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                        <AlertTriangle size={36} />
                    </div>

                    <h1 className="font-extrabold text-3xl mb-3 tracking-tight">Critical System Failure</h1>
                    <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                        A critical application error occurred. We are investigating the issue. Please try reloading the page.
                    </p>

                    <button
                        onClick={() => reset()}
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                        <RefreshCcw size={16} /> Recover Application
                    </button>

                    {error.digest && (
                        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-4">
                            <p className="font-bold text-slate-500 text-xs uppercase tracking-widest mb-1">Incident ID</p>
                            <code className="text-slate-500 font-mono text-sm break-all">{error.digest}</code>
                        </div>
                    )}
                </div>
            </body>
        </html>
    )
}
