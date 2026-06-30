"use client"

import Link from "next/link"
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Home, Briefcase, GraduationCap, CreditCard, Info, Menu,
  LogOut, Settings, User, Search, X, ChevronRight, MessageSquare,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Users, Shield, FileText, Sparkles, Map, LayoutDashboard, Building2
} from "lucide-react"
import { useState, useEffect, useRef, memo } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "@/components/ThemeToggle"
import NotificationsPopover from "@/components/NotificationsPopover"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

/* ===============================
   SEARCH MODAL
================================ */
function CmdkSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      onClose()
      setQuery("")
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center pt-[20vh] px-4" style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg bg-[#131929] border border-[#7C3AED]/30 rounded-2xl shadow-[0_0_50px_rgba(124,58,237,0.15)] overflow-hidden"
      >
        <form onSubmit={handleSearch} className="flex items-center px-4 border-white/10">
          <Search size={20} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search gigs, skills, startups..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent px-4 py-5 text-white placeholder-slate-500 focus:outline-none"
          />
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
        </form>
        <div className="p-4">
          <p className="font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Links</p>
          <div className="space-y-1">
            {[
              { label: "Browse Gigs", href: "/gigs/find", icon: Briefcase },
              { label: "SmartMatch AI", href: "/dashboard/student/smartmatch", icon: Sparkles },
              { label: "My Network", href: "/network", icon: Users },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <link.icon size={16} className="text-slate-400" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function PendingDot() {
  const [dot, setDot] = useState(false)
  const supabase = createClient()
  
  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const res = await fetch("/api/application/pending-count")
      if (res.ok) {
        const { count } = await res.json()
        if (count > 0) setDot(true)
      }
    }
    check()
  }, [supabase])
  
  if (!dot) return null
  return <span className="absolute top-1 lg:top-0 right-1 lg:-right-1 w-2.5 h-2.5 rounded-full bg-[#F43F5E] animate-pulse border-[#0A0F1E]" />
}

/* ===============================
   NAVIGATION LINKS CONFIGURATION
================================ */
const getNavLinks = (role: string) => {
  const commonLinks = [
    { href: "/messages", icon: MessageSquare, label: "Messages" },
    { href: "/network", icon: Users, label: "Network" },
    { href: "/about", icon: Info, label: "About" },
  ]

  const studentLinks = [
    { href: "/dashboard/student", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/gigs/find", icon: Briefcase, label: "Find Gigs" },
    { href: "/internships", icon: GraduationCap, label: "Internships" },
    { href: "/dashboard/student/smartmatch", icon: Sparkles, label: "SmartMatch" },
  ]

  const clientLinks = [
    { href: "/dashboard", icon: Building2, label: "Dashboard", highlight: true },
    { href: "/post-gig", icon: Briefcase, label: "Post Gig" },
    { href: "/gigs/find", icon: Users, label: "Browse Talent" },
    { href: "/payments", icon: CreditCard, label: "Payments" },
  ]

  const founderLinks = [
    { href: "/dashboard/founder", icon: Shield, label: "Founder Hub" },
    { href: "/dashboard/founder/users", icon: Users, label: "Users" },
    { href: "/dashboard/founder/approvals", icon: Briefcase, label: "Approvals" },
    { href: "/dashboard/founder/reports", icon: Info, label: "Reports" },
  ]

  if (role === "FOUNDER") return founderLinks
  if (role === "CLIENT") return [...clientLinks, ...commonLinks]
  return [...studentLinks, ...commonLinks]
}

/* ===============================
   BREADCRUMB COMPONENT
================================ */
function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length === 0) return null

  return (
    <div className="hidden md:flex items-center gap-2 font-bold uppercase tracking-wider text-slate-500">
      <Link href="/" className="hover:text-white transition-colors">Home</Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`
        const label = segment.replace(/-/g, " ")
        const isLast = index === segments.length - 1

        return (
          <div key={href} className="flex items-center gap-2">
            <ChevronRight size={12} className="text-slate-600 shrink-0" />
            {isLast ? (
              <span className="text-[#A78BFA]">{label}</span>
            ) : (
              <Link href={href} className="hover:text-white transition-colors">{label}</Link>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ===============================
   MAIN NAVIGATION
================================ */
function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

  const navRef = useRef<HTMLDivElement>(null)

  /* ===============================
     HYDRATION & AUTH SETUP
  =============================== */
  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true)
    })
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)

      if (data.user) {
        const res = await fetch("/api/user/profile")
        if (res.ok) {
          const profile = await res.json()
          setUserRole(profile.role || "STUDENT")
        }
      }
      setAuthLoading(false)
    }

    loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === "SIGNED_IN") loadUser()
      if (event === "SIGNED_OUT") setUserRole(null)
    })

    return () => listener.subscription.unsubscribe()
  }, [supabase])

  /* ===============================
     EVENT LISTENERS
  =============================== */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false)
        setIsNotifOpen(false)
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsSearchModalOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      requestAnimationFrame(() => {
        setIsMobileMenuOpen(false)
      })
    }
  }, [pathname, isMobileMenuOpen])

  if (pathname === "/") return null
  if (!mounted) return null
  if (authLoading) return <NavSkeleton />

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const initials = user?.user_metadata?.name?.slice(0, 2).toUpperCase() ?? user?.email?.slice(0, 2).toUpperCase() ?? "JD"
  const navLinks = getNavLinks(userRole || "STUDENT")

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 bg-[#0A0F1E]/80 backdrop-blur-xl border-white/5"
        style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            
            {/* 1. Logo (Left) */}
            <Link href="/" className="shrink-0 flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#7C3AED] to-[#0EA5E9] flex justify-center items-center shadow-[0_0_20px_rgba(124,58,237,0.3)] group-hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all">
                <span className="font-black text-lg tracking-tighter mix-blend-overlay">CC</span>
              </div>
              <span className="hidden lg:block font-black text-white tracking-tight" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
                CampusConnect
              </span>
            </Link>

            {/* 2. Center Links */}
            <div className="hidden lg:flex flex-1 justify-center">
              {user && (
                <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1">
                  {navLinks.slice(0, 6).map((link) => {
                    const { href, icon: Icon, label } = link;
                    const highlight = (link as { highlight?: boolean }).highlight;
                    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))

                    let linkClass = "text-slate-400 hover:text-white hover:bg-white/5"
                    if (highlight && !isActive) linkClass = "text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20 hover:bg-[#F59E0B]/20"
                    if (highlight && isActive) linkClass = "text-[#F59E0B] bg-[#F59E0B]/20 border border-[#F59E0B]/40"
                    if (!highlight && isActive) linkClass = "bg-[#7C3AED] text-white shadow-lg"

                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${linkClass}`}
                      >
                        <Icon size={16} />
                        <span className="hidden xl:inline">{label}</span>
                        {highlight && <PendingDot />}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 3. Right Side */}
            <div className="flex items-center justify-end gap-3 min-w-[200px]">
              {/* Cmd+K Search Button */}
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="hidden md:flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 transition-all text-slate-400 hover:text-white"
              >
                <Search size={14} />
                <span className="text-xs font-bold">Search</span>
                <span className="font-mono px-1.5 py-0.5 rounded-md border border-white/10 bg-[#0A0F1E] text-slate-500">⌘K</span>
              </button>
              
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="md:hidden p-2 text-slate-400 hover:text-white"
              >
                <Search size={20} />
              </button>

              <ThemeToggle />

              {/* Auth state */}
              {user ? (
                <>
                  {userRole === "CLIENT" && (
                    <Link
                      href="/post-gig"
                      className="hidden sm:flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] rounded-full px-4 py-2 text-sm font-black shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
                    >
                      <Sparkles size={16} /> Hire Students
                    </Link>
                  )}

                  {/* Notifications */}
                  <NotificationsPopover
                    isOpen={isNotifOpen}
                    onOpenChange={(open) => { setIsNotifOpen(open); if (open) setIsProfileOpen(false); }}
                  />

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                      className="h-9 w-9 rounded-full bg-linear-to-br from-[#10B981] to-[#0EA5E9] font-black text-sm hover:scale-105 transition-transform flex items-center justify-center uppercase shadow-inner"
                    >
                      {initials}
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute right-0 mt-3 w-56 bg-[#131929] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden"
                        >
                          <div className="p-4 border-white/5 bg-white/3">
                            <p className="font-bold text-white truncate">
                              {user?.user_metadata?.name || user?.email}
                            </p>
                            <p className="text-[#A78BFA] font-bold tracking-widest uppercase mt-1">{(userRole || "STUDENT")}</p>
                          </div>

                          <div className="p-2 flex flex-col gap-1">
                            <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl flex items-center gap-3 transition-colors">
                              <User size={16} className="text-slate-500" /> Profile
                            </Link>

                            {(userRole === "CLIENT" || userRole === "FOUNDER") && (
                              <>
                                <div className="h-px bg-white/5 my-1" />
                                <Link href="/dashboard" onClick={() => setIsProfileOpen(false)} className="px-3 py-2 text-[#F59E0B] hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 rounded-xl flex items-center gap-3 transition-colors font-bold">
                                  <Building2 size={16} /> Dashboard
                                </Link>
                                <Link href="/post-gig" onClick={() => setIsProfileOpen(false)} className="px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl flex items-center gap-3 transition-colors font-bold">
                                  <Briefcase size={16} className="text-slate-400" /> Post a Gig
                                </Link>
                                <div className="h-px bg-white/5 my-1" />
                              </>
                            )}

                            <Link href={`/dashboard/${(userRole || "STUDENT").toLowerCase()}/settings`} onClick={() => setIsProfileOpen(false)} className="px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl flex items-center gap-3 transition-colors">
                              <Settings size={16} className="text-slate-500" /> Settings
                            </Link>

                            <div className="h-px bg-white/5 my-1" />
                            <button onClick={handleSignOut} className="w-full px-3 py-2 text-[#F43F5E] hover:bg-[#F43F5E]/10 rounded-xl flex items-center gap-3 transition-colors font-bold">
                              <LogOut size={16} /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-3">
                  <Link href="/auth/sign-in" className="font-bold text-slate-300 hover:text-white">
                    Log In
                  </Link>
                  <Link href="/auth/sign-up?role=client" className="hidden md:flex items-center px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] rounded-xl text-xs font-black transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    Hire Students
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-400 hover:text-white"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Breadcrumb Area within Navbar */}
          {user && (
            <div className="hidden lg:block pb-2 -mt-1">
              <Breadcrumb pathname={pathname} />
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-[#0A0F1E] border-white/5 overflow-hidden"
            >
              <div className="p-4 space-y-2 max-h-[70vh] overflow-y-auto">
                {!user && (
                  <div className="flex gap-2 mb-4">
                    <Link href="/auth/sign-in" className="flex-1 py-2 border border-white/10 rounded-xl font-bold text-white">Log In</Link>
                    <Link href="/auth/sign-up" className="flex-1 py-2 bg-[#7C3AED] rounded-xl font-bold text-white">Sign Up</Link>
                  </div>
                )}
                {navLinks.map((link) => {
                  const { href, icon: Icon, label } = link;
                  const highlight = (link as { highlight?: boolean }).highlight;
                  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))

                  let linkClass = "text-slate-400 hover:text-white hover:bg-white/5"
                  if (highlight) linkClass = "text-[#F59E0B]"
                  if (isActive && !highlight) linkClass = "bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-white"

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${linkClass}`}
                    >
                      <Icon size={20} className={isActive && !highlight ? "text-[#A78BFA]" : highlight ? "text-[#F59E0B]" : "text-slate-500"} />
                      <span className="font-bold">{label}</span>
                      {highlight && <PendingDot />}
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
         {isSearchModalOpen && <CmdkSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />}
      </AnimatePresence>
    </>
  )
}

function NavSkeleton() {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-[#0A0F1E] animate-pulse flex items-center px-6 gap-4 z-50 border-white/5">
      <div className="w-10 h-10 bg-white/10 rounded-xl" />
      <div className="h-4 w-32 bg-white/10 rounded-md" />
      <div className="flex-1" />
      <div className="h-8 w-24 bg-white/10 rounded-xl" />
      <div className="h-10 w-10 bg-white/10 rounded-full" />
    </div>
  )
}

const MemoizedNavigation = memo(Navigation)
export default MemoizedNavigation
