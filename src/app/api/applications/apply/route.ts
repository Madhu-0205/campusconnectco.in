import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { validateSessionUserId, isValidUUID } from "@/lib/uuid-utils";


export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const isPreview = (await cookieStore).get('admin_preview_mode')?.value === 'true';

        if (isPreview) {
            return NextResponse.json({ error: "Cannot submit applications in Preview Mode" }, { status: 403 });
        }

        // Get authenticated user
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = user.id;

        // 🛡️ UUID Guard
        try {
            validateSessionUserId(userId, "POST /api/applications/apply");
        } catch (uuidErr) {
            console.error("[P2023 Guard]", uuidErr);
            return NextResponse.json({ error: "Invalid session. Please sign out and sign in again." }, { status: 400 });
        }

        // Parse request body
        const body = await req.json();
        const { gigId, coverLetter } = body;

        if (!gigId) {
            return NextResponse.json({ error: "Gig ID is required" }, { status: 400 });
        }

        // Validate UUID format to prevent DB casting crashes
        if (!isValidUUID(gigId)) {
            return NextResponse.json({ error: "Invalid Gig ID format" }, { status: 400 });
        }

        // Sanitize and limit cover letter input length
        if (coverLetter && typeof coverLetter === 'string' && coverLetter.length > 5000) {
            return NextResponse.json({ error: "Cover letter must be under 5000 characters" }, { status: 400 });
        }

        // Check if gig exists and is open
        const gig = await prisma.gig.findUnique({
            where: { id: gigId },
            select: {
                id: true,
                status: true,
                posted_by: true,
            },
        });

        if (!gig) {
            return NextResponse.json({ error: "Gig not found" }, { status: 404 });
        }

        if (gig.status !== "OPEN") {
            return NextResponse.json({ error: "This gig is no longer accepting applications" }, { status: 400 });
        }

        // Check if user is the poster
        if (gig.posted_by === userId) {
            return NextResponse.json({ error: "You cannot apply to your own gig" }, { status: 400 });
        }

        // Check if user has already applied
        const existingApplication = await prisma.application.findFirst({
            where: {
                gigId,
                applicantId: userId,
            },
        });

        if (existingApplication) {
            return NextResponse.json({ error: "You have already applied to this gig" }, { status: 400 });
        }

        // Create application
        const application = await prisma.application.create({
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

        return NextResponse.json({
            message: "Application submitted successfully",
            application: {
                id: application.id,
                status: application.status,
                createdAt: application.createdAt,
            },
        });
    } catch (error) {
        console.error("Error creating application:", error);
        return NextResponse.json(
            { error: "Failed to submit application" },
            { status: 500 }
        );
    }
}
