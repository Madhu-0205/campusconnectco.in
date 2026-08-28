"use client"

import { useRouter, useSearchParams } from "next/navigation"
import React, { useState, useEffect } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"

import { FilterBar, FilterOption } from "@/components/v2/FilterBar"
import { Opportunity, OpportunityFeed } from "@/components/v2/OpportunityFeed"

interface OpportunityDiscoveryClientProps {
  gigs: Opportunity[]
  hasMore?: boolean
  page?: number
}
 
export function OpportunityDiscoveryClient({ gigs, hasMore = false, page = 0 }: OpportunityDiscoveryClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Local state for snappy UI updates before the URL change finishes propagating
  const [localSearch, setLocalSearch] = useState(searchParams.get("q") || "")
  const [localCategory, setLocalCategory] = useState(searchParams.get("category") || "all")
  const [localType, setLocalType] = useState(searchParams.get("type") || "all")

  // Debounce search update to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (localSearch.trim()) {
        params.set("q", localSearch)
      } else {
        params.delete("q")
      }
      
      if (localCategory !== "all") {
        params.set("category", localCategory)
      } else {
        params.delete("category")
      }

      if (localType !== "all") {
        params.set("type", localType)
      } else {
        params.delete("type")
      }
      
      // Reset page to 0 when filters change (naive implementation: could check if they actually changed)
      // Actually, we'll let the user explicitly paginate. If they type, it resets.
      if (searchParams.get("q") !== localSearch || searchParams.get("category") !== localCategory || searchParams.get("type") !== localType) {
        params.delete("page")
      }

      router.replace(`?${params.toString()}`, { scroll: false })
    }, 400)

    return () => clearTimeout(handler)
  }, [localSearch, localCategory, localType, router, searchParams])

  const FILTERS: FilterOption[] = [
    { id: "all", label: "All Types" },
    { id: "gig", label: "Gigs" },
    { id: "internship", label: "Internships" },
  ]

  const CATEGORY_FILTERS: FilterOption[] = [
    { id: "all", label: "All Categories" },
    { id: "engineering", label: "Engineering" },
    { id: "design", label: "Design" },
    { id: "marketing", label: "Marketing" },
    { id: "content", label: "Content" },
    { id: "data", label: "Data Science" },
    { id: "sales", label: "Sales & BD" },
  ]

  const handleTypeToggle = (id: string) => {
    setLocalType(id === localType ? "all" : id)
  }

  const handleCategoryToggle = (id: string) => {
    setLocalCategory(id === localCategory ? "all" : id)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newPage > 0) {
      params.set("page", newPage.toString())
    } else {
      params.delete("page")
    }
    router.replace(`?${params.toString()}`, { scroll: true })
  }

  return (
    <div className="space-y-8 pb-32">
      <div className="sticky top-24 z-20 backdrop-blur-md p-3 rounded-2xl bg-surface/50 border border-border shadow-sm flex flex-col gap-3">
        <FilterBar
          filters={FILTERS}
          activeFilters={[localType]}
          onFilterToggle={handleTypeToggle}
          onSearch={setLocalSearch}
          className="w-full"
        />
        <div className="flex overflow-x-auto pb-1 no-scrollbar border-t border-border/50 pt-2">
          {CATEGORY_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => handleCategoryToggle(f.id)}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium mr-2 transition-colors ${localCategory === f.id ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-2 text-muted-foreground border border-border-subtle hover:text-foreground'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      
      <OpportunityFeed 
        opportunities={gigs} 
        emptyMessage="No opportunities found matching your filters. Try clearing your search or filters." 
      />

      {(page > 0 || hasMore) && (
        <div className="flex items-center justify-center gap-4 pt-8">
          <button 
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 border border-border text-sm font-medium disabled:opacity-50 hover:bg-surface-3 transition-colors"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="text-sm font-medium text-muted-foreground">Page {page + 1}</span>
          <button 
            onClick={() => handlePageChange(page + 1)}
            disabled={!hasMore}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 border border-border text-sm font-medium disabled:opacity-50 hover:bg-surface-3 transition-colors"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
