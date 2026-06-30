import type { Metadata } from 'next';
import Link from "next/link";
import { Suspense } from "react";

import SignUpForm from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
    title: "Join CampusConnect — Start Your Student Career",
    description: "Create your free CampusConnect account. Find gigs, post opportunities, and build your career before graduation."
};

export default function SignUpPage() {
    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-background overflow-hidden" style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>
            {/* Background FX */}
            <div className="absolute inset-0 bg-size-[48px_48px]" />
            <div className="absolute top-[-20%] right-[-5%] w-[500px] h-[500px] bg-(--primary)/15 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] bg-(--accent)/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                {/* Logo & Brand */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-(--primary) to-(--accent) flex justify-center items-center shadow-[0_0_20px_rgba(124,58,237,0.3)] group-hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all">
                            <span className="font-black text-xl tracking-tighter mix-blend-overlay">CC</span>
                        </div>
                        <span className="font-black text-white group-hover:text-slate-200 transition-colors tracking-tight" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
                            CampusConnect
                        </span>
                    </Link>
                    <p className="text-sm mt-2 font-bold tracking-wide uppercase">Join students building their careers</p>
                </div>

                {/* Trust badges */}
                <div className="flex justify-center gap-3 mb-6 flex-wrap">
                    {["Free Forever", "Campus Verified", "Secure Escrow"].map(badge => (
                        <span key={badge} className="font-black px-3 py-1.5 rounded-full bg-(--surface-2) border border-(--border) text-muted-foreground uppercase tracking-widest shadow-sm">
                            ✓ {badge}
                        </span>
                    ))}
                </div>

                <div className="bg-(--surface-2) border border-(--border) rounded-3xl p-1 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <Suspense fallback={
                        <div className="p-4 md:p-8 animate-pulse space-y-4">
                            <div className="h-6 bg-white/10 rounded-xl w-1/2 mx-auto" />
                            <div className="h-11 bg-white/10 rounded-xl" />
                            <div className="h-11 bg-white/10 rounded-xl" />
                            <div className="h-11 bg-(--primary)/20 rounded-xl" />
                        </div>
                    }>
                        <SignUpForm />
                    </Suspense>
                </div>

                <p className="text-xs mt-6">
                    By joining you agree to our{" "}
                    <Link href="/terms-and-conditions" className="text-(--primary-light) hover:text-white transition-colors hover:underline">Terms</Link> &{" "}
                    <Link href="/privacy-policy" className="text-(--primary-light) hover:text-white transition-colors hover:underline">Privacy Policy</Link>
                </p>
            </div>
        </div>
    );
}
