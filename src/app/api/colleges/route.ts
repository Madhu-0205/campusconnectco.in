import { NextRequest, NextResponse } from "next/server"

import { INDIA_COLLEGES } from "@/lib/colleges-dataset"
import { fuzzySearchColleges, getNearbyColleges } from "@/lib/colleges-geo"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  try {
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
const sanitize = (colleges: any[]) => colleges.map(c => ({
    id: c.id,
    name: c.name,
    city: c.city,
    state: c.state,
    country: c.country || "India",
  }))
const limitParam = parseInt(searchParams.get("limit") || "50")
const limit = Math.min(Math.max(limitParam, 1), 50)
if (!isNaN(lat) && !isNaN(lng) && !q) {
    const nearby = getNearbyColleges(lat, lng, radius, dataset)
    return NextResponse.json({ colleges: sanitize(nearby).slice(0, limit), source: "nearby" })
  }
if (q && q.length >= 2) {
    const results = fuzzySearchColleges(q, dataset)
    return NextResponse.json({ colleges: sanitize(results).slice(0, limit), source: "search" })
  }
return NextResponse.json({
    colleges: sanitize(dataset).slice(0, limit),
    source: "all",
  })
  } catch (error) {
    console.error("API Error in src/app/api/colleges/route.ts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
