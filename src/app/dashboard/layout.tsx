"use client"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/Button"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart, Briefcase, CreditCard, Home, LogOut, Settings, User, GraduationCap, Info, Menu, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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

function SidebarLink({ href, icon: Icon, label, isActive }: { href: string, icon: React.ComponentType<{ size?: number }>, label: string, isActive: boolean }) {
    return (
        <Link href={href}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                <Icon size={20} />
                <span className="text-sm">{label}</span>
                {isActive && (
                    <motion.div
                        layoutId="activeTab"
                        className="ml-auto w-1 h-4 rounded-full bg-primary"
                    />
                )}
            </div>
        </Link>
    )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const isClient = pathname.startsWith('/dashboard/client')

    // Close sidebar on navigation
    useEffect(() => {
        setIsSidebarOpen(false)
    }, [pathname])

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
                w-64 bg-white border-r border-slate-200 fixed h-full z-[70] transition-transform duration-300
                md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 h-full flex flex-col">
                    <Link href="/" className="flex flex-col gap-2 mb-10 group">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-standout flex items-center justify-center shadow-lg shadow-standout/20 group-hover:scale-105 transition-transform">
                                <span className="font-black text-white text-xl">C</span>
                            </div>
                            <span className="font-heading brand-name text-2xl tracking-tighter">CampusConnect</span>
                        </div>
                        <span className="student-badge ml-1">Made by students for students</span>
                    </Link>

                    <nav className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                        <div>
                            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Student Hub</p>
                            <div className="space-y-1">
                                {studentItems.map((item) => (
                                    <SidebarLink key={item.href} {...item} isActive={pathname === item.href} />
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Client Hub</p>
                            <div className="space-y-1">
                                {clientItems.map((item) => (
                                    <SidebarLink key={item.href} {...item} isActive={pathname === item.href} />
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Founder Hub</p>
                            <div className="space-y-1">
                                {founderItems.map((item) => (
                                    <SidebarLink key={item.href} {...item} isActive={pathname === item.href} />
                                ))}
                            </div>
                        </div>

                        <div className="pb-10">
                            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">General</p>
                            <div className="space-y-1">
                                {generalItems.map((item) => (
                                    <SidebarLink key={item.href} {...item} isActive={pathname === item.href} />
                                ))}
                            </div>
                        </div>
                    </nav>

                    <div className="pt-6 border-t border-slate-100 mt-auto">
                        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl">
                            <LogOut size={20} className="mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 w-full">
                {/* Dashboard Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="font-black text-lg text-slate-900 tracking-tight">
                            {isClient ? "Client Dashboard" : "Student Dashboard"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-full bg-slate-200 border-2 border-white shadow-sm ring-1 ring-slate-100" />
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
