import { NextRequest, NextResponse } from "next/server"

import { INDIA_COLLEGES } from "@/lib/colleges-dataset"
import { fuzzySearchColleges, getNearbyColleges } from "@/lib/colleges-geo"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""
  const lat = parseFloat(searchParams.get("lat") || "")
  const lng = parseFloat(searchParams.get("lng") || "")
  const radius = parseFloat(searchParams.get("radius") || "50")
  const stateFilter = searchParams.get("state") || ""

  let dataset = INDIA_COLLEGES
  if (stateFilter) {
    dataset = dataset.filter(c => c.state.toLowerCase() === stateFilter.toLowerCase())
  }

  // Nearby + search combined
  if (!isNaN(lat) && !isNaN(lng) && !q) {
    const nearby = getNearbyColleges(lat, lng, radius, dataset)
    return NextResponse.json({ colleges: nearby, source: "nearby" })
  }

  if (q && q.length >= 2) {
    const results = fuzzySearchColleges(q, dataset)
    return NextResponse.json({ colleges: results, source: "search" })
  }

  // Default: return all (first 50)
  return NextResponse.json({
    colleges: dataset.slice(0, 50).map(c => ({ ...c, score: 0 })),
    source: "all",
  })
}
