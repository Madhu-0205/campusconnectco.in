import { NextResponse } from 'next/server';

import { AIService, AIConfigurationError, AIRateLimitError } from '@/lib/ai';
import { protectApi } from '@/lib/auth-checks';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface CareerRoadmapDelegate {
    findMany: (args: unknown) => Promise<unknown>;
    create: (args: unknown) => Promise<unknown>;
}
const getRoadmap = () => (prisma as unknown as { careerRoadmap: CareerRoadmapDelegate }).careerRoadmap;

export async function GET() {
    try {
        const auth = await protectApi(["FOUNDER", "STUDENT"]);
        if (auth.errorResponse) return auth.errorResponse;

        const roadmaps = await getRoadmap().findMany({
            where: { userId: auth.user!.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, data: roadmaps });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Internal error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const auth = await protectApi(["FOUNDER", "STUDENT"]);
        if (auth.errorResponse) return auth.errorResponse;

        const { targetCareer, currentSkills } = await req.json();

        if (!targetCareer) {
            return NextResponse.json({ error: "Target career is required." }, { status: 400 });
        }

        // Generate via AI
        const roadmapData = await AIService.getCareerRoadmap(targetCareer, currentSkills || []);

        // Save to DB
        const savedRoadmap = await getRoadmap().create({
            data: {
                userId: auth.user!.id,
                targetCareer,
                currentSkills: currentSkills?.join(',') || '',
                roadmapData,
            }
        });

        return NextResponse.json({ success: true, data: savedRoadmap });
    } catch (error: unknown) {
        console.error("[CAREER_COOP_ERROR]:", error);

        if (error instanceof AIConfigurationError) {
            return NextResponse.json({ error: "AI service is not configured correctly." }, { status: 503 });
        }
        if (error instanceof AIRateLimitError) {
            return NextResponse.json({ error: "AI quota exceeded. Please try again later." }, { status: 429 });
        }

        const msg = error instanceof Error ? error.message : "Internal error";
        return NextResponse.json(
            { error: msg || "Failed to generate roadmap." },
            { status: 500 }
        );
    }
}
