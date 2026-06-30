import {
  Search, Target, Building2, Zap, ChevronRight,
  LayoutDashboard, Crown
} from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { getSession } from "@/lib/auth-checks"
import prisma from "@/lib/prisma"


const NAV_ITEMS = [
  {
    href: "/client-hub",
    icon: LayoutDashboard,
    label: "Dashboard",
    description: "Hiring pipeline & overview",
    color: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10 border-[#F59E0B]/20",
  },
  {
    href: "/employer/talent-search",
    icon: Search,
    label: "Talent Search",
    description: "AI-powered candidate discovery",
    color: "text-[#7C3AED]",
    bg: "bg-[#7C3AED]/10 border-[#7C3AED]/20",
  },
  {
    href: "/employer/drives",
    icon: Target,
    label: "Campus Drives",
    description: "Virtual placement orchestrator",
    color: "text-[#10B981]",
    bg: "bg-[#10B981]/10 border-[#10B981]/20",
  },
  {
    href: "/employer/profile",
    icon: Building2,
    label: "Company Profile",
    description: "Employer branding page",
    color: "text-[#0EA5E9]",
    bg: "bg-[#0EA5E9]/10 border-[#0EA5E9]/20",
  },
  {
    href: "/employer/upgrade",
    icon: Crown,
    label: "Plans & Upgrade",
    description: "B2B subscription tiers",
    color: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10 border-[#F59E0B]/20",
    highlight: true,
  },
]

async function getSubscriptionBadge(userId?: string) {
  if (!userId) return null
  try {
     
    const membership = await (prisma as any).member.findFirst({
      where: { userId },
      include: { organization: { include: { subscription: true } } },
    })
    return membership?.organization?.subscription?.plan || "FREE"
  } catch {
    return null
  }
}

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  FREE: { label: "Basic", color: "text-slate-400" },
  LAUNCHPAD: { label: "Launchpad", color: "text-[#0EA5E9]" },
  GROWTH: { label: "Growth", color: "text-[#7C3AED]" },
  ENTERPRISE: { label: "Enterprise", color: "text-[#F59E0B]" },
}

export default async function EmployerLayout({ children }: { children: ReactNode }) {
  const user = await getSession()
  const plan = await getSubscriptionBadge(user?.id)
  const planCfg = plan ? PLAN_LABELS[plan] : null

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      {/* Top employer nav bar */}
      <div
        className="sticky top-0 z-40 border-b"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
            {/* Brand */}
            <div className="flex items-center gap-2 pr-4 mr-2 border-r border-white/10 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center">
                <Zap size={13} className="text-[#F59E0B]" />
              </div>
              <span className="text-sm font-black text-white whitespace-nowrap">Employer Hub</span>
              {planCfg && (
                <span className={`text-[10px] font-black uppercase tracking-wider ${planCfg.color}`}>
                  {planCfg.label}
                </span>
              )}
            </div>

            {/* Nav items */}
            {NAV_ITEMS.map(({ href, icon: Icon, label, color, highlight }) => (
              <Link key={href} href={href}>
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    highlight
                      ? "text-[#F59E0B] hover:bg-[#F59E0B]/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={14} className={color} />
                  {label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Page content */}
      {children}
    </div>
  )
}
