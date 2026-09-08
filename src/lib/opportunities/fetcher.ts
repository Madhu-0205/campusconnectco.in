import {
  isValidCoordinate,
  computeBoundingBox,
  computeCanonicalDistance,
  LocationType
} from "@/lib/geo/distance"
import prisma from "@/lib/prisma"

export interface OpportunityNormalized {
  id: string
  type: "gig" | "internship"
  title: string
  company: string
  location: string
  compensation?: string
  duration?: string
  workType?: string
  tags: string[]
  logoUrl?: string | null
  href: string
  isFeatured: boolean
  isUrgent: boolean
  createdAt: Date
  sourceId: string
  latitude?: number | null
  longitude?: number | null
  rawCompensation?: number // Used for sorting
  distanceMeters?: number
  distanceFormatted?: string
  distanceLabel?: string
  isApproximateDistance?: boolean
  locationType?: LocationType
}

export interface FetchOpportunitiesParams {
  query?: string
  category?: string
  location?: string
  type?: "all" | "gig" | "internship"
  page?: number
  limit?: number
  sortBy?: "newest" | "compensation_high" | "compensation_low" | "distance"
  userLat?: number | null
  userLng?: number | null
  radiusKm?: number | 'all' | null
  workMode?: "all" | "on-site" | "remote" | "hybrid"
}

export async function getUnifiedOpportunities(params: FetchOpportunitiesParams) {
  const {
    query = "",
    category = "all",
    location = "",
    type = "all",
    page = 0,
    limit = 20,
    sortBy = "newest",
    userLat = null,
    userLng = null,
    radiusKm = null,
    workMode = "all"
  } = params

  const hasUserLocation = isValidCoordinate(userLat, userLng)
  const isDistanceSort = sortBy === "distance"
  const isRadiusFiltering = hasUserLocation && radiusKm && radiusKm !== "all" && typeof radiusKm === "number" && radiusKm > 0

  const skip = page * limit

  const fetchGigs = type === "all" || type === "gig"
  const fetchInternships = type === "all" || type === "internship"

  // Gig.status defaults to "active" in schema; Internship.status defaults to "OPEN"
  // Both must strictly exclude soft-deleted (deletedAt != null), INACTIVE, and COMPLETED records from active discovery
  const gigWhere: any = { status: { in: ["OPEN", "active"] }, deletedAt: null }
  const intWhere: any = { status: "OPEN", deletedAt: null }

  // Work Mode filtering
  if (workMode && workMode !== "all") {
    if (workMode === "remote") {
      gigWhere.work_mode = { in: ["remote", "Remote"] }
      intWhere.OR = [{ location: { contains: "remote", mode: "insensitive" } }]
    } else if (workMode === "on-site") {
      gigWhere.work_mode = { in: ["on-site", "onsite", "in-person"] }
      intWhere.NOT = [
        { location: { contains: "remote", mode: "insensitive" } },
        { location: { contains: "hybrid", mode: "insensitive" } }
      ]
    } else if (workMode === "hybrid") {
      gigWhere.work_mode = { in: ["hybrid", "Hybrid"] }
      intWhere.OR = [
        { location: { contains: "hybrid", mode: "insensitive" } }
      ]
    }
  }

  // 1. Search Query
  if (query.trim()) {
    const q = { contains: query.trim(), mode: "insensitive" }
    gigWhere.OR = [{ title: q }, { description: q }]
    intWhere.OR = [{ title: q }, { description: q }, { company: q }]
  }

  // 2. Category / Tags
  if (category && category !== "all") {
    gigWhere.tags = { contains: category, mode: "insensitive" }
    intWhere.tags = { contains: category, mode: "insensitive" }
  }

  // 3. Location text search
  if (location) {
    const loc = { contains: location, mode: "insensitive" }
    gigWhere.OR = gigWhere.OR ? [
      ...gigWhere.OR,
      { city: loc }, { state: loc }
    ] : [{ city: loc }, { state: loc }]
    
    intWhere.OR = intWhere.OR ? [
      ...intWhere.OR,
      { city: loc }, { state: loc }, { location: loc }
    ] : [{ city: loc }, { state: loc }, { location: loc }]
  }

  // 4. Bounding-box candidate prefilter for database scalability
  // Applies indexed range filters (minLat <= lat <= maxLat, minLng <= lng <= maxLng) directly in SQL
  if (isRadiusFiltering && hasUserLocation) {
    const bbox = computeBoundingBox(userLat!, userLng!, radiusKm as number)
    gigWhere.latitude = { gte: bbox.minLat, lte: bbox.maxLat }
    gigWhere.longitude = { gte: bbox.minLng, lte: bbox.maxLng }
    intWhere.latitude = { gte: bbox.minLat, lte: bbox.maxLat }
    intWhere.longitude = { gte: bbox.minLng, lte: bbox.maxLng }
  } else if (isDistanceSort && (!radiusKm || radiusKm === "all")) {
    // When sorting purely by distance without a radius cap, prioritize items with coordinates
    gigWhere.latitude = { not: null }
    gigWhere.longitude = { not: null }
    intWhere.latitude = { not: null }
    intWhere.longitude = { not: null }
  }

  // 5. Sorting & DB Take limits
  let gigOrderBy: any = { createdAt: "desc" }
  let intOrderBy: any = { createdAt: "desc" }

  if (sortBy === "compensation_high") {
    gigOrderBy = { budget: "desc" }
    intOrderBy = { stipend: "desc" }
  } else if (sortBy === "compensation_low") {
    gigOrderBy = { budget: "asc" }
    intOrderBy = { stipend: "asc" }
  }

  // Candidate batch limit for geographic refinement
  const queryLimit = (isDistanceSort || isRadiusFiltering) ? 250 : limit
  const querySkip = (isDistanceSort || isRadiusFiltering) ? 0 : skip

  const [gigs, internships] = await Promise.all([
    fetchGigs ? prisma.gig.findMany({
      where: gigWhere,
      orderBy: gigOrderBy,
      take: queryLimit, 
      skip: querySkip,
      include: {
        poster: { select: { id: true, name: true, image: true, college: true } }
      }
    }) : Promise.resolve([]),
    fetchInternships ? prisma.internship.findMany({
      where: intWhere,
      orderBy: intOrderBy,
      take: queryLimit,
      skip: querySkip,
    }) : Promise.resolve([])
  ])

  // Normalize Gigs
  const normalizedGigs: OpportunityNormalized[] = gigs.map(gig => {
    const skills = typeof gig.required_skills === "string" 
      ? gig.required_skills.split(",").map(s => s.trim()).filter(Boolean)
      : Array.isArray(gig.required_skills) ? gig.required_skills : []

    const hasCoords = isValidCoordinate(gig.latitude, gig.longitude)
    let distanceMeters: number | undefined = undefined
    let distanceFormatted: string | undefined = undefined
    let distanceLabel: string | undefined = undefined
    let isApproximateDistance = false
    let locationType: LocationType = "REMOTE"

    if (hasCoords && workMode !== "remote") {
      locationType = gig.city ? "APPROXIMATE_CITY" : "PRECISE"
      if (hasUserLocation) {
        const canonical = computeCanonicalDistance(userLat!, userLng!, gig.latitude!, gig.longitude!, locationType)
        if (canonical) {
          distanceMeters = canonical.distanceMeters
          distanceFormatted = canonical.distanceFormatted
          distanceLabel = canonical.distanceLabel
          isApproximateDistance = canonical.isApproximateDistance
        }
      }
    }

    return {
      id: `gig-${gig.id}`,
      sourceId: gig.id,
      type: "gig",
      title: gig.title,
      company: gig.poster?.name || "CampusConnectCo Member",
      location: gig.city ? `${gig.city}${gig.state ? `, ${gig.state}` : ""}` : (gig.work_mode || "Remote"),
      compensation: gig.budget ? `₹${gig.budget.toLocaleString("en-IN")}` : undefined,
      rawCompensation: gig.budget,
      duration: "Flexible",
      workType: gig.work_mode || "Remote",
      tags: skills.slice(0, 3) as string[],
      logoUrl: gig.poster?.image,
      href: `/gigs/${gig.id}`,
      isFeatured: gig.isPremium || false,
      isUrgent: false,
      createdAt: gig.createdAt,
      latitude: (hasCoords && workMode !== "remote") ? gig.latitude : undefined,
      longitude: (hasCoords && workMode !== "remote") ? gig.longitude : undefined,
      distanceMeters,
      distanceFormatted,
      distanceLabel,
      isApproximateDistance,
      locationType
    }
  })

  // Normalize Internships
  const normalizedInternships: OpportunityNormalized[] = internships.map(int => {
    const skills = typeof int.skills === "string"
      ? int.skills.split(",").map(s => s.trim()).filter(Boolean)
      : Array.isArray(int.skills) ? int.skills : []

    const hasCoords = isValidCoordinate(int.latitude, int.longitude)
    let distanceMeters: number | undefined = undefined
    let distanceFormatted: string | undefined = undefined
    let distanceLabel: string | undefined = undefined
    let isApproximateDistance = false
    let locationType: LocationType = "REMOTE"

    if (hasCoords && workMode !== "remote") {
      locationType = int.city ? "APPROXIMATE_CITY" : "PRECISE"
      if (hasUserLocation) {
        const canonical = computeCanonicalDistance(userLat!, userLng!, int.latitude!, int.longitude!, locationType)
        if (canonical) {
          distanceMeters = canonical.distanceMeters
          distanceFormatted = canonical.distanceFormatted
          distanceLabel = canonical.distanceLabel
          isApproximateDistance = canonical.isApproximateDistance
        }
      }
    }

    return {
      id: `internship-${int.id}`,
      sourceId: int.id,
      type: "internship",
      title: int.title,
      company: int.company,
      location: int.city ? `${int.city}${int.state ? `, ${int.state}` : ""}` : (int.location || "Remote"),
      compensation: int.stipend ? `₹${int.stipend.toLocaleString("en-IN")}/mo` : undefined,
      rawCompensation: int.stipend || 0,
      duration: int.duration || "Standard",
      workType: "Internship",
      tags: skills.slice(0, 3) as string[],
      logoUrl: null,
      href: `/internships/${int.id}`,
      isFeatured: int.isFeatured || false,
      isUrgent: false, 
      createdAt: int.createdAt,
      latitude: (hasCoords && workMode !== "remote") ? int.latitude : undefined,
      longitude: (hasCoords && workMode !== "remote") ? int.longitude : undefined,
      distanceMeters,
      distanceFormatted,
      distanceLabel,
      isApproximateDistance,
      locationType
    }
  })

  // Merge
  let combined = [...normalizedGigs, ...normalizedInternships]

  // Radius filtering (strictly enforce distanceMeters <= maxRadiusMeters; remote jobs without coordinates excluded)
  if (isRadiusFiltering) {
    const maxRadiusMeters = (radiusKm as number) * 1000
    combined = combined.filter(opp => {
      if (opp.distanceMeters === undefined) return false
      return opp.distanceMeters <= maxRadiusMeters
    })
  }

  // Sort
  if (sortBy === "distance" && hasUserLocation) {
    combined.sort((a, b) => {
      // Opportunities with valid distance come first
      if (a.distanceMeters !== undefined && b.distanceMeters !== undefined) {
        return a.distanceMeters - b.distanceMeters
      }
      if (a.distanceMeters !== undefined) return -1
      if (b.distanceMeters !== undefined) return 1
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
  } else if (sortBy === "newest") {
    combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } else if (sortBy === "compensation_high") {
    combined.sort((a, b) => (b.rawCompensation || 0) - (a.rawCompensation || 0))
  } else if (sortBy === "compensation_low") {
    combined.sort((a, b) => (a.rawCompensation || 0) - (b.rawCompensation || 0))
  }
  
  // Pagination
  const totalCount = combined.length
  const paginatedResults = (isDistanceSort || isRadiusFiltering)
    ? combined.slice(skip, skip + limit)
    : combined.slice(0, limit)
  
  const hasMore = (isDistanceSort || isRadiusFiltering)
    ? (skip + limit) < totalCount
    : combined.length > limit

  return {
    opportunities: paginatedResults,
    total: totalCount,
    hasMore
  }
}
