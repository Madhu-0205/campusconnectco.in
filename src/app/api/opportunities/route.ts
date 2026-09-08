import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { MarkerData } from "@/components/v2/maps/MapContext"
import { getUnifiedOpportunities } from "@/lib/opportunities/fetcher"

export const dynamic = "force-dynamic"

const QuerySchema = z.object({
  q: z.string().optional().default(""),
  category: z.string().optional().default("all"),
  location: z.string().optional().default(""),
  type: z.enum(["all", "gig", "internship"]).optional().default("all"),
  sortBy: z.enum(["newest", "compensation_high", "compensation_low", "distance"]).optional().default("newest"),
  page: z.coerce.number().int().nonnegative().optional().default(0),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  userLat: z.coerce.number().min(-90).max(90).optional().nullable(),
  userLng: z.coerce.number().min(-180).max(180).optional().nullable(),
  radiusKm: z.union([z.coerce.number().positive(), z.literal("all")]).optional().nullable(),
  workMode: z.enum(["all", "on-site", "remote", "hybrid"]).optional().default("all"),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rawParams = Object.fromEntries(searchParams.entries())

    const parsed = QuerySchema.safeParse({
      ...rawParams,
      userLat: rawParams.userLat ? parseFloat(rawParams.userLat) : undefined,
      userLng: rawParams.userLng ? parseFloat(rawParams.userLng) : undefined,
      radiusKm: rawParams.radiusKm === "all" ? "all" : (rawParams.radiusKm ? parseFloat(rawParams.radiusKm) : undefined),
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const {
      q,
      category,
      location,
      type,
      sortBy,
      page,
      limit,
      userLat,
      userLng,
      radiusKm,
      workMode
    } = parsed.data

    const result = await getUnifiedOpportunities({
      query: q,
      category,
      location,
      type,
      sortBy,
      page,
      limit,
      userLat,
      userLng,
      radiusKm,
      workMode
    })

    // Map opportunities to feed and map marker shape
    const mappedOpportunities = result.opportunities.map(opp => ({
      id: opp.sourceId,
      type: opp.type,
      title: opp.title,
      company: opp.company,
      location: opp.location,
      compensation: opp.compensation,
      stipend: opp.compensation,
      duration: opp.duration,
      workType: opp.workType,
      tags: opp.tags,
      logoUrl: opp.logoUrl ?? undefined,
      href: opp.href,
      isFeatured: opp.isFeatured,
      isUrgent: opp.isUrgent,
      distanceMeters: opp.distanceMeters,
      distanceFormatted: opp.distanceFormatted,
      distanceLabel: opp.distanceLabel,
      isApproximateDistance: opp.isApproximateDistance,
      locationType: opp.locationType
    }))

    const markers: MarkerData[] = result.opportunities
      .filter(opp => opp.locationType !== "REMOTE" && opp.latitude && opp.longitude)
      .map(opp => ({
        id: opp.sourceId,
        type: opp.type,
        lat: opp.latitude!,
        lng: opp.longitude!,
        title: opp.title,
        subtitle: opp.company,
        location: opp.location,
        compensation: opp.compensation,
        url: opp.href,
        isPremium: opp.isFeatured,
        distanceMeters: opp.distanceMeters,
        distanceFormatted: opp.distanceFormatted,
        distanceLabel: opp.distanceLabel,
        isApproximateDistance: opp.isApproximateDistance,
        locationType: opp.locationType
      }))

    return NextResponse.json({
      opportunities: mappedOpportunities,
      markers,
      total: result.total,
      hasMore: result.hasMore,
      page,
      limit
    })
  } catch (error) {
    console.error("[GET /api/opportunities] Internal Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
