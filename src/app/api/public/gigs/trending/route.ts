import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const gigs = await prisma.gig.findMany({
            where: {
                status: { in: ["OPEN", "PENDING_APPROVAL"] },
            },
            orderBy: { createdAt: "desc" },
            take: 6,
            include: {
                applications: {
                    select: { id: true },
                },
                gigSkills: {
                    include: { skill: true }
                }
            }
        });

        // Map to format expected by LiveGigCard
        const formattedGigs = gigs.map((gig: any) => {
            const skillName = gig.gigSkills?.[0]?.skill?.name || "General";

            return {
                id: gig.id,
                title: gig.title,
                description: gig.description || `I will provide professional ${skillName} services tailored to your needs.`,
                category: skillName,
                startingPrice: Number(gig.budget),
                pay: `â‚¹${gig.budget.toLocaleString()}`,
                distance: "Online / Campus",
                applicants: gig.applications?.length || 0,
                deliveryTime: "3", // Mock 3 days
                isNew: (new Date().getTime() - new Date(gig.createdAt).getTime()) < 1000 * 60 * 60 * 24 * 2,
                seller: {
                    id: gig.posted_by,
                    name: "Campus Student",
                    role: `${skillName} Expert`,
                    isVerified: true,
                    rating: 4.9,
                    reviewsCount: 15
                }
            };
        });

        return NextResponse.json({ gigs: formattedGigs });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Internal error";
        console.error("[PUBLIC_GIGS_GET_ERROR]:", error);
        return NextResponse.json(
            { gigs: [], error: msg },
            { status: 500 }
        );
    }
}
