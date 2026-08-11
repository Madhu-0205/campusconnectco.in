import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

// Cache for 1 hour — no DB hit per visit
export const revalidate = 3600

export async function GET() {
  try {
    const [totalUsers, totalGigs, activeGigs, totalInternships] = await Promise.all([
      prisma.user.count(),
      prisma.gig.count(),
      prisma.gig.count({ where: { status: 'OPEN' } }),
      prisma.internship.count({ where: { status: 'OPEN' } }),
    ])

    // Count distinct non-null colleges
    const collegeRows = await prisma.user.findMany({ take: 50,
      select: { college: true },
      distinct: ['college'],
      where: { college: { not: null } },
    })

    return NextResponse.json({
      users: totalUsers,
      gigs: totalGigs,
      activeGigs,
      internships: totalInternships,
      colleges: collegeRows.length,
    })
  } catch {
    // Never crash — return zeros gracefully
    return NextResponse.json({
      users: 0,
      gigs: 0,
      activeGigs: 0,
      internships: 0,
      colleges: 0,
    })
  }
}
