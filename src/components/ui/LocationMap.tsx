"use client"

import React, { useEffect, useRef, useState } from "react"
import * as maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { reverseGeocode, geocodeLocation, GeoLocation } from "@/lib/maps/geocoding"
import { Search, Navigation, MapPin } from "lucide-react"

interface LocationMapProps {
  initialLat?: number
  initialLng?: number
  onLocationSelect: (location: GeoLocation) => void
  className?: string
}

export function LocationMap({ initialLat = 20.5937, initialLng = 78.9629, onLocationSelect, className = "" }: LocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const marker = useRef<maplibregl.Marker | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json", // Free OSM based style
      center: [initialLng, initialLat],
      zoom: initialLat === 20.5937 ? 4 : 12 // Zoom out for India, zoom in for specific
    })

    marker.current = new maplibregl.Marker({
      draggable: true,
      color: "#6366f1"
    })
      .setLngLat([initialLng, initialLat])
      .addTo(map.current)

    // Handle marker drag
    marker.current.on('dragend', async () => {
      const lngLat = marker.current?.getLngLat()
      if (lngLat) {
        await updateLocation(lngLat.lat, lngLat.lng)
      }
    })

    // Handle map click
    map.current.on('click', async (e: maplibregl.MapMouseEvent) => {
      const { lat, lng } = e.lngLat
      marker.current?.setLngLat([lng, lat])
      await updateLocation(lat, lng)
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [initialLat, initialLng])

  const updateLocation = async (lat: number, lng: number) => {
    setIsLoading(true)
    setError("")
    const location = await reverseGeocode(lat, lng)
    if (location) {
      onLocationSelect(location)
      setSearchQuery(location.city || location.district || location.state || "")
    } else {
      setError("Failed to identify location. Please try again.")
    }
    setIsLoading(false)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setError("")
    const location = await geocodeLocation(searchQuery)
    
    if (location && map.current && marker.current) {
      map.current.flyTo({ center: [location.longitude, location.latitude], zoom: 12 })
      marker.current.setLngLat([location.longitude, location.latitude])
      onLocationSelect(location)
    } else {
      setError("Location not found.")
    }
    setIsLoading(false)
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        if (map.current && marker.current) {
          map.current.flyTo({ center: [longitude, latitude], zoom: 12 })
          marker.current.setLngLat([longitude, latitude])
        }
        await updateLocation(latitude, longitude)
      },
      () => {
        setError("Unable to retrieve your location. Please check permissions.")
        setIsLoading(false)
      }
    )
  }

  return (
    <div className={`flex flex-col gap-4 w-full ${className}`}>
      <form onSubmit={handleSearch} className="flex gap-2 relative z-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for your city or area..."
            className="w-full bg-[#1A1A24] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-white placeholder:text-muted-foreground"
          />
        </div>
        <button
          type="button"
          onClick={useCurrentLocation}
          className="px-4 py-3 bg-[#1A1A24] hover:bg-white/10 border border-white/10 rounded-xl transition-all text-indigo-400 flex items-center justify-center shrink-0"
          title="Use current location"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </form>

      {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

      <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
        
        {isLoading && (
          <div className="absolute inset-0 bg-[#0A0A0F]/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        )}
        
        <div className="absolute top-4 left-4 z-10 bg-[#0A0A0F]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-white flex items-center gap-2">
          <MapPin size={14} className="text-indigo-400" />
          Drag marker to adjust
        </div>
      </div>
    </div>
  )
}
