"use client"

import { Search, Navigation, MapPin, Map as MapIcon, Loader2, X } from "lucide-react"
import * as maplibregl from "maplibre-gl"
import React, { useEffect, useRef, useState, useCallback } from "react"

import "maplibre-gl/dist/maplibre-gl.css"
import { reverseGeocode, geocodeLocation, GeoLocation } from "@/lib/maps/geocoding"
import { MAP_CONFIG } from "@/lib/maps/map-config"

interface LocationMapProps {
  initialLat?: number
  initialLng?: number
  onLocationSelect: (location: GeoLocation) => void
  onGeocodeFailed?: () => void
  className?: string
}

interface LocationSearchResult {
  id: string
  name: string
  city: string
  state: string
  latitude: number
  longitude: number
  isCollege?: boolean
}

export function LocationMap({
  initialLat = 20.5937,
  initialLng = 78.9629,
  onLocationSelect,
  onGeocodeFailed,
  className = "",
}: LocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const marker = useRef<maplibregl.Marker | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [mapError, setMapError] = useState(false)

  const searchRequestId = useRef(0)
  const isDraggingMarker = useRef(false)
  const latestOnLocationSelect = useRef(onLocationSelect)
  latestOnLocationSelect.current = onLocationSelect
  const latestOnGeocodeFailed = useRef(onGeocodeFailed)
  latestOnGeocodeFailed.current = onGeocodeFailed

  // Reverse geocode when dragging or clicking
  const updateLocationFromCoords = useCallback(async (lat: number, lng: number) => {
    setIsLoading(true)
    setError("")
    try {
      const location = await reverseGeocode(lat, lng)
      if (location) {
        latestOnLocationSelect.current(location)
        setSearchQuery([location.city, location.state].filter(Boolean).join(", "))
      } else {
        // Fallback: still notify parent with known coords
        latestOnLocationSelect.current({
          city: "",
          state: "",
          district: "",
          country: "India",
          latitude: lat,
          longitude: lng,
          displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        })
        setError("Location details couldn't be auto-detected. You can type your city and state below.")
      }
    } catch {
      latestOnGeocodeFailed.current?.()
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initialize MapLibre ONCE on mount
  useEffect(() => {
    if (map.current || !mapContainer.current || mapError) return

    try {
      if (typeof window !== "undefined") {
        maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs")
      }

      const mapInstance = new maplibregl.Map({
        container: mapContainer.current,
        style: MAP_CONFIG.STYLE_URL_LIGHT,
        center: [initialLng, initialLat],
        zoom: initialLat !== 20.5937 ? 13 : MAP_CONFIG.DEFAULT_ZOOM,
        attributionControl: false,
      })

      map.current = mapInstance

      mapInstance.on("error", (e) => {
        console.warn("MapLibre runtime error:", e)
        setMapError(true)
        latestOnGeocodeFailed.current?.()
      })

      mapInstance.addControl(new maplibregl.NavigationControl(), "bottom-right")

      const markerInstance = new maplibregl.Marker({
        draggable: true,
        color: "#1FA971", // Vivid CampusConnect green
      })
        .setLngLat([initialLng, initialLat])
        .addTo(mapInstance)

      marker.current = markerInstance

      markerInstance.on("dragstart", () => {
        isDraggingMarker.current = true
      })

      markerInstance.on("dragend", async () => {
        isDraggingMarker.current = false
        const lngLat = markerInstance.getLngLat()
        if (lngLat) {
          await updateLocationFromCoords(lngLat.lat, lngLat.lng)
        }
      })

      mapInstance.on("click", async (e: maplibregl.MapMouseEvent) => {
        const { lat, lng } = e.lngLat
        markerInstance.setLngLat([lng, lat])
        await updateLocationFromCoords(lat, lng)
      })
    } catch (err) {
      console.warn("MapLibre initialization failed:", err)
      setMapError(true)
      latestOnGeocodeFailed.current?.()
    }

    return () => {
      map.current?.remove()
      map.current = null
      marker.current = null
    }
  }, [mapError, updateLocationFromCoords])

  // Imperatively move map and marker when external coordinates change (e.g., college selection)
  useEffect(() => {
    if (!map.current || !marker.current || isDraggingMarker.current) return
    if (!initialLat || !initialLng) return

    // If both are at India defaults and map is initialized, no need to snap
    if (initialLat === 20.5937 && initialLng === 78.9629) return

    const currentLngLat = marker.current.getLngLat()
    const diffLat = Math.abs(currentLngLat.lat - initialLat)
    const diffLng = Math.abs(currentLngLat.lng - initialLng)

    if (diffLat > 0.0001 || diffLng > 0.0001) {
      marker.current.setLngLat([initialLng, initialLat])
      map.current.flyTo({
        center: [initialLng, initialLat],
        zoom: 13.5,
        essential: true,
      })
    }
  }, [initialLat, initialLng])

  // Live suggestions for Search Input (combining authoritative colleges & geocoding)
  useEffect(() => {
    const q = searchQuery.trim()
    if (q.length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    const currentReqId = ++searchRequestId.current
    setIsSearching(true)

    const timer = setTimeout(async () => {
      try {
        // Query colleges dataset first
        const collegeRes = await fetch(`/api/colleges?q=${encodeURIComponent(q)}&limit=6`)
        const collegeData = await collegeRes.json()

        if (currentReqId !== searchRequestId.current) return

        const colleges: LocationSearchResult[] = (collegeData.colleges || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          city: c.city,
          state: c.state,
          latitude: c.latitude,
          longitude: c.longitude,
          isCollege: true,
        }))

        setSearchResults(colleges)
      } catch (err) {
        console.error("Search suggestions error:", err)
      } finally {
        if (currentReqId === searchRequestId.current) {
          setIsSearching(false)
        }
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const selectSearchResult = (item: LocationSearchResult) => {
    setShowResults(false)
    setSearchQuery(item.name)
    setError("")

    if (map.current && marker.current) {
      map.current.flyTo({
        center: [item.longitude, item.latitude],
        zoom: 14,
        essential: true,
      })
      marker.current.setLngLat([item.longitude, item.latitude])
    }

    latestOnLocationSelect.current({
      city: item.city || "",
      state: item.state || "",
      district: item.city || "",
      country: "India",
      latitude: item.latitude,
      longitude: item.longitude,
      displayName: item.name,
    })
  }

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowResults(false)
    const q = searchQuery.trim()
    if (!q) return

    setIsLoading(true)
    setError("")

    try {
      // 1. Check if there is an authoritative college match
      const collegeRes = await fetch(`/api/colleges?q=${encodeURIComponent(q)}&limit=1`)
      const collegeData = await collegeRes.json()
      const topCollege = collegeData.colleges?.[0]

      if (topCollege && topCollege.latitude && topCollege.longitude) {
        selectSearchResult({
          id: topCollege.id,
          name: topCollege.name,
          city: topCollege.city,
          state: topCollege.state,
          latitude: topCollege.latitude,
          longitude: topCollege.longitude,
          isCollege: true,
        })
        setIsLoading(false)
        return
      }

      // 2. Fall back to external geocoding
      const location = await geocodeLocation(q)
      if (location && map.current && marker.current) {
        map.current.flyTo({
          center: [location.longitude, location.latitude],
          zoom: 12.5,
          essential: true,
        })
        marker.current.setLngLat([location.longitude, location.latitude])
        latestOnLocationSelect.current(location)
      } else {
        setError("Location not found. Try searching by city name or enter manually below.")
        latestOnGeocodeFailed.current?.()
      }
    } catch {
      setError("Unable to resolve location. Please enter your city and state below.")
      latestOnGeocodeFailed.current?.()
    } finally {
      setIsLoading(false)
    }
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      latestOnGeocodeFailed.current?.()
      return
    }

    setIsLoading(true)
    setError("")
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        if (map.current && marker.current) {
          map.current.flyTo({ center: [longitude, latitude], zoom: 13.5, essential: true })
          marker.current.setLngLat([longitude, latitude])
        }
        await updateLocationFromCoords(latitude, longitude)
      },
      () => {
        setError("Location permission denied. You can enter your city and state below.")
        latestOnGeocodeFailed.current?.()
        setIsLoading(false)
      },
      { timeout: 10000, maximumAge: 300000 }
    )
  }

  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      {/* Search Input Bar */}
      <div className="relative z-30">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowResults(true)
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Search for college, campus, city, or area…"
              className="w-full bg-surface border border-border rounded-xl py-3 pl-10 pr-9 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all text-foreground placeholder:text-muted-foreground font-medium shadow-xs"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("")
                  setSearchResults([])
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={useCurrentLocation}
            className="px-4 py-3 bg-surface hover:bg-surface-2 border border-border rounded-xl transition-all text-primary flex items-center justify-center shrink-0 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            title="Use device GPS location"
            aria-label="Use device GPS location"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </form>

        {/* Live Search Suggestions Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50 divide-y divide-border/20 max-h-60 overflow-y-auto"
            style={{
              boxShadow: "0 12px 32px -4px rgba(0, 0, 0, 0.12)",
            }}
          >
            {searchResults.map((item) => (
              <button
                key={item.id || item.name}
                type="button"
                onClick={() => selectSearchResult(item)}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-accent/60 transition-colors flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground truncate">{item.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {[item.city, item.state].filter(Boolean).join(", ")}
                  </div>
                </div>
                {item.isCollege && (
                  <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                    Campus
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-rose-500 text-xs font-semibold px-1">{error}</p>}

      {/* Map Container */}
      <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-border shadow-md bg-surface-2">
        {mapError ? (
          <div className="absolute inset-0 bg-surface flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-2xl gap-3">
            <MapIcon className="w-12 h-12 text-muted-foreground/50" />
            <h3 className="text-sm font-semibold text-foreground">Map Preview Unavailable</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              Map service is temporarily offline. Search your college above or enter your city and state below.
            </p>
            <button
              type="button"
              onClick={useCurrentLocation}
              className="mt-1 flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-light rounded-xl text-primary-foreground text-xs font-bold transition-all shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5" /> Detect via GPS
            </button>
          </div>
        ) : (
          <>
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

            {isLoading && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-xs flex items-center justify-center z-10">
                <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl shadow-lg border border-border text-xs font-bold text-foreground">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Locating…</span>
                </div>
              </div>
            )}

            <div className="absolute top-3 left-3 z-10 bg-card/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground flex items-center gap-2 shadow-xs">
              <MapPin size={13} className="text-primary" />
              <span>Drag marker or click map to adjust</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
