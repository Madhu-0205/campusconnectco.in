"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

import { AccuracyTier, LocationType } from "@/lib/geo/distance"

export type MarkerData = {
  id: string
  type: "gig" | "internship" | "user" | "college"
  lat: number
  lng: number
  title?: string
  subtitle?: string
  location?: string
  compensation?: string
  url?: string
  isPremium?: boolean
  distanceMeters?: number
  distanceFormatted?: string
  distanceLabel?: string
  isApproximateDistance?: boolean
  locationType?: LocationType
}

export interface UserLocation {
  lat: number
  lng: number
  accuracy?: number
  accuracyTier?: AccuracyTier
}

type MapContextType = {
  hoveredId: string | null
  setHoveredId: (id: string | null) => void
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  markers: MarkerData[]
  setMarkers: (markers: MarkerData[]) => void
  userLocation: UserLocation | null
  setUserLocation: (loc: UserLocation | null) => void
  locationStatus: "idle" | "requesting" | "success" | "error"
  setLocationStatus: (status: "idle" | "requesting" | "success" | "error") => void
  locationError: string | null
  setLocationError: (err: string | null) => void
  radiusKm: number | "all"
  setRadiusKm: (radius: number | "all") => void
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export function MapProvider({ children }: { children: ReactNode }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [markers, setMarkers] = useState<MarkerData[]>([])
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "success" | "error">("idle")
  const [locationError, setLocationError] = useState<string | null>(null)
  const [radiusKm, setRadiusKm] = useState<number | "all">("all")

  const contextValue = React.useMemo(() => ({
    hoveredId,
    setHoveredId,
    selectedId,
    setSelectedId,
    markers,
    setMarkers,
    userLocation,
    setUserLocation,
    locationStatus,
    setLocationStatus,
    locationError,
    setLocationError,
    radiusKm,
    setRadiusKm,
  }), [
    hoveredId,
    selectedId,
    markers,
    userLocation,
    locationStatus,
    locationError,
    radiusKm,
  ])

  return (
    <MapContext.Provider value={contextValue}>
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
