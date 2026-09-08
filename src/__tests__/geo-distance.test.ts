import { describe, it, expect } from 'vitest'
import {
  haversineDistanceMeters,
  haversineDistanceKm,
  safeHaversineDistanceMeters,
  computeBoundingBox,
  computeCanonicalDistance,
  getAccuracyTier,
  getAccuracyDescription,
  formatDistance,
  isWithinRadius,
  isValidLatitude,
  isValidLongitude,
  isValidCoordinate
} from '@/lib/geo/distance'

describe('Geo Distance & Geodesic Engine', () => {
  describe('Coordinate Validation', () => {
    it('should validate valid latitude and longitude values', () => {
      expect(isValidLatitude(12.9716)).toBe(true)
      expect(isValidLatitude(-90)).toBe(true)
      expect(isValidLatitude(90)).toBe(true)
      expect(isValidLatitude(91)).toBe(false)
      expect(isValidLatitude(-91)).toBe(false)
      expect(isValidLatitude(NaN)).toBe(false)
      expect(isValidLatitude('12.97')).toBe(false)

      expect(isValidLongitude(77.5946)).toBe(true)
      expect(isValidLongitude(-180)).toBe(true)
      expect(isValidLongitude(180)).toBe(true)
      expect(isValidLongitude(181)).toBe(false)
      expect(isValidLongitude(-181)).toBe(false)
      expect(isValidLongitude(null)).toBe(false)

      expect(isValidCoordinate(12.9716, 77.5946)).toBe(true)
      expect(isValidCoordinate(undefined, 77.5946)).toBe(false)
      expect(isValidCoordinate(12.9716, null)).toBe(false)
    })
  })

  describe('Haversine Distance Calculations with Known Coordinates', () => {
    it('should return 0 meters for identical coordinates', () => {
      const dist = haversineDistanceMeters(12.9716, 77.5946, 12.9716, 77.5946)
      expect(dist).toBe(0)
    })

    it('should calculate accurate distance between Bengaluru and Hyderabad (~500 km)', () => {
      // Bengaluru (12.9716, 77.5946) to Hyderabad (17.3850, 78.4867)
      const distKm = haversineDistanceKm(12.9716, 77.5946, 17.3850, 78.4867)
      // Geodesic distance is ~500 km
      expect(distKm).toBeGreaterThan(495)
      expect(distKm).toBeLessThan(505)
    })

    it('should calculate accurate distance between Charminar and Hitec City (~13.78 km)', () => {
      // Charminar (17.3616, 78.4747) to Hitec City (17.4435, 78.3772)
      const distKm = haversineDistanceKm(17.3616, 78.4747, 17.4435, 78.3772)
      expect(distKm).toBeGreaterThan(13.5)
      expect(distKm).toBeLessThan(14.0)
    })

    it('should calculate short sub-kilometer distance accurately in meters', () => {
      // Points ~111 meters apart in latitude (0.001 deg lat difference)
      const distMeters = haversineDistanceMeters(12.9716, 77.5946, 12.9726, 77.5946)
      expect(distMeters).toBeGreaterThan(110)
      expect(distMeters).toBeLessThan(112)
    })

    it('should throw on invalid coordinates in haversineDistanceMeters', () => {
      expect(() => haversineDistanceMeters(95, 77, 12, 77)).toThrow(/Invalid source coordinate/)
      expect(() => haversineDistanceMeters(12, 77, 12, 195)).toThrow(/Invalid target coordinate/)
    })

    it('should safely return null for invalid inputs in safeHaversineDistanceMeters', () => {
      expect(safeHaversineDistanceMeters(null, 77.5, 12.9, 77.5)).toBeNull()
      expect(safeHaversineDistanceMeters(12.9, 77.5, undefined, 77.5)).toBeNull()
      expect(safeHaversineDistanceMeters(12.9, 77.5, 12.9, 77.5)).toBe(0)
    })
  })

  describe('Bounding Box Calculation', () => {
    it('should compute valid bounding box for 10 km radius', () => {
      const bbox = computeBoundingBox(12.9716, 77.5946, 10)
      expect(bbox.minLat).toBeLessThan(12.9716)
      expect(bbox.maxLat).toBeGreaterThan(12.9716)
      expect(bbox.minLng).toBeLessThan(77.5946)
      expect(bbox.maxLng).toBeGreaterThan(77.5946)

      // 10 km is approx 0.09 degrees latitude
      expect(bbox.maxLat - bbox.minLat).toBeCloseTo(0.18, 1)
    })

    it('should handle radius 0 km', () => {
      const bbox = computeBoundingBox(12.9716, 77.5946, 0)
      expect(bbox.minLat).toBe(12.9716)
      expect(bbox.maxLat).toBe(12.9716)
      expect(bbox.minLng).toBe(77.5946)
      expect(bbox.maxLng).toBe(77.5946)
    })

    it('should handle antimeridian crossing and polar regions safely', () => {
      // Near antimeridian (lng = 179) with 200 km radius
      const bboxAntimeridian = computeBoundingBox(0, 179, 200)
      expect(bboxAntimeridian.minLng).toBe(-180)
      expect(bboxAntimeridian.maxLng).toBe(180)

      // Near North pole (lat = 89.9)
      const bboxPole = computeBoundingBox(89.9, 0, 50)
      expect(bboxPole.maxLat).toBe(90)
    })
  })

  describe('Accuracy Tier Classification', () => {
    it('should classify accuracy tiers truthfully', () => {
      expect(getAccuracyTier(10)).toBe('excellent')
      expect(getAccuracyTier(50)).toBe('excellent')
      expect(getAccuracyTier(150)).toBe('acceptable')
      expect(getAccuracyTier(250)).toBe('acceptable')
      expect(getAccuracyTier(600)).toBe('degraded')
      expect(getAccuracyTier(1000)).toBe('degraded')
      expect(getAccuracyTier(2500)).toBe('poor')
      expect(getAccuracyTier(null)).toBe('acceptable')
    })

    it('should provide informative descriptions', () => {
      expect(getAccuracyDescription('excellent', 15)).toBe('High precision ±15m')
      expect(getAccuracyDescription('acceptable', 120)).toBe('Standard accuracy ±120m')
      expect(getAccuracyDescription('degraded', 800)).toBe('Approximate area ±800m')
      expect(getAccuracyDescription('poor', 3500)).toBe('Coarse estimate ±3.5km')
    })
  })

  describe('Distance Formatting with Semantics', () => {
    it('should format precise sub-kilometer distances', () => {
      expect(formatDistance(450, 'PRECISE')).toBe('450 m away')
      expect(formatDistance(0, 'PRECISE')).toBe('1 m away') // minimum clamped to 1m
    })

    it('should format precise kilometer distances', () => {
      expect(formatDistance(3200, 'PRECISE')).toBe('3.2 km away')
      expect(formatDistance(12450, 'PRECISE')).toBe('12.5 km away')
    })

    it('should ALWAYS prepend Approx. for APPROXIMATE_CITY', () => {
      expect(formatDistance(450, 'APPROXIMATE_CITY')).toBe('Approx. 450 m away')
      expect(formatDistance(850, 'APPROXIMATE_CITY')).toBe('Approx. 850 m away')
      expect(formatDistance(3200, 'APPROXIMATE_CITY')).toBe('Approx. 3.2 km away')
      expect(formatDistance(15000, 'APPROXIMATE_CITY')).toBe('Approx. 15.0 km away')
    })

    it('should return empty string for REMOTE opportunities', () => {
      expect(formatDistance(500, 'REMOTE')).toBe('')
      expect(formatDistance(5000, 'REMOTE')).toBe('')
    })
  })

  describe('Canonical Distance Object Calculation', () => {
    it('should compute canonical distance object for PRECISE opportunity', () => {
      const result = computeCanonicalDistance(17.3850, 78.4867, 17.3860, 78.4867, 'PRECISE')
      expect(result).not.toBeNull()
      expect(result!.distanceMeters).toBeGreaterThan(100)
      expect(result!.distanceFormatted).toBe('111 m away')
      expect(result!.distanceLabel).toBe('111 m away')
      expect(result!.isApproximateDistance).toBe(false)
    })

    it('should compute canonical distance object for APPROXIMATE_CITY opportunity', () => {
      const result = computeCanonicalDistance(17.3850, 78.4867, 17.3860, 78.4867, 'APPROXIMATE_CITY')
      expect(result).not.toBeNull()
      expect(result!.distanceFormatted).toBe('Approx. 111 m away')
      expect(result!.distanceLabel).toBe('Approx. 111 m away')
      expect(result!.isApproximateDistance).toBe(true)
    })

    it('should return null for REMOTE opportunities', () => {
      const result = computeCanonicalDistance(17.3850, 78.4867, 17.3860, 78.4867, 'REMOTE')
      expect(result).toBeNull()
    })
  })

  describe('Radius Filtering Boundary Behavior', () => {
    it('should correctly filter within and outside radius boundaries', () => {
      expect(isWithinRadius(4999, 5)).toBe(true) // 4.999km <= 5km
      expect(isWithinRadius(5000, 5)).toBe(true) // exactly on 5km boundary (inclusive)
      expect(isWithinRadius(5001, 5)).toBe(false) // 5.001km > 5km (strictly excluded)

      expect(isWithinRadius(24999, 25)).toBe(true)
      expect(isWithinRadius(25000, 25)).toBe(true)
      expect(isWithinRadius(25001, 25)).toBe(false)

      expect(isWithinRadius(50000, 'all')).toBe(true)
      expect(isWithinRadius(50000, undefined)).toBe(true)
      expect(isWithinRadius(50000, null)).toBe(true)
    })
  })
})
