import {
  Building2, Globe, Users, Briefcase,
  Twitter, Linkedin, Github, Shield,
  Sparkles, Star
} from "lucide-react"
import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { OrgProfileClient } from "@/components/employer/OrgProfileClient"
import { Card } from "@/components/ui/Card"
import { getSession } from "@/lib/auth-checks"
import prisma from "@/lib/prisma"


export const metadata: Metadata = {
  title: "Company Profile | CampusConnect Employers",
  description: "Showcase your company to India's best student talent",
}

export const dynamic = "force-dynamic"

async function getOrgProfile(userId?: string) {
  if (!userId) return null
  try {
     
    return await (prisma as any).member.findFirst({
      where: { userId },
      include: {
        organization: {
          include: {
            subscription: true,
            members: {
              include: { user: { select: { name: true, image: true, role: true } } },
            },
            campusDrives: {
              where: { status: { in: ["LIVE", "UPCOMING"] } },
              take: 3,
            },
          },
        },
      },
    })
  } catch {
    return null
  }
}

const TECH_STACK_COLORS: Record<string, string> = {
  React: "#61DAFB", TypeScript: "#3178C6", Python: "#F7D02C",
  "Node.js": "#68A063", "Next.js": "#ffffff", PostgreSQL: "#336791",
  AWS: "#FF9900", Docker: "#2496ED", MongoDB: "#47A248",
  GraphQL: "#E10098", Rust: "#CE422B", Go: "#00ACD7",
}

export default async function EmployerProfilePage() {
  const user = await getSession()
  const membership = await getOrgProfile(user?.id)
  const org = membership?.organization

  if (!org) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-slate-100"
        style={{ background: "var(--color-background)" }}
      >
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center mx-auto mb-5">
            <Building2 size={28} className="text-[#A78BFA]" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">No Organization Yet</h2>
          <p className="text-slate-500 text-sm mb-6">
            You haven&apos;t set up an employer profile. Create your organization to start posting gigs and accessing talent.
          </p>
          <OrgProfileClient.CreateOrgButton userId={user?.id} />
        </div>
      </div>
    )
  }

  const socialLinks = (org.socialLinks as Record<string, string> | null) || {}
  const plan = org.subscription?.plan || "FREE"
  const planConfig: Record<string, { label: string; color: string; bg: string }> = {
    FREE: { label: "Basic", color: "text-slate-400", bg: "bg-white/5 border-white/10" },
    LAUNCHPAD: { label: "Launchpad", color: "text-[#0EA5E9]", bg: "bg-[#0EA5E9]/10 border-[#0EA5E9]/20" },
    GROWTH: { label: "Growth", color: "text-[#7C3AED]", bg: "bg-[#7C3AED]/10 border-[#7C3AED]/20" },
    ENTERPRISE: { label: "Enterprise", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10 border-[#F59E0B]/20" },
  }
  const planCfg = planConfig[plan]

  return (
    <div
      className="min-h-screen text-slate-100"
      style={{ background: "var(--color-background)", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
    >
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 right-1/3 w-96 h-96 blur-[140px] rounded-full" style={{ background: "rgba(245,158,11,0.08)" }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* COVER + LOGO */}
        <div className="relative rounded-3xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          {/* Cover */}
          <div
            className="h-40 w-full"
            style={{
              background: org.coverImage
                ? `url(${org.coverImage}) center/cover`
                : "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(255,77,28,0.3))",
            }}
          />

          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4 gap-4">
              {/* Logo */}
              <div className="w-20 h-20 rounded-2xl border-4 border-[var(--color-surface)] overflow-hidden bg-[#7C3AED]/20 flex items-center justify-center shrink-0">
                {org.logo ? (
                  <Image src={org.logo} alt={org.name} width={80} height={80} className="object-cover" />
                ) : (
                  <Building2 size={28} className="text-[#A78BFA]" />
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${planCfg.bg} ${planCfg.color}`}>
                  {planCfg.label} Plan
                </span>
                <OrgProfileClient.EditButton org={org} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>
                  {org.name}
                </h1>
                {org.isPremium && (
                  <Shield size={16} className="text-[#F59E0B]" />
                )}
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                {org.industry && (
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <Briefcase size={12} />
                    {org.industry}
                  </span>
                )}
                {org.size && (
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <Users size={12} />
                    {org.size} employees
                  </span>
                )}
                {org.website && (
                  <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-sm text-[#A78BFA] hover:text-white flex items-center gap-1 transition-colors">
                    <Globe size={12} />
                    {org.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>

              {org.bio && (
                <p className="text-slate-400 text-sm mt-3 max-w-2xl">{org.bio}</p>
              )}

              {/* Social Links */}
              <div className="flex items-center gap-3 mt-3">
                {socialLinks.linkedin && (
                  <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0077B5] transition-colors">
                    <Linkedin size={16} />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#1DA1F2] transition-colors">
                    <Twitter size={16} />
                  </a>
                )}
                {socialLinks.github && (
                  <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                    <Github size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Tech Stack */}
            {org.techStack.length > 0 && (
              <Card className="p-6 rounded-3xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <h2 className="font-black text-white mb-4 flex items-center gap-2">
                  <Sparkles size={16} className="text-[#7C3AED]" />
                  Tech Stack
                </h2>
                <div className="flex flex-wrap gap-2">
                  {org.techStack.map((tech: string) => {
                    const color = TECH_STACK_COLORS[tech] || "#7C3AED"
                    return (
                      <span
                        key={tech}
                        className="text-sm font-bold px-3 py-1.5 rounded-xl"
                        style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
                      >
                        {tech}
                      </span>
                    )
                  })}
                </div>
              </Card>
            )}

            {/* Active Drives */}
            {org.campusDrives.length > 0 && (
              <Card className="p-6 rounded-3xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <h2 className="font-black text-white mb-4 flex items-center gap-2">
                  <Star size={16} className="text-[#F59E0B]" />
                  Active Campus Drives
                </h2>
                <div className="space-y-3">
                  {org.campusDrives.map((drive: { id: string; title: string; targetColleges: string[]; status: string }) => (
                    <div key={drive.id} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/8">
                      <div>
                        <p className="font-bold text-white text-sm">{drive.title}</p>
                        <p className="text-xs text-slate-500">{drive.targetColleges.length} colleges targeted</p>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        drive.status === "LIVE"
                          ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"
                          : "bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20"
                      }`}>
                        {drive.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Team */}
            <Card className="p-5 rounded-3xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <h3 className="font-black text-white mb-4 flex items-center gap-2">
                <Users size={15} className="text-[#0EA5E9]" />
                Team ({org.members.length})
              </h3>
              <div className="space-y-3">
                {org.members.slice(0, 5).map((m: { id: string; role: string; user: { name: string | null; image: string | null } }) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/20 flex items-center justify-center text-xs font-black text-[#A78BFA]">
                      {m.user.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{m.user.name}</p>
                      <p className="text-xs text-slate-600">{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Subscription Status */}
            <Card
              className="p-5 rounded-3xl"
              style={{ background: "var(--color-surface)", border: `1px solid ${planCfg.color.replace("text-", "")}33` }}
            >
              <h3 className="font-black text-white mb-3">Subscription</h3>
              <div className={`px-3 py-2 rounded-xl border ${planCfg.bg} mb-3`}>
                <p className={`font-black text-lg ${planCfg.color}`}>{planCfg.label}</p>
                {org.subscription?.currentPeriodEnd && (
                  <p className="text-xs text-slate-500">
                    Renews {new Date(org.subscription.currentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}
              </div>
              <Link href="/employer/upgrade" className="block text-center text-xs font-black text-[#A78BFA] hover:text-white transition-colors py-2">
                Upgrade Plan →
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
