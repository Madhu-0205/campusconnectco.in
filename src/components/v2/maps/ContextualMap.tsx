"use client"

import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Briefcase, GraduationCap, X } from "lucide-react"
import * as maplibregl from "maplibre-gl"
import React, { useEffect, useRef, useState } from "react"
import { createRoot, Root } from "react-dom/client"

import "maplibre-gl/dist/maplibre-gl.css"
import { MAP_CONFIG } from "@/lib/maps/map-config"

import { useMapContext, MarkerData } from "./MapContext"

// Custom HTML Markers
function UserLocationMarker() {
  return (
    <div className="relative flex flex-col items-center -translate-y-1/2 pointer-events-none select-none">
      <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/25 border-2 border-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)]">
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping absolute opacity-60" />
        <div className="w-3.5 h-3.5 bg-blue-600 rounded-full relative z-10 border-2 border-white shadow-sm" />
      </div>
      <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-900/90 backdrop-blur-md text-[10px] font-bold text-white shadow-lg whitespace-nowrap border border-white/20 tracking-tight">
        You are here
      </div>
    </div>
  )
}

function OpportunityMapMarker({ 
  data, 
  isHovered, 
  isSelected,
  onSelect
}: { 
  data: MarkerData, 
  isHovered: boolean, 
  isSelected: boolean,
  onSelect?: () => void
}) {
  const Icon = data.type === 'gig' ? Briefcase : GraduationCap
  
  return (
    <div 
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.()
      }}
      className={`relative cursor-pointer transition-all duration-300 ${isHovered || isSelected ? 'scale-110 z-50' : 'scale-100 z-10'}`}
    >
      <div className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 ${
        data.type === 'gig' 
          ? (isSelected ? 'bg-primary border-white' : 'bg-white border-primary')
          : (isSelected ? 'bg-emerald-500 border-white' : 'bg-white border-emerald-500')
      }`}>
        <Icon size={18} className={isSelected ? 'text-white' : (data.type === 'gig' ? 'text-primary' : 'text-emerald-500')} />
      </div>
      
      {/* Tooltip on hover or select */}
      {(isHovered || isSelected) && data.title && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max max-w-56 bg-white border border-border rounded-lg p-2 shadow-xl z-50 pointer-events-none">
          <p className="text-sm font-semibold text-slate-900 truncate">{data.title}</p>
          {data.subtitle && <p className="text-xs text-slate-500 truncate">{data.subtitle}</p>}
          {data.distanceFormatted && (
            <span className="inline-block mt-1 text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
              {data.distanceFormatted}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default function ContextualMap() {
  const { markers, hoveredId, selectedId, setHoveredId, setSelectedId, userLocation } = useMapContext()
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null)
  
  // Track active markers and their React roots for cleanup
  const activeMarkers = useRef<Map<string, { marker: maplibregl.Marker, root: Root }>>(new Map())
  const userMarkerRef = useRef<{ marker: maplibregl.Marker, root: Root } | null>(null)

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    if (typeof window !== 'undefined') {
      maplibregl.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')
    }

    const initialCenter: [number, number] = userLocation 
      ? [userLocation.lng, userLocation.lat]
      : [MAP_CONFIG.DEFAULT_CENTER.lng, MAP_CONFIG.DEFAULT_CENTER.lat]

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_CONFIG.STYLE_URL_LIGHT,
      center: initialCenter,
      zoom: userLocation ? MAP_CONFIG.CITY_ZOOM : MAP_CONFIG.DEFAULT_ZOOM,
      attributionControl: false
    })

    // Place NavigationControl top-right to prevent collision with mobile bottom-sheet and Copilot button
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    mapRef.current = map
    setMapInstance(map)

    if (typeof window !== 'undefined') {
      (window as any).__map = map
    }
    map.on('error', (e) => {
      console.error('[MAPLIBRE_ERROR_EVENT]', e)
    })
    map.on('style.load', () => {
      console.log('[MAPLIBRE_STYLE_LOADED]')
    })

    // ResizeObserver ensures canvas always matches container dimensions without zero-height glitches
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize()
      }
    })
    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current)
    }

    // Force an immediate resize tick after mount
    const timer = setTimeout(() => {
      map.resize()
    }, 100)

    const markersSnapshot = activeMarkers.current

    return () => {
      clearTimeout(timer)
      resizeObserver.disconnect()
      markersSnapshot.forEach(({ root, marker }) => {
        try { marker.remove() } catch {}
        try { setTimeout(() => root.unmount(), 0) } catch {}
      })
      markersSnapshot.clear()

      if (userMarkerRef.current) {
        try { userMarkerRef.current.marker.remove() } catch {}
        try {
          const uRoot = userMarkerRef.current.root
          setTimeout(() => uRoot.unmount(), 0)
        } catch {}
        userMarkerRef.current = null
      }
      map.remove()
      mapRef.current = null
      setMapInstance(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update User Marker
  useEffect(() => {
    if (!mapInstance) return

    if (!userLocation) {
      if (userMarkerRef.current) {
        try { userMarkerRef.current.marker.remove() } catch {}
        try {
          const uRoot = userMarkerRef.current.root
          setTimeout(() => uRoot.unmount(), 0)
        } catch {}
        userMarkerRef.current = null
      }
      return
    }
    
    if (!userMarkerRef.current) {
      const el = document.createElement('div')
      el.className = 'user-location-marker pointer-events-none'
      el.style.pointerEvents = 'none'
      el.style.zIndex = '5'
      const root = createRoot(el)
      root.render(<UserLocationMarker />)
      
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapInstance)
      
      marker.getElement().style.pointerEvents = 'none'
      
      userMarkerRef.current = { marker, root }
      mapInstance.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: MAP_CONFIG.CITY_ZOOM })
    } else {
      userMarkerRef.current.marker.setLngLat([userLocation.lng, userLocation.lat])
    }
  }, [mapInstance, userLocation])

  // Sync opportunity markers
  useEffect(() => {
    if (!mapInstance) return

    // 1. Remove markers that are no longer in the list
    const currentIds = new Set(markers.map(m => m.id))
    for (const [id, { marker, root }] of Array.from(activeMarkers.current.entries())) {
      if (!currentIds.has(id)) {
        try { marker.remove() } catch {}
        try { setTimeout(() => root.unmount(), 0) } catch {}
        activeMarkers.current.delete(id)
      }
    }

    // 2. Add or update markers
    markers.forEach(data => {
      const isHovered = hoveredId === data.id
      const isSelected = selectedId === data.id
      
      const createMarker = () => {
        const el = document.createElement('div')
        el.className = 'opportunity-marker cursor-pointer'
        el.setAttribute('data-marker-id', data.id)
        el.setAttribute('role', 'button')
        el.setAttribute('tabindex', '0')
        el.setAttribute('aria-label', `Opportunity: ${data.title}`)
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          setSelectedId(data.id)
        })
        el.addEventListener('mouseenter', () => setHoveredId(data.id))
        el.addEventListener('mouseleave', () => setHoveredId(null))
        
        const root = createRoot(el)
        root.render(<OpportunityMapMarker data={data} isHovered={isHovered} isSelected={isSelected} onSelect={() => setSelectedId(data.id)} />)
        
        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([data.lng, data.lat])
          .addTo(mapInstance)
        
        activeMarkers.current.set(data.id, { marker, root })
      }

      if (!activeMarkers.current.has(data.id)) {
        createMarker()
      } else {
        const entry = activeMarkers.current.get(data.id)!
        try {
          entry.root.render(<OpportunityMapMarker data={data} isHovered={isHovered} isSelected={isSelected} onSelect={() => setSelectedId(data.id)} />)
          entry.marker.setLngLat([data.lng, data.lat])
        } catch {
          // If the root was unmounted, cleanly recreate it
          try { entry.marker.remove() } catch {}
          activeMarkers.current.delete(data.id)
          createMarker()
        }
      }
    })
    
    // Auto-fit bounds if we have multiple markers and no user location override recently
    if (markers.length > 0 && mapInstance) {
      const bounds = new maplibregl.LngLatBounds()
      let validCount = 0
      markers.forEach(m => {
        if (Number.isFinite(m.lat) && Number.isFinite(m.lng)) {
          bounds.extend([m.lng, m.lat])
          validCount++
        }
      })
      if (userLocation) {
        bounds.extend([userLocation.lng, userLocation.lat])
        validCount++
      }

      if (validCount > 1) {
        mapInstance.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 1000 })
      } else if (validCount === 1) {
        const single = markers[0]
        mapInstance.flyTo({ center: [single.lng, single.lat], zoom: MAP_CONFIG.CITY_ZOOM, duration: 1000 })
      }
    }
  }, [mapInstance, markers, hoveredId, selectedId, setHoveredId, setSelectedId, userLocation])

  // Center & zoom on selected marker
  useEffect(() => {
    if (!mapInstance || !selectedId) return
    const sel = markers.find(m => m.id === selectedId)
    if (sel && Number.isFinite(sel.lat) && Number.isFinite(sel.lng)) {
      mapInstance.flyTo({
        center: [sel.lng, sel.lat],
        zoom: Math.max(mapInstance.getZoom(), 12),
        duration: 800
      })
    }
  }, [mapInstance, selectedId, markers])

  const selectedMarker = markers.find(m => m.id === selectedId)

 return (
 <div className="relative w-full h-full bg-surface">
 <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

 {!userLocation && (
 <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none flex justify-center">
 <div className="bg-slate-900/85 backdrop-blur-md border border-white/10 text-white/90 text-xs px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
 <MapPin size={12} className="text-primary shrink-0" />
 <span>Set your location to discover opportunities near you.</span>
 </div>
 </div>
 )}
 
 {/* Selected Opportunity Sheet / Overlay in Map */}
 <AnimatePresence>
 {selectedMarker && (
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
 <div className="flex items-center gap-2 mb-1.5">
 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
 selectedMarker.type === 'gig' 
 ? 'bg-primary/10 text-primary border border-primary/20' 
 : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
 }`}>
 {selectedMarker.type === 'gig' ? 'Gig' : 'Internship'}
 </span>
 {selectedMarker.location && (
 <span className="text-xs text-slate-500 flex items-center gap-1 truncate">
 <MapPin size={10} />
 {selectedMarker.location}
 </span>
 )}
 {selectedMarker.distanceFormatted && (
 <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
 {selectedMarker.distanceFormatted}
 </span>
 )}
 </div>
 <h3 className="font-semibold text-slate-900 truncate">
 {selectedMarker.title || "Selected Item"}
 </h3>
 {selectedMarker.subtitle && (
 <p className="text-sm text-slate-600 truncate mt-0.5">
 {selectedMarker.subtitle}
 </p>
 )}
 {selectedMarker.compensation && (
 <p className="text-xs font-semibold text-primary mt-1">
 {selectedMarker.compensation}
 </p>
 )}
 <div className="mt-3">
 <a
 href={selectedMarker.url || (selectedMarker.type === 'gig' ? `/gigs/${selectedMarker.id}` : `/internships/${selectedMarker.id}`)}
 className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
 >
 View opportunity
 </a>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )
}
