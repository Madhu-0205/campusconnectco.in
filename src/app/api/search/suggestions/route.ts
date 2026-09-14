import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { INDIA_COLLEGES } from "@/lib/colleges-dataset";
import { getActiveOpportunityPrismaFilter } from "@/lib/opportunities/lifecycle";

export const dynamic = "force-dynamic";

export interface SearchSuggestion {
  label: string;
  type: 'skill' | 'city' | 'category' | 'company' | 'type' | 'college';
  filterValue: string;
  filterKey: 'q' | 'location' | 'category' | 'type';
  meta?: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim().toLowerCase();

    if (!query || query.length < 2) {
      return NextResponse.json({
        suggestions: [
          { label: "Internships", type: "type", filterValue: "internship", filterKey: "type", meta: "Opportunity Type" },
          { label: "Campus Gigs", type: "type", filterValue: "gig", filterKey: "type", meta: "Opportunity Type" },
          { label: "Remote Opportunities", type: "type", filterValue: "remote", filterKey: "q", meta: "Work Mode" },
          { label: "Hyderabad", type: "city", filterValue: "hyderabad", filterKey: "location", meta: "City" },
          { label: "Bengaluru", type: "city", filterValue: "bengaluru", filterKey: "location", meta: "City" },
        ]
      }, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
        }
      });
    }

    const suggestions: SearchSuggestion[] = [];

    // 1. Opportunity Types
    if ("internship".includes(query) || "intern".includes(query)) {
      suggestions.push({
        label: "Internships",
        type: "type",
        filterValue: "internship",
        filterKey: "type",
        meta: "Opportunity Type"
      });
    }
    if ("gig".includes(query) || "campus gig".includes(query) || "freelance".includes(query)) {
      suggestions.push({
        label: "Campus Gigs",
        type: "type",
        filterValue: "gig",
        filterKey: "type",
        meta: "Opportunity Type"
      });
    }

    // 2. Real Skills from DB
    const matchingSkills = await prisma.skill.findMany({
      where: {
        name: { contains: query, mode: "insensitive" }
      },
      select: { name: true, category: true },
      take: 4
    });

    for (const skill of matchingSkills) {
      suggestions.push({
        label: skill.name,
        type: "skill",
        filterValue: skill.name,
        filterKey: "q",
        meta: skill.category || "Skill"
      });
    }

    // 3. Real Active Cities from strictly active, non-expired Gigs & Internships
    const activeFilter = getActiveOpportunityPrismaFilter();
    const [gigCities, internshipCities] = await Promise.all([
      prisma.gig.findMany({
        where: {
          status: { in: ["OPEN", "active"] },
          ...activeFilter,
          city: { contains: query, mode: "insensitive" }
        },
        select: { city: true },
        distinct: ["city"],
        take: 3
      }),
      prisma.internship.findMany({
        where: {
          status: "OPEN",
          ...activeFilter,
          city: { contains: query, mode: "insensitive" }
        },
        select: { city: true },
        distinct: ["city"],
        take: 3
      })
    ]);

    const distinctCities = Array.from(
      new Set(
        [...gigCities, ...internshipCities]
          .map(c => c.city)
          .filter((c): c is string => Boolean(c && c.trim()))
      )
    ).slice(0, 3);

    for (const city of distinctCities) {
      suggestions.push({
        label: city,
        type: "city",
        filterValue: city.toLowerCase(),
        filterKey: "location",
        meta: "City"
      });
    }

    // 4. Real Companies from strictly active, non-expired internships
    const matchingCompanies = await prisma.internship.findMany({
      where: {
        status: "OPEN",
        ...activeFilter,
        company: { contains: query, mode: "insensitive" }
      },
      select: { company: true },
      distinct: ["company"],
      take: 2
    });

    for (const comp of matchingCompanies) {
      if (comp.company) {
        suggestions.push({
          label: comp.company,
          type: "company",
          filterValue: comp.company,
          filterKey: "q",
          meta: "Company"
        });
      }
    }

    // 5. College suggestions from INDIA_COLLEGES
    const matchedColleges = INDIA_COLLEGES.filter(col => 
      col.name.toLowerCase().includes(query) || 
      (col.city && col.city.toLowerCase().includes(query))
    ).slice(0, 2);

    for (const col of matchedColleges) {
      suggestions.push({
        label: col.name,
        type: "college",
        filterValue: col.city ? col.city.toLowerCase() : col.name,
        filterKey: col.city ? "location" : "q",
        meta: col.city ? `Campus in ${col.city}` : "College"
      });
    }

    return NextResponse.json(
      { suggestions: suggestions.slice(0, 8) },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
        }
      }
    );
  } catch (error) {
    console.error("API Error in src/app/api/search/suggestions/route.ts:", error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
