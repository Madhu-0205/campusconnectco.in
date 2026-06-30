import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-checks"

// POST /api/employer/drives — Create a new campus drive
export async function POST(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { organizationId, title, description, startDate, endDate, colleges } = body

    if (!organizationId || !title || !description || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify user is a member of the organization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const membership = await (prisma as any).member.findFirst({
      where: { userId: user.id, organizationId },
    })
    if (!membership) {
      return NextResponse.json({ error: "Forbidden: Not a member of this organization" }, { status: 403 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const drive = await (prisma as any).campusDrive.create({
      data: {
        organizationId,
        title: title.trim(),
        description: description.trim(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        targetColleges: Array.isArray(colleges) ? colleges : [],
        status: "UPCOMING",
      },
    })

    return NextResponse.json(drive, { status: 201 })
  } catch (error) {
    console.error("[/api/employer/drives POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET /api/employer/drives — List drives for the user's organization
export async function GET(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const membership = await (prisma as any).member.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    })

    if (!membership) {
      return NextResponse.json([])
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const drives = await (prisma as any).campusDrive.findMany({
      where: { organizationId: membership.organizationId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(drives)
  } catch (error) {
    console.error("[/api/employer/drives GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
