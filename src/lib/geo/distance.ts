/**
 * Canonical Geodesic & Geolocation Utilities for CampusConnect / JobNest.
 * 
 * Provides WGS84 spherical Haversine calculations, coordinate validation,
 * accuracy tier classification, bounding box calculation for database filtering,
 * and truthful distance formatting (supporting approximate-city semantics).
 */

export const EARTH_RADIUS_METERS = 6_371_000 // WGS84 mean spherical radius in meters
export const KM_PER_LATITUDE_DEGREE = 111.045 // ~111.045 km per degree latitude

export type AccuracyTier = 'excellent' | 'acceptable' | 'degraded' | 'poor'
export type LocationType = 'PRECISE' | 'APPROXIMATE_CITY' | 'REMOTE'

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface BoundingBox {
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

/**
 * Validates whether a given latitude is in the valid [-90, 90] range.
 */
export function isValidLatitude(lat: unknown): lat is number {
  return typeof lat === 'number' && Number.isFinite(lat) && lat >= -90 && lat <= 90
}

/**
 * Validates whether a given longitude is in the valid [-180, 180] range.
 */
export function isValidLongitude(lng: unknown): lng is number {
  return typeof lng === 'number' && Number.isFinite(lng) && lng >= -180 && lng <= 180
}

/**
 * Validates a coordinate pair.
 */
export function isValidCoordinate(lat?: unknown, lng?: unknown): lat is number {
  return isValidLatitude(lat) && isValidLongitude(lng)
}

/**
 * Canonical WGS84 spherical Haversine distance in meters.
 * Throws an Error if coordinates are invalid.
 */
export function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  if (!isValidLatitude(lat1) || !isValidLongitude(lng1)) {
    throw new Error(`Invalid source coordinate: [lat: ${lat1}, lng: ${lng1}]`)
  }
  if (!isValidLatitude(lat2) || !isValidLongitude(lng2)) {
    throw new Error(`Invalid target coordinate: [lat: ${lat2}, lng: ${lng2}]`)
  }

  // Exact match shortcut
  if (lat1 === lat2 && lng1 === lng2) {
    return 0
  }

  const toRad = Math.PI / 180
  const dLat = (lat2 - lat1) * toRad
  const dLng = (lng2 - lng1) * toRad
  const lat1Rad = lat1 * toRad
  const lat2Rad = lat2 * toRad

  const sinDLat2 = Math.sin(dLat / 2)
  const sinDLng2 = Math.sin(dLng / 2)

  const a = sinDLat2 * sinDLat2 + Math.cos(lat1Rad) * Math.cos(lat2Rad) * sinDLng2 * sinDLng2

  // Clamp 'a' to [0, 1] to prevent NaN due to floating point inaccuracies
  const clampedA = Math.max(0, Math.min(1, a))
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA))

  return EARTH_RADIUS_METERS * c
}

/**
 * Safe Haversine distance in meters, returning null instead of throwing on invalid coordinates.
 */
export function safeHaversineDistanceMeters(
  lat1?: number | null,
  lng1?: number | null,
  lat2?: number | null,
  lng2?: number | null
): number | null {
  if (
    typeof lat1 !== 'number' ||
    typeof lng1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lng2 !== 'number'
  ) {
    return null
  }
  if (!isValidCoordinate(lat1, lng1) || !isValidCoordinate(lat2, lng2)) {
    return null
  }
  return haversineDistanceMeters(lat1, lng1, lat2, lng2)
}

/**
 * Canonical Haversine distance in kilometers.
 */
export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  return haversineDistanceMeters(lat1, lng1, lat2, lng2) / 1000
}

/**
 * Computes a bounding box around a center point for a given radius in kilometers.
 * Useful for indexing / initial DB pre-filtering before exact geodesic calculations.
 */
export function computeBoundingBox(
  centerLat: number,
  centerLng: number,
  radiusKm: number
): BoundingBox {
  if (!isValidCoordinate(centerLat, centerLng)) {
    throw new Error(`Invalid center coordinate for bounding box: [${centerLat}, ${centerLng}]`)
  }
  if (radiusKm <= 0) {
    return {
      minLat: centerLat,
      maxLat: centerLat,
      minLng: centerLng,
      maxLng: centerLng
    }
  }

  const latDelta = radiusKm / KM_PER_LATITUDE_DEGREE
  const minLat = Math.max(-90, centerLat - latDelta)
  const maxLat = Math.min(90, centerLat + latDelta)

  // Longitude delta scales with cos(latitude)
  const radLat = centerLat * (Math.PI / 180)
  const cosLat = Math.abs(Math.cos(radLat))
  
  // Near the poles, longitude delta covers all 360 degrees
  const lngDelta = cosLat > 1e-6 ? radiusKm / (KM_PER_LATITUDE_DEGREE * cosLat) : 180

  let minLng = centerLng - lngDelta
  let maxLng = centerLng + lngDelta

  // If longitude delta exceeds hemisphere or crosses antimeridian, expand to full [-180, 180] for pre-filtering
  if (minLng < -180 || maxLng > 180 || lngDelta >= 180) {
    minLng = -180
    maxLng = 180
  }

  return { minLat, maxLat, minLng, maxLng }
}

/**
 * Classifies GPS/Geolocation accuracy into actionable confidence tiers.
 * - excellent: <= 50m (GPS chip level)
 * - acceptable: <= 250m (Wi-Fi / blended)
 * - degraded: <= 1000m (Cell tower)
 * - poor: > 1000m (IP / coarse)
 */
export function getAccuracyTier(accuracyMeters?: number | null): AccuracyTier {
  if (typeof accuracyMeters !== 'number' || !Number.isFinite(accuracyMeters) || accuracyMeters < 0) {
    return 'acceptable'
  }
  if (accuracyMeters <= 50) return 'excellent'
  if (accuracyMeters <= 250) return 'acceptable'
  if (accuracyMeters <= 1000) return 'degraded'
  return 'poor'
}

/**
 * Human-readable description of the accuracy confidence.
 */
export function getAccuracyDescription(tier: AccuracyTier, accuracyMeters?: number | null): string {
  const rounded = typeof accuracyMeters === 'number' && Number.isFinite(accuracyMeters) 
    ? (accuracyMeters < 1000 ? `±${Math.round(accuracyMeters)}m` : `±${(accuracyMeters / 1000).toFixed(1)}km`)
    : ''

  switch (tier) {
    case 'excellent':
      return `High precision ${rounded}`.trim()
    case 'acceptable':
      return `Standard accuracy ${rounded}`.trim()
    case 'degraded':
      return `Approximate area ${rounded}`.trim()
    case 'poor':
      return `Coarse estimate ${rounded}`.trim()
  }
}

export interface CanonicalDistanceResult {
  distanceMeters: number
  distanceFormatted: string
  distanceLabel: string
  isApproximateDistance: boolean
}

/**
 * Computes canonical distance, formatting, and approximate flags for an opportunity.
 */
export function computeCanonicalDistance(
  userLat: number,
  userLng: number,
  oppLat: number,
  oppLng: number,
  locationType: LocationType = 'PRECISE'
): CanonicalDistanceResult | null {
  if (locationType === 'REMOTE') {
    return null
  }
  const meters = safeHaversineDistanceMeters(userLat, userLng, oppLat, oppLng)
  if (meters === null) return null

  const formatted = formatDistance(meters, locationType)
  return {
    distanceMeters: meters,
    distanceFormatted: formatted,
    distanceLabel: formatted,
    isApproximateDistance: locationType === 'APPROXIMATE_CITY'
  }
}

/**
 * Truthfully formats distance strings respecting location precision semantics:
 * - If locationType is REMOTE, returns empty string.
 * - If location is an approximate city centroid (APPROXIMATE_CITY), ALWAYS prefix "Approx. "
 *   (e.g., "Approx. 850 m away", "Approx. 2.4 km away").
 * - If < 1000 meters, format as "XXX m away"
 * - If >= 1000 meters, format as "X.X km away"
 */
export function formatDistance(
  distanceMeters: number,
  locationType: LocationType = 'PRECISE'
): string {
  if (locationType === 'REMOTE') {
    return ''
  }
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) {
    return ''
  }

  const isApprox = locationType === 'APPROXIMATE_CITY'
  const prefix = isApprox ? 'Approx. ' : ''

  if (distanceMeters < 1000) {
    const meters = Math.max(1, Math.round(distanceMeters))
    return `${prefix}${meters} m away`
  }

  const km = (Math.round((distanceMeters / 1000) * 10) / 10).toFixed(1)
  return `${prefix}${km} km away`
}

/**
 * Determines whether a distance is within the specified radius in kilometers.
 * Comparison is mathematically strict and inclusive: distanceMeters <= radiusKm * 1000.
 * Handles 'all' or undefined as unconstrained.
 */
export function isWithinRadius(
  distanceMeters: number,
  radiusKm: number | 'all' | undefined | null
): boolean {
  if (radiusKm === 'all' || radiusKm === undefined || radiusKm === null) {
    return true
  }
  if (!Number.isFinite(radiusKm) || radiusKm <= 0) {
    return true
  }
  return distanceMeters <= radiusKm * 1000
}
