"use client"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/Button"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart, Briefcase, CreditCard, Home, LogOut, Settings, User, GraduationCap, Info, Menu, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import NotificationsPopover from "@/components/NotificationsPopover"

const studentItems = [
    { icon: Home, label: "Student Overview", href: "/dashboard/student" },
    { icon: GraduationCap, label: "Internships", href: "/dashboard/student/internships" },
    { icon: Briefcase, label: "Browse Gigs", href: "/dashboard/student/gigs" },
    { icon: BarChart, label: "My Applications", href: "/dashboard/student/applications" },
    { icon: User, label: "Wall of Fame", href: "/dashboard/student/profile" },
    { icon: CreditCard, label: "Personal Wallet", href: "/dashboard/student/wallet" },
]

const clientItems = [
    { icon: Home, label: "Client Overview", href: "/dashboard/client" },
    { icon: Briefcase, label: "Post a Gig", href: "/dashboard/client/post-gig" },
    { icon: User, label: "Applicants Hub", href: "/dashboard/client/applicants" },
    { icon: CreditCard, label: "Billing & Plans", href: "/dashboard/client/billing" },
]

const founderItems = [
    { icon: Home, label: "Founder Overview", href: "/dashboard/founder" },
    { icon: BarChart, label: "Platform Revenue", href: "/dashboard/founder/revenue" },
    { icon: ShieldCheck, label: "Escrow Logic", href: "/dashboard/founder/escrow" },
]

const generalItems = [
    { icon: Info, label: "Our Story", href: "/about" },
    { icon: Settings, label: "Settings", href: "/dashboard/student/settings" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isSigningOut, setIsSigningOut] = useState(false)

    // Determine role based on path
    const isStudentRole = pathname?.startsWith("/dashboard/student")
    const isClientRole = pathname?.startsWith("/dashboard/client")
    const isFounder = pathname?.startsWith("/dashboard/founder")

    // Dynamic Header Title
    const getHeaderTitle = () => {
        if (pathname === "/dashboard/student") return "Student Overview"
        if (pathname?.includes("/internships")) return "Internships"
        if (pathname?.includes("/gigs")) return "Browse Gigs"
        if (pathname?.includes("/applications")) return "My Applications"
        if (pathname?.includes("/profile")) return "Wall of Fame"
        if (pathname?.includes("/wallet")) return "Personal Wallet"

        if (pathname === "/dashboard/client") return "Client Overview"
        if (pathname?.includes("/post-gig")) return "Post a Gig"
        if (pathname?.includes("/applicants")) return "Applicants Hub"
        if (pathname?.includes("/billing")) return "Billing & Plans"

        if (pathname === "/dashboard/founder") return "Founder Overview"
        if (pathname?.includes("/revenue")) return "Platform Revenue"
        if (pathname?.includes("/escrow")) return "Escrow Logic"

        if (pathname?.includes("/settings")) return "Settings"
        if (pathname?.includes("/about")) return "Our Story"

        return "Dashboard"
    }

    const headerTitle = getHeaderTitle()

    const handleSignOut = async () => {
        setIsSigningOut(true)
        try {
            const supabase = createClient()
            await supabase.auth.signOut()
            toast.success("Signed out successfully")
            router.push("/auth/sign-in")
        } catch (error) {
            toast.error("Failed to sign out")
        } finally {
            setIsSigningOut(false)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden transition-colors duration-300">
            {/* Ambient Background - Similar to Home/PostGig */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
                w-64 fixed top-16 h-[calc(100vh-4rem)] z-40 transition-all duration-300
                md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800
                shadow-[4px_0_24px_rgba(0,0,0,0.02)]
            `}>
                <div className="p-6 h-full flex flex-col">
                    <nav className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                        {isStudentRole && (
                            <div className="space-y-2">
                                <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 opacity-70">Student Hub</p>
                                <div className="space-y-1">
                                    {studentItems.map((item) => (
                                        <SidebarLink key={item.href} {...item} isActive={pathname === item.href} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {isClientRole && (
                            <div className="space-y-2">
                                <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 opacity-70">Client Hub</p>
                                <div className="space-y-1">
                                    {clientItems.map((item) => (
                                        <SidebarLink key={item.href} {...item} isActive={pathname === item.href} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {isFounder && (
                            <div className="space-y-2">
                                <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 opacity-70">Founder Hub</p>
                                <div className="space-y-1">
                                    {founderItems.map((item) => (
                                        <SidebarLink key={item.href} {...item} isActive={pathname === item.href} />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pb-10 space-y-2">
                            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 opacity-70">General</p>
                            <div className="space-y-1">
                                {generalItems.map((item) => (
                                    <SidebarLink key={item.href} {...item} isActive={pathname === item.href} />
                                ))}
                            </div>
                        </div>
                    </nav>

                    <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-auto">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium"
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                        >
                            <LogOut size={18} className="mr-3" />
                            {isSigningOut ? "Signing Out..." : "Sign Out"}
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 w-full relative z-10 transition-all duration-300">
                {/* Dashboard Header - Glassmorphic */}
                <header className="h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg md:hidden transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="font-black text-sm md:text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-electric"></span>
                            </span>
                            {headerTitle}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
                        <NotificationsPopover />
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)]">
                    {children}
                </div>
            </main>
        </div>
    )
}

import { LucideIcon } from "lucide-react"

function SidebarLink({ href, icon: Icon, label, isActive }: { href: string, icon: LucideIcon, label: string, isActive: boolean }) {
    return (
        <Link href={href}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                ? 'bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}>
                <Icon size={18} className={isActive ? "text-blue-600 dark:text-blue-400" : ""} />
                <span className="text-xs md:text-sm tracking-wide">{label}</span>
                {isActive && (
                    <motion.div
                        layoutId="activeTab"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.5)]"
                    />
                )}
            </div>
        </Link>
    )
}
