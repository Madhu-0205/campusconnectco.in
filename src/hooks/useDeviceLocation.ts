"use client"

import { useState, useCallback, useRef, useEffect } from "react"

import {
  getAccuracyTier,
  AccuracyTier
} from "@/lib/geo/distance"

export type LocationErrorCode =
  | "PERMISSION_DENIED"
  | "POSITION_UNAVAILABLE"
  | "TIMEOUT"
  | "UNSUPPORTED"
  | "INVALID_COORDINATES"

export interface DeviceLocation {
  lat: number
  lng: number
  accuracy?: number
  accuracyTier?: AccuracyTier
  timestamp?: number
}

export interface LocationErrorState {
  code: LocationErrorCode
  message: string
}

export type LocationStatus = "idle" | "requesting" | "success" | "error"

export interface RequestLocationOptions {
  forceFresh?: boolean
}

export interface UseDeviceLocationReturn {
  status: LocationStatus
  location: DeviceLocation | null
  error: LocationErrorState | null
  isRefreshing: boolean
  requestLocation: (options?: RequestLocationOptions) => Promise<DeviceLocation | null>
  refreshLocation: () => Promise<DeviceLocation | null>
  clearLocation: () => void
}

export function useDeviceLocation(
  initialLocation: DeviceLocation | null = null
): UseDeviceLocationReturn {
  const [status, setStatus] = useState<LocationStatus>(initialLocation ? "success" : "idle")
  const [location, setLocation] = useState<DeviceLocation | null>(initialLocation)
  const [error, setError] = useState<LocationErrorState | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const isRequestingRef = useRef(false)

  const clearLocation = useCallback(() => {
    setStatus("idle")
    setLocation(null)
    setError(null)
    setIsRefreshing(false)
    isRequestingRef.current = false
  }, [])

  const requestLocation = useCallback(async (options?: RequestLocationOptions): Promise<DeviceLocation | null> => {
    if (isRequestingRef.current) {
      return location
    }

    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      const err: LocationErrorState = {
        code: "UNSUPPORTED",
        message: "Location is not supported by this browser."
      }
      setError(err)
      setStatus("error")
      return null
    }

    const forceFresh = options?.forceFresh ?? false
    isRequestingRef.current = true
    if (forceFresh) {
      setIsRefreshing(true)
    } else {
      setStatus("requesting")
    }
    setError(null)

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          isRequestingRef.current = false
          setIsRefreshing(false)
          const { latitude, longitude, accuracy } = position.coords

          if (
            typeof latitude !== "number" ||
            typeof longitude !== "number" ||
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
          ) {
            const err: LocationErrorState = {
              code: "INVALID_COORDINATES",
              message: "Device returned invalid latitude or longitude coordinates."
            }
            setError(err)
            setStatus("error")
            resolve(null)
            return
          }

          const safeAccuracy = typeof accuracy === "number" && Number.isFinite(accuracy) && accuracy >= 0
            ? accuracy
            : undefined

          const tier = getAccuracyTier(safeAccuracy)
          const loc: DeviceLocation = {
            lat: latitude,
            lng: longitude,
            accuracy: safeAccuracy,
            accuracyTier: tier,
            timestamp: position.timestamp || Date.now()
          }

          setLocation(loc)
          setStatus("success")
          setError(null)
          resolve(loc)
        },
        (geoError) => {
          isRequestingRef.current = false
          setIsRefreshing(false)
          let code: LocationErrorCode = "POSITION_UNAVAILABLE"
          let message = "Location is currently unavailable."

          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              code = "PERMISSION_DENIED"
              message = "Location access was denied."
              break
            case geoError.POSITION_UNAVAILABLE:
              code = "POSITION_UNAVAILABLE"
              message = "Location is currently unavailable."
              break
            case geoError.TIMEOUT:
              code = "TIMEOUT"
              message = "Location request timed out."
              break
          }

          const err: LocationErrorState = { code, message }
          setError(err)
          setStatus("error")
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: forceFresh ? 0 : 60000 // 0 when explicitly refreshing, 1 min otherwise
        }
      )
    })
  }, [location])

  const refreshLocation = useCallback(async (): Promise<DeviceLocation | null> => {
    return requestLocation({ forceFresh: true })
  }, [requestLocation])

  // Cleanup if unmounted
  useEffect(() => {
    return () => {
      isRequestingRef.current = false
    }
  }, [])

  return {
    status,
    location,
    error,
    isRefreshing,
    requestLocation,
    refreshLocation,
    clearLocation
  }
}
