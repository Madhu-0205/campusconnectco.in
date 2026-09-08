import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth-checks";
import { isValidLifecycleTransition } from "@/lib/opportunities/lifecycle";
import { prisma } from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security/sanitization";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Invalid internship ID format" }, { status: 400 });
    }

    const internship = await prisma.internship.findUnique({
      where: { id },
      include: {
        poster: {
          select: { id: true, name: true, image: true, email: true },
        },
      },
    });

    if (internship) return NextResponse.json(internship);

    return NextResponse.json({ error: "Internship not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, role, errorResponse } = await requireUser();
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Invalid internship ID format" }, { status: 400 });
    }

    const body = await req.json();
    const internship = await prisma.internship.findUnique({ where: { id } });
    if (!internship) return NextResponse.json({ error: "Internship not found" }, { status: 404 });

    // Strict server-side ownership verification
    if (internship.posted_by !== user.id && role !== "ADMIN" && role !== "FOUNDER") {
      return NextResponse.json({ error: "Forbidden: You do not own this opportunity" }, { status: 403 });
    }

    let nextStatus = body.status;
    if (nextStatus === "CLOSED") nextStatus = "COMPLETED";
    if (nextStatus === "ARCHIVED") nextStatus = "INACTIVE";

    let completedAt = internship.completedAt;
    let deletedAt = internship.deletedAt;

    if (nextStatus) {
      const transitionCheck = isValidLifecycleTransition(internship.status, nextStatus);
      if (!transitionCheck.valid) {
        return NextResponse.json({ error: transitionCheck.reason }, { status: 400 });
      }

      if (nextStatus === "COMPLETED") completedAt = new Date();
      else if (nextStatus === "OPEN") completedAt = null;
      if (nextStatus === "DELETED") deletedAt = new Date();
    }

    const updateData: any = {
      ...(body.title !== undefined ? { title: sanitizeInput(body.title) } : {}),
      ...(body.description !== undefined ? { description: sanitizeInput(body.description) } : {}),
      ...(body.company !== undefined ? { company: sanitizeInput(body.company) } : {}),
      ...(body.skills !== undefined ? { skills: body.skills ? sanitizeInput(body.skills) : null } : {}),
      ...(body.stipend !== undefined ? { stipend: body.stipend } : {}),
      ...(body.duration !== undefined ? { duration: body.duration ? sanitizeInput(body.duration) : null } : {}),
      ...(body.location !== undefined ? { location: body.location ? sanitizeInput(body.location) : null } : {}),
      ...(body.deadline !== undefined ? { deadline: body.deadline ? new Date(body.deadline) : null } : {}),
      ...(body.tags !== undefined ? { tags: body.tags ? sanitizeInput(body.tags) : null } : {}),
      ...(nextStatus !== undefined ? { status: nextStatus, completedAt, deletedAt } : {}),
    };

    const updated = await prisma.internship.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[INTERNSHIP_ID_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, role, errorResponse } = await requireUser();
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Invalid internship ID format" }, { status: 400 });
    }

    const internship = await prisma.internship.findUnique({ where: { id } });
    if (!internship) return NextResponse.json({ error: "Internship not found" }, { status: 404 });

    if (internship.posted_by !== user.id && role !== "ADMIN" && role !== "FOUNDER") {
      return NextResponse.json({ error: "Forbidden: You do not own this opportunity" }, { status: 403 });
    }

    const transitionCheck = isValidLifecycleTransition(internship.status, "DELETED");
    if (!transitionCheck.valid) {
      return NextResponse.json({ error: transitionCheck.reason }, { status: 400 });
    }

    await prisma.internship.update({
      where: { id },
      data: {
        status: "DELETED",
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: "Internship soft-deleted successfully" });
  } catch (error) {
    console.error("[INTERNSHIP_ID_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
