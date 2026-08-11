"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  Search, X, MapPin, GraduationCap,
  ChevronRight, Sparkles
} from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"

import type { CollegeResult } from "@/lib/colleges-geo"

import CollegeCard from "./CollegeCard"

const RADII = [20, 50, 100] as const
type Radius = typeof RADII[number]

interface CollegeSearchListProps {
  selectedValue: string
  onSelect: (name: string, id: string) => void
  onCantFind: () => void
  hasLocation: boolean
  userLat?: number
  userLng?: number
}

function EmptyState({ query }: { query: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-10 text-center space-y-3"
    >
      <div
        className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}
      >
        <GraduationCap className="w-6 h-6" style={{ color: "#8B5CF6", opacity: 0.6 }} />
      </div>
      <div>
        <p className="font-bold text-sm text-white">
          We couldn&apos;t find your campus yet.
        </p>
        <p className="text-xs mt-1" style={{ color: "#64748B" }}>
          {query
            ? `No results for "${query}"`
            : "No colleges found in this area."}
        </p>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-xs font-bold" style={{ color: "#8B5CF6" }}>
        <Sparkles className="w-3 h-3" />
        Add it below and become the first verified student from your campus.
      </div>
    </motion.div>
  )
}

export default function CollegeSearchList({
  selectedValue,
  onSelect,
  onCantFind,
  hasLocation,
  userLat,
  userLng,
}: CollegeSearchListProps) {
  const [query, setQuery] = useState("")
  const [radius, setRadius] = useState<Radius>(50)
  const [colleges, setColleges] = useState<CollegeResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchColleges = useCallback(
    async (q: string, rad: Radius) => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (q.length >= 2) {
          params.set("q", q)
        } else if (hasLocation && userLat !== undefined && userLng !== undefined) {
          params.set("lat", String(userLat))
          params.set("lng", String(userLng))
          params.set("radius", String(rad))
        }
        const res = await fetch(`/api/colleges?${params.toString()}`)
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        setColleges(data.colleges || [])
      } catch {
        setColleges([])
      } finally {
        setIsLoading(false)
      }
    },
    [hasLocation, userLat, userLng]
  )

  // Initial load
  useEffect(() => {
    fetchColleges("", radius)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchColleges(query, radius)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, radius, fetchColleges])

  const isNearby = !query && hasLocation
  const sectionLabel = isNearby
    ? "📍 Nearby Colleges"
    : query.length >= 2
    ? `Search results`
    : "All Colleges"

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: "#64748B" }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search college, city, state…"
          autoComplete="off"
          className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm font-medium text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-[#7C3AED]/50"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          aria-label="Search for your college"
          id="college-search-input"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              type="button"
              onClick={() => { setQuery(""); inputRef.current?.focus() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Radius toggle (only when no query and location is available) */}
      <AnimatePresence>
        {!query && hasLocation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5"
          >
            <MapPin className="w-3 h-3 shrink-0" style={{ color: "#67E8F9" }} />
            <span className="text-[11px] font-medium shrink-0" style={{ color: "#64748B" }}>
              Within:
            </span>
            {RADII.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRadius(r)}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold transition-all"
                style={{
                  background: radius === r ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.03)",
                  color: radius === r ? "#67E8F9" : "#64748B",
                  border: `1px solid ${radius === r ? "rgba(6,182,212,0.3)" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                {r}km
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section header */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#475569" }}>
          {sectionLabel}
        </span>
        {isLoading && (
          <span className="w-3.5 h-3.5 border-2 border-slate-700 border-t-[#8B5CF6] rounded-full animate-spin" />
        )}
      </div>

      {/* College list */}
      <div
        className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        role="listbox"
        aria-label="College results"
      >
        <AnimatePresence mode="wait">
          {!isLoading && colleges.length === 0 ? (
            <EmptyState key="empty" query={query} />
          ) : (
            colleges.map((c, i) => (
              <CollegeCard
                key={c.id}
                college={c}
                isSelected={selectedValue === c.name}
                onClick={() => onSelect(c.name, c.id)}
                index={i}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Can't find */}
      <motion.button
        type="button"
        onClick={onCantFind}
        whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        style={{
          background: "rgba(124,58,237,0.04)",
          borderColor: "rgba(124,58,237,0.15)",
          color: "#8B5CF6",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.08)"
          ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.3)"
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.04)"
          ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.15)"
        }}
      >
        <span>I can&apos;t find my college</span>
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </div>
  )
}
