import { NextRequest, NextResponse } from "next/server";

// Server refresh
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

import { z } from "zod";
import { sanitizeInput } from "@/lib/security/sanitization";

const ReviewSchema = z.object({
    gigId: z.string().uuid("Invalid Gig ID format"),
    revieweeId: z.string().uuid("Invalid Reviewee ID format"),
    rating: z.number().min(1, "Minimum rating is 1").max(5, "Maximum rating is 5"),
    comment: z.string().max(1000, "Comment must be under 1000 characters").optional().nullable(),
});

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const parseResult = ReviewSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { gigId, revieweeId, rating } = parseResult.data;
        const comment = parseResult.data.comment ? sanitizeInput(parseResult.data.comment) : null;

        if (user.id === revieweeId) {
            return NextResponse.json({ error: "Cannot review yourself" }, { status: 400 });
        }

        // Verify gig exists and is completed
        const gig = await prisma.gig.findUnique({
            where: { id: gigId },
            include: { applications: { where: { status: "ACCEPTED" } }, poster: true }
        });

        if (!gig) return NextResponse.json({ error: "Gig not found" }, { status: 404 });
        if (gig.status !== "COMPLETED") return NextResponse.json({ error: "Gig is not completed yet" }, { status: 400 });

        // Ensure user is involved in the gig
        const acceptedApp = gig.applications[0];
        if (!acceptedApp) return NextResponse.json({ error: "No accepted application" }, { status: 400 });

        const isClient = gig.posted_by === user.id;
        const isWorker = acceptedApp.applicantId === user.id;

        if (!isClient && !isWorker) {
            return NextResponse.json({ error: "You are not involved in this gig" }, { status: 403 });
        }

        // Verify that the reviewee is indeed the other party
        if (isClient && revieweeId !== acceptedApp.applicantId) {
            return NextResponse.json({ error: "You can only review the student who completed the gig" }, { status: 400 });
        }

        if (isWorker && revieweeId !== gig.posted_by) {
            return NextResponse.json({ error: "You can only review the client of the gig" }, { status: 400 });
        }

        const review = await prisma.review.create({
            data: {
                gigId,
                reviewerId: user.id,
                revieweeId,
                rating: Number(rating),
                comment,
            }
        });

        // Notify reviewee
        await prisma.notification.create({
            data: {
                userId: revieweeId,
                title: "New Review Received",
                message: `You received a ${rating}-star review for your work on "${gig.title}".`,
                type: "REVIEW",
                link: "/profile"
            }
        });

        return NextResponse.json({ success: true, review });
    } catch (error: unknown) {
        console.error("Review error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
