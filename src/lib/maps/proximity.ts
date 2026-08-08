// src/lib/maps/proximity.ts

/**
 * Calculates a bounding box for a given coordinate and radius.
 * This allows for faster initial geographic filtering in the database 
 * using simple floating point comparisons (between latitude/longitude)
 * before calculating precise Haversine distances.
 * 
 * @param lat Center latitude
 * @param lng Center longitude
 * @param radiusKm Radius in kilometers
 * @returns Bounding box with minLat, maxLat, minLng, maxLng
 */
export function getBoundingBox(lat: number, lng: number, radiusKm: number) {
  // Approximate conversions
  // 1 degree of latitude is ~111.32 km
  const latDelta = radiusKm / 111.32;
  
  // 1 degree of longitude varies by latitude
  const lngDelta = radiusKm / (111.32 * Math.cos(lat * (Math.PI / 180)));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

/**
 * Calculates the Haversine distance between two points in kilometers.
 * 
 * @param lat1 Point 1 latitude
 * @param lon1 Point 1 longitude
 * @param lat2 Point 2 latitude
 * @param lon2 Point 2 longitude
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}
