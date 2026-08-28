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
}

export interface FetchOpportunitiesParams {
  query?: string
  category?: string
  location?: string
  type?: "all" | "gig" | "internship"
  page?: number
  limit?: number
  sortBy?: "newest" | "compensation_high" | "compensation_low"
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
  } = params

  const skip = page * limit

  const fetchGigs = type === "all" || type === "gig"
  const fetchInternships = type === "all" || type === "internship"

  // Gig.status defaults to "active" in schema; Internship.status defaults to "OPEN"
  // Query for both possible active states to be safe
  const gigWhere: any = { status: { in: ["OPEN", "active"] } }
  const intWhere: any = { status: "OPEN" }

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

  // 3. Location
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

  // 4. Sorting
  let gigOrderBy: any = { createdAt: "desc" }
  let intOrderBy: any = { createdAt: "desc" }

  if (sortBy === "compensation_high") {
    gigOrderBy = { budget: "desc" }
    intOrderBy = { stipend: "desc" }
  } else if (sortBy === "compensation_low") {
    gigOrderBy = { budget: "asc" }
    intOrderBy = { stipend: "asc" }
  }

  const [gigs, internships] = await Promise.all([
    fetchGigs ? prisma.gig.findMany({
      where: gigWhere,
      orderBy: gigOrderBy,
      take: limit, 
      skip: skip,
      include: {
        poster: { select: { id: true, name: true, image: true, college: true } }
      }
    }) : Promise.resolve([]),
    fetchInternships ? prisma.internship.findMany({
      where: intWhere,
      orderBy: intOrderBy,
      take: limit,
      skip: skip,
    }) : Promise.resolve([])
  ])

  // Normalize Gigs
  const normalizedGigs: OpportunityNormalized[] = gigs.map(gig => {
    const skills = typeof gig.required_skills === "string" 
      ? gig.required_skills.split(",").map(s => s.trim()).filter(Boolean)
      : Array.isArray(gig.required_skills) ? gig.required_skills : []

    return {
      id: `gig-${gig.id}`,
      sourceId: gig.id,
      type: "gig",
      title: gig.title,
      company: gig.poster?.name || "CampusConnect Member",
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
      latitude: gig.latitude,
      longitude: gig.longitude
    }
  })

  // Normalize Internships
  const normalizedInternships: OpportunityNormalized[] = internships.map(int => {
    const skills = int.skills ? int.skills.split(",").map(s => s.trim()).filter(Boolean) : []

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
      logoUrl: null, // Internships might not have logos in this schema unless linked to a startup profile
      href: `/dashboard/student/internships/${int.id}`, 
      isFeatured: int.isFeatured || false,
      isUrgent: false, 
      createdAt: int.createdAt,
      latitude: int.latitude,
      longitude: int.longitude
    }
  })

  // Merge and Sort
  const combined = [...normalizedGigs, ...normalizedInternships]

  if (sortBy === "newest") {
    combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } else if (sortBy === "compensation_high") {
    combined.sort((a, b) => (b.rawCompensation || 0) - (a.rawCompensation || 0))
  } else if (sortBy === "compensation_low") {
    combined.sort((a, b) => (a.rawCompensation || 0) - (b.rawCompensation || 0))
  }
  
  const results = combined.slice(0, limit)
  
  const hasMore = combined.length > limit

  return {
    opportunities: results,
    hasMore
  }
}
