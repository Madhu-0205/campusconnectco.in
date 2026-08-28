"use client"

import { Search, Navigation, MapPin, Map as MapIcon } from"lucide-react"
import * as maplibregl from"maplibre-gl"
import React, { useEffect, useRef, useState, useCallback } from"react"

import"maplibre-gl/dist/maplibre-gl.css"
import { reverseGeocode, geocodeLocation, GeoLocation } from"@/lib/maps/geocoding"
import { MAP_CONFIG } from"@/lib/maps/map-config"

interface LocationMapProps {
 initialLat?: number
 initialLng?: number
 onLocationSelect: (location: GeoLocation) => void
 onGeocodeFailed?: () => void
 className?: string
}

export function LocationMap({ initialLat = 20.5937, initialLng = 78.9629, onLocationSelect, onGeocodeFailed, className ="" }: LocationMapProps) {
 const mapContainer = useRef<HTMLDivElement>(null)
 const map = useRef<maplibregl.Map | null>(null)
 const marker = useRef<maplibregl.Marker | null>(null)
 const [searchQuery, setSearchQuery] = useState("")
 const [isLoading, setIsLoading] = useState(false)
 const [error, setError] = useState("")
 const [mapError, setMapError] = useState(false)

 const updateLocation = useCallback(async (lat: number, lng: number) => {
 setIsLoading(true)
 setError("")
 const location = await reverseGeocode(lat, lng)
 if (location) {
 onLocationSelect(location)
 setSearchQuery(location.city || location.district || location.state ||"")
 } else {
 setError("We couldn't identify this location. You can type your city below.")
 onGeocodeFailed?.()
 }
 setIsLoading(false)
 }, [onLocationSelect, onGeocodeFailed])

 useEffect(() => {
 if (map.current || !mapContainer.current || mapError) return

 try {
 map.current = new maplibregl.Map({
 container: mapContainer.current,
 style: MAP_CONFIG.STYLE_URL_LIGHT,
 center: [initialLng, initialLat],
 zoom: MAP_CONFIG.DEFAULT_ZOOM,
 attributionControl: false,
 })

 map.current.on('error', (e) => {
 console.warn('MapLibre error encountered:', e);
 setMapError(true);
 // Notify parent so it can switch to manual entry
 onGeocodeFailed?.();
 });

 map.current.addControl(new maplibregl.NavigationControl(),"bottom-right")

 marker.current = new maplibregl.Marker({
 draggable: true,
 color:"#1fa971" // Vivid green primary
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
 } catch (err) {
 console.warn('MapLibre initialization failed:', err);
 setTimeout(() => {
 setMapError(true);
 onGeocodeFailed?.();
 }, 0);
 }

 return () => {
 map.current?.remove()
 map.current = null
 }
 }, [initialLat, initialLng, mapError, onGeocodeFailed, updateLocation])

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
 setError("Location not found. Try typing your city and state below.")
 onGeocodeFailed?.()
 }
 setIsLoading(false)
 }

 const useCurrentLocation = () => {
 if (!navigator.geolocation) {
 setError("Geolocation is not supported by your browser")
 onGeocodeFailed?.()
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
 setError("Location permission denied. You can type your city and state below.")
 onGeocodeFailed?.()
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
 className="w-full bg-surface border border-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
 />
 </div>
 <button
 type="button"
 onClick={useCurrentLocation}
 className="px-4 py-3 bg-surface hover:bg-surface-2 border border-border rounded-xl transition-all text-primary flex items-center justify-center shrink-0"
 title="Use current location"
 >
 <Navigation className="w-5 h-5" />
 </button>
 </form>

 {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

 <div className="relative w-full h-100 rounded-2xl overflow-hidden border border-border shadow-2xl">
 {mapError ? (
 <div className="absolute inset-0 bg-surface flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-2xl gap-3">
 <MapIcon className="w-12 h-12 text-muted-foreground/50" />
 <h3 className="text-sm font-medium text-foreground">Map Preview Unavailable</h3>
 <p className="text-xs text-muted-foreground max-w-65">
 The interactive map couldn&apos;t load. Use the search bar above or detect your location via GPS below.
 </p>
 <button
 type="button"
 onClick={useCurrentLocation}
 className="mt-1 flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-light rounded-xl text-primary-foreground text-xs font-bold transition-all"
 >
 <Navigation className="w-3.5 h-3.5" /> Detect via GPS
 </button>
 </div>
 ) : (
 <>
 <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
 
 {isLoading && (
 <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
 </div>
 )}
 
 <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground flex items-center gap-2">
 <MapPin size={14} className="text-primary" />
 Drag marker to adjust
 </div>
 </>
 )}
 </div>
 </div>
 )
}
