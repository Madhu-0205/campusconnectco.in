"use client"
import { motion } from "framer-motion"
import { Clock, Bookmark, Zap } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

import MatchRing from "@/components/ui/MatchRing"
import Image from "@/components/ui/ResilientImage"
import { cardHover, cardTap } from "@/lib/animations"

export interface GigCardData {
  id: string
  title: string
  company: string
  companyLogo?: string
  skills: string[]
  budget: number
  currency?: string
  duration?: string
  postedAt?: string | Date
  matchPercent?: number
  remote?: boolean
  saved?: boolean
  onSave?: (id: string) => void
}

const skillColors: Record<string, string> = {
  React: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  "Next.js": "bg-slate-500/15 text-slate-300 border-slate-500/20",
  TypeScript: "bg-blue-400/15 text-blue-200 border-blue-400/20",
  Python: "bg-yellow-500/15 text-yellow-300 border-yellow-500/20",
  Figma: "bg-purple-500/15 text-purple-300 border-purple-500/20",
  Design: "bg-pink-500/15 text-pink-300 border-pink-500/20",
  Marketing: "bg-orange-500/15 text-orange-300 border-orange-500/20",
  default: "bg-white/8 text-slate-300 border-white/10",
}

function getSkillColor(skill: string) {
  return skillColors[skill] ?? skillColors.default
}

export default function GigCard({
  id,
  title,
  company,
  companyLogo,
  skills,
  budget,
  currency = "₹",
  duration,
  postedAt,
  matchPercent,
  remote,
  saved,
  onSave,
}: GigCardData) {
  const initials = company.charAt(0).toUpperCase()
  const [timeAgo, setTimeAgo] = useState("")

  useEffect(() => {
    if (!postedAt) return
    const d = typeof postedAt === "string" ? new Date(postedAt) : postedAt
    const diff = Date.now() - d.getTime()
    const hours = Math.floor(diff / 3_600_000)
    let text = ""
    if (hours < 1) {
      text = "Just now"
    } else if (hours < 24) {
      text = `${hours}h ago`
    } else {
      text = `${Math.floor(hours / 24)}d ago`
    }
    const timer = setTimeout(() => {
      setTimeAgo(text)
    }, 0)
    return () => clearTimeout(timer)
  }, [postedAt])


  return (
    <motion.div
      whileHover={cardHover}
      whileTap={cardTap}
      className="group relative bg-[#131929]/80 border border-white/8 hover:border-[#7C3AED]/30 rounded-2xl p-5 flex flex-col gap-4 backdrop-blur-sm shadow-card hover:shadow-[0_8px_32px_rgba(124,58,237,0.15)] transition-colors cursor-pointer"
    >
      {/* Save button */}
      {onSave && (
        <button
          onClick={(e) => { e.preventDefault(); onSave(id) }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all z-10"
          aria-label="Save gig"
        >
          <Bookmark size={16} fill={saved ? "currentColor" : "none"} className={saved ? "text-[#7C3AED]" : ""} />
        </button>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl shrink-0 overflow-hidden border border-white/10 bg-[#1A2240] flex items-center justify-center font-black text-white shadow-inner">
          {companyLogo ? (
            <Image src={companyLogo} alt={company} width={44} height={44} className="w-full h-full object-cover" unoptimized />
          ) : initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-[#A78BFA] transition-colors pr-6">
            {title}
          </h3>
          <p className="text-xs mt-0.5 font-medium">{company}</p>
        </div>
        {matchPercent !== undefined && (
          <MatchRing value={matchPercent} size={44} strokeWidth={4} />
        )}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getSkillColor(skill)}`}
            >
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="px-2 py-0.5 rounded-md font-bold bg-white/5 text-slate-400 border border-white/8">
              +{skills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex flex-col">
          <span className="font-black text-xl leading-tight">
            {currency}{budget.toLocaleString("en-IN")}
          </span>
          {remote && (
            <span className="flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 w-fit">
              <Zap size={9} /> Remote
            </span>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {duration && (
            <span className="flex items-center gap-1 text-slate-500">
              <Clock size={11} /> {duration}
            </span>
          )}
          {postedAt && (
            <span className="text-slate-600">{timeAgo}</span>
          )}
          <Link
            href={`/gigs/${id}`}
            className="mt-1 px-4 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-xs font-bold rounded-xl transition-all shadow-[0_0_16px_rgba(124,58,237,0.35)] hover:shadow-[0_0_24px_rgba(124,58,237,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            Quick Apply
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
