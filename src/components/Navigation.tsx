"use client";

import Link from 'next/link';
import { Home, Users, Briefcase, MessageSquare, CreditCard, Bell, Search, Menu, LogOut, Settings, User, GraduationCap, Info } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';

export default function Navigation() {
    const { data: session, status } = useSession();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
                setIsNotifOpen(false);
                setIsMobileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navLinks = [
        { href: "/", icon: <Home size={20} />, label: "Home" },
        { href: "/post-gig", icon: <Briefcase size={20} className="text-amber-500" />, label: "Post Gig" },
        { href: "/get-gig", icon: <Briefcase size={20} className="text-electric" />, label: "Get Gig" },
        { href: "/internships", icon: <GraduationCap size={20} />, label: "Internships" },
        { href: "/payments", icon: <CreditCard size={20} />, label: "Payments" },
        { href: "/about", icon: <Info size={20} />, label: "About" },
    ];

    return (
        <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-gray-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-9 h-9 bg-standout rounded-xl flex items-center justify-center font-black text-white text-xl group-hover:scale-105 transition-transform shadow-xl shadow-standout/20">C</div>
                            <div className="flex flex-col -space-y-1">
                                <span className="text-xl font-heading brand-name tracking-tighter">CampusConnect</span>
                                <span className="student-badge text-slate-500">Made by students for students</span>
                            </div>
                        </Link>

                        <div className="hidden lg:block relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="bg-slate-800/50 border border-gray-700 text-gray-300 rounded-full pl-10 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-electric/50 text-sm w-64 transition-all focus:w-80"
                                placeholder="Search network..."
                            />
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <NavLink key={link.href} {...link} />
                        ))}
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); setIsMobileMenuOpen(false); }}
                                className="text-gray-400 hover:text-white transition-colors relative p-2 hover:bg-slate-800/50 rounded-full active:scale-95 duration-200"
                            >
                                <Bell size={20} />
                                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-midnight animate-pulse"></span>
                            </button>

                            <AnimatePresence>
                                {isNotifOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden glass-card z-50 origin-top-right"
                                    >
                                        <div className="p-3 border-b border-slate-700/50 font-bold text-white text-sm">Notifications</div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {[
                                                { text: "Sarah liked your post", time: "2m ago", read: false },
                                                { text: "New gig match: React Dev", time: "1h ago", read: false },
                                                { text: "Payment received: \u20B9450", time: "5h ago", read: true },
                                            ].map((n, i) => (
                                                <div key={i} className={`p-3 border-b border-slate-700/50 text-sm hover:bg-slate-800/50 cursor-pointer transition-colors ${!n.read ? 'bg-electric/5' : ''}`}>
                                                    <p className="text-gray-200">{n.text}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="w-full p-2 text-center text-xs text-electric hover:bg-slate-800/50 transition-colors">Mark all as read</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); setIsMobileMenuOpen(false); }}
                                className="h-9 w-9 rounded-full bg-linear-to-tr from-electric to-purple-500 p-[2px] active:scale-95 transition-transform"
                            >
                                <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white uppercase tabular-nums">
                                    {session?.user?.name?.substring(0, 2) || "JD"}
                                </div>
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden glass-card z-50 origin-top-right"
                                    >
                                        <div className="p-3 border-b border-slate-700/50">
                                            <p className="font-bold text-white text-sm truncate">{session?.user?.name || "John Doe"}</p>
                                            <p className="text-xs text-gray-400">{session?.user?.email || "student@university.edu"}</p>
                                        </div>
                                        <div className="p-1">
                                            <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-electric hover:bg-electric/10 rounded-lg transition-colors">
                                                <Briefcase size={16} /> Dashboard
                                            </Link>
                                            <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                                                <User size={16} /> Profile
                                            </Link>
                                            <Link href="/dashboard/student/settings" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors text-left">
                                                <Settings size={16} /> Settings
                                            </Link>
                                            <button
                                                onClick={() => signOut({ callbackUrl: '/' })}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                                            >
                                                <LogOut size={16} /> Sign Out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); setIsProfileOpen(false); setIsNotifOpen(false); }}
                            className="md:hidden text-gray-300 p-2 hover:bg-slate-800/50 rounded-full active:scale-95 transition-all"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-slate-900 border-b border-slate-800 overflow-hidden shadow-2xl"
                    >
                        <div className="px-4 py-6 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-4 px-4 py-4 rounded-xl text-gray-300 hover:text-white hover:bg-slate-800 transition-all font-medium border border-transparent hover:border-slate-700"
                                >
                                    <div className="p-2 bg-slate-800 rounded-lg">
                                        {link.icon}
                                    </div>
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-slate-800 mt-4">
                                <Link
                                    href="/auth/signup"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block w-full text-center bg-electric hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-electric/20 transition-all active:scale-[0.98]"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex flex-col items-center justify-center px-4 py-1 transition-all text-gray-400 hover:text-white hover:bg-white/5 rounded-lg active:scale-95"
        >
            {icon}
            <span className="text-[10px] font-medium mt-0.5">{label}</span>
        </Link>
    );
}
