'use client'

/**
 * NavbarClient — auth-aware, hydration-safe navbar.
 *
 * Architecture: server component (Navbar.tsx) passes initial user data as
 * props from an SSR fetch. This client component then subscribes to
 * Supabase's onAuthStateChange so the UI reacts instantly to login/logout
 * without a full-page refresh.
 *
 * Hydration safety:
 * - No Math.random() or Date.now() during render.
 * - Auth UI is gated behind `mounted` state so SSR HTML (logged-out)
 *   matches the initial client render before JS hydrates.
 */

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Briefcase, Sparkles,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MessageSquare, Users, Bell, Search, ChevronDown, Building2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LogOut, Settings, UserCircle, Plus, GraduationCap,
  ArrowUp,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Shield, CreditCard, Info, Menu, X, LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'
import NotificationsPopover from '@/components/NotificationsPopover'
import { createClient } from '@/lib/supabase/client'
import { SignOutButton } from '@/components/SignOutButton'

interface NavbarClientProps {
  userRole: string | null
  userId: string | null
  userName: string | null
  userAvatar: string | null
  unreadMessages: number
  pendingApplications: number
}

interface NavLink {
  label: string
  href: string
  icon: LucideIcon
  badge?: 'messages' | 'applications'
  highlight?: boolean
}

const getNavLinks = (role: string | null): NavLink[] => {
  if (!role) return []

  const common: NavLink[] = [
    { label: 'Post a Gig', href: '/post-gig', icon: Plus, highlight: true },
    { label: 'Network', href: '/network', icon: Users },
    { label: 'Messages', href: '/messages', icon: MessageSquare, badge: 'messages' },
  ]

  if (role === 'STUDENT') {
    return [
      { label: 'Home', href: '/dashboard/student', icon: LayoutDashboard },
      { label: 'Find Gigs', href: '/gigs/find', icon: Briefcase },
      { label: 'Internships', href: '/dashboard/student/internships', icon: GraduationCap },
      { label: 'SmartMatch', href: '/dashboard/student/smartmatch', icon: Sparkles, highlight: true },
      ...common,
    ]
  }

  if (role === 'CLIENT' || role === 'STARTUP') {
    return [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Browse Talent', href: '/gigs/find', icon: Briefcase },
      ...common,
    ]
  }

  if (role === 'FOUNDER') {
    return [
      { label: 'Founder Hub', href: '/dashboard/founder', icon: Shield },
      ...common,
    ]
  }

  return common
}

export function NavbarClient({
  userRole: initialRole,
  userId: initialUserId,
  userName: initialUserName,
  userAvatar: initialAvatar,
  unreadMessages,
  pendingApplications,
}: NavbarClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // ── Hydration gate ──────────────────────────────────────────────────────
  // On the server, we always render the logged-OUT state to produce
  // a stable SSR HTML. After mount we sync to the real auth state.
  const [mounted, setMounted] = useState(false)

  // ── Live auth state — seeded from server props to avoid flash ─────────
  // Server component (Navbar.tsx) already fetched these safely server-side.
  // We use them as initial values so the first render is already correct.
  const [userId, setUserId] = useState<string | null>(initialUserId)
  const [userRole, setUserRole] = useState<string | null>(initialRole)
  const [userName, setUserName] = useState<string | null>(initialUserName)
  const [userAvatar, setUserAvatar] = useState<string | null>(initialAvatar)

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isScrolled = useScroll()

  // Close mobile menu on path changes safely (React 19 rules compliant)
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setIsMobileMenuOpen(false)
  }

  // ── Sync auth state from server props + Supabase listener ───────────────
  // Sync auth state. We deliberately do NOT query the User table here —
  // that triggers a Supabase RLS 403 from the client-side anon key.
  // Instead we read from auth.getUser() which is always permitted, and
  // fall back to the server-passed props that were already fetched safely.
  const syncUser = useCallback(async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      setUserId(null)
      setUserRole(null)
      setUserName(null)
      setUserAvatar(null)
      return
    }

    setUserId(user.id)
    // Use user_metadata populated by OAuth/auth provider — no DB round-trip needed
    const meta = user.user_metadata ?? {}
    setUserName(meta.full_name ?? meta.name ?? user.email?.split('@')[0] ?? null)
    setUserAvatar(meta.avatar_url ?? meta.picture ?? null)
    // Role comes from the server props (already correct) — don't overwrite unless we
    // can read it without 403. Keep existing userRole state from initial server props.
  }, [supabase])

  useEffect(() => {
    // 1. Mount flag — prevents auth UI flash on SSR
    // eslint-disable-next-line
    setMounted(true)

    // 2. Initial sync
    syncUser()

    // 3. Real-time listener — reacts to login/logout from any tab
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') syncUser()
      if (event === 'SIGNED_OUT') {
        setUserId(null)
        setUserRole(null)
        setUserName(null)
        setUserAvatar(null)
      }
      // Refresh server components (RSC) so Navbar.tsx re-fetches
      router.refresh()
    })

    return () => subscription.unsubscribe()
  }, [syncUser, supabase, router])

  const navLinks = getNavLinks(userRole)

  // ── Don't render nav on landing page ────────────────────────────────────
  if (pathname === '/') return null

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 h-16 border-b transition-all duration-300',
          isScrolled
            ? 'backdrop-blur-3xl border-white/10'
            : 'border-white/5'
        )}
        style={{
          background: isScrolled
            ? 'rgba(8,8,15,0.92)'
            : 'rgba(8,8,15,1)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative w-8 h-8">
              <Image src="/logo-v2.jpg" alt="CampusConnect" width={32} height={32} className="rounded-lg object-contain" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: 'var(--accent)' }} />
            </div>
            <span
              className="text-lg hidden sm:block"
              style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--text)" }}
            >
              Campus<span className="text-gradient">Connect</span>
            </span>
          </Link>

          {/* Desktop Nav Links — only shown when logged in */}
          <div className="hidden lg:flex items-center gap-1.5 flex-1 justify-center">
            {mounted && userId && navLinks.map(link => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
              const badgeCount = link.badge === 'messages' ? unreadMessages
                : link.badge === 'applications' ? pendingApplications : 0

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300',
                    link.highlight && !isActive && 'border',
                    link.highlight && isActive && 'border',
                    !link.highlight && !isActive && 'hover:bg-white/5',
                    !link.highlight && isActive && 'border',
                  )}
                  style={{
                    color: link.highlight
                      ? 'var(--gold)'
                      : isActive
                        ? 'var(--primary-light)'
                        : 'var(--text-2)',
                    background: link.highlight && isActive
                      ? 'rgba(245,158,11,0.12)'
                      : link.highlight && !isActive
                        ? 'rgba(245,158,11,0.05)'
                        : !link.highlight && isActive
                          ? 'rgba(124,58,237,0.12)'
                          : undefined,
                    borderColor: link.highlight && isActive
                      ? 'rgba(245,158,11,0.3)'
                      : link.highlight && !isActive
                        ? 'rgba(245,158,11,0.12)'
                        : !link.highlight && isActive
                          ? 'rgba(124,58,237,0.25)'
                          : undefined,
                  }}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {badgeCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[9px] font-black flex items-center justify-center px-1 border-2"
                      style={{ background: 'var(--primary)', borderColor: 'var(--bg)' }}
                    >
                      {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all">
              <Search className="w-4 h-4" />
            </button>

            <NotificationsPopover
              isOpen={isNotificationsOpen}
              onOpenChange={setIsNotificationsOpen}
            />

            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {(userRole === 'CLIENT' || userRole === 'STARTUP') && mounted && userId && (
              <Link
                href="/post-gig"
                className="hidden xl:flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                style={{
                  background: "var(--grad-brand)",
                  boxShadow: "var(--shadow-glow-primary)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-btn-hover)" }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-glow-primary)" }}
              >
                <Plus className="w-3.5 h-3.5" />
                Post Gig
              </Link>
            )}

            {/* ── Auth UI — gated behind `mounted` to prevent hydration mismatch ── */}
            {!mounted ? (
              // Skeleton placeholder — same dimensions as auth buttons to avoid layout shift
              <div className="w-24 h-9 rounded-2xl bg-white/5 animate-pulse" />
            ) : userId ? (
              // ── LOGGED IN ──────────────────────────────────────────────
              <div className="relative group">
                <button className="flex items-center gap-3 p-1 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                  <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center border" style={{ background: 'rgba(124,58,237,0.15)', borderColor: 'var(--border)' }}>
                    {userAvatar ? (
                      <Image src={userAvatar} alt="Avatar" width={36} height={36} className="w-full h-full object-cover" referrerPolicy="no-referrer" unoptimized />
                    ) : (
                      <span className="font-black text-sm" style={{ color: "var(--primary-light)" }}>
                        {userName?.charAt(0)?.toUpperCase() ?? 'U'}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors pr-2" />
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-3 w-64 bg-[#111116] border border-white/10 rounded-3xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-2xl overflow-hidden ring-1 ring-white/5">
                  <div className="px-5 py-4 border-b mb-2" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-sm font-black truncate" style={{ color: 'var(--text)' }}>{userName ?? 'Authenticated User'}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest mt-0.5" style={{ color: "var(--primary-light)" }}>{userRole}</p>
                  </div>

                  <DropdownItem href={userRole === 'STUDENT' ? '/dashboard/student/profile' : '/dashboard'} icon={UserCircle} label="Account Profile" />
                  <DropdownItem href={userRole === 'STUDENT' ? '/dashboard/student/settings' : (userRole === 'FOUNDER' ? '/dashboard/founder/settings' : '/dashboard')} icon={Settings} label="Settings" />

                  {userRole === 'STUDENT' && (
                    <>
                      <DropdownItem href="/dashboard/student/resume-analyzer" icon={Sparkles} label="Resume Analyzer" amber />
                      <DropdownItem href="/dashboard/student/career-copilot" icon={Sparkles} label="Career Copilot" amber />
                    </>
                  )}

                  {(userRole === 'CLIENT' || userRole === 'STARTUP') && (
                    <DropdownItem href="/dashboard" icon={Building2} label="Dashboard" amber />
                  )}

                  <div className="mt-3 pt-3 border-white/5 px-2">
                    <div className="flex items-center justify-center">
                      <SignOutButton />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // ── LOGGED OUT ─────────────────────────────────────────────
              <div className="flex items-center gap-3">
                <Link href="/auth/sign-in" className="text-[11px] font-black uppercase tracking-widest pr-2 transition-colors" style={{ color: 'var(--text-2)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)' }}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all"
                  style={{
                    background: "var(--grad-brand)",
                    boxShadow: "var(--shadow-glow-primary)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-btn-hover)" }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-glow-primary)" }}
                >
                  Join Free →
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden border-t"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
            >
              <div className="p-4 space-y-1 max-h-[70vh] overflow-y-auto">
                {/* Auth links for logged-out mobile */}
                {mounted && !userId && (
                  <div className="flex gap-2 mb-4">
                    <Link
                      href="/auth/sign-in"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 py-3 rounded-xl text-sm font-bold transition-colors"
                      style={{ border: '1px solid var(--border)', color: 'var(--text)' }}
                    >
                      Log In
                    </Link>
                    <Link
                      href="/auth/sign-up"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 py-3 rounded-xl font-bold text-white"
                      style={{ background: 'var(--grad-brand)' }}
                    >
                      Join Free
                    </Link>
                  </div>
                )}
                {mounted && navLinks.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold"
                      style={{
                        color: link.highlight ? 'var(--gold)' : isActive ? 'var(--text)' : 'var(--text-2)',
                        background: isActive && !link.highlight ? 'rgba(124,58,237,0.12)' : undefined,
                        border: isActive && !link.highlight ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
                      }}
                    >
                      <link.icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}

/* ── Scroll-to-top button ──────────────────────────────────────────── */
function ScrollToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full glass border text-sm font-medium transition-all hover:scale-105 active:scale-95"
          style={{
            color: 'var(--text-2)',
            borderColor: 'var(--border)',
            background: 'rgba(17,17,39,0.85)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
        >
          <ArrowUp className="w-4 h-4" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>Top</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

function DropdownItem({ href, icon: Icon, label, amber }: { href: string; icon: LucideIcon; label: string; amber?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-all',
      )}
      style={{ color: amber ? 'var(--gold)' : 'var(--text-2)' }}
      onMouseEnter={e => {
        e.currentTarget.style.background = amber ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.04)'
        e.currentTarget.style.color = amber ? 'var(--gold)' : 'var(--text)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = ''
        e.currentTarget.style.color = amber ? 'var(--gold)' : 'var(--text-2)'
      }}
    >
      <Icon size={16} />
      {label}
    </Link>
  )
}

function useScroll() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  return scrolled
}
