"use client"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart, Briefcase, Home, LogOut, Settings, User, GraduationCap, Info, Menu, MessageCircle, Users, FileText, Zap, ShieldAlert, Brain, Bell, Sparkles, Bookmark } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import PostGigModal from "@/components/gigs/PostGigModal"
import NotificationsPopover from "@/components/NotificationsPopover"
import { Button } from "@/components/ui/Button"
import { CopilotChat } from "@/components/v2/copilot/CopilotChat"
import { CopilotProvider } from "@/components/v2/copilot/CopilotProvider"
import { createClient } from "@/lib/supabase/client"

const studentItems = [
    { icon: Home, label: "Overview", href: "/dashboard/student" },
    { icon: Briefcase, label: "Gigs", href: "/dashboard/student/gigs" },
    { icon: GraduationCap, label: "Internships", href: "/dashboard/student/internships" },
    { icon: BarChart, label: "Applications", href: "/dashboard/student/applications" },
    { icon: Sparkles, label: "SmartMatch", href: "/dashboard/student/smartmatch" },
    { icon: Bookmark, label: "Saved", href: "/dashboard/student/saved" },
    { icon: Brain, label: "Resume Intelligence", href: "/dashboard/student/resume" },
    { icon: User, label: "Profile", href: "/dashboard/student/profile" },
]

const clientItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Briefcase, label: "Browse Talent", href: "/gigs/find" },
    { icon: Home, label: "Post a Gig", href: "/post-gig" },
]

const founderItems = [
    { icon: Zap, label: "Dashboard", href: "/dashboard/founder" },
    { icon: Users, label: "Users", href: "/dashboard/founder/users" },
    { icon: Briefcase, label: "Gigs", href: "/dashboard/founder/gigs" },
    { icon: GraduationCap, label: "Internships", href: "/dashboard/founder/internships" },
    { icon: FileText, label: "Applications", href: "/dashboard/founder/applications" },
    { icon: ShieldAlert, label: "Approvals", href: "/dashboard/founder/approvals" },
    { icon: BarChart, label: "Reports", href: "/dashboard/founder/reports" },
    { icon: BarChart, label: "Analytics", href: "/dashboard/founder/analytics" },
    { icon: ShieldAlert, label: "Moderation", href: "/dashboard/founder/moderation" },
    { icon: Brain, label: "AI Insights", href: "/dashboard/founder/ai-insights" },
    { icon: Bell, label: "Notifications", href: "/dashboard/founder/notifications" },
    { icon: Settings, label: "System Settings", href: "/dashboard/founder/settings" },
]

const collegeItems = [
    { icon: Home, label: "Overview", href: "/dashboard/college" },
    { icon: Users, label: "Students", href: "/dashboard/college/students" },
    { icon: BarChart, label: "Analytics", href: "/dashboard/college/analytics" },
    { icon: Settings, label: "Settings", href: "/dashboard/college/settings" },
]


interface ClientLayoutProps {
    children: React.ReactNode;
    initialRole: string;
    isPreviewMode: boolean;
}

export default function ClientLayout({ children, initialRole, isPreviewMode }: ClientLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isSigningOut, setIsSigningOut] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

    // Role is now passed from server (Requirement 8)
    const role = initialRole;

    const isStudentPath = pathname?.startsWith("/dashboard/student")
    const isFounderPath = pathname?.startsWith("/dashboard/founder")
    const isClientPath = pathname?.startsWith("/dashboard") && !isStudentPath && !isFounderPath
    
    const getHeaderTitle = () => {
        if (pathname === "/dashboard/student") return "Student Overview"
        if (pathname === "/dashboard") return "Dashboard"
        if (pathname?.includes("/internships")) return pathname.includes("/founder") ? "Internship Management" : "Internships"
        if (pathname?.includes("/applicants")) return "Applicants"
        if (pathname?.includes("/post-gig")) return "Post a new Gig"
        if (pathname?.includes("/gigs")) return pathname.includes("/founder") ? "Gig Operations" : "Browse Gigs"
        if (pathname?.includes("/applications")) return pathname.includes("/founder") ? "Platform Applications" : "My Applications"
        if (pathname?.includes("/profile")) return "Wall of Fame"
        if (pathname === "/dashboard/founder") return "Control Room"
        if (pathname?.includes("/analytics")) return "Platform Analytics"
        if (pathname?.includes("/users")) return "User Manager"
        if (pathname?.includes("/moderation")) return "Moderation Queue"
        if (pathname?.includes("/ai-insights")) return "AI Insights"
        if (pathname?.includes("/resume")) return "Resume Intelligence"
        if (pathname?.includes("/approvals")) return "Pending Approvals"
        if (pathname?.includes("/saved")) return "Saved Opportunities"
        if (pathname?.includes("/reports")) return "Platform Reports"
        if (pathname?.includes("/notifications")) return "System Notifications"
        if (pathname?.includes("/settings")) return "Platform Settings"
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
        } catch {
            toast.error("Failed to sign out")
        } finally {
            setIsSigningOut(false)
        }
    }

    const enterPreview = async () => {
        await fetch('/api/founder/preview', { method: 'POST', body: JSON.stringify({ enable: true }) });
        router.refresh(); // Important to refresh server components
        router.push('/dashboard/student');
    }

    const exitPreview = async () => {
        await fetch('/api/founder/preview', { method: 'POST', body: JSON.stringify({ enable: false }) });
        router.refresh();
        router.push('/dashboard/founder');
    }

    return (
        <CopilotProvider>
            <div className="min-h-screen flex bg-background text-foreground relative overflow-hidden transition-colors duration-300">
            {/* 10. FOUNDER PREVIEW MODE LABEL (Requirement 10) */}
            {isPreviewMode && (
                <div className="bg-amber-400 px-4 py-2 text-center font-bold flex justify-between items-center shadow-md relative z-50">
                    <span className="flex items-center gap-2">
                        <Users size={16} />
                        PREVIEW MODE: You are viewing the platform as a student. Actions are restricted.
                    </span>
                    <Button size="sm" variant="secondary" onClick={exitPreview} className="bg-black text-white hover:bg-slate-800 border-none h-8">
                        Exit Preview
                    </Button>
                </div>
            )}

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
            <aside className={`w-64 fixed top-16 h-[calc(100vh-4rem)] z-40 transition-all duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-[#0a0a0f]/80 backdrop-blur-xl border-white/5 shadow-[4px_0_24px_rgba(0,0,0,0.2)]`}>
                <div className="p-6 h-full flex flex-col">
                    <nav className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                        {isStudentPath && (
                            <div className="space-y-2">
                                <p className="px-4 font-black text-slate-400 uppercase tracking-widest mb-2 opacity-70">Student Hub</p>
                                <div className="space-y-1">
                                    {studentItems.map((item) => (
                                        <SidebarLink key={item.href} {...item} isActive={pathname === item.href} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {isClientPath && (
                            <div className="space-y-2">
                                <p className="px-4 font-black text-slate-400 uppercase tracking-widest mb-2 opacity-70">Client Hub</p>
                                <div className="space-y-1">
                                    {clientItems.map((item) => (
                                        <SidebarLink key={item.href} {...item} isActive={pathname === item.href} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {isFounderPath && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <p className="px-4 font-black text-slate-400 uppercase tracking-widest mb-2 opacity-70">Founder Hub</p>
                                    <div className="space-y-1">
                                        {founderItems.map((item) => (
                                            <SidebarLink key={item.href} {...item} isActive={pathname === item.href} />
                                        ))}
                                    </div>
                                </div>
                                <div className="px-2">
                                    <Button
                                        onClick={enterPreview}
                                        variant="outline"
                                        className="w-full justify-start border-amber-500/50 text-amber-500 hover:bg-amber-500/10 gap-2 h-9"
                                    >
                                        <Users size={14} />
                                        View as Student
                                    </Button>
                                </div>
                            </div>
                        )}

                        {!isFounderPath && !isStudentPath && !isClientPath && (
                            <div className="space-y-2">
                                <p className="px-4 font-black text-slate-400 uppercase tracking-widest mb-2 opacity-70">Menu</p>
                                <SidebarLink icon={Home} label="Back to Dash" href={role === 'FOUNDER' ? '/dashboard/founder' : role === 'CLIENT' ? '/dashboard' : '/dashboard/student'} isActive={false} />
                            </div>
                        )}

                        <div className="pb-10 space-y-2">
                            <p className="px-4 font-black text-slate-400 uppercase tracking-widest mb-2 opacity-70">General</p>
                            <div className="space-y-1">
                                <SidebarLink icon={Info} label="Our Story" href="/about" isActive={pathname === '/about'} />
                                <SidebarLink
                                    icon={Settings}
                                    label="Settings"
                                    href={role === 'FOUNDER' ? '/dashboard/founder/settings' : role === 'CLIENT' ? '/dashboard/student/settings' : '/dashboard/student/settings'}
                                    isActive={pathname?.includes('/settings')}
                                />
                            </div>
                        </div>
                    </nav>

                    <div className="pt-6 border-white/10 mt-auto">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl font-medium"
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
                <header className="h-16 bg-[#0a0a0f]/70 backdrop-blur-xl border-white/5 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-slate-500 hover:bg-white/5 rounded-lg md:hidden transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="font-black md:text-base text-white tracking-tight flex items-center gap-3">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-(--primary) opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-(--primary)"></span>
                            </span>
                            {headerTitle}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div suppressHydrationWarning className="hidden sm:block font-black tracking-widest text-slate-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="h-6 w-px bg-white/5 mx-1" />
                        <PostGigModal />
                        <button
                            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', metaKey: true }))}
                            className="relative p-2.5 rounded-full text-slate-500 hover:bg-white/5 transition-all duration-300 hidden md:block"
                            title="Open Career Copilot (⌘ + J)"
                        >
                            <Sparkles size={20} />
                        </button>
                        <Link href="/dashboard/student/messages" className="relative p-2.5 rounded-full text-slate-500 hover:bg-white/5 transition-all duration-300">
                            <MessageCircle size={20} />
                        </Link>
                        <NotificationsPopover
                            isOpen={isNotificationsOpen}
                            onOpenChange={setIsNotificationsOpen}
                        />
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)]">
                    {children}
                </div>
            </main>
            
            <CopilotChat />
        </div>
        </CopilotProvider>
    )
}

 
function SidebarLink({ href, icon: Icon, label, isActive }: { href: string, icon: any, label: string, isActive: boolean }) {
    return (
        <Link href={href}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-500/10 text-blue-400 font-bold shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium' }`}>
                <Icon size={18} className={isActive ? "text-blue-400" : ""} />
                <span className="text-xs md:text-sm tracking-wide">{label}</span>
                {isActive && (
                    <motion.div
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]"
                    />
                )}
            </div>
        </Link>
    )
}
