import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-checks"

// PATCH /api/employer/organization/[id] — Update org profile
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    // Verify membership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const membership = await (prisma as any).member.findFirst({
      where: { userId: user.id, organizationId: id },
    })
    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { name, website, industry, size, bio, techStack, socialLinks, logo, coverImage } = body

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await (prisma as any).organization.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(website !== undefined && { website }),
        ...(industry !== undefined && { industry }),
        ...(size !== undefined && { size }),
        ...(bio !== undefined && { bio }),
        ...(techStack !== undefined && { techStack }),
        ...(socialLinks !== undefined && { socialLinks }),
        ...(logo !== undefined && { logo }),
        ...(coverImage !== undefined && { coverImage }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[/api/employer/organization/[id] PATCH]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
