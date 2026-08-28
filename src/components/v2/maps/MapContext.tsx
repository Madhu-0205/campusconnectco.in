"use client"

import React, { createContext, useContext, useState, ReactNode } from"react"

export type MarkerData = {
 id: string
 type:"gig" |"internship" |"user"
 lat: number
 lng: number
 title?: string
 subtitle?: string
 isPremium?: boolean
}

type MapContextType = {
 hoveredId: string | null
 setHoveredId: (id: string | null) => void
 selectedId: string | null
 setSelectedId: (id: string | null) => void
 markers: MarkerData[]
 setMarkers: (markers: MarkerData[]) => void
 userLocation: { lat: number; lng: number } | null
 setUserLocation: (loc: { lat: number; lng: number } | null) => void
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export function MapProvider({ children }: { children: ReactNode }) {
 const [hoveredId, setHoveredId] = useState<string | null>(null)
 const [selectedId, setSelectedId] = useState<string | null>(null)
 const [markers, setMarkers] = useState<MarkerData[]>([])
 const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

 return (
 <MapContext.Provider
 value={{
 hoveredId,
 setHoveredId,
 selectedId,
 setSelectedId,
 markers,
 setMarkers,
 userLocation,
 setUserLocation,
 }}
 >
 {children}
 </MapContext.Provider>
 )
}

export function useMapContext() {
 const context = useContext(MapContext)
 if (context === undefined) {
 throw new Error("useMapContext must be used within a MapProvider")
 }
 return context
}
