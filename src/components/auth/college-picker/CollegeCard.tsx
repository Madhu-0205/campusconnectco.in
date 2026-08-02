"use client"

import { motion } from "framer-motion"
import { MapPin, CheckCircle2 } from "lucide-react"
import type { CollegeResult } from "@/lib/colleges-geo"

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Engineering:    { bg: "rgba(99,102,241,0.12)", text: "#818CF8" },
  Medical:        { bg: "rgba(239,68,68,0.12)",  text: "#FCA5A5" },
  MBA:            { bg: "rgba(245,158,11,0.12)", text: "#FCD34D" },
  Law:            { bg: "rgba(168,85,247,0.12)", text: "#D8B4FE" },
  University:     { bg: "rgba(16,185,129,0.12)", text: "#6EE7B7" },
  Arts:           { bg: "rgba(236,72,153,0.12)", text: "#F9A8D4" },
  Science:        { bg: "rgba(6,182,212,0.12)",  text: "#67E8F9" },
  Commerce:       { bg: "rgba(234,179,8,0.12)",  text: "#FDE047" },
  Polytechnic:    { bg: "rgba(148,163,184,0.1)", text: "#94A3B8" },
  Design:         { bg: "rgba(251,113,133,0.12)","text": "#FDA4AF" },
  Agriculture:    { bg: "rgba(34,197,94,0.12)",  text: "#86EFAC" },
  Architecture:   { bg: "rgba(234,88,12,0.12)",  text: "#FED7AA" },
  Nursing:        { bg: "rgba(20,184,166,0.12)", text: "#99F6E4" },
  Pharmacy:       { bg: "rgba(124,58,237,0.12)", text: "#C4B5FD" },
  default:        { bg: "rgba(100,116,139,0.1)", text: "#94A3B8" },
}

interface CollegeCardProps {
  college: CollegeResult
  isSelected: boolean
  onClick: () => void
  index: number
}

export default function CollegeCard({
  college,
  isSelected,
  onClick,
  index,
}: CollegeCardProps) {
  const typeColor = TYPE_COLORS[college.type] ?? TYPE_COLORS.default
  const dist = college.distanceKm

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left group relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      style={{
        background: isSelected ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.02)",
        borderColor: isSelected ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.06)",
        boxShadow: isSelected ? "0 2px 12px rgba(124,58,237,0.15)" : "none",
      }}
      aria-pressed={isSelected}
      aria-label={`Select ${college.name}`}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-sm font-bold transition-transform duration-200 group-hover:scale-105"
        style={{ background: typeColor.bg, color: typeColor.text }}
      >
        {college.name[0]}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold leading-snug truncate transition-colors duration-200"
          style={{ color: isSelected ? "#C4B5FD" : "#E2E8F0" }}
        >
          {college.name}
        </p>
        <p className="text-xs truncate mt-0.5" style={{ color: "#64748B" }}>
          {college.city}
          {college.city !== college.district && `, ${college.district}`}
          {` · ${college.state}`}
        </p>
      </div>

      {/* Right: distance + type badge */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        {dist !== undefined && (
          <span
            className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(6,182,212,0.1)", color: "#67E8F9" }}
          >
            <MapPin className="w-2.5 h-2.5" />
            {dist < 1 ? "<1" : Math.round(dist)}km
          </span>
        )}
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{ background: typeColor.bg, color: typeColor.text }}
        >
          {college.type}
        </span>
      </div>

      {/* Selected check */}
      {isSelected && (
        <CheckCircle2
          className="w-4 h-4 shrink-0 absolute right-3 top-3"
          style={{ color: "#8B5CF6" }}
        />
      )}
    </motion.button>
  )
}
