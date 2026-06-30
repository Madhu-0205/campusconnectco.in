import { NextResponse } from 'next/server';
import { protectApi } from '@/lib/auth-checks';
import { aiLimiter } from '@/lib/rate-limit';
import prisma from '@/lib/prisma';
import { AIService } from '@/lib/ai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; 

export async function POST(req: Request) {
    // 1. Rate Limiting
    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    if (!(await aiLimiter.check(ip))) {
        return NextResponse.json(
            { error: "Too many AI requests. AI resources are limited. Please try again later." },
            { status: 429 }
        );
    }

    try {
        // 2. Auth Check
        const auth = await protectApi(["FOUNDER", "STUDENT"]);
        if (auth.errorResponse) return auth.errorResponse;

        // 3. Get Real User Profile from DB
        const user = await prisma.user.findUnique({
            where: { id: auth.user!.id },
            select: { skills: true, bio: true, careerGoal: true, branch: true, year: true, }
        });

        if (!user) {
            return NextResponse.json({ error: "User profile not found." }, { status: 404 });
        }

        const userProfile = {
            skills: user.skills ? user.skills.split(',').map((s: string) => s.trim()) : [],
            bio: user.bio || "",
            careerGoal: user.careerGoal || "",
            branch: user.branch || "",
            year: user.year || ""
        };

        // 4. Get active opportunities from DB (limit to 20 for AI context size)
        const activeInternships = await prisma.internship.findMany({
            where: { status: "OPEN" },
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, description: true, skills: true, stipend: true }
        });

        const activeGigs = await prisma.gig.findMany({
            where: { status: "OPEN" },
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, description: true, required_skills: true, budget: true }
        });

        const opportunitiesContext = {
            internships: activeInternships,
            gigs: activeGigs
        };

        let result;
        try {
            result = await AIService.getSmartMatch(userProfile, opportunitiesContext);
        } catch (error: unknown) {
             const msg = error instanceof Error ? error.message : "Unknown error";
             console.error("[SMARTMATCH_ENGINE_CRASH]:", error);
             throw new Error(`Matching Engine Error: ${msg}`);
        }

        // Add correct IDs and types so frontend can format correctly and navigate later
        // `getSmartMatch` ideally retains `id` but just to be sure we format the type!
        
        if (result && result.internships) {
             result.internships = result.internships.map((i: Record<string, unknown>) => ({ ...i, type: "Internship" }));
        }
        if (result && result.gigs) {
             result.gigs = result.gigs.map((g: Record<string, unknown>) => ({ ...g, type: "Gig" }));
        }

        return NextResponse.json({ success: true, data: result });

    } catch (error: unknown) {
        console.error("[SMARTMATCH_API_ERROR]:", error);
        const errObj = error instanceof Error ? error : new Error(String(error));
        
        if (errObj.message?.includes("API Key")) {
            return NextResponse.json({ error: "AI Service Configuration Error. Contact Admin." }, { status: 500 });
        }

        return NextResponse.json(
            { error: errObj.message || "Failed to generate matches. Please try again." },
            { status: 500 }
        );
    }
}
