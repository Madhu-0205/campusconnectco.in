"use client"

import { motion } from "framer-motion"
import { ArrowUpRight, Github, Twitter, Linkedin, Instagram } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const FOOTER_LINKS = {
    Product: [
        { label: "Campus Gigs",        href: "/gigs/find" },
        { label: "Startup Internships", href: "/internships" },
        { label: "SmartMatch AI",       href: "/dashboard/student/smartmatch" },
        { label: "Marketplace",         href: "/marketplace" },
        { label: "Pricing",             href: "/pricing" },
    ],
    Company: [
        { label: "About Us",          href: "/about" },
        { label: "Success Stories",   href: "/success-stories" },
        { label: "Manifesto",         href: "/manifesto" },
        { label: "Careers",           href: "/contact-us" },
        { label: "Contact",           href: "/contact-us" },
    ],
    Trust: [
        { label: "Trust & Safety",      href: "/trust" },
        { label: "Editorial Standards", href: "/editorial" },
        { label: "Verification System", href: "/trust#verification" },
        { label: "Dispute Resolution",  href: "/trust#disputes" },
    ],
    "For Employers": [
        { label: "Talent Search",    href: "/employer/talent-search" },
        { label: "Campus Drives",    href: "/employer/drives" },
        { label: "Employer Plans",   href: "/employer/upgrade" },
        { label: "Case Studies",     href: "/success-stories" },
    ],
    Legal: [
        { label: "Terms of Service", href: "/terms-and-conditions" },
        { label: "Privacy Policy",   href: "/privacy-policy" },
        { label: "Refund Policy",    href: "/refund-policy" },
    ],
}

const SOCIALS = [
    { label: "Twitter / X", href: "https://twitter.com/campusconnectin", icon: Twitter },
    { label: "LinkedIn",    href: "https://linkedin.com/company/campusconnect-in", icon: Linkedin },
    { label: "Instagram",   href: "https://instagram.com/campusconnect.in", icon: Instagram },
    { label: "GitHub",      href: "https://github.com/campusconnect-in", icon: Github },
]

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
    return (
        <div>
            <h4
                className="text-xs uppercase tracking-[0.2em] font-bold mb-5"
                style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)" }}
            >
                {title}
            </h4>
            <ul className="space-y-3">
                {links.map((link) => (
                    <li key={link.label}>
                        <Link
                            href={link.href}
                            className="group flex items-center gap-1 text-sm transition-colors w-fit"
                            style={{ color: "var(--text-2)" }}
                            onMouseEnter={e => { e.currentTarget.style.color = "var(--text)" }}
                            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-2)" }}
                        >
                            {link.label}
                            <ArrowUpRight
                                className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -translate-y-0.5"
                            />
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default function CCFooter() {
    return (
        <footer
            className="relative overflow-hidden"
            style={{
                background: "var(--bg-subtle)",
                borderTop: "1px solid var(--border)",
            }}
        >
            {/* ambient glow */}
            <div
                className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)",
                    filter: "blur(40px)",
                }}
            />

            <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-8">

                {/* ── Main grid ───────────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-12 gap-12 mb-16">

                    {/* Brand column */}
                    <div className="col-span-2 md:col-span-4">
                        <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
                            <div className="relative w-9 h-9">
                                <Image
                                    src="/logo-v2.jpg"
                                    alt="CampusConnect"
                                    className="w-9 h-9 rounded-xl object-contain transition-all group-hover:brightness-110"
                                    width={36}
                                    height={36}
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.4, 1] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                                    style={{ background: "var(--accent)" }}
                                />
                            </div>
                            <span
                                className="text-xl"
                                style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--text)" }}
                            >
                                Campus<span className="text-gradient">Connect</span>
                            </span>
                        </Link>

                        <p className="text-sm leading-relaxed max-w-xs mb-6" style={{ color: "var(--text-2)" }}>
                            The hyperlocal student marketplace. Find campus gigs, startup internships,
                            and AI-powered career guidance — any college, any city across India.
                        </p>

                        {/* Socials */}
                        <div className="flex items-center gap-3">
                            {SOCIALS.map(({ label, href, icon: Icon }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                    style={{
                                        background: "rgba(139,92,246,0.08)",
                                        border: "1px solid var(--border)",
                                        color: "var(--text-3)",
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"
                                        e.currentTarget.style.color = "var(--primary-light)"
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = "var(--border)"
                                        e.currentTarget.style.color = "var(--text-3)"
                                    }}
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    <div className="col-span-2 md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-10">
                        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
                            <FooterColumn key={title} title={title} links={links} />
                        ))}
                    </div>
                </div>

                {/* ── Bottom bar ─────────────────────────────────────── */}
                <div
                    className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
                    style={{ borderTop: "1px solid var(--border)" }}
                >
                    <p className="text-xs" style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                        © {new Date().getFullYear()} CampusConnect. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <span
                            className="text-xs px-3 py-1 rounded-full"
                            style={{
                                background: "rgba(16,185,129,0.08)",
                                border: "1px solid rgba(16,185,129,0.2)",
                                color: "var(--success)",
                                fontFamily: "var(--font-mono)",
                                fontSize: "10px",
                            }}
                        >
                            ● All systems operational
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-3)" }}>
                            Made with ♥ in India
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
