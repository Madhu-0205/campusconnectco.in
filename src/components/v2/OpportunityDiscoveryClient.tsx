"use client"

import { useRouter, useSearchParams } from "next/navigation"
import React, { useMemo, useState, useEffect } from "react"

import { FilterBar, FilterOption } from "@/components/v2/FilterBar"
import { Opportunity, OpportunityFeed } from "@/components/v2/OpportunityFeed"

// Using any here to bypass complex Supabase generated types for the client mapping,
// but we will cast safely.
 
export function OpportunityDiscoveryClient({ gigs }: { gigs: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Local state for snappy UI updates before the URL change finishes propagating
  const [localSearch, setLocalSearch] = useState(searchParams.get("q") || "")
  const [localCategory, setLocalCategory] = useState(searchParams.get("category") || "all")

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
      
      router.replace(`?${params.toString()}`, { scroll: false })
    }, 400)

    return () => clearTimeout(handler)
  }, [localSearch, localCategory, router, searchParams])

  // Top level categories for the FilterBar
  const FILTERS: FilterOption[] = [
    { id: "all", label: "All Opportunities" },
    { id: "engineering", label: "Engineering" },
    { id: "design", label: "Design" },
    { id: "marketing", label: "Marketing" },
    { id: "content", label: "Content" },
    { id: "data", label: "Data Science" },
    { id: "sales", label: "Sales & BD" },
  ]

  const handleFilterToggle = (id: string) => {
    // If clicking an already active filter, maybe reset to 'all'?
    // Wait, if it's 'all' and we click 'all', do nothing.
    // Let's implement single selection for simplicity right now, matching the backend category logic.
    if (id === localCategory) {
      setLocalCategory("all")
    } else {
      setLocalCategory(id)
    }
  }

  const mappedOpportunities: Opportunity[] = useMemo(() => {
    return gigs.map((gig) => {
      const companyName = gig.posted_by_user?.company_name || gig.posted_by_user?.full_name || "CampusConnect Partner"
      const logoUrl = gig.posted_by_user?.avatar_url || gig.posted_by_user?.image
      
      const skills = Array.isArray(gig.required_skills)
        ? gig.required_skills
        : typeof gig.required_skills === "string"
          ? gig.required_skills.split(",").map((s: string) => s.trim()).filter(Boolean)
          : []

      return {
        id: gig.id,
        type: gig.type === "internship" ? "internship" : "gig", // Use DB type if exists, else default to gig
        title: gig.title,
        company: companyName,
        location: gig.work_mode || "Remote",
        compensation: gig.budget ? `₹${gig.budget.toLocaleString("en-IN")}` : undefined,
        stipend: gig.budget ? `₹${gig.budget.toLocaleString("en-IN")}/mo` : undefined, // Assuming stipend structure
        duration: gig.duration || "Flexible",
        workType: gig.work_mode || "Remote",
        tags: skills.slice(0, 3), // Show top 3 skills
        logoUrl: logoUrl,
        href: `/gigs/${gig.id}`,
        isFeatured: gig.featured || false,
        isUrgent: false, // Maybe compute based on expires_at if we had it
      }
    })
  }, [gigs])

  return (
    <div className="space-y-8 pb-32">
      <FilterBar
        filters={FILTERS}
        activeFilters={[localCategory]}
        onFilterToggle={handleFilterToggle}
        onSearch={setLocalSearch}
        className="sticky top-24 z-20 backdrop-blur-md p-2 rounded-2xl bg-surface/50 "
      />
      
      <OpportunityFeed 
        opportunities={mappedOpportunities} 
        emptyMessage="No opportunities found matching your filters. Try clearing your search." 
      />
    </div>
  )
}
