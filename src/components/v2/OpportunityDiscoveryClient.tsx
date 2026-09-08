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
  RotateCw
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useState, useEffect, useCallback, useTransition, useRef } from "react"

import { FilterBar, FilterOption } from "@/components/v2/FilterBar"
import { useMapContext } from "@/components/v2/maps/MapContext"
import { Opportunity, OpportunityFeed } from "@/components/v2/OpportunityFeed"
import { useDeviceLocation, DeviceLocation } from "@/hooks/useDeviceLocation"
import { getAccuracyDescription } from "@/lib/geo/distance"

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
  const [localCategory, setLocalCategory] = useState(searchParams.get("category") || "all")
  const [localType, setLocalType] = useState(searchParams.get("type") || "all")
  const [localWorkMode, setLocalWorkMode] = useState<"all" | "on-site" | "remote" | "hybrid">((searchParams.get("workMode") as any) || "all")
  
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

  // Fetch opportunities with geolocation, radius, and workMode parameters
  const fetchNearbyOpportunities = useCallback(async (
    loc: DeviceLocation | null,
    radius: number | "all",
    sort: "distance" | "newest" | "compensation_high" | "compensation_low",
    q: string,
    cat: string,
    typ: string,
    wm: "all" | "on-site" | "remote" | "hybrid" = "all",
    pageIndex: number = 0,
    force: boolean = false
  ) => {
    const fetchKey = `${loc ? `${loc.lat.toFixed(4)},${loc.lng.toFixed(4)}` : 'none'}-${radius}-${sort}-${q}-${cat}-${typ}-${wm}-${pageIndex}`
    if (!force && lastFetchedKeyRef.current === fetchKey) return
    lastFetchedKeyRef.current = fetchKey

    setIsLoadingApi(true)
    try {
      const params = new URLSearchParams()
      if (q.trim()) params.set("q", q.trim())
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
        fetchNearbyOpportunities(deviceLoc, activeRadius, activeSort, localSearch, localCategory, localType, localWorkMode, page)
      } else {
        const params = new URLSearchParams(searchParams.toString())
        if (localSearch.trim()) params.set("q", localSearch)
        else params.delete("q")
        
        if (localCategory !== "all") params.set("category", localCategory)
        else params.delete("category")

        if (localType !== "all") params.set("type", localType)
        else params.delete("type")

        if (localWorkMode !== "all") params.set("workMode", localWorkMode)
        else params.delete("workMode")

        if (
          searchParams.get("q") !== localSearch ||
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

  const handleResetAllFilters = () => {
    setLocalSearch("")
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
      fetchNearbyOpportunities(deviceLoc, activeRadius, activeSort, localSearch, localCategory, localType, localWorkMode, newPage)
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

        {/* Filters & Controls: Work Mode + Category + Sort */}
        <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
          {/* Work Mode and Sort Row */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
            {/* Work Mode Toggle Pills */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground mr-0.5">Mode:</span>
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

            {/* Sort Toggle */}
            <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-border/50">
              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <ArrowUpDown size={11} />
              </span>
              <select
                value={activeSort}
                onChange={e => handleSortChange(e.target.value as any)}
                aria-label="Sort opportunities"
                className="bg-surface-2 border border-border text-xs rounded-lg px-2 py-1 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {isLocationActive && <option value="distance">Nearest First</option>}
                <option value="newest">Newest First</option>
                <option value="compensation_high">Highest Pay</option>
                <option value="compensation_low">Lowest Pay</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] uppercase font-bold text-muted-foreground mr-0.5">Category:</span>
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

          {/* Active Geolocation Radius Selector */}
          {isLocationActive && (
            <div className="flex items-center gap-2 pt-1 border-t border-border/40 text-xs">
              <span className="text-muted-foreground font-semibold text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Navigation size={10} className="text-primary" /> Radius:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
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
        </div>
      </div>

      {/* Opportunity Feed with Distance Semantics */}
      {isLoadingApi ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-surface-2 animate-pulse border border-border"
            />
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
