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
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-background overflow-hidden">
            {/* Background FX */}
            <div className="absolute inset-0 bg-size-[48px_48px]" />
            <div className="absolute top-[-20%] right-[-5%] w-125 h-125 bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-15%] left-[-10%] w-100 h-100 bg-primary-light/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                {/* Logo & Brand */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-primary-light flex justify-center items-center shadow-[0_0_20px_rgba(31,169,113,0.3)] group-hover:shadow-[0_0_25px_rgba(31,169,113,0.5)] transition-all">
                            <span className="font-heading font-black text-xl tracking-tighter text-background">CC</span>
                        </div>
                        <span className="font-heading font-black text-2xl text-foreground transition-colors tracking-tight">
                            CampusConnect
                        </span>
                    </Link>
                    <p className="text-sm mt-2 font-bold tracking-wide uppercase text-muted-foreground">Join students building their careers</p>
                </div>

                {/* Trust badges */}
                <div className="flex justify-center gap-3 mb-6 flex-wrap text-[10px]">
                    {["Free Forever", "Campus Verified", "Secure Escrow"].map(badge => (
                        <span key={badge} className="font-bold px-3 py-1.5 rounded-full bg-surface-2 border border-border text-muted-foreground uppercase tracking-widest shadow-sm">
                            ✓ {badge}
                        </span>
                    ))}
                </div>

                <div className="bg-surface/50 border border-border rounded-3xl p-1 backdrop-blur-xl shadow-2xl">
                    <Suspense fallback={
                        <div className="p-4 md:p-8 animate-pulse space-y-4">
                            <div className="h-6 bg-accent rounded-xl w-1/2 mx-auto" />
                            <div className="h-11 bg-accent rounded-xl" />
                            <div className="h-11 bg-accent rounded-xl" />
                            <div className="h-11 bg-foreground text-background rounded-xl" />
                        </div>
                    }>
                        <SignUpForm />
                    </Suspense>
                </div>

                <p className="text-xs mt-6 text-center text-muted-foreground">
                    By joining you agree to our{" "}
                    <Link href="/terms" className="text-primary hover:text-foreground transition-colors hover:underline">Terms</Link> &{" "}
                    <Link href="/privacy" className="text-primary hover:text-foreground transition-colors hover:underline">Privacy Policy</Link>
                </p>
            </div>
        </div>
    );
}
