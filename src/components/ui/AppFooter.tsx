import Link from "next/link";
import { FC } from "react";

const AppFooter: FC = () => {
    return (
        <footer
            className="w-full py-8 mt-auto"
            style={{
                background: "var(--bg-subtle)",
                borderTop: "1px solid var(--border)",
            }}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Logo + copyright */}
                <div className="flex items-center gap-3">
                    <span
                        className="text-base"
                        style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--text)" }}
                    >
                        Campus<span className="text-gradient">Connect</span>
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-3)" }}>
                        © {new Date().getFullYear()} All rights reserved.
                    </span>
                </div>
                {/* Links */}
                <div className="flex items-center gap-6 text-xs" style={{ color: "var(--text-3)" }}>
                    <Link
                        href="/terms-and-conditions"
                        className="transition-colors"
                        style={{ fontFamily: "var(--font-mono)" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "var(--text)" }}
                        onMouseLeave={e => { e.currentTarget.style.color = "var(--text-3)" }}
                    >
                        Terms
                    </Link>
                    <Link
                        href="/privacy-policy"
                        className="transition-colors"
                        style={{ fontFamily: "var(--font-mono)" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "var(--text)" }}
                        onMouseLeave={e => { e.currentTarget.style.color = "var(--text-3)" }}
                    >
                        Privacy
                    </Link>
                    <Link
                        href="/trust"
                        className="transition-colors"
                        style={{ fontFamily: "var(--font-mono)" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "var(--text)" }}
                        onMouseLeave={e => { e.currentTarget.style.color = "var(--text-3)" }}
                    >
                        Trust & Safety
                    </Link>
                    <Link
                        href="/success-stories"
                        className="transition-colors"
                        style={{ fontFamily: "var(--font-mono)" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "var(--text)" }}
                        onMouseLeave={e => { e.currentTarget.style.color = "var(--text-3)" }}
                    >
                        Success Stories
                    </Link>
                    <Link
                        href="/contact-us"
                        className="transition-colors"
                        style={{ fontFamily: "var(--font-mono)" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "var(--text)" }}
                        onMouseLeave={e => { e.currentTarget.style.color = "var(--text-3)" }}
                    >
                        Support
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default AppFooter;
