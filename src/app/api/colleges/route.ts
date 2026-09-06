import { NextRequest, NextResponse } from "next/server"

import { INDIA_COLLEGES } from "@/lib/colleges-dataset"
import { fuzzySearchColleges, getNearbyColleges } from "@/lib/colleges-geo"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q") || ""
    const lat = parseFloat(searchParams.get("lat") || "")
    const lng = parseFloat(searchParams.get("lng") || "")
    const radius = parseFloat(searchParams.get("radius") || "50")
    const stateFilter = searchParams.get("state") || ""
    const limitParam = parseInt(searchParams.get("limit") || "50")
    const limit = Math.min(Math.max(limitParam, 1), 50)

    // Primary: Query PostgreSQL colleges table
    try {
      if (!isNaN(lat) && !isNaN(lng) && !q) {
        const dbColleges = await prisma.college.findMany({
          where: {
            approved: true,
            latitude: { not: null },
            longitude: { not: null },
            ...(stateFilter ? { state: { equals: stateFilter, mode: "insensitive" } } : {})
          },
          take: 250,
        })

        const nearby = getNearbyColleges(
          lat,
          lng,
          radius,
          dbColleges.map(c => ({
            id: c.id,
            name: c.name,
            city: c.city,
            district: c.district,
            state: c.state,
            latitude: c.latitude!,
            longitude: c.longitude!,
            type: c.type as any,
          }))
        )

        return NextResponse.json({
          colleges: nearby.slice(0, limit).map(c => ({
            id: c.id,
            name: c.name,
            city: c.city,
            district: c.district,
            state: c.state,
            latitude: c.latitude,
            longitude: c.longitude,
            type: c.type,
            country: "India",
            distanceKm: c.distanceKm
          })),
          source: "db_nearby"
        })
      }

      if (q && q.length >= 2) {
        const dbColleges = await prisma.college.findMany({
          where: {
            approved: true,
            ...(stateFilter ? { state: { equals: stateFilter, mode: "insensitive" } } : {}),
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
              { district: { contains: q, mode: "insensitive" } },
            ]
          },
          take: limit,
          orderBy: { name: "asc" }
        })

        if (dbColleges.length > 0) {
          return NextResponse.json({
            colleges: dbColleges.map(c => ({
              id: c.id,
              name: c.name,
              city: c.city,
              district: c.district,
              state: c.state,
              latitude: c.latitude,
              longitude: c.longitude,
              type: c.type,
              country: "India",
            })),
            source: "db_search"
          })
        }
      } else {
        const dbColleges = await prisma.college.findMany({
          where: {
            approved: true,
            ...(stateFilter ? { state: { equals: stateFilter, mode: "insensitive" } } : {})
          },
          take: limit,
          orderBy: { name: "asc" }
        })

        if (dbColleges.length > 0) {
          return NextResponse.json({
            colleges: dbColleges.map(c => ({
              id: c.id,
              name: c.name,
              city: c.city,
              district: c.district,
              state: c.state,
              latitude: c.latitude,
              longitude: c.longitude,
              type: c.type,
              country: "India",
            })),
            source: "db_all"
          })
        }
      }
    } catch (dbErr) {
      console.warn("[API /api/colleges] DB query failed, falling back to curated dataset:", dbErr)
    }

    // In-memory fallback
    let dataset = INDIA_COLLEGES
    if (stateFilter) {
      dataset = dataset.filter(c => c.state.toLowerCase() === stateFilter.toLowerCase())
    }

    const sanitize = (colleges: any[]) => colleges.map(c => ({
      id: c.id,
      name: c.name,
      city: c.city,
      district: c.district,
      state: c.state,
      latitude: c.latitude,
      longitude: c.longitude,
      type: c.type,
      country: "India",
      ...(c.distanceKm !== undefined ? { distanceKm: c.distanceKm } : {})
    }))

    if (!isNaN(lat) && !isNaN(lng) && !q) {
      const nearby = getNearbyColleges(lat, lng, radius, dataset)
      return NextResponse.json({ colleges: sanitize(nearby).slice(0, limit), source: "fallback_nearby" })
    }

    if (q && q.length >= 2) {
      const results = fuzzySearchColleges(q, dataset)
      return NextResponse.json({ colleges: sanitize(results).slice(0, limit), source: "fallback_search" })
    }

    return NextResponse.json({
      colleges: sanitize(dataset).slice(0, limit),
      source: "fallback_all"
    })
  } catch (error) {
    console.error("API Error in src/app/api/colleges/route.ts:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
