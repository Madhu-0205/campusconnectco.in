"use client";

import Link from "next/link";
import {
    Home,
    Briefcase,
    GraduationCap,
    CreditCard,
    Info,
    Bell,
    Menu,
    LogOut,
    Settings,
    User,
    Search,
} from "lucide-react";
import { useState, useEffect, useRef, memo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/* ===============================
   MAIN NAVIGATION
================================ */
function Navigation() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navRef = useRef<HTMLDivElement>(null);

    /* ===============================
       HYDRATION SAFETY
    =============================== */
    useEffect(() => {
        setMounted(true);
    }, []);

    /* ===============================
       AUTH HANDLING
    =============================== */
    useEffect(() => {
        const loadUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
            setAuthLoading(false);
        };

        loadUser();

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => listener.subscription.unsubscribe();
    }, [supabase]);

    /* ===============================
       CLICK OUTSIDE
    =============================== */
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (navRef.current && !navRef.current.contains(e.target as Node)) {
                setIsProfileOpen(false);
                setIsNotifOpen(false);
                setIsMobileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ===============================
       EARLY RETURNS (SAFE)
    =============================== */
    if (!mounted) return null;
    if (authLoading) return <NavSkeleton />;

    /* ===============================
       HELPERS
    =============================== */
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    const initials =
        user?.user_metadata?.name?.slice(0, 2).toUpperCase() ??
        user?.email?.slice(0, 2).toUpperCase() ??
        "JD";

    const navLinks = [
        { href: "/", icon: Home, label: "Home" },
        { href: "/post-gig", icon: Briefcase, label: "Post Gig" },
        { href: "/get-gig", icon: Briefcase, label: "Get Gig" },
        { href: "/internships", icon: GraduationCap, label: "Internships" },
        { href: "/payments", icon: CreditCard, label: "Payments" },
        { href: "/about", icon: Info, label: "About" },
    ];

    /* ===============================
       RENDER
    =============================== */
    return (
        <nav
            ref={navRef}
            className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-gray-800/50"
        >
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* LEFT */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="font-black text-xl">CampusConnect</Link>

                    <div className="hidden lg:flex relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            placeholder="Search..."
                            className="bg-slate-800/50 border border-gray-700 rounded-full pl-9 pr-4 py-1.5 text-sm text-gray-300"
                        />
                    </div>
                </div>

                {/* CENTER */}
                <div className="hidden md:flex gap-2">
                    {navLinks.map(({ href, icon: Icon, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center px-3 py-1 rounded-lg transition-colors ${pathname === href ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Icon size={18} />
                            <span className="text-[10px]">{label}</span>
                        </Link>
                    ))}
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <button
                        onClick={() => {
                            setIsNotifOpen(!isNotifOpen);
                            setIsProfileOpen(false);
                        }}
                        className="relative p-2 rounded-full hover:bg-slate-800/50"
                    >
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                    </button>

                    {/* Profile */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setIsProfileOpen(!isProfileOpen);
                                setIsNotifOpen(false);
                            }}
                            className="h-9 w-9 rounded-full bg-electric text-white font-bold"
                        >
                            {initials}
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    className="absolute right-0 mt-2 w-48 bg-slate-900 rounded-xl shadow-xl border border-slate-700"
                                >
                                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-800 flex items-center gap-2">
                                        <User size={16} /> Profile
                                    </Link>
                                    <Link href="/dashboard/student/settings" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-800 flex items-center gap-2">
                                        <Settings size={16} /> Settings
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 flex items-center gap-2"
                                    >
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Mobile */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-full hover:bg-slate-800/50"
                    >
                        <Menu size={22} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-slate-900 border-b border-gray-800"
                    >
                        <div className="p-4 space-y-2">
                            {navLinks.map(({ href, icon: Icon, label }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-slate-800 rounded-xl"
                                >
                                    <Icon size={20} />
                                    <span>{label}</span>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

/* ===============================
   SKELETON
================================ */
function NavSkeleton() {
    return (
        <div className="fixed top-0 left-0 right-0 h-16 bg-slate-900 animate-pulse flex items-center px-6 gap-4 z-50">
            <div className="h-8 w-32 bg-slate-700 rounded-lg" />
            <div className="flex-1" />
            <div className="h-8 w-8 bg-slate-700 rounded-full" />
        </div>
    );
}

const MemoizedNavigation = memo(Navigation);
export default MemoizedNavigation;
