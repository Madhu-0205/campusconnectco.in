'use client'
import {
  Home, Briefcase, Building2,
  MessageSquare, Users, Sparkles, LucideIcon
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

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
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-safe bg-background/90 backdrop-blur-md border-t border-border/50"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-1 min-w-14 py-1 transition-all",
                isActive ? "text-foreground" : "text-muted-foreground",
                tab.highlight && isActive && "text-foreground"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-xl transition-all",
                  isActive ? "bg-accent/50 text-foreground" : "bg-transparent text-muted-foreground hover:bg-accent/30"
                )}
              >
                <tab.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold tracking-wide">
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
