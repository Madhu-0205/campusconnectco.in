"use client"

import { motion, LayoutGroup, AnimatePresence } from "framer-motion"
import { Search, SlidersHorizontal, X, MapPin, Briefcase, Sparkles, Building2, GraduationCap } from "lucide-react"
import React, { useState, useRef, useEffect } from "react"

import { cn } from "@/lib/utils"

export interface FilterOption {
  id: string
  label: string
}

export interface SearchSuggestionItem {
  label: string
  type: 'skill' | 'city' | 'category' | 'company' | 'type' | 'college'
  filterValue: string
  filterKey: 'q' | 'location' | 'category' | 'type'
  meta?: string
}

interface FilterBarProps {
  filters: FilterOption[]
  activeFilters: string[]
  onFilterToggle: (id: string) => void
  onSearch?: (query: string) => void
  searchValue?: string
  suggestions?: SearchSuggestionItem[]
  isLoadingSuggestions?: boolean
  onSelectSuggestion?: (suggestion: SearchSuggestionItem) => void
  className?: string
}

export const FilterBar = ({
  filters,
  activeFilters,
  onFilterToggle,
  onSearch,
  searchValue = "",
  suggestions = [],
  isLoadingSuggestions = false,
  onSelectSuggestion,
  className
}: FilterBarProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault()
        handleSelect(suggestions[selectedIndex])
      }
    } else if (e.key === "Escape") {
      setIsOpen(false)
      setSelectedIndex(-1)
    }
  }

  const handleSelect = (item: SearchSuggestionItem) => {
    setIsOpen(false)
    setSelectedIndex(-1)
    onSelectSuggestion?.(item)
  }

  const getSuggestionIcon = (type: SearchSuggestionItem['type']) => {
    switch (type) {
      case 'city':
        return <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
      case 'type':
        return <Briefcase className="h-3.5 w-3.5 text-purple-500 shrink-0" />
      case 'company':
        return <Building2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
      case 'college':
        return <GraduationCap className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
      default:
        return <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
    }
  }

  return (
    <div className={cn("flex flex-col sm:flex-row gap-4", className)}>
      {/* Search Input & Dropdown */}
      <div ref={containerRef} className="relative flex-1 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors z-10" />
        
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          placeholder="Search skills, roles, cities, or colleges..."
          onChange={(e) => {
            onSearch?.(e.target.value)
            setIsOpen(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-xl border border-transparent bg-surface-2 px-10 py-2.5 text-sm outline-none transition-all duration-300 focus:border-border focus:bg-surface focus:shadow-glow-primary placeholder:text-muted-foreground"
        />

        {searchValue && (
          <button
            type="button"
            onClick={() => {
              onSearch?.("")
              inputRef.current?.focus()
            }}
            className="absolute right-9 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {isOpen && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full mt-1.5 z-50 overflow-hidden rounded-xl border border-border bg-surface/95 backdrop-blur-md shadow-xl py-1"
            >
              <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Suggested Searches</span>
                {isLoadingSuggestions && <span className="text-[10px] animate-pulse">Loading...</span>}
              </div>

              <div className="max-h-64 overflow-y-auto">
                {suggestions.map((item, idx) => {
                  const isSelected = idx === selectedIndex
                  return (
                    <button
                      key={`${item.type}-${item.filterValue}-${idx}`}
                      type="button"
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors",
                        isSelected ? "bg-primary/10 text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {getSuggestionIcon(item.type)}
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.meta && (
                        <span className="text-[10px] text-muted-foreground/70 bg-surface-2 px-1.5 py-0.5 rounded border border-border-subtle shrink-0 ml-2">
                          {item.meta}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <LayoutGroup>
          {filters.map((filter) => {
            const isActive = activeFilters.includes(filter.id)
            return (
              <motion.button
                layout
                key={filter.id}
                onClick={() => onFilterToggle(filter.id)}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                  isActive
                    ? "border-primary/20 text-foreground"
                    : "border-border-subtle bg-surface-2 text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="filter-active"
                    className="absolute inset-0 -z-10 rounded-full bg-primary/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {filter.label}
                {isActive && <X className="h-3 w-3" />}
              </motion.button>
            )
          })}
        </LayoutGroup>
      </div>
    </div>
  )
}
