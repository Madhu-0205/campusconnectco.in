import { NextRequest, NextResponse } from "next/server";
// Server refresh
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { gigId, revieweeId, rating, comment } = await req.json();

        if (!gigId || !revieweeId || rating === undefined) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

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
