"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  Megaphone,
  Calendar,
  Briefcase,
  Clock,
  FileText,
  Sparkles,
  ArrowRight,
  Bell,
} from "lucide-react"
import Link from "next/link"
import React, { useState, useEffect } from "react"

import AnnouncementCard, { AnnouncementCardSkeleton, AnnouncementItem } from "./AnnouncementCard"

// ── Sample data ────────────────────────────────────────────────────────────────
const SAMPLE_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "ann-1",
    title: "Annual Pan-India Campus Hiring Drive 2026 Announced",
    description:
      "50+ verified tech startups are conducting off-campus recruitment drives for Software Development Engineer (SDE) and Product Design intern roles. Register now to get priority interview slots.",
    date: "Aug 15, 2026",
    category: "Placement Drive",
    priority: "Urgent",
    featured: true,
    locationOrOrganizer: "CampusConnect Placement Portal",
    linkUrl: "/employer/drives",
  },
  {
    id: "ann-2",
    title: "Summer Internship Application Deadline Extended",
    description:
      "Submit your final portfolio and GitHub project links for summer 2026 AI research & frontend engineering roles before midnight.",
    date: "Aug 20, 2026",
    category: "Internship Deadline",
    priority: "High Priority",
    featured: false,
    locationOrOrganizer: "Verified Startup Cohort",
    linkUrl: "/internships",
  },
  {
    id: "ann-3",
    title: "National Student Hackathon & Open Source Sprint",
    description:
      "Participate in a 48-hour live building sprint with ₹25,00,000 in bounty prizes, mentorship from senior engineers, and fast-track interviews at top startups.",
    date: "Sep 01, 2026",
    category: "Campus Event",
    priority: "New",
    featured: false,
    locationOrOrganizer: "CampusConnect Developer Hub",
    linkUrl: "/gigs/find",
  },
  {
    id: "ann-4",
    title: "Semester Mid-Term & Academic Credit Verification Notice",
    description:
      "Students seeking academic credit equivalence for completed campus gigs must upload verified milestone completion certificates before the deadline.",
    date: "Sep 10, 2026",
    category: "Exam Notification",
    featured: false,
    locationOrOrganizer: "Academic Relations Board",
    linkUrl: "/trust#verification",
  },
  {
    id: "ann-5",
    title: "New Escrow Milestone Feature Released for Student Freelancers",
    description:
      "Instant partial payouts on 50% project completion now live for all active campus gig freelancers with gold verification badges.",
    date: "Aug 10, 2026",
    category: "Campus Announcement",
    featured: false,
    locationOrOrganizer: "Platform Core Team",
    linkUrl: "/trust#disputes",
  },
]

// ── Category filter config ─────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "All",                    icon: Bell      },
  { label: "Placement Drive",        icon: Briefcase },
  { label: "Campus Event",           icon: Calendar  },
  { label: "Internship Deadline",    icon: Clock     },
  { label: "Exam Notification",      icon: FileText  },
  { label: "Campus Announcement",    icon: Megaphone },
] as const

type CategoryLabel = typeof CATEGORIES[number]["label"]

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyState({ category }: { category: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="col-span-full flex flex-col items-center justify-center py-20 text-center"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
      >
        <Bell className="w-7 h-7" style={{ color: "var(--primary-light)", opacity: 0.6 }} />
      </div>
      <p className="font-bold text-base mb-1" style={{ color: "var(--text)" }}>
        No {category === "All" ? "announcements" : `"${category}" announcements`} right now
      </p>
      <p className="text-sm" style={{ color: "var(--text-3)" }}>
        Check back soon — new updates are posted daily.
      </p>
    </motion.div>
  )
}

// ── Main Section ───────────────────────────────────────────────────────────────
export default function AnnouncementSection() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryLabel>("All")
  const [isLoading, setIsLoading] = useState(true)

  // Simulate async data load
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  const featuredAnnouncements = SAMPLE_ANNOUNCEMENTS.filter(
    (a) => a.featured && (selectedCategory === "All" || a.category === selectedCategory)
  )
  const regularAnnouncements = SAMPLE_ANNOUNCEMENTS.filter(
    (a) => !a.featured && (selectedCategory === "All" || a.category === selectedCategory)
  )
  const filteredAnnouncements = [...featuredAnnouncements, ...regularAnnouncements]

  return (
    <section
      className="relative overflow-hidden py-20 px-4 sm:px-6"
      id="announcements"
      aria-labelledby="announcements-heading"
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.05) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.4), rgba(6,182,212,0.3), transparent)" }}
      />

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "2rem" }}
        >
          <div className="space-y-3">
            {/* Eyebrow label */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest font-mono"
              style={{
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.2)",
                color: "var(--primary-light)",
              }}
            >
              <Megaphone className="w-3.5 h-3.5" />
              Campus Bulletin &amp; Updates
            </div>

            <h2
              id="announcements-heading"
              className="text-3xl sm:text-4xl font-black tracking-tight"
              style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
            >
              Announcements &amp;{" "}
              <span
                style={{
                  background: "var(--grad-brand)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Campus News
              </span>
            </h2>

            <p className="text-sm max-w-xl" style={{ color: "var(--text-2)" }}>
              Stay up to date with active placement drives, upcoming hackathons, internship deadlines, and official campus notices.
            </p>
          </div>

          {/* View All link */}
          <Link
            href="/announcements"
            className="group inline-flex items-center gap-1.5 text-xs font-bold shrink-0 transition-all duration-200 focus:outline-none focus-visible:underline"
            style={{ color: "var(--text-3)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--primary-light)" }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-3)" }}
          >
            View All Announcements
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* ── Category Filter Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
          role="tablist"
          aria-label="Filter announcements by category"
        >
          {CATEGORIES.map(({ label, icon: Icon }) => {
            const isActive = selectedCategory === label
            return (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedCategory(label as CategoryLabel)}
                className="relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 shrink-0"
                style={{
                  color: isActive ? "#fff" : "var(--text-3)",
                  background: isActive ? "rgba(124,58,237,0.85)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isActive ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.07)"}`,
                  boxShadow: isActive ? "0 2px 12px rgba(124,58,237,0.3)" : "none",
                  transform: isActive ? "scale(1.03)" : "scale(1)",
                }}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
                {isActive && (
                  <motion.span
                    layoutId="announcement-tab-dot"
                    className="w-1.5 h-1.5 rounded-full bg-white/70"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                  />
                )}
              </button>
            )
          })}
        </motion.div>

        {/* ── Announcements Grid ── */}
        {isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnnouncementCardSkeleton featured />
            {[1, 2, 3, 4].map(i => (
              <AnnouncementCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredAnnouncements.length === 0 ? (
                <EmptyState category={selectedCategory} />
              ) : (
                filteredAnnouncements.map((announcement, i) => (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                    className={
                      announcement.featured
                        ? "md:col-span-2 lg:col-span-3"
                        : ""
                    }
                  >
                    <AnnouncementCard
                      announcement={announcement}
                      className="h-full"
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── Bottom CTA strip ── */}
        {!isLoading && filteredAnnouncements.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p className="text-xs font-mono" style={{ color: "var(--text-3)" }}>
              <Sparkles className="w-3.5 h-3.5 inline-block mr-1.5" style={{ color: "var(--primary-light)" }} />
              Showing {filteredAnnouncements.length} {selectedCategory === "All" ? "total" : selectedCategory} announcement{filteredAnnouncements.length !== 1 ? "s" : ""}
            </p>
            <Link
              href="/announcements"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              style={{
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.25)",
                color: "var(--primary-light)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(124,58,237,0.2)"
                e.currentTarget.style.borderColor = "rgba(124,58,237,0.45)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(124,58,237,0.1)"
                e.currentTarget.style.borderColor = "rgba(124,58,237,0.25)"
              }}
            >
              Browse All Campus Notices
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}
