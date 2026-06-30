import { Mail, Phone, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

import ContactForm from "./ContactForm";

export const metadata: Metadata = {
    title: "Contact Us — CampusConnect",
};

export default function ContactUsPage() {
    return (
        <main 
            className="min-h-screen relative overflow-hidden" 
            style={{ 
                backgroundColor: "var(--ink, #0a0a0f)",
                color: "var(--text-inverse, #f0eee8)",
                ['--accent-warm' as string]: '#ffb800',
                ['--surface' as string]: 'rgba(255, 255, 255, 0.03)',
                ['--border-dim' as string]: 'rgba(255, 255, 255, 0.08)',
            }}
        >
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes revealUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .stagger-1 { animation: revealUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both; }
                .stagger-2 { animation: revealUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both; }
                .stagger-3 { animation: revealUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both; }
                .stagger-4 { animation: revealUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both; }
                
                .form-input {
                    transition: border-color 0.4s ease, background-color 0.4s ease;
                }
                .form-input:focus {
                    border-color: var(--accent-warm);
                    background-color: rgba(255, 255, 255, 0.02);
                }
                
                @media (prefers-reduced-motion: reduce) {
                    .stagger-1, .stagger-2, .stagger-3, .stagger-4 {
                        animation: none !important;
                        opacity: 1 !important;
                        transform: none !important;
                    }
                }
            `}} />

            {/* Layered Background Depth */}
            <div className="absolute inset-0 noise-bg opacity-[0.025] pointer-events-none" />
            <div 
                className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none opacity-20"
                style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} 
            />

            <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-24 pt-40 pb-32">
                
                {/* Grid Layout: Asymmetric */}
                <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24 items-start relative z-10">

                    {/* LEFT COLUMN: Hero Text & Trust Signals */}
                    <section className="flex flex-col">
                        <div 
                            className="inline-flex items-center gap-3 px-4 py-2 rounded-full border mb-12 stagger-1 w-fit"
                            style={{ borderColor: 'var(--border-dim)', background: 'var(--surface)' }}
                        >
                    <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--color-primary)", boxShadow: "0 0 8px var(--color-primary)" }} />
                            <span className="font-mono uppercase tracking-[0.2em] text-[#a0a0ab]">Direct Line</span>
                        </div>

                        <h1 
                            className="text-5xl md:text-6xl lg:text-7xl mb-8 leading-[1.05] tracking-tight stagger-2"
                            style={{ fontFamily: 'var(--font-display, "Syne", sans-serif)', fontWeight: 800 }}
                        >
                            Start the <br/>
                         <span style={{ color: 'var(--color-primary)' }}>conversation.</span>
                        </h1>

                        <p 
                            className="leading-relaxed text-[#8a8a93] mb-16 max-w-md stagger-3"
                            style={{ fontFamily: 'var(--font-body)' }}
                        >
                            No automated hurdles. Real people, immediate resolution. Whether you&apos;re navigating an escrow transaction or managing bulk campus recruitment, our desk is open.
                        </p>

                        <div className="space-y-10 stagger-4">
                            <div className="flex items-start gap-6 group">
                                <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl border transition-colors duration-300" style={{ borderColor: 'var(--border-dim)', background: 'var(--surface)' }}>
                                    <Mail className="w-5 h-5 text-white group-hover:text-(--accent-warm) transition-colors duration-300" />
                                </div>
                                <div>
                                    <h3 className="font-mono uppercase tracking-[0.15em] text-[#6b6b80] mb-2">Priority Email</h3>
                                    <a href="mailto:support@campusconnectco.in" className="text-xl font-medium tracking-tight hover:text-(--accent-warm) outline-none focus-visible:text-(--accent-warm) transition-colors duration-300 inline-flex items-center gap-2">
                                        support@campusconnectco.in
                                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:translate-x-0 group-hover:translate-x-0 transition-all duration-300" />
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-6 group">
                                <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl border transition-colors duration-300" style={{ borderColor: 'var(--border-dim)', background: 'var(--surface)' }}>
                                    <Phone className="w-5 h-5 text-white group-hover:text-(--accent-warm) transition-colors duration-300" />
                                </div>
                                <div>
                                    <h3 className="font-mono uppercase tracking-[0.15em] text-[#6b6b80] mb-2">Director&apos;s Desk</h3>
                                    <p className="font-medium tracking-tight transition-colors duration-300 inline-flex items-center gap-2 text-white">
                                        Mon-Fri, 9AM-6PM IST
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* RIGHT COLUMN: Contact Form Grid-Breaker */}
                    <section 
                        className="relative w-full rounded-4xl border overflow-hidden p-8 sm:p-12 stagger-4"
                        style={{ 
                            borderColor: 'var(--border-dim)', 
                            background: 'rgba(255,255,255,0.015)',
                            backdropFilter: 'blur(16px)'
                        }}
                    >
                        {/* Soft inset shadow/glow on the form card */}
                        <div className="absolute inset-0 pointer-events-none rounded-4xl" style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)' }} />

                        <ContactForm />
                    </section>
                </div>
            </div>
        </main>
    );
}
