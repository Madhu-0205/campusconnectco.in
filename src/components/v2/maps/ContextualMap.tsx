"use client"

import * as maplibregl from"maplibre-gl"
import React, { useEffect, useRef, useState } from"react"
import { createRoot, Root } from"react-dom/client"

import"maplibre-gl/dist/maplibre-gl.css"
import { MAP_CONFIG } from"@/lib/maps/map-config"

import { useMapContext, MarkerData } from"./MapContext"

import { MapPin, Briefcase, GraduationCap, X } from"lucide-react"
import { motion, AnimatePresence } from"framer-motion"

// Custom HTML Markers
function UserLocationMarker() {
 return (
 <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 border-2 border-primary/50 shadow-[0_0_15px_rgba(31,169,113,0.5)]">
 <div className="w-3 h-3 bg-primary rounded-full animate-ping absolute" />
 <div className="w-3 h-3 bg-primary rounded-full relative z-10" />
 </div>
 )
}

function OpportunityMapMarker({ 
 data, 
 isHovered, 
 isSelected 
}: { 
 data: MarkerData, 
 isHovered: boolean, 
 isSelected: boolean 
}) {
 const Icon = data.type === 'gig' ? Briefcase : GraduationCap
 
 return (
 <div className={`relative transition-all duration-300 ${isHovered || isSelected ? 'scale-110 z-50' : 'scale-100 z-10'}`}>
 <div className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 ${
 data.type === 'gig' 
 ? (isSelected ? 'bg-primary border-white' : 'bg-white border-primary')
 : (isSelected ? 'bg-emerald-500 border-white' : 'bg-white border-emerald-500')
 }`}>
 <Icon size={18} className={isSelected ? 'text-white' : (data.type === 'gig' ? 'text-primary' : 'text-emerald-500')} />
 </div>
 
 {/* Tooltip on hover or select */}
 {(isHovered || isSelected) && data.title && (
 <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max max-w-50 bg-white border border-border rounded-lg p-2 shadow-xl z-50 pointer-events-none">
 <p className="text-sm font-semibold text-slate-900 truncate">{data.title}</p>
 {data.subtitle && <p className="text-xs text-slate-500 truncate">{data.subtitle}</p>}
 </div>
 )}
 </div>
 )
}

export default function ContextualMap() {
 const { markers, hoveredId, selectedId, setHoveredId, setSelectedId, userLocation } = useMapContext()
 const mapContainer = useRef<HTMLDivElement>(null)
 const mapRef = useRef<maplibregl.Map | null>(null)
 
 // Track active markers and their React roots for cleanup
 const activeMarkers = useRef<Map<string, { marker: maplibregl.Marker, root: Root }>>(new Map())
 const userMarkerRef = useRef<{ marker: maplibregl.Marker, root: Root } | null>(null)

 useEffect(() => {
 if (!mapContainer.current || mapRef.current) return

 const initialCenter: [number, number] = userLocation 
 ? [userLocation.lng, userLocation.lat]
 : [MAP_CONFIG.DEFAULT_CENTER.lng, MAP_CONFIG.DEFAULT_CENTER.lat]

 const map = new maplibregl.Map({
 container: mapContainer.current,
 style: MAP_CONFIG.STYLE_URL_LIGHT,
 center: initialCenter,
 zoom: userLocation ? MAP_CONFIG.CITY_ZOOM : MAP_CONFIG.DEFAULT_ZOOM,
 attributionControl: false // Custom attribution or none for cleaner look
 })

 map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
 mapRef.current = map

 return () => {
 // Cleanup all roots and map on unmount
 activeMarkers.current.forEach(({ root }) => root.unmount())
 if (userMarkerRef.current) userMarkerRef.current.root.unmount()
 map.remove()
 mapRef.current = null
 }
 }, []) // Empty dependency array means init once

 // Update User Marker
 useEffect(() => {
 if (!mapRef.current || !userLocation) return
 
 if (!userMarkerRef.current) {
 const el = document.createElement('div')
 const root = createRoot(el)
 root.render(<UserLocationMarker />)
 
 const marker = new maplibregl.Marker({ element: el })
 .setLngLat([userLocation.lng, userLocation.lat])
 .addTo(mapRef.current)
 
 userMarkerRef.current = { marker, root }
 mapRef.current.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: MAP_CONFIG.CITY_ZOOM })
 } else {
 userMarkerRef.current.marker.setLngLat([userLocation.lng, userLocation.lat])
 }
 }, [userLocation])

 // Sync opportunity markers
 useEffect(() => {
 if (!mapRef.current) return

 // 1. Remove markers that are no longer in the list
 const currentIds = new Set(markers.map(m => m.id))
 for (const [id, { marker, root }] of Array.from(activeMarkers.current.entries())) {
 if (!currentIds.has(id)) {
 root.unmount()
 marker.remove()
 activeMarkers.current.delete(id)
 }
 }

 // 2. Add or update markers
 markers.forEach(data => {
 const isHovered = hoveredId === data.id
 const isSelected = selectedId === data.id
 
 if (!activeMarkers.current.has(data.id)) {
 const el = document.createElement('div')
 // Add click listener to element wrapper
 el.addEventListener('click', (e) => {
 e.stopPropagation()
 setSelectedId(data.id)
 })
 el.addEventListener('mouseenter', () => setHoveredId(data.id))
 el.addEventListener('mouseleave', () => setHoveredId(null))
 
 const root = createRoot(el)
 root.render(<OpportunityMapMarker data={data} isHovered={isHovered} isSelected={isSelected} />)
 
 const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
 .setLngLat([data.lng, data.lat])
 .addTo(mapRef.current!)
 
 activeMarkers.current.set(data.id, { marker, root })
 } else {
 // Re-render the root with new hover/selected props
 const { root, marker } = activeMarkers.current.get(data.id)!
 root.render(<OpportunityMapMarker data={data} isHovered={isHovered} isSelected={isSelected} />)
 marker.setLngLat([data.lng, data.lat]) // in case it moved
 }
 })
 
 // Auto-fit bounds if we have multiple markers and no user location override recently
 if (markers.length > 0 && mapRef.current) {
 const bounds = new maplibregl.LngLatBounds()
 markers.forEach(m => bounds.extend([m.lng, m.lat]))
 if (userLocation) {
 bounds.extend([userLocation.lng, userLocation.lat])
 }
 
 // Only fit bounds if we have a reasonable spread, otherwise don't zoom in too far
 mapRef.current.fitBounds(bounds, { padding: 50, maxZoom: 14, duration: 1000 })
 }

 }, [markers, hoveredId, selectedId, setHoveredId, setSelectedId])

 return (
 <div className="relative w-full h-full bg-surface">
 <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
 
 {/* Selected Opportunity Sheet / Overlay in Map */}
 <AnimatePresence>
 {selectedId && (
 <motion.div 
 initial={{ y: 20, opacity: 0 }}
 animate={{ y: 0, opacity: 1 }}
 exit={{ y: 20, opacity: 0 }}
 className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-xl border border-border p-4 rounded-2xl shadow-2xl z-20"
 >
 <button 
 onClick={() => setSelectedId(null)}
 className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
 >
 <X size={16} />
 </button>
 <div className="pr-6">
 <h3 className="font-semibold text-slate-900 truncate">
 {markers.find(m => m.id === selectedId)?.title ||"Selected Item"}
 </h3>
 <p className="text-sm text-slate-500 mt-1">
 View more details in the feed.
 </p>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )
}
