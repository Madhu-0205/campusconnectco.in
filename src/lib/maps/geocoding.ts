"use server";

export interface GeoLocation {
 state: string
 district: string
 city: string
 country: string
 latitude: number
 longitude: number
 displayName: string
}

const NOMINATIM_BASE_URL ="https://nominatim.openstreetmap.org"

// Basic rate limiting/caching (since Nominatim requires 1 request per second max per TOS)
let lastRequestTime = 0
const requestDelay = 1000 // 1 second

async function throttledFetch(url: string): Promise<Response> {
 const now = Date.now()
 if (now - lastRequestTime < requestDelay) {
 await new Promise(resolve => setTimeout(resolve, requestDelay - (now - lastRequestTime)))
 }
 lastRequestTime = Date.now()
 return fetch(url, {
 headers: {
"User-Agent":"CampusConnect/1.0 (campusconnectco.in)" // Must provide user agent per Nominatim TOS
 }
 })
}

/**
 * Reverse geocodes a latitude and longitude into a structured location
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeoLocation | null> {
 try {
 const url = `${NOMINATIM_BASE_URL}/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
 const res = await throttledFetch(url)
 
 if (!res.ok) {
 console.error(`Nominatim reverse geocode failed: ${res.statusText}`)
 return null
 }
 
 const data = await res.json()
 const addr = data.address || {}
 
 return {
 state: addr.state ||"",
 district: addr.county || addr.district || addr.city_district ||"",
 city: addr.city || addr.town || addr.village || addr.suburb ||"",
 country: addr.country_code?.toUpperCase() ||"",
 latitude: lat,
 longitude: lng,
 displayName: data.display_name ||"",
 }
 } catch (error) {
 console.error("Error reverse geocoding:", error)
 return null
 }
}

/**
 * Forward geocodes a string query into a structured location
 */
export async function geocodeLocation(query: string): Promise<GeoLocation | null> {
 try {
 const url = `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`
 const res = await throttledFetch(url)
 
 if (!res.ok) {
 console.error(`Nominatim forward geocode failed: ${res.statusText}`)
 return null
 }
 
 const data = await res.json()
 if (!data || data.length === 0) return null
 
 const result = data[0]
 const addr = result.address || {}
 
 return {
 state: addr.state ||"",
 district: addr.county || addr.district || addr.city_district ||"",
 city: addr.city || addr.town || addr.village || addr.suburb ||"",
 country: addr.country_code?.toUpperCase() ||"",
 latitude: parseFloat(result.lat),
 longitude: parseFloat(result.lon),
 displayName: result.display_name ||"",
 }
 } catch (error) {
 console.error("Error forward geocoding:", error)
 return null
 }
}
