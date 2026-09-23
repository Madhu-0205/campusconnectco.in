"use client"

import { useEffect } from "react"

import { useMapContext, MarkerData, UserLocation } from "./MapContext"

function areMarkersEqual(prev: MarkerData[], next: MarkerData[]): boolean {
  if (prev === next) return true
  if (prev.length !== next.length) return false
  for (let i = 0; i < prev.length; i++) {
    const p = prev[i]
    const n = next[i]
    if (!p || !n) return false
    if (
      p.id !== n.id ||
      p.lat !== n.lat ||
      p.lng !== n.lng ||
      p.type !== n.type ||
      p.title !== n.title ||
      p.subtitle !== n.subtitle ||
      p.compensation !== n.compensation ||
      p.url !== n.url ||
      p.isPremium !== n.isPremium ||
      p.location !== n.location ||
      p.distanceMeters !== n.distanceMeters
    ) {
      return false
    }
  }
  return true
}

function areLocationsEqual(
  prev: UserLocation | null | undefined,
  next: { lat: number; lng: number } | null | undefined
): boolean {
  if (prev === next) return true
  if (!prev && !next) return true
  if (!prev || !next) return false
  return prev.lat === next.lat && prev.lng === next.lng
}

export function MapDataSync({ 
  markers, 
  userLocation 
}: { 
  markers?: MarkerData[]
  userLocation?: { lat: number; lng: number } | null 
}) {
  const { setMarkers, setUserLocation } = useMapContext()

  useEffect(() => {
    if (markers) {
      setMarkers(prev => (areMarkersEqual(prev, markers) ? prev : markers))
    }
  }, [markers, setMarkers])

  useEffect(() => {
    if (userLocation !== undefined) {
      setUserLocation(prev =>
        areLocationsEqual(prev, userLocation)
          ? prev
          : userLocation
          ? { lat: userLocation.lat, lng: userLocation.lng }
          : null
      )
    }
  }, [userLocation, setUserLocation])

  return null
}
