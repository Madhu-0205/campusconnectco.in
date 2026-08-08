"use client"

import { useEffect } from "react"
import { useMapContext, MarkerData } from "./MapContext"

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
      setMarkers(markers)
    }
  }, [markers, setMarkers])

  useEffect(() => {
    if (userLocation !== undefined) {
      setUserLocation(userLocation)
    }
  }, [userLocation, setUserLocation])

  return null
}
