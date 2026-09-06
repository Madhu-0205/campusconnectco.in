import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security/sanitization";
import { createClient } from "@/lib/supabase/server";
import { validateSessionUserId } from "@/lib/uuid-utils";

const ApplySchema = z.object({
  gigId: z.string().uuid("Invalid Gig ID format"),
  coverLetter: z.string().max(5000, "Cover letter must be under 5000 characters").optional().nullable(),
});

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("admin_preview_mode")?.value === "true";

    if (isPreview) {
      return NextResponse.json({ error: "Cannot submit applications in Preview Mode" }, { status: 403 });
    }

    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // 2. Validate UUID
    try {
      validateSessionUserId(userId, "POST /api/applications/apply");
    } catch (uuidErr) {
      logger.error("[P2023 Guard] Invalid Session ID", uuidErr, { userId });
      return NextResponse.json({ error: "Invalid session. Please sign out and sign in again." }, { status: 400 });
    }

    // 3. Verify user role & status in database
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isSuspended: true, name: true, email: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    if (dbUser.isSuspended) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    if (dbUser.role !== "STUDENT") {
      return NextResponse.json({ error: "Only student accounts are eligible to apply for gigs" }, { status: 403 });
    }

    // 4. Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parseResult = ApplySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { gigId } = parseResult.data;
    const coverLetter = parseResult.data.coverLetter ? sanitizeInput(parseResult.data.coverLetter) : null;

    // 5. Verify gig exists and is open
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      select: {
        id: true,
        status: true,
        posted_by: true,
        title: true,
        poster: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    if (gig.status !== "OPEN") {
      return NextResponse.json({ error: "This gig is no longer accepting applications" }, { status: 400 });
    }

    // 6. Self-apply guard
    if (gig.posted_by === userId) {
      return NextResponse.json({ error: "You cannot apply to your own gig" }, { status: 400 });
    }

    // 7. Duplicate application prevention
    const existingApplication = await prisma.application.findFirst({
      where: {
        gigId,
        applicantId: userId,
      },
    });

    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied to this gig" }, { status: 400 });
    }

    // 8. Transactional consistency: Create application and in-app notifications atomically
    const [application] = await prisma.$transaction(async (tx) => {
      const newApp = await tx.application.create({
        data: {
          gigId,
          applicantId: userId,
          coverLetter: coverLetter || null,
          status: "PENDING",
        },
        include: {
          gig: {
            select: {
              title: true,
              posted_by: true,
            },
          },
          applicant: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      // In-app notification for gig poster (Founder/Client)
      await tx.notification.create({
        data: {
          userId: gig.posted_by,
          type: "APPLICATION_RECEIVED",
          title: "New Application Received",
          message: `${dbUser.name || "A student"} submitted an application for "${gig.title}".`,
          link: `/client-hub/applicants?gigId=${gig.id}`,
        },
      });

      // In-app notification for applicant (Student)
      await tx.notification.create({
        data: {
          userId: userId,
          type: "APPLICATION_SUBMITTED",
          title: "Application Submitted",
          message: `Your application for "${gig.title}" has been successfully submitted.`,
          link: `/dashboard/student/applications`,
        },
      });

      return [newApp];
    });

    // 9. Send Resend transactional emails (fire-and-forget after DB transaction succeeds)
    import("@/lib/email/resend")
      .then(async ({ sendTransactionalEmail }) => {
        const { ApplicationSubmittedEmail } = await import("@/lib/email/templates/ApplicationSubmittedEmail");
        const { NewApplicationFounderEmail } = await import("@/lib/email/templates/NewApplicationFounderEmail");

        // Confirmation to applicant
        if (application.applicant?.email) {
          await sendTransactionalEmail({
            to: application.applicant.email,
            subject: `Application Submitted: ${gig.title}`,
            react: ApplicationSubmittedEmail({
              applicantName: application.applicant.name || "there",
              gigTitle: gig.title,
              applicationId: application.id,
            }) as any,
          });
        }

        // Alert to founder
        if (gig.poster?.email) {
          await sendTransactionalEmail({
            to: gig.poster.email,
            subject: `New applicant for: ${gig.title}`,
            react: NewApplicationFounderEmail({
              founderName: gig.poster.name || "Founder",
              applicantName: application.applicant?.name || "A student",
              gigTitle: gig.title,
              applicationId: application.id,
            }) as any,
          });
        }
      })
      .catch(console.error);

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    logger.error("Error submitting application", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
