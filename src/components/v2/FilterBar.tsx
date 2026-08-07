"use client"

import { motion, LayoutGroup } from "framer-motion"
import { Search, SlidersHorizontal, X } from "lucide-react"
import React, { } from "react"

import { cn } from "@/lib/utils"

export interface FilterOption {
  id: string
  label: string
}

interface FilterBarProps {
  filters: FilterOption[]
  activeFilters: string[]
  onFilterToggle: (id: string) => void
  onSearch?: (query: string) => void
  className?: string
}

export const FilterBar = ({
  filters,
  activeFilters,
  onFilterToggle,
  onSearch,
  className
}: FilterBarProps) => {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-4", className)}>
      {/* Search Input */}
      <div className="relative flex-1 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
        <input
          type="text"
          placeholder="Search opportunities..."
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full rounded-xl border border-transparent bg-surface-2 px-10 py-2.5 text-sm outline-none transition-all duration-300 focus:border-border focus:bg-surface focus:shadow-glow-primary placeholder:text-muted-foreground"
        />
        <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
