'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Briefcase, Sparkles,
  MessageSquare, Users, Bell, Search, ChevronDown, Building2,
  LogOut, Settings, UserCircle, Plus, GraduationCap,
  ArrowUp, Trophy, Gift, Target,
  Shield, CreditCard, Info, Menu, X, LucideIcon
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'

import NotificationsPopover from '@/components/NotificationsPopover'
import { SignOutButton } from '@/components/SignOutButton'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { pressScale, springSnappy } from '@/lib/motion'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

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
      { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
      { label: 'Refer & Earn', href: '/refer', icon: Gift },
      ...common,
    ]
  }

  if (role === 'CLIENT' || role === 'STARTUP') {
    return [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Talent Search', href: '/employer/talent-search', icon: Search },
      { label: 'Campus Drives', href: '/employer/drives', icon: Target },
      { label: 'Company Profile', href: '/employer/profile', icon: Building2 },
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

  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState<string | null>(initialUserId)
  const [userRole, setUserRole] = useState<string | null>(initialRole)
  const [userName, setUserName] = useState<string | null>(initialUserName)
  const [userAvatar, setUserAvatar] = useState<string | null>(initialAvatar)

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isScrolled = useScroll()

  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setIsMobileMenuOpen(false)
  }

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
    const meta = user.user_metadata ?? {}
    setUserName(meta.full_name ?? meta.name ?? user.email?.split('@')[0] ?? null)
    setUserAvatar(meta.avatar_url ?? meta.picture ?? null)
  }, [supabase])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    syncUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') syncUser()
      if (event === 'SIGNED_OUT') {
        setUserId(null)
        setUserRole(null)
        setUserName(null)
        setUserAvatar(null)
      }
      router.refresh()
    })

    return () => subscription.unsubscribe()
  }, [syncUser, supabase, router])

  const navLinks = getNavLinks(userRole)

  if (pathname === '/') return null

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 h-14 border-b transition-colors duration-300',
          isScrolled
            ? 'bg-background/80 backdrop-blur-md border-border'
            : 'bg-transparent border-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center text-background font-bold text-xs">
              CC
            </div>
            <span className="text-sm font-semibold hidden sm:block tracking-tight text-foreground">
              CampusConnect
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {mounted && userId && navLinks.map(link => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
              const badgeCount = link.badge === 'messages' ? unreadMessages
                : link.badge === 'applications' ? pendingApplications : 0

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                    isActive ? 'text-foreground bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                    link.highlight && 'text-primary'
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {badgeCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                      {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
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
              <Button asChild size="sm" className="hidden xl:flex">
                <Link href="/post-gig">
                  <Plus className="w-4 h-4 mr-1" />
                  Post Gig
                </Link>
              </Button>
            )}

            {!mounted ? (
              <div className="w-8 h-8 rounded-full bg-accent animate-pulse" />
            ) : userId ? (
              <div className="relative group">
                <button className="flex items-center justify-center w-8 h-8 rounded-full bg-accent border border-border overflow-hidden hover:border-foreground/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {userAvatar ? (
                    <Image src={userAvatar} alt="Avatar" width={32} height={32} className="w-full h-full object-cover" unoptimized />
                  ) : (
                    <span className="font-semibold text-xs text-foreground">
                      {userName?.charAt(0)?.toUpperCase() ?? 'U'}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-card">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-sm font-medium truncate text-foreground">{userName ?? 'Authenticated User'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">{userRole?.toLowerCase()}</p>
                  </div>

                  <DropdownItem href={userRole === 'STUDENT' ? '/dashboard/student/profile' : '/dashboard'} icon={UserCircle} label="Account Profile" />
                  <DropdownItem href={userRole === 'STUDENT' ? '/dashboard/student/settings' : (userRole === 'FOUNDER' ? '/dashboard/founder/settings' : '/dashboard')} icon={Settings} label="Settings" />

                  {userRole === 'STUDENT' && (
                    <>
                      <DropdownItem href="/dashboard/student/resume-analyzer" icon={Sparkles} label="Resume Analyzer" />
                      <DropdownItem href="/dashboard/student/career-copilot" icon={Sparkles} label="Career Copilot" />
                    </>
                  )}

                  {(userRole === 'CLIENT' || userRole === 'STARTUP') && (
                    <DropdownItem href="/dashboard" icon={Building2} label="Dashboard" />
                  )}

                  <div className="mt-1 pt-1 border-t border-border px-1">
                    <div className="flex items-center justify-center w-full">
                      <SignOutButton />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/sign-up">Join Free</Link>
                </Button>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
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
              className="lg:hidden overflow-hidden border-t border-border bg-background"
            >
              <div className="p-4 space-y-1 max-h-[70vh] overflow-y-auto">
                {mounted && !userId && (
                  <div className="flex gap-2 mb-4">
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href="/auth/sign-in" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
                    </Button>
                    <Button className="flex-1" asChild>
                      <Link href="/auth/sign-up" onClick={() => setIsMobileMenuOpen(false)}>Join Free</Link>
                    </Button>
                  </div>
                )}
                {mounted && navLinks.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                        isActive ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
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
      <ScrollToTop />
    </>
  )
}

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
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={springSnappy}
          whileTap={{ scale: pressScale }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-surface border border-border text-foreground shadow-card hover:bg-accent transition-colors"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

function DropdownItem({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md mx-1 transition-colors"
    >
      <Icon className="w-4 h-4" />
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
