"use client"

import {
  ChevronRight,
  ChevronLeft,
  Navigation,
  Loader2,
  AlertCircle,
  X,
  Crosshair,
  ArrowUpDown,
  RotateCw,
  SlidersHorizontal,
  Sparkles
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useState, useEffect, useCallback, useTransition, useRef, useMemo } from "react"

import { FilterBar, FilterOption, SearchSuggestionItem } from "@/components/v2/FilterBar"
import { useMapContext } from "@/components/v2/maps/MapContext"
import { Opportunity, OpportunityFeed } from "@/components/v2/OpportunityFeed"
import { useDeviceLocation, DeviceLocation } from "@/hooks/useDeviceLocation"
import { getAccuracyDescription } from "@/lib/geo/distance"
import { parseSearchIntent } from "@/lib/search/intent"

interface OpportunityDiscoveryClientProps {
  gigs: Opportunity[]
  hasMore?: boolean
  page?: number
}

const RADIUS_OPTIONS: { label: string; value: number | "all" }[] = [
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
  { label: "25 km", value: 25 },
  { label: "50 km", value: 50 },
  { label: "All India", value: "all" },
]

const WORK_MODE_FILTERS: { id: "all" | "on-site" | "remote" | "hybrid"; label: string }[] = [
  { id: "all", label: "All Modes" },
  { id: "on-site", label: "On-site" },
  { id: "hybrid", label: "Hybrid" },
  { id: "remote", label: "Remote" },
]

function useSafeMapContext() {
  try {
    return useMapContext()
  } catch {
    return null
  }
}

export function OpportunityDiscoveryClient({
  gigs,
  hasMore = false,
  page = 0,
}: OpportunityDiscoveryClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mapContext = useSafeMapContext()
  const [, startTransition] = useTransition()

  // Local state for filters
  const [localSearch, setLocalSearch] = useState(searchParams.get("q") || "")
  const [localLocation, setLocalLocation] = useState(searchParams.get("location") || "")
  const [localCategory, setLocalCategory] = useState(searchParams.get("category") || "all")
  const [localType, setLocalType] = useState(searchParams.get("type") || "all")
  const [localWorkMode, setLocalWorkMode] = useState<"all" | "on-site" | "remote" | "hybrid">((searchParams.get("workMode") as any) || "all")
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  
  // Search suggestions & Intent state
  const [suggestions, setSuggestions] = useState<SearchSuggestionItem[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  // Fetch real-entity search suggestions
  useEffect(() => {
    if (!localSearch || localSearch.trim().length < 2) {
      setSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true)
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(localSearch.trim())}`)
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data.suggestions || [])
        }
      } catch {
        // Ignore network errors
      } finally {
        setIsLoadingSuggestions(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [localSearch])

  // Parse natural search intent from user input
  const parsedIntent = useMemo(() => {
    if (!localSearch || localSearch.trim().length < 3) return null
    const intent = parseSearchIntent(localSearch)
    const hasFilters = Boolean(
      intent.detectedFilters.type ||
      intent.detectedFilters.workMode ||
      intent.detectedFilters.location ||
      intent.detectedFilters.nearMe
    )
    return hasFilters ? intent : null
  }, [localSearch])

  // Geolocation & Radius state
  const {
    status: geoStatus,
    location: deviceLoc,
    error: geoError,
    isRefreshing,
    requestLocation,
    refreshLocation,
    clearLocation: clearDeviceLoc
  } = useDeviceLocation()
  const [activeRadius, setActiveRadius] = useState<number | "all">(25)
  const [activeSort, setActiveSort] = useState<"distance" | "newest" | "compensation_high" | "compensation_low">("newest")
  
  // Opportunities feed state
  const [feedOpportunities, setFeedOpportunities] = useState<Opportunity[]>(gigs)
  const [feedHasMore, setFeedHasMore] = useState(hasMore)
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const [hasUserRequestedLocation, setHasUserRequestedLocation] = useState(false)

  // Sync with incoming server props when geolocation is not active
  useEffect(() => {
    if (!hasUserRequestedLocation || !deviceLoc) {
      setFeedOpportunities(gigs)
      setFeedHasMore(hasMore)
    }
  }, [gigs, hasMore, hasUserRequestedLocation, deviceLoc])

  const mapContextRef = useRef(mapContext)
  useEffect(() => {
    mapContextRef.current = mapContext
  }, [mapContext])
  const lastFetchedKeyRef = useRef("")

  // Fetch opportunities with geolocation, radius, location, and workMode parameters
  const fetchNearbyOpportunities = useCallback(async (
    loc: DeviceLocation | null,
    radius: number | "all",
    sort: "distance" | "newest" | "compensation_high" | "compensation_low",
    q: string,
    cat: string,
    typ: string,
    wm: "all" | "on-site" | "remote" | "hybrid" = "all",
    pageIndex: number = 0,
    force: boolean = false,
    locText: string = ""
  ) => {
    const fetchKey = `${loc ? `${loc.lat.toFixed(4)},${loc.lng.toFixed(4)}` : 'none'}-${radius}-${sort}-${q}-${cat}-${typ}-${wm}-${locText}-${pageIndex}`
    if (!force && lastFetchedKeyRef.current === fetchKey) return
    lastFetchedKeyRef.current = fetchKey

    setIsLoadingApi(true)
    try {
      const params = new URLSearchParams()
      if (q.trim()) params.set("q", q.trim())
      if (locText.trim()) params.set("location", locText.trim())
      if (cat !== "all") params.set("category", cat)
      if (typ !== "all") params.set("type", typ)
      if (wm !== "all") params.set("workMode", wm)
      params.set("sortBy", sort)
      params.set("page", pageIndex.toString())
      params.set("limit", "20")

      if (loc) {
        params.set("userLat", loc.lat.toString())
        params.set("userLng", loc.lng.toString())
        params.set("radiusKm", radius.toString())
      }

      const res = await fetch(`/api/opportunities?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch opportunities")
      
      const data = await res.json()
      setFeedOpportunities(data.opportunities || [])
      setFeedHasMore(data.hasMore || false)

      // Sync map markers if MapContext is available
      if (mapContextRef.current && Array.isArray(data.markers)) {
        mapContextRef.current.setMarkers(data.markers)
      }
    } catch (err) {
      console.error("[OpportunityDiscovery] Geolocation fetch error:", err)
    } finally {
      setIsLoadingApi(false)
    }
  }, [])

  // Debounce search/filter updates
  useEffect(() => {
    const handler = setTimeout(() => {
      if (hasUserRequestedLocation && deviceLoc) {
        fetchNearbyOpportunities(deviceLoc, activeRadius, activeSort, localSearch, localCategory, localType, localWorkMode, page, false, localLocation)
      } else {
        const params = new URLSearchParams(searchParams.toString())
        if (localSearch.trim()) params.set("q", localSearch)
        else params.delete("q")

        if (localLocation.trim()) params.set("location", localLocation)
        else params.delete("location")
        
        if (localCategory !== "all") params.set("category", localCategory)
        else params.delete("category")

        if (localType !== "all") params.set("type", localType)
        else params.delete("type")

        if (localWorkMode !== "all") params.set("workMode", localWorkMode)
        else params.delete("workMode")

        if (
          searchParams.get("q") !== localSearch ||
          searchParams.get("location") !== localLocation ||
          searchParams.get("category") !== localCategory ||
          searchParams.get("type") !== localType ||
          searchParams.get("workMode") !== localWorkMode
        ) {
          params.delete("page")
        }

        startTransition(() => {
          router.replace(`?${params.toString()}`, { scroll: false })
        })
      }
    }, 400)

    return () => clearTimeout(handler)
  }, [
    localSearch,
    localLocation,
    localCategory,
    localType,
    localWorkMode,
    hasUserRequestedLocation,
    deviceLoc,
    activeRadius,
    activeSort,
    page,
    fetchNearbyOpportunities,
    router,
    searchParams
  ])

  // Handle "Use my location" trigger
  const handleUseLocation = async () => {
    setHasUserRequestedLocation(true)
    const loc = await requestLocation()
    if (loc) {
      if (mapContext) {
        mapContext.setUserLocation({
          lat: loc.lat,
          lng: loc.lng,
          accuracy: loc.accuracy,
          accuracyTier: loc.accuracyTier,
        })
        mapContext.setLocationStatus("success")
        mapContext.setRadiusKm(25)
      }
      setActiveRadius(25)
      setActiveSort("distance")
      fetchNearbyOpportunities(loc, 25, "distance", localSearch, localCategory, localType, localWorkMode, 0)
    }
  }

  // Handle deliberate "Refresh location" action (forces fresh GPS with maximumAge: 0)
  const handleRefreshLocation = async () => {
    const loc = await refreshLocation()
    if (loc) {
      if (mapContextRef.current) {
        mapContextRef.current.setUserLocation({
          lat: loc.lat,
          lng: loc.lng,
          accuracy: loc.accuracy,
          accuracyTier: loc.accuracyTier,
        })
        mapContextRef.current.setLocationStatus("success")
      }
      fetchNearbyOpportunities(loc, activeRadius, activeSort, localSearch, localCategory, localType, localWorkMode, 0, true)
    }
  }

  // Handle clearing user location
  const handleClearLocation = () => {
    clearDeviceLoc()
    setHasUserRequestedLocation(false)
    setActiveRadius("all")
    setActiveSort("newest")
    lastFetchedKeyRef.current = ""
    if (mapContextRef.current) {
      mapContextRef.current.setUserLocation(null)
      mapContextRef.current.setLocationStatus("idle")
      mapContextRef.current.setRadiusKm("all")
    }
    // Re-fetch normal view
    fetchNearbyOpportunities(null, "all", "newest", localSearch, localCategory, localType, localWorkMode, 0, true)
  }

  // Handle radius selection
  const handleRadiusChange = (radius: number | "all") => {
    setActiveRadius(radius)
    if (mapContext) {
      mapContext.setRadiusKm(radius)
    }
    if (deviceLoc) {
      fetchNearbyOpportunities(deviceLoc, radius, activeSort, localSearch, localCategory, localType, localWorkMode, 0)
    }
  }

  // Handle sort change
  const handleSortChange = (sort: "distance" | "newest" | "compensation_high" | "compensation_low") => {
    setActiveSort(sort)
    if (deviceLoc && hasUserRequestedLocation) {
      fetchNearbyOpportunities(deviceLoc, activeRadius, sort, localSearch, localCategory, localType, localWorkMode, 0)
    } else {
      const params = new URLSearchParams(searchParams.toString())
      params.set("sort", sort)
      router.replace(`?${params.toString()}`, { scroll: false })
    }
  }

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

  const handleSelectSuggestion = (item: SearchSuggestionItem) => {
    if (item.filterKey === "type") {
      setLocalType(item.filterValue)
    } else if (item.filterKey === "location") {
      setLocalLocation(item.filterValue)
    } else if (item.filterKey === "category") {
      setLocalCategory(item.filterValue)
    } else {
      setLocalSearch(item.filterValue)
    }
  }

  const handleApplyIntent = () => {
    if (!parsedIntent) return
    if (parsedIntent.detectedFilters.type) setLocalType(parsedIntent.detectedFilters.type)
    if (parsedIntent.detectedFilters.workMode) setLocalWorkMode(parsedIntent.detectedFilters.workMode)
    if (parsedIntent.detectedFilters.location) setLocalLocation(parsedIntent.detectedFilters.location)
    if (parsedIntent.detectedFilters.nearMe && !isLocationActive) handleUseLocation()
    setLocalSearch(parsedIntent.keyword)
  }

  const handleResetAllFilters = () => {
    setLocalSearch("")
    setLocalLocation("")
    setLocalType("all")
    setLocalCategory("all")
    setLocalWorkMode("all")
    setActiveRadius(25)
    setActiveSort("newest")
    clearDeviceLoc()
    setHasUserRequestedLocation(false)
    router.replace("/opportunities", { scroll: false })
  }

  const handlePageChange = (newPage: number) => {
    if (deviceLoc && hasUserRequestedLocation) {
      fetchNearbyOpportunities(deviceLoc, activeRadius, activeSort, localSearch, localCategory, localType, localWorkMode, newPage, false, localLocation)
    } else {
      const params = new URLSearchParams(searchParams.toString())
      if (newPage > 0) params.set("page", newPage.toString())
      else params.delete("page")
      router.replace(`?${params.toString()}`, { scroll: true })
    }
  }

  const isLocationActive = Boolean(deviceLoc && geoStatus === "success")

  return (
    <div className="space-y-6 pb-32">
      {/* Search & Location Bar */}
      <div className="sticky top-24 z-20 backdrop-blur-md p-4 rounded-2xl bg-surface/85 border border-border shadow-sm flex flex-col gap-3 transition-all">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          <div className="flex-1">
            <FilterBar
              filters={FILTERS}
              activeFilters={[localType]}
              onFilterToggle={handleTypeToggle}
              onSearch={setLocalSearch}
              searchValue={localSearch}
              suggestions={suggestions}
              isLoadingSuggestions={isLoadingSuggestions}
              onSelectSuggestion={handleSelectSuggestion}
              className="w-full"
            />
          </div>

          {/* Location Action Button & Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {!isLocationActive ? (
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={geoStatus === "requesting"}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
                aria-label="Use device location to find nearby gigs and internships"
              >
                {geoStatus === "requesting" ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-primary" />
                    <span>Detecting location...</span>
                  </>
                ) : (
                  <>
                    <Navigation size={14} className="text-primary" />
                    <span>Use my location</span>
                  </>
                )}
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 text-xs font-semibold">
                <Crosshair size={13} className="text-emerald-600 shrink-0" />
                <span className="truncate max-w-36 sm:max-w-none">
                  {getAccuracyDescription(deviceLoc?.accuracyTier || "acceptable", deviceLoc?.accuracy)}
                </span>
                
                {/* Refresh Location Button */}
                <button
                  type="button"
                  onClick={handleRefreshLocation}
                  disabled={isRefreshing}
                  className="p-1 hover:bg-emerald-500/20 rounded-lg text-emerald-700 transition-colors ml-1 disabled:opacity-50"
                  title="Refresh location"
                  aria-label="Refresh location"
                >
                  <RotateCw size={12} className={isRefreshing ? "animate-spin text-emerald-600" : ""} />
                </button>

                {/* Clear Location Button */}
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="p-1 hover:bg-emerald-500/20 rounded-lg text-emerald-700 transition-colors"
                  title="Clear location filter"
                  aria-label="Clear location filter"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Natural Search Intent Banner */}
        {parsedIntent && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-foreground">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-primary flex items-center gap-1">
                <Sparkles size={13} />
                Smart Intent:
              </span>
              {parsedIntent.detectedFilters.type && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 font-medium">
                  {parsedIntent.detectedFilters.type === "internship" ? "Internships" : "Campus Gigs"}
                </span>
              )}
              {parsedIntent.detectedFilters.workMode && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 font-medium">
                  {parsedIntent.detectedFilters.workMode}
                </span>
              )}
              {parsedIntent.detectedFilters.location && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-medium">
                  📍 {parsedIntent.detectedFilters.location}
                </span>
              )}
              {parsedIntent.detectedFilters.nearMe && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 font-medium">
                  🎯 Near Me
                </span>
              )}
              {parsedIntent.keyword && (
                <span className="text-muted-foreground">
                  Keyword: <strong className="text-foreground">{parsedIntent.keyword}</strong>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleApplyIntent}
              className="px-2.5 py-1 rounded-lg bg-primary text-white text-[11px] font-semibold hover:bg-primary/90 transition-colors shadow-xs"
            >
              Apply Intent Filters
            </button>
          </div>
        )}

        {/* Active Filter Chips Bar */}
        {(localSearch || localCategory !== "all" || localType !== "all" || localWorkMode !== "all" || localLocation || isLocationActive) && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Active Filters:
            </span>

            {localSearch && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 border border-border text-xs font-medium text-foreground">
                <span>&ldquo;{localSearch}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => setLocalSearch("")}
                  className="p-0.5 hover:bg-surface-3 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Clear search keyword"
                  aria-label="Clear search keyword"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {localType !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-xs font-medium">
                <span>Type: <strong className="capitalize">{localType}</strong></span>
                <button
                  type="button"
                  onClick={() => setLocalType("all")}
                  className="p-0.5 hover:bg-emerald-500/20 rounded cursor-pointer"
                  title="Clear type filter"
                  aria-label="Clear type filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {localCategory !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
                <span>Category: <strong className="capitalize">{localCategory}</strong></span>
                <button
                  type="button"
                  onClick={() => setLocalCategory("all")}
                  className="p-0.5 hover:bg-primary/20 rounded cursor-pointer"
                  title="Clear category filter"
                  aria-label="Clear category filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {localWorkMode !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 border border-blue-500/20 text-xs font-medium">
                <span>Mode: <strong className="capitalize">{localWorkMode}</strong></span>
                <button
                  type="button"
                  onClick={() => setLocalWorkMode("all")}
                  className="p-0.5 hover:bg-blue-500/20 rounded cursor-pointer"
                  title="Clear work mode filter"
                  aria-label="Clear work mode filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {localLocation && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-800 border border-amber-500/20 text-xs font-medium">
                <span>City: <strong className="capitalize">{localLocation}</strong></span>
                <button
                  type="button"
                  onClick={() => setLocalLocation("")}
                  className="p-0.5 hover:bg-amber-500/20 rounded cursor-pointer"
                  title="Clear city filter"
                  aria-label="Clear city filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {isLocationActive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 text-xs font-medium">
                <span>Radius: <strong>{activeRadius === "all" ? "All India" : `${activeRadius} km`}</strong></span>
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="p-0.5 hover:bg-emerald-500/20 rounded cursor-pointer"
                  title="Clear location filter"
                  aria-label="Clear location filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetAllFilters}
              className="text-xs font-bold text-primary hover:underline ml-1 cursor-pointer"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Location Accuracy Notice for Coarse/Degraded Accuracy */}
        {isLocationActive && (deviceLoc?.accuracyTier === "degraded" || deviceLoc?.accuracyTier === "poor") && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs">
            <AlertCircle size={14} className="shrink-0 text-amber-600" />
            <span>Location accuracy is low ({deviceLoc.accuracy ? `±${Math.round(deviceLoc.accuracy)}m` : 'coarse'}). Nearby results may be approximate.</span>
          </div>
        )}

        {/* Location Error Notification */}
        {geoStatus === "error" && geoError && (
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{geoError.message}</span>
            </div>
            <button
              type="button"
              onClick={handleUseLocation}
              className="font-bold underline hover:opacity-80 shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Mobile Filter Toggle Button */}
        <div className="flex md:hidden items-center justify-between pt-2 border-t border-border/50">
          <span className="text-xs font-semibold text-muted-foreground">
            {isLocationActive ? "Location Active" : "Filters & Sorting"}
          </span>
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs font-semibold hover:bg-surface-3 transition-colors"
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>
        </div>

        {/* Filters & Controls: Work Mode + Category + Sort */}
        {/* Desktop inline view, Mobile drawer view */}
        <div className={`
          flex-col gap-2 pt-2 md:pt-2 md:border-t border-border/50
          md:flex 
          ${isMobileFiltersOpen 
            ? "fixed inset-0 z-50 bg-white/95 backdrop-blur-md p-6 flex flex-col pt-16 overflow-y-auto" 
            : "hidden"
          }
        `}>
          {isMobileFiltersOpen && (
            <div className="absolute top-4 right-4 flex items-center justify-between w-[calc(100%-2rem)]">
              <span className="text-lg font-bold text-foreground">Filters</span>
              <button 
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 bg-surface-2 rounded-full text-foreground hover:bg-surface-3 transition-colors"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* Work Mode and Sort Row */}
          <div className={`flex ${isMobileFiltersOpen ? 'flex-col gap-4' : 'items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar'}`}>
            {/* Work Mode Toggle Pills */}
            <div className={`flex ${isMobileFiltersOpen ? 'flex-col items-start gap-2' : 'items-center gap-1.5'}`}>
              <span className="text-[10px] uppercase font-bold text-muted-foreground mr-0.5">Mode:</span>
              <div className="flex flex-wrap gap-1.5">
                {WORK_MODE_FILTERS.map(wm => (
                  <button
                    key={wm.id}
                    type="button"
                    onClick={() => setLocalWorkMode(wm.id)}
                    className={`whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                      localWorkMode === wm.id
                        ? "bg-primary text-primary-foreground shadow-2xs font-bold"
                        : "bg-surface-2 text-muted-foreground hover:text-foreground border border-border/60"
                    }`}
                  >
                    {wm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Toggle */}
            <div className={`flex items-center gap-1 shrink-0 ${isMobileFiltersOpen ? 'w-full' : 'pl-2 border-l border-border/50'}`}>
              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <ArrowUpDown size={11} />
                {isMobileFiltersOpen && <span className="ml-1">Sort By</span>}
              </span>
              <select
                value={activeSort}
                onChange={e => handleSortChange(e.target.value as any)}
                aria-label="Sort opportunities"
                className={`bg-surface-2 border border-border text-xs rounded-lg px-2 py-1 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary ${isMobileFiltersOpen ? 'flex-1 ml-2 py-2 text-sm' : ''}`}
              >
                {isLocationActive && <option value="distance">Nearest First</option>}
                <option value="newest">Newest First</option>
                <option value="compensation_high">Highest Pay</option>
                <option value="compensation_low">Lowest Pay</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className={`flex ${isMobileFiltersOpen ? 'flex-col gap-2 mt-2' : 'items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar'}`}>
            <span className="text-[10px] uppercase font-bold text-muted-foreground mr-0.5">Category:</span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => handleCategoryToggle(f.id)}
                  className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    localCategory === f.id
                      ? "bg-primary/10 text-primary border border-primary/20 font-bold"
                      : "bg-surface-2 text-muted-foreground border border-border-subtle hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Geolocation Radius Selector */}
          {isLocationActive && (
            <div className={`flex ${isMobileFiltersOpen ? 'flex-col gap-2 mt-2' : 'items-center gap-2 pt-1 border-t border-border/40 text-xs'}`}>
              <span className="text-muted-foreground font-semibold text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Navigation size={10} className="text-primary" /> Radius:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {RADIUS_OPTIONS.map(opt => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleRadiusChange(opt.value)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition-all ${
                      activeRadius === opt.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-surface-2 hover:bg-surface-3 text-muted-foreground border border-border"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isMobileFiltersOpen && (
            <div className="mt-8 pt-4 border-t border-border/50">
              <button 
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-sm"
              >
                View Results
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Opportunity Feed with Distance Semantics */}
      {isLoadingApi ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs animate-pulse flex flex-col justify-between h-64"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-5 w-24 bg-slate-200 rounded-md" />
                  <div className="h-5 w-16 bg-slate-100 rounded-md" />
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-slate-200 rounded-md w-4/5" />
                    <div className="h-3.5 bg-slate-100 rounded-md w-1/2" />
                  </div>
                </div>
                <div className="mt-5 flex gap-3">
                  <div className="h-4 w-28 bg-slate-100 rounded-md" />
                  <div className="h-4 w-20 bg-slate-100 rounded-md" />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <div className="h-3.5 w-16 bg-slate-100 rounded-md" />
                <div className="h-3.5 w-20 bg-slate-200 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <OpportunityFeed
          opportunities={feedOpportunities}
          onResetFilters={handleResetAllFilters}
          emptyMessage={
            isLocationActive && activeRadius !== "all"
              ? localWorkMode === "remote"
                ? "Remote opportunities do not have geographic coordinates. Switch to 'All Modes' or remove the location filter to explore remote roles."
                : `No opportunities found within ${activeRadius} km of your location. Try increasing the radius to 50 km or All India.`
              : localWorkMode === "remote"
              ? "No remote opportunities found matching your filters. Try clearing some filters."
              : "No opportunities found matching your filters. Try clearing your search or filters."
          }
        />
      )}

      {/* Pagination Controls */}
      {(page > 0 || feedHasMore) && (
        <div className="flex items-center justify-center gap-4 pt-8">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0 || isLoadingApi}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 border border-border text-sm font-medium disabled:opacity-50 hover:bg-surface-3 transition-colors"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="text-sm font-medium text-muted-foreground">Page {page + 1}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={!feedHasMore || isLoadingApi}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 border border-border text-sm font-medium disabled:opacity-50 hover:bg-surface-3 transition-colors"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
