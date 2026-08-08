"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown, Loader2 } from "lucide-react"

export function CollegeDropdown({
  value,
  onChange,
  onCollegeId,
  city,
  state
}: { 
  value: string; 
  onChange: (v: string) => void;
  onCollegeId?: (id: string) => void;
  city?: string;
  state?: string;
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [colleges, setColleges] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function fetchColleges() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.set("q", search)
        if (!search && state) params.set("state", state)
        const res = await fetch(`/api/colleges?${params.toString()}`)
        const data = await res.json()
        setColleges(data.colleges || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    const timeoutId = setTimeout(() => {
      if (open) fetchColleges()
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [search, open, state])

  useEffect(() => {
    function handleOut(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOut)
    return () => document.removeEventListener("mousedown", handleOut)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setTimeout(() => inputRef.current?.focus(), 100) }}
        className="w-full bg-[#111116] border border-border text-left p-3.5 rounded-xl focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/50 outline-none transition-all flex items-center justify-between"
      >
        <span className={value ? "text-white font-medium text-sm" : "text-slate-600 text-sm"}>
          {value || "Select your college…"}
        </span>
        <ChevronDown size={16} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-[#131929] border border-border rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            <div className="p-2 border-b border-white/5 flex items-center gap-2 px-3">
              <Search size={14} className="text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search college…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none py-2 text-sm"
              />
            </div>
            <ul className="max-h-52 overflow-y-auto py-1">
              {loading ? (
                <li className="px-4 py-3 text-center text-sm text-slate-500 flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Fetching...</li>
              ) : colleges.length === 0 ? (
                <li className="px-4 py-3 text-center text-sm text-slate-500">No colleges found. Type to add manually.</li>
              ) : colleges.map(college => (
                <li key={college.id}>
                  <button
                    type="button"
                    onClick={() => { 
                      onChange(college.name); 
                      if (onCollegeId) onCollegeId(college.id);
                      setOpen(false); 
                      setSearch(""); 
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-violet-600/20 hover:text-white ${value === college.name ? "bg-violet-600/20 text-white font-bold" : "text-slate-400"}`}
                  >
                    <div className="font-medium text-white">{college.name}</div>
                    <div className="text-xs text-slate-500">{college.city}, {college.state}</div>
                  </button>
                </li>
              ))}
              {search && colleges.length === 0 && (
                <li>
                  <button
                    type="button"
                    onClick={() => { 
                      onChange(search); 
                      if (onCollegeId) onCollegeId("");
                      setOpen(false); 
                    }}
                    className="w-full px-4 py-3 text-left text-sm bg-violet-600/10 text-violet-400 font-medium hover:bg-violet-600/20 transition-colors"
                  >
                    Add "{search}" manually
                  </button>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
