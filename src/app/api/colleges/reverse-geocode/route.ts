import { NextRequest, NextResponse } from "next/server"

import { reverseGeocode } from "@/lib/maps/geocoding"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get("lat") || "")
  const lng = parseFloat(searchParams.get("lng") || "")

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 })
  }

  const location = await reverseGeocode(lat, lng)

  if (!location) {
    return NextResponse.json({ error: "Failed to geocode" }, { status: 500 })
  }

  return NextResponse.json(location)
}
