"use client"

import {
 Megaphone,
 Calendar,
 Briefcase,
 Clock,
 FileText,
 ArrowRight,
 Sparkles,
 Building2,
 Star,
} from"lucide-react"
import Link from"next/link"
import React from"react"

export interface AnnouncementItem {
 id: string
 title: string
 description: string
 date: string
 category:"Placement Drive" |"Campus Event" |"Internship Deadline" |"Exam Notification" |"Campus Announcement"
 priority?:"Urgent" |"Featured" |"New" |"High Priority"
 featured?: boolean
 linkUrl?: string
 locationOrOrganizer?: string
}

const CATEGORY_ICONS: Record<AnnouncementItem["category"], React.ComponentType<{ className?: string }>> = {
"Placement Drive": Briefcase,
"Campus Event": Calendar,
"Internship Deadline": Clock,
"Exam Notification": FileText,
"Campus Announcement": Megaphone,
}

const CATEGORY_COLORS: Record<AnnouncementItem["category"], { bg: string; text: string; border: string; glow: string }> = {
"Placement Drive": { bg:"rgba(16,185,129,0.1)", text:"#10B981", border:"rgba(16,185,129,0.25)", glow:"rgba(16,185,129,0.08)" },
"Campus Event": { bg:"rgba(6,182,212,0.1)", text:"#06B6D4", border:"rgba(6,182,212,0.25)", glow:"rgba(6,182,212,0.08)" },
"Internship Deadline": { bg:"rgba(245,158,11,0.1)", text:"#F59E0B", border:"rgba(245,158,11,0.25)", glow:"rgba(245,158,11,0.08)" },
"Exam Notification": { bg:"rgba(239,68,68,0.1)", text:"#EF4444", border:"rgba(239,68,68,0.25)", glow:"rgba(239,68,68,0.08)" },
"Campus Announcement": { bg:"rgba(31,169,113,0.1)", text:"#8B5CF6", border:"rgba(31,169,113,0.25)", glow:"rgba(31,169,113,0.08)" },
}

const PRIORITY_STYLES: Record<NonNullable<AnnouncementItem["priority"]>, { bg: string; text: string; border: string }> = {
"Urgent": { bg:"rgba(239,68,68,0.15)", text:"#FCA5A5", border:"rgba(239,68,68,0.35)" },
"High Priority": { bg:"rgba(245,158,11,0.12)", text:"#FCD34D", border:"rgba(245,158,11,0.3)" },
"Featured": { bg:"rgba(31,169,113,0.15)", text:"#C4B5FD", border:"rgba(31,169,113,0.35)" },
"New": { bg:"rgba(16,185,129,0.12)", text:"#6EE7B7", border:"rgba(16,185,129,0.3)" },
}

/** Skeleton loading state for AnnouncementCard */
export function AnnouncementCardSkeleton({ featured = false }: { featured?: boolean }) {
 return (
 <div
 className={`rounded-3xl p-6 ${featured ?"md:col-span-2 lg:col-span-3" :""}`}
 style={{
 background:"rgba(17,17,39,0.5)",
 border:"1px solid rgba(255,255,255,0.05)",
 }}
 >
 <div className="space-y-4">
 <div className="flex items-center justify-between gap-2">
 <div className="flex items-center gap-2">
 <div className="h-6 w-28 rounded-full shimmer" />
 {featured && <div className="h-5 w-16 rounded-full shimmer" />}
 </div>
 <div className="h-4 w-20 rounded shimmer" />
 </div>
 <div className="space-y-2">
 <div className="h-5 w-3/4 rounded shimmer" />
 {featured && <div className="h-5 w-1/2 rounded shimmer" />}
 <div className="h-3 w-36 rounded shimmer" />
 </div>
 <div className="space-y-1.5">
 <div className="h-3 w-full rounded shimmer" />
 <div className="h-3 w-5/6 rounded shimmer" />
 </div>
 <div className="pt-2 flex items-center justify-between border-t" style={{ borderColor:"rgba(255,255,255,0.05)" }}>
 <div className="h-4 w-28 rounded shimmer" />
 </div>
 </div>
 </div>
 )
}

export default function AnnouncementCard({
 announcement,
 className ="",
}: {
 announcement: AnnouncementItem
 className?: string
}) {
 const IconComponent = CATEGORY_ICONS[announcement.category] ?? Megaphone
 const colorStyle = CATEGORY_COLORS[announcement.category] ?? CATEGORY_COLORS["Campus Announcement"]
 const priorityStyle = announcement.priority ? PRIORITY_STYLES[announcement.priority] : null
 const isFeatured = announcement.featured
 const cardId = `announcement-title-${announcement.id}`

 return (
 <article
 aria-labelledby={cardId}
 className={`group relative rounded-3xl p-6 transition-all duration-300 cursor-default ${className}`}
 style={{
 background: isFeatured
 ?"linear-gradient(135deg, rgba(31,169,113,0.12) 0%, rgba(17,17,39,0.9) 50%, rgba(8,8,15,0.95) 100%)"
 :"rgba(17,17,39,0.6)",
 border: `1px solid ${isFeatured ?"rgba(31,169,113,0.3)" :"rgba(255,255,255,0.06)"}`,
 boxShadow: isFeatured ?"0 8px 32px rgba(31,169,113,0.12)" :"0 2px 16px rgba(0,0,0,0.2)",
 transform:"translateY(0)",
 transition:"transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
 }}
 onMouseEnter={e => {
 e.currentTarget.style.transform ="translateY(-4px)"
 e.currentTarget.style.boxShadow = isFeatured
 ? `0 16px 48px rgba(31,169,113,0.2)`
 : `0 8px 32px ${colorStyle.glow}, 0 2px 16px rgba(0,0,0,0.3)`
 e.currentTarget.style.borderColor = isFeatured ?"rgba(31,169,113,0.5)" : colorStyle.border
 }}
 onMouseLeave={e => {
 e.currentTarget.style.transform ="translateY(0)"
 e.currentTarget.style.boxShadow = isFeatured ?"0 8px 32px rgba(31,169,113,0.12)" :"0 2px 16px rgba(0,0,0,0.2)"
 e.currentTarget.style.borderColor = isFeatured ?"rgba(31,169,113,0.3)" :"rgba(255,255,255,0.06)"
 }}
 >
 {/* Featured ambient glow */}
 {isFeatured && (
 <div
 className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
 style={{ background:"radial-gradient(circle, rgba(31,169,113,0.12) 0%, transparent 70%)" }}
 />
 )}

 {/* Category color top accent */}
 <div
 className="absolute top-0 left-6 right-6 h-[1.5px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
 style={{ background: `linear-gradient(90deg, transparent, ${colorStyle.text}, transparent)` }}
 />

 <div className="space-y-4 relative z-10">
 {/* Header: badges + date */}
 <div className="flex flex-wrap items-center justify-between gap-2">
 <div className="flex items-center gap-2 flex-wrap">
 {/* Category badge */}
 <span
 className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
 style={{
 background: colorStyle.bg,
 color: colorStyle.text,
 border: `1px solid ${colorStyle.border}`,
 }}
 >
 <IconComponent className="w-3.5 h-3.5" />
 {announcement.category}
 </span>

 {/* Priority badge */}
 {priorityStyle && announcement.priority && (
 <span
 className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
 style={{
 background: priorityStyle.bg,
 color: priorityStyle.text,
 border: `1px solid ${priorityStyle.border}`,
 }}
 >
 {announcement.priority ==="Urgent" || announcement.priority ==="High Priority"
 ? <Sparkles className="w-3 h-3" />
 : announcement.priority ==="Featured"
 ? <Star className="w-3 h-3" />
 : <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
 }
 {announcement.priority}
 </span>
 )}
 </div>

 {/* Date */}
 <time
 className="text-xs font-mono shrink-0"
 style={{ color:"var(--text-3)" }}
 dateTime={announcement.date}
 >
 {announcement.date}
 </time>
 </div>

 {/* Title + organizer */}
 <div>
 <h3
 id={cardId}
 className="text-base sm:text-lg font-bold leading-snug transition-colors duration-200"
 style={{
 fontFamily:"var(--font-heading)",
 color:"var(--text)",
 }}
 >
 {announcement.title}
 </h3>

 {announcement.locationOrOrganizer && (
 <p
 className="mt-1.5 flex items-center gap-1.5 text-xs"
 style={{ color:"var(--text-3)" }}
 >
 <Building2 className="w-3.5 h-3.5 shrink-0" style={{ color:"var(--text-3)" }} />
 {announcement.locationOrOrganizer}
 </p>
 )}
 </div>

 {/* Description */}
 <p
 className={`text-sm leading-relaxed line-clamp-2 ${isFeatured ?"line-clamp-3" :""}`}
 style={{ color:"var(--text-2)" }}
 >
 {announcement.description}
 </p>

 {/* Footer: Read More */}
 <div
 className="pt-3 flex items-center justify-between"
 style={{ borderTop:"1px solid rgba(255,255,255,0.05)" }}
 >
 <Link
 href={announcement.linkUrl ??"/announcements"}
 className="group/btn inline-flex items-center gap-1.5 text-sm font-bold transition-all duration-200 focus:outline-none focus-visible:underline"
 style={{ color: colorStyle.text }}
 onMouseEnter={e => { e.currentTarget.style.opacity ="0.8" }}
 onMouseLeave={e => { e.currentTarget.style.opacity ="1" }}
 >
 Read More
 <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
 </Link>

 {isFeatured && (
 <span
 className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded"
 style={{
 background:"rgba(31,169,113,0.1)",
 color:"var(--primary-light)",
 border:"1px solid rgba(31,169,113,0.2)",
 }}
 >
 Featured
 </span>
 )}
 </div>
 </div>
 </article>
 )
}
