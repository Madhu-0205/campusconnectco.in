'use client'
import {
  Home, Briefcase, Building2,
  MessageSquare, Users, Sparkles, LucideIcon
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface TabItem {
  label: string
  href: string
  icon: LucideIcon
  highlight?: boolean
}

export function MobileTabBar({ userRole }: { userRole: string | null }) {
  const pathname = usePathname()

  const getTabs = (): TabItem[] => {
    if (!userRole) return []

    const common: TabItem[] = [
      { label: 'Network', href: '/network',  icon: Users },
      { label: 'Msgs',    href: '/messages', icon: MessageSquare },
    ]

    const role = userRole.toUpperCase()

    if (role === 'STUDENT') {
      return [
        { label: 'Home',  href: '/dashboard/student',            icon: Home },
        { label: 'Gigs',  href: '/gigs/find',                    icon: Briefcase },
        ...common,
        { label: 'Match', href: '/dashboard/student/smartmatch', icon: Sparkles, highlight: true },
      ]
    }

    if (role === 'CLIENT' || role === 'STARTUP') {
      return [
        { label: 'Home',     href: '/dashboard',  icon: Home },
        { label: 'Talent',   href: '/gigs/find',  icon: Briefcase },
        { label: 'Messages', href: '/messages',   icon: MessageSquare },
        { label: 'Post Gig', href: '/post-gig',   icon: Building2, highlight: true },
      ]
    }

    return common
  }

  const tabs = getTabs()
  if (!tabs.length) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-safe"
      style={{
        background: 'rgba(8,8,15,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
          const activeColor = tab.highlight ? 'var(--gold)' : 'var(--primary-light)'
          const inactiveColor = 'var(--text-3)'

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 min-w-[56px] py-1 transition-all"
              style={{ color: isActive ? activeColor : inactiveColor }}
            >
              <div
                className="p-2 rounded-xl transition-all"
                style={{
                  background: isActive
                    ? tab.highlight
                      ? 'rgba(245,158,11,0.12)'
                      : 'rgba(124,58,237,0.14)'
                    : 'transparent',
                }}
              >
                <tab.icon className="w-5 h-5" />
              </div>
              <span
                className="uppercase"
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
