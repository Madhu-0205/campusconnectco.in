import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-checks"

// POST /api/employer/organization — Create a new organization
export async function POST(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { name } = await req.json()
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 })

    // Check if user already has an org
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (prisma as any).member.findFirst({ where: { userId: user.id } })
    if (existing) return NextResponse.json({ error: "Already in an organization" }, { status: 409 })

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const org = await (prisma as any).organization.create({
      data: {
        name: name.trim(),
        slug: `${slug}-${Date.now()}`,
        members: {
          create: { userId: user.id, role: "OWNER" },
        },
      },
    })

    return NextResponse.json(org, { status: 201 })
  } catch (error) {
    console.error("[/api/employer/organization POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
