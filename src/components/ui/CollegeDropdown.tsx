"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown, Loader2, X, Check } from "lucide-react"
import React, { useState, useRef, useEffect, useCallback, useId } from "react"

export interface CollegeDropdownItem {
  id: string
  name: string
  city?: string
  state?: string
  latitude?: number
  longitude?: number
  type?: string
}

export interface CollegeDropdownProps {
  value: string
  onChange: (value: string, college?: CollegeDropdownItem) => void
  onCollegeId?: (id: string) => void
  city?: string
  state?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
}

export function CollegeDropdown({
  value,
  onChange,
  onCollegeId,
  city,
  state,
  placeholder = "Select your college…",
  disabled = false,
  className = "",
  id,
}: CollegeDropdownProps) {
  const generatedId = useId()
  const componentId = id || generatedId
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [colleges, setColleges] = useState<CollegeDropdownItem[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const fetchColleges = useCallback(async (query: string, stateFilter?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set("q", query.trim())
      if (!query.trim() && stateFilter) params.set("state", stateFilter)
      const res = await fetch(`/api/colleges?${params.toString()}`)
      const data = await res.json()
      setColleges(data.colleges || [])
    } catch (err) {
      console.error("[CollegeDropdown] Fetch error:", err)
      setColleges([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const timeoutId = setTimeout(() => {
      fetchColleges(search, state)
    }, 250)
    return () => clearTimeout(timeoutId)
  }, [search, open, state, fetchColleges])

  // Handle outside click
  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("touchstart", handlePointerDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("touchstart", handlePointerDown)
    }
  }, [open])

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement | undefined
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" })
      }
    }
  }, [activeIndex])

  const handleSelect = (college: CollegeDropdownItem) => {
    onChange(college.name, college)
    if (onCollegeId) onCollegeId(college.id)
    setOpen(false)
    setSearch("")
    setActiveIndex(-1)
    triggerRef.current?.focus()
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("", undefined)
    if (onCollegeId) onCollegeId("")
    setSearch("")
    setActiveIndex(-1)
    triggerRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    if (!open) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault()
        setOpen(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
      return
    }

    if (e.key === "Escape") {
      e.preventDefault()
      setOpen(false)
      setActiveIndex(-1)
      triggerRef.current?.focus()
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => (prev < colleges.length - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : colleges.length - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (activeIndex >= 0 && colleges[activeIndex]) {
        handleSelect(colleges[activeIndex])
      } else if (colleges.length === 0 && search.trim()) {
        // Manual entry fallback
        const manualItem: CollegeDropdownItem = {
          id: "",
          name: search.trim(),
          city: city || "",
          state: state || "",
        }
        handleSelect(manualItem)
      }
    } else if (e.key === "Tab") {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`} id={`${componentId}-wrapper`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id={componentId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="College or University selector"
        onClick={() => {
          if (disabled) return
          const nextOpen = !open
          setOpen(nextOpen)
          if (nextOpen) {
            setTimeout(() => inputRef.current?.focus(), 60)
          }
        }}
        onKeyDown={handleKeyDown}
        className={`w-full bg-surface border border-border text-left p-3.5 rounded-xl outline-none transition-all flex items-center justify-between gap-2 shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary ${
          disabled ? "opacity-60 cursor-not-allowed" : "hover:border-primary/40"
        } ${value ? "border-border font-semibold text-foreground" : "text-muted-foreground"}`}
      >
        <span className="truncate flex-1 text-sm font-medium">
          {value || placeholder}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleClear(e as any)
                }
              }}
              title="Clear selection"
              aria-label="Clear college selection"
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown
            size={16}
            className={`text-muted-foreground transition-transform duration-200 ${
              open ? "rotate-180 text-primary" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Overlay with High Contrast & Layering */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden backdrop-blur-md"
            style={{
              maxHeight: "360px",
              boxShadow: "0 12px 36px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.08)",
            }}
          >
            {/* Search Input inside popover */}
            <div className="p-2.5 border-b border-border bg-surface-2/60 flex items-center gap-2 px-3">
              <Search size={15} className="text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search college, city, or state…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setActiveIndex(-1)
                }}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none py-1.5 text-sm font-medium"
                autoComplete="off"
                aria-label="Search colleges"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("")
                    inputRef.current?.focus()
                  }}
                  className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                  aria-label="Clear search text"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Listbox */}
            <ul
              ref={listRef}
              role="listbox"
              id={`${componentId}-listbox`}
              aria-label="Colleges list"
              className="max-h-56 overflow-y-auto py-1 overscroll-contain divide-y divide-border/20"
            >
              {loading ? (
                <li className="px-4 py-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 size={15} className="animate-spin text-primary" />
                  <span>Searching colleges…</span>
                </li>
              ) : colleges.length === 0 ? (
                <li className="px-4 py-4 text-center text-sm text-muted-foreground">
                  <p>No colleges found.</p>
                  {search.trim() && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSelect({
                          id: "",
                          name: search.trim(),
                          city: city || "",
                          state: state || "",
                        })
                      }
                      className="mt-2 w-full px-3 py-2 text-xs bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      Use &quot;{search.trim()}&quot; as college name
                    </button>
                  )}
                </li>
              ) : (
                colleges.map((college, idx) => {
                  const isSelected = value === college.name
                  const isActive = activeIndex === idx

                  return (
                    <li key={college.id || `${college.name}-${idx}`}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(college)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? "bg-primary/15 text-primary font-bold"
                            : isActive
                            ? "bg-accent/80 text-foreground"
                            : "hover:bg-accent/50 text-foreground"
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <span className={`block truncate ${isSelected ? "text-primary font-bold" : "text-foreground font-semibold"}`}>
                            {college.name}
                          </span>
                          {(college.city || college.state) && (
                            <span className="block text-xs text-muted-foreground truncate mt-0.5">
                              {[college.city, college.state].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </div>

                        {isSelected && (
                          <Check size={16} className="text-primary shrink-0" />
                        )}
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
