import { Metadata } from "next"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-checks"
// Employer-specific component for campus recruitment drives
import { CampusDriveClient } from "../../../components/employer/CampusDriveClient"
import {
  Building2, Plus, MapPin, CalendarDays,
  Users, Target, Trophy, Clock, Zap,
  ChevronRight, GraduationCap, PlayCircle
} from "lucide-react"
import { Card } from "@/components/ui/Card"

export const metadata: Metadata = {
  title: "Campus Drives | CampusConnect Employers",
  description: "Orchestrate virtual campus recruitment drives across 100+ colleges from a single dashboard.",
}

export const dynamic = "force-dynamic"

const DRIVE_STATUS_CONFIG = {
  DRAFT: { label: "Draft", color: "text-slate-400", bg: "bg-white/5 border-white/10", dot: "bg-slate-500" },
  UPCOMING: { label: "Upcoming", color: "text-[#0EA5E9]", bg: "bg-[#0EA5E9]/10 border-[#0EA5E9]/20", dot: "bg-[#0EA5E9]" },
  LIVE: { label: "Live", color: "text-[#10B981]", bg: "bg-[#10B981]/10 border-[#10B981]/20", dot: "bg-[#10B981] animate-pulse" },
  COMPLETED: { label: "Completed", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10 border-[#F59E0B]/20", dot: "bg-[#F59E0B]" },
}

type DriveItem = {
  id: string
  title: string
  description: string
  status: string
  startDate: Date
  endDate: Date
  targetColleges: string[]
  organizationId: string
  createdAt: Date
}

async function getDrives(orgId?: string) {
  if (!orgId) return []
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (prisma as any).campusDrive.findMany({
      where: { organizationId: orgId },
      include: { organization: { select: { name: true, logo: true } } },
      orderBy: { createdAt: "desc" },
    })
  } catch {
    return []
  }
}

async function getOrganization(userId?: string) {
  if (!userId) return null
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (prisma as any).member.findFirst({
      where: { userId },
      include: { organization: { include: { subscription: true } } },
    })
  } catch {
    return null
  }
}

const TOP_COLLEGES = [
  "IIT Delhi", "IIT Bombay", "IIT Madras", "IIT Kanpur", "IIT Kharagpur",
  "BITS Pilani", "NIT Trichy", "NIT Warangal", "IIIT Hyderabad",
  "VIT Vellore", "Jadavpur University", "Anna University",
  "Delhi Technological University", "VJTI Mumbai",
]

function getDaysRemaining(endDate: Date | string) {
  return Math.ceil(
    (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
}

export default async function CampusDrivesPage() {
  const user = await getSession()
  const membership = await getOrganization(user?.id)
  const org = membership?.organization
  const drives: DriveItem[] = await getDrives(org?.id)

  const stats = {
    total: drives.length,
    live: drives.filter((d) => d.status === "LIVE").length,
    upcoming: drives.filter((d) => d.status === "UPCOMING").length,
    completed: drives.filter((d) => d.status === "COMPLETED").length,
    colleges: [...new Set(drives.flatMap((d) => d.targetColleges))].length,
  }

  return (
    <div
      className="min-h-screen text-slate-100"
      style={{ background: "var(--color-background)", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
    >
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 right-1/3 w-96 h-96 blur-[140px] rounded-full" style={{ background: "rgba(16,185,129,0.1)" }} />
        <div className="absolute top-1/2 left-1/4 w-80 h-80 blur-[120px] rounded-full" style={{ background: "rgba(255,77,28,0.07)" }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#34D399] text-[10px] font-black uppercase tracking-widest mb-3">
              <Target size={12} />
              Campus Recruitment Platform
            </div>
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
              Campus Drives
            </h1>
            <p className="text-slate-400 mt-1">
              Orchestrate virtual placement drives across {TOP_COLLEGES.length}+ colleges
            </p>
          </div>
          <CampusDriveClient.CreateButton orgId={org?.id} />
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Drives", value: stats.total, icon: PlayCircle, color: "text-[#7C3AED]", bg: "bg-[#7C3AED]/10 border-[#7C3AED]/20" },
            { label: "Live Now", value: stats.live, icon: Zap, color: "text-[#10B981]", bg: "bg-[#10B981]/10 border-[#10B981]/20" },
            { label: "Upcoming", value: stats.upcoming, icon: Clock, color: "text-[#0EA5E9]", bg: "bg-[#0EA5E9]/10 border-[#0EA5E9]/20" },
            { label: "Completed", value: stats.completed, icon: Trophy, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10 border-[#F59E0B]/20" },
            { label: "Colleges Targeted", value: stats.colleges, icon: GraduationCap, color: "text-slate-300", bg: "bg-white/5 border-white/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card
              key={label}
              className="p-4 rounded-2xl"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            >
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center mb-3 ${bg}`}>
                <Icon size={14} className={color} />
              </div>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* DRIVES LIST */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-white text-lg">Your Drives</h2>
              {drives.length > 0 && (
                <span className="text-xs text-slate-500">{drives.length} total</span>
              )}
            </div>

            {drives.length === 0 ? (
              <div
                className="rounded-3xl p-12 text-center"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              >
                <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mx-auto mb-4">
                  <Target size={28} className="text-[#10B981]" />
                </div>
                <h3 className="font-black text-white text-lg mb-2">No drives yet</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-5">
                  Create your first virtual campus recruitment drive to connect with students across India&apos;s top colleges.
                </p>
                <CampusDriveClient.CreateButton orgId={org?.id} variant="secondary" />
              </div>
            ) : (
              <div className="space-y-3">
                {drives.map((drive: DriveItem) => {
                  const cfg = DRIVE_STATUS_CONFIG[drive.status as keyof typeof DRIVE_STATUS_CONFIG] || DRIVE_STATUS_CONFIG.DRAFT
                  const daysLeft = getDaysRemaining(drive.endDate)
                  return (
                    <div
                      key={drive.id}
                      className="p-5 rounded-2xl hover:border-[#7C3AED]/30 transition-all group"
                      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                          </div>
                          <h3 className="font-black text-white text-sm">{drive.title}</h3>
                          <p className="text-slate-500 text-xs mt-1 line-clamp-2">{drive.description}</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors shrink-0 mt-1" />
                      </div>
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <GraduationCap size={11} />
                          {drive.targetColleges.length} colleges targeted
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <CalendarDays size={11} />
                          {new Date(drive.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
                          {new Date(drive.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        {drive.status !== "COMPLETED" && daysLeft > 0 && (
                          <span className="flex items-center gap-1.5 text-xs text-[#F59E0B]">
                            <Clock size={11} />
                            {daysLeft}d remaining
                          </span>
                        )}
                      </div>
                      {/* College pills */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {drive.targetColleges.slice(0, 4).map((c: string) => (
                          <span key={c} className="text-[10px] font-bold px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-slate-400">
                            {c}
                          </span>
                        ))}
                        {drive.targetColleges.length > 4 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-slate-500">
                            +{drive.targetColleges.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-5">

            {/* Drive Creator Card */}
            <Card
              className="p-6 rounded-3xl relative overflow-hidden"
              style={{ background: "var(--color-surface)", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#10B981]/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[10px] font-black uppercase tracking-widest text-[#34D399] mb-4">
                  <Zap size={10} /> Enterprise Feature
                </div>
                <h3 className="font-black text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  Drive Orchestrator
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  Schedule a virtual placement drive, target specific college tiers, and auto-screen applicants before interviews.
                </p>
                <div className="space-y-2">
                  {[
                    "Target college lists by tier/city",
                    "Auto-screen via coding challenges",
                    "Batch interview scheduling",
                    "Conversion analytics dashboard",
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-slate-400">
                      <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Top Colleges */}
            <Card
              className="p-5 rounded-3xl"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            >
              <h3 className="font-black text-white mb-4 flex items-center gap-2">
                <Trophy size={14} className="text-[#F59E0B]" />
                Top Target Colleges
              </h3>
              <div className="space-y-2">
                {TOP_COLLEGES.slice(0, 7).map((college, i) => (
                  <div key={college} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600 w-4">{i + 1}</span>
                      <span className="text-sm text-slate-300 font-medium">{college}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#A78BFA] rounded-full font-bold">
                      {i < 5 ? "Tier 1" : "Tier 2"}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/employer/talent-search" className="mt-4 flex items-center gap-1 text-xs text-[#A78BFA] hover:text-white transition-colors font-bold">
                Search talent from these colleges <ChevronRight size={11} />
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
