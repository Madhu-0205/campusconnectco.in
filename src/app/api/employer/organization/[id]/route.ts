import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getSession } from "@/lib/auth-checks"
import prisma from "@/lib/prisma"
import { sanitizeInput } from "@/lib/security/sanitization"

const OrgUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long").optional(),
  website: z.string().url("Invalid website URL").or(z.literal("")).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  size: z.string().max(50).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  techStack: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  socialLinks: z.any().optional().nullable(),
  logo: z.string().max(1000).optional().nullable(),
  coverImage: z.string().max(1000).optional().nullable(),
});

// PATCH /api/employer/organization/[id] — Update org profile
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    // Validate UUID format to prevent DB casting crashes
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Invalid organization ID format" }, { status: 400 });
    }

    // Verify membership
    const membership = await (prisma as any).member.findFirst({
      where: { userId: user.id, organizationId: id },
    })
    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    let body;
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const parseResult = OrgUpdateSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parseResult.data

    // Sanitize string inputs
    const name = data.name ? sanitizeInput(data.name) : undefined;
    const website = data.website ? sanitizeInput(data.website) : undefined;
    const industry = data.industry !== undefined ? (data.industry ? sanitizeInput(data.industry) : null) : undefined;
    const size = data.size !== undefined ? (data.size ? sanitizeInput(data.size) : null) : undefined;
    const bio = data.bio !== undefined ? (data.bio ? sanitizeInput(data.bio) : null) : undefined;
    const logo = data.logo !== undefined ? (data.logo ? sanitizeInput(data.logo) : null) : undefined;
    const coverImage = data.coverImage !== undefined ? (data.coverImage ? sanitizeInput(data.coverImage) : null) : undefined;

    let formattedTechStack: string[] | null | undefined = undefined;
    if (data.techStack !== undefined) {
      if (data.techStack === null) {
        formattedTechStack = null;
      } else {
        const arr = Array.isArray(data.techStack) ? data.techStack : data.techStack.split(",");
        formattedTechStack = arr.map(t => sanitizeInput(t.trim())).filter(Boolean);
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (website !== undefined) updateData.website = website;
    if (industry !== undefined) updateData.industry = industry;
    if (size !== undefined) updateData.size = size;
    if (bio !== undefined) updateData.bio = bio;
    if (formattedTechStack !== undefined) updateData.techStack = formattedTechStack;
    if (data.socialLinks !== undefined) updateData.socialLinks = data.socialLinks;
    if (logo !== undefined) updateData.logo = logo;
    if (coverImage !== undefined) updateData.coverImage = coverImage;

    const updated = await (prisma as any).organization.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[/api/employer/organization/[id] PATCH]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
