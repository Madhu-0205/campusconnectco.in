// Geolocation utilities: Haversine distance, fuzzy search, reverse geocoding
import { CollegeData, INDIA_COLLEGES } from"./colleges-dataset"

export interface CollegeResult extends CollegeData {
 distanceKm?: number
 score?: number
}

// ── Haversine distance ─────────────────────────────────────────────────────────
export function haversineDistance(
 lat1: number, lng1: number,
 lat2: number, lng2: number
): number {
 const R = 6371 // Earth radius in km
 const dLat = ((lat2 - lat1) * Math.PI) / 180
 const dLng = ((lng2 - lng1) * Math.PI) / 180
 const a =
 Math.sin(dLat / 2) * Math.sin(dLat / 2) +
 Math.cos((lat1 * Math.PI) / 180) *
 Math.cos((lat2 * Math.PI) / 180) *
 Math.sin(dLng / 2) *
 Math.sin(dLng / 2)
 const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
 return R * c
}

// ── Fuzzy scoring (trigram + substring) ────────────────────────────────────────
function getTrigrams(str: string): Set<string> {
 const s = str.toLowerCase().replace(/[^a-z0-9]/g,"").trim()
 const trigrams = new Set<string>()
 const padded = ` ${s} `
 for (let i = 0; i < padded.length - 2; i++) {
 trigrams.add(padded.slice(i, i + 3))
 }
 return trigrams
}

function trigramSimilarity(a: string, b: string): number {
 const ta = getTrigrams(a)
 const tb = getTrigrams(b)
 let intersection = 0
 ta.forEach(t => { if (tb.has(t)) intersection++ })
 return (2 * intersection) / (ta.size + tb.size)
}

export function fuzzySearchColleges(
 query: string,
 dataset: CollegeData[] = INDIA_COLLEGES,
 maxResults = 30
): CollegeResult[] {
 if (!query || query.trim().length < 2) {
 return dataset.slice(0, maxResults).map(c => ({ ...c, score: 0 }))
 }
 const q = query.toLowerCase().trim()

 const scored = dataset.map(college => {
 const nameL = college.name.toLowerCase()
 const cityL = college.city.toLowerCase()
 const distL = college.district.toLowerCase()
 const stateL = college.state.toLowerCase()

 let score = 0

 // Exact prefix match (highest priority)
 if (nameL.startsWith(q)) score += 100
 // Substring match in name
 else if (nameL.includes(q)) score += 70
 // City/district/state match
 if (cityL.includes(q)) score += 50
 if (distL.includes(q)) score += 40
 if (stateL.includes(q)) score += 20
 // Word boundary match in name
 if (nameL.split(/\s+/).some(w => w.startsWith(q))) score += 60
 // Trigram similarity
 score += trigramSimilarity(q, college.name) * 40

 return { ...college, score }
 })

 return scored
 .filter(c => (c.score ?? 0) > 2)
 .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
 .slice(0, maxResults)
}

// ── Nearby colleges using Haversine ────────────────────────────────────────────
export function getNearbyColleges(
 lat: number,
 lng: number,
 radiusKm: number,
 dataset: CollegeData[] = INDIA_COLLEGES
): CollegeResult[] {
 return dataset
 .map(c => ({
 ...c,
 distanceKm: haversineDistance(lat, lng, c.latitude, c.longitude),
 }))
 .filter(c => c.distanceKm! <= radiusKm)
 .sort((a, b) => a.distanceKm! - b.distanceKm!)
}

// ── Reverse geocoding (Nominatim) ──────────────────────────────────────────────
export interface GeoLocation {
 state: string
 district: string
 city: string
 country: string
}

export async function reverseGeocode(
 lat: number,
 lng: number
): Promise<GeoLocation | null> {
 try {
 const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
 const res = await fetch(url, {
 headers: {"User-Agent":"CampusConnect/1.0 (campusconnectco.in)" },
 })
 if (!res.ok) return null
 const data = await res.json()
 const addr = data.address || {}
 return {
 state: addr.state ||"",
 district: addr.county || addr.district || addr.city_district ||"",
 city: addr.city || addr.town || addr.village || addr.suburb ||"",
 country: addr.country_code?.toUpperCase() ||"",
 }
 } catch {
 return null
 }
}
