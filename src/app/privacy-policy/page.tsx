import { Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy — CampusConnect",
};

export default function PrivacyPolicyPage() {
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
                .stagger-text > * {
                    animation: revealUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
                .stagger-text > *:nth-child(1) { animation-delay: 0.3s; }
                .stagger-text > *:nth-child(2) { animation-delay: 0.35s; }
                .stagger-text > *:nth-child(3) { animation-delay: 0.4s; }
                .stagger-text > *:nth-child(4) { animation-delay: 0.45s; }
                .stagger-text > *:nth-child(5) { animation-delay: 0.5s; }
                .stagger-text > *:nth-child(6) { animation-delay: 0.55s; }
                
                @media (prefers-reduced-motion: reduce) {
                    .stagger-1, .stagger-2, .stagger-3, .stagger-text > * {
                        animation: none !important;
                        opacity: 1 !important;
                        transform: none !important;
                    }
                }
                
                .editorial-text h2 {
                    font-family: var(--font-display, "Syne", sans-serif);
                    font-weight: 800;
                    font-size: 1.5rem;
                    color: #ffffff;
                    margin-top: 4rem;
                    margin-bottom: 1.5rem;
                    letter-spacing: -0.02em;
                    position: relative;
                }
                .editorial-text h2::before {
                    content: "";
                    position: absolute;
                    top: -1.5rem;
                    left: 0;
                    width: 24px;
                    height: 2px;
                    background: var(--accent-warm);
                }
                .editorial-text p {
                    font-family: var(--font-body, sans-serif);
                    font-size: 1.125rem;
                    line-height: 1.8;
                    color: #a1a1aa;
                    margin-bottom: 2rem;
                }
                .editorial-text strong {
                    color: #e4e4e7;
                    font-weight: 600;
                }
            `}} />

            {/* Layered Background Depth */}
            <div className="absolute inset-0 noise-bg opacity-[0.025] pointer-events-none" />
            <div 
                className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[160px] pointer-events-none opacity-[0.15]"
                style={{ background: 'radial-gradient(circle, var(--accent-warm) 0%, transparent 80%)', transform: 'translate(40%, -40%)' }} 
            />

            <div className="max-w-[1200px] mx-auto px-6 sm:px-12 pt-40 pb-32 relative z-10">
                
                {/* Header Section */}
                <div className="mb-24 max-w-2xl">
                    <div 
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-full border mb-8 stagger-1"
                        style={{ borderColor: 'var(--border-dim)', background: 'var(--surface)' }}
                    >
                        <Shield className="w-4 h-4 text-(--accent-warm) shrink-0" />
                        <span className="font-mono uppercase tracking-[0.2em] text-[#a0a0ab]">Data Security</span>
                    </div>

                    <h1 
                        className="text-5xl md:text-6xl lg:text-7xl mb-8 leading-[1.05] tracking-tight stagger-2"
                        style={{ fontFamily: 'var(--font-display, "Syne", sans-serif)', fontWeight: 800 }}
                    >
                        Total Privacy. <br/>
                        <span style={{ color: 'var(--text-muted, #6b6b80)' }}>Zero Compromise.</span>
                    </h1>

                    <p 
                        className="leading-relaxed text-[#8a8a93] stagger-3"
                        style={{ fontFamily: 'var(--font-body)' }}
                    >
                        We built CampusConnect to empower you, not to harvest your data. We operate on strict necessity—collecting only what ensures secure escrow and definitive identity verification.
                    </p>
                    
                    <div className="mt-8 pt-8 border-t stagger-3 flex items-center gap-4" style={{ borderColor: 'var(--border-dim)' }}>
                        <span className="font-mono uppercase tracking-[0.2em] text-[#6b6b80]">Effective Date</span>
                        <span className="font-bold text-white">Immediately</span>
                    </div>
                </div>

                {/* Editorial Body layout */}
                <div className="grid lg:grid-cols-[1fr_2fr] gap-16 lg:gap-32">
                    
                    {/* Index / Sidebar (Optional visual balance) */}
                    <aside className="hidden lg:block relative stagger-3">
                        <div className="sticky top-32 space-y-6">
                            <h3 className="font-mono uppercase tracking-[0.2em] text-[#6b6b80] mb-8">Contents</h3>
                            <ul className="space-y-4 font-medium text-[#8a8a93]">
                                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-2"><span className="w-1 h-1 shrink-0 rounded-full bg-(--accent-warm)" /> Identity & Data</li>
                                <li className="hover:text-white transition-colors cursor-pointer">Financial Security</li>
                                <li className="hover:text-white transition-colors cursor-pointer">Platform Operations</li>
                                <li className="hover:text-white transition-colors cursor-pointer">Third-Party Subprocessors</li>
                            </ul>
                        </div>
                    </aside>

                    {/* Policy Content */}
                    <div className="editorial-text stagger-text max-w-3xl">
                        
                        <h2>Information Collection Paradigm</h2>
                        <p>At CampusConnect, our architecture guarantees your privacy. Upon account creation, we query strictly requisite parameters: cryptographic identifiers (emails), physical nomenclature (names), and academic vetting data (college affiliations). No ambient tracking, no shadow profiling.</p>

                        <h2>Isolated Financial Architecture</h2>
                        <p>CampusConnect fundamentally functions as a mediator. <strong>All payment credentials, credit matrices, and banking routes are handled securely by our payment partners.</strong> Our servers never ingest, parse, or log your primary financial artifacts.</p>

                        <h2>Operational Utility</h2>
                        <p>Information persists in our active databases solely to optimize the latency of your matches, execute escrow triggers reliably, and deliver push-telemetry regarding gig trajectories. If data isn&apos;t serving your operational velocity, it gets pruned.</p>

                        <h2>Sovereign Data Boundaries</h2>
                        <p>Your institutional graph and transactional history are entirely sovereign. We do not aggregate your behaviors for external ad-exchanges. Datasets bridge only with our regulated financial partners, exclusively to clear authorized capital flows.</p>

                        <h2>Authentication Tokens & Cookies</h2>
                        <p>We deploy highly encrypted JWT cookies locally to persist your session state securely across edge reloads. Standardized interaction telemetry is buffered strictly to ensure frictionless UI state restoration and security auditing. By engaging with our routing system, you authorize this baseline telemetry.</p>

                        <h2>Enterprise-Grade Security Framework</h2>
                        <p>We mandate modern cryptographic standards (AES-256 equivalent wrappers in-flight via TLS 1.3) across all network layers. While the nature of distributed systems implies an absolute zero-risk environment is theoretical, our infrastructure continuously self-audits and upgrades to mitigate hostile vectors instantly.</p>
                        
                    </div>
                </div>
            </div>
        </main>
    );
}
