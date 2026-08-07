import Link from "next/link";
import { FC } from "react";

const AppFooter: FC = () => {
    return (
        <footer className="w-full py-8 mt-auto bg-background border-t border-border">
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Logo + copyright */}
                <div className="flex items-center gap-3">
                    <span className="text-base font-semibold tracking-tight text-foreground">
                        Campus<span className="text-muted-foreground">Connect</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} All rights reserved.
                    </span>
                </div>
                {/* Links */}
                <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground font-mono">
                    <Link
                        href="/terms-and-conditions"
                        className="transition-colors hover:text-foreground"
                    >
                        Terms
                    </Link>
                    <Link
                        href="/privacy-policy"
                        className="transition-colors hover:text-foreground"
                    >
                        Privacy
                    </Link>
                    <Link
                        href="/trust"
                        className="transition-colors hover:text-foreground"
                    >
                        Trust & Safety
                    </Link>
                    <Link
                        href="/success-stories"
                        className="transition-colors hover:text-foreground"
                    >
                        Success Stories
                    </Link>
                    <Link
                        href="/contact-us"
                        className="transition-colors hover:text-foreground"
                    >
                        Support
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default AppFooter;
