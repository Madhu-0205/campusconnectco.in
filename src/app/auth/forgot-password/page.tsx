"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Mail, ArrowLeft, Loader2, CheckCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
    const supabase = createClient();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            if (resetError) { setError(resetError.message); return; }
            setSuccess(true);
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-size-[48px_48px]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-(--primary)/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                {/* Brand */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2.5 group">
                        <Image src="/logo-v2.jpg" alt="CampusConnect" width={40} height={40} className="w-10 h-10 rounded-xl object-contain" />
                        <span className="font-black text-white group-hover:text-(--primary) transition-colors">CampusConnect</span>
                    </Link>
                </div>

                <div className="bg-(--surface-2) border border-(--border) rounded-3xl p-4 md:p-8 backdrop-blur-xl shadow-2xl">
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                                <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle size={32} className="text-emerald-400" />
                                </div>
                                <h2 className="font-black text-white mb-3">Check your inbox</h2>
                                <p className="text-muted-foreground mb-2">We sent a reset link to</p>
                                <p className="font-black text-(--primary) mb-6">{email}</p>
                                <p className="text-muted-foreground mb-8 leading-relaxed">
                                    Click the link in the email to reset your password. Check spam if you don&apos;t see it within a minute.
                                </p>
                                <Link href="/auth/sign-in" className="inline-flex items-center gap-2 font-black text-muted-foreground hover:text-white transition-colors">
                                    <ArrowLeft size={14} /> Back to Sign In
                                </Link>
                            </motion.div>
                        ) : (
                            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="text-center mb-8">
                                    <div className="w-14 h-14 bg-(--primary)/15 border border-(--primary)/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                        <Mail size={26} className="text-(--primary)" />
                                    </div>
                                    <h1 className="font-black text-white mb-2">Forgot your password?</h1>
                                    <p className="text-sm">No worries — enter your email and we&apos;ll send a reset link instantly.</p>
                                </div>

                                {error && (
                                    <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl font-medium text-red-400">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block font-black text-muted-foreground uppercase tracking-widest mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                            <input
                                                type="email"
                                                placeholder="you@university.edu"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                required
                                                className="w-full pl-10 pr-4 py-3 bg-(--surface-2) border border-(--border) placeholder:text-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--primary)/40 focus:border-(--primary)/40 transition-all text-sm font-medium"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-11 bg-(--primary) hover:bg-blue-600 disabled:bg-slate-700 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-(--primary)/20 disabled:shadow-none disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <><Loader2 size={16} className="animate-spin" /> Sending...</>
                                        ) : (
                                            <><Sparkles size={15} /> Send Reset Link</>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-6 text-center">
                                    <Link href="/auth/sign-in" className="inline-flex items-center gap-1.5 font-bold text-muted-foreground hover:text-white transition-colors">
                                        <ArrowLeft size={13} /> Back to Sign In
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
