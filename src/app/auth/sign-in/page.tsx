import type { Metadata } from 'next';
import Link from "next/link";
import { Suspense } from "react";

import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = {
    title: "Sign In — CampusConnect",
    description: "Sign in to your CampusConnect account and access your student opportunity dashboard."
};

export default function SignInPage() {
    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-background overflow-hidden" style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>
            {/* Background FX */}
            <div className="absolute inset-0 bg-size-[48px_48px]" />
            <div className="absolute top-[-20%] left-[-10%] w-150 h-150 bg-foreground text-background/15 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-100 h-100 bg-(--accent)/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                {/* Logo & Brand */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-(--primary) to-(--accent) flex justify-center items-center shadow-[0_0_20px_rgba(124,58,237,0.3)] group-hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all">
                            <span className="font-black text-xl tracking-tighter mix-blend-overlay">CC</span>
                        </div>
                        <span className="font-black text-foreground group-hover:text-foreground transition-colors tracking-tight" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
                            CampusConnect
                        </span>
                    </Link>
                    <p className="text-sm mt-2 font-bold tracking-wide uppercase">The student opportunity hub</p>
                </div>

                <div className="bg-(--surface-2) border border-border rounded-3xl p-1 backdrop-blur-xl shadow-2xl">
                    <Suspense fallback={
                        <div className="p-4 md:p-8 animate-pulse space-y-4">
                            <div className="h-6 bg-accent rounded-xl w-1/2 mx-auto" />
                            <div className="h-11 bg-accent rounded-xl" />
                            <div className="h-11 bg-accent rounded-xl" />
                            <div className="h-11 bg-foreground text-background rounded-xl" />
                        </div>
                    }>
                        <SignInForm />
                    </Suspense>
                </div>

                <p className="text-xs mt-6">
                    By signing in you agree to our{" "}
                    <Link href="/terms" className="text-(--primary-light) hover:text-foreground transition-colors hover:underline">Terms</Link> &{" "}
                    <Link href="/privacy" className="text-(--primary-light) hover:text-foreground transition-colors hover:underline">Privacy Policy</Link>
                </p>
            </div>
        </div>
    );
}
