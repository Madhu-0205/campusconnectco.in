import { NextResponse } from "next/server";
import { protectApi } from "@/lib/auth-checks";
import { aiLimiter } from "@/lib/rate-limit";
import { AIService } from "@/lib/ai";
import { z } from "zod";

const aiRequestSchema = z.object({
    type: z.enum(["resume", "smartmatch", "career"]),
    data: z.unknown(),
});

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Groq is fast, but we'll set it for the full logic

export async function POST(req: Request) {
    // 1. Rate Limiting (20 requests / 10 minutes)
    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    if (!(await aiLimiter.check(ip))) {
        return NextResponse.json(
            { error: "Too many AI requests. AI resources are limited. Please try again in 10 minutes." },
            { status: 429 }
        );
    }

    try {
        // 2. Auth Check
        const auth = await protectApi(["FOUNDER", "STUDENT"]);
        if (auth.errorResponse) return auth.errorResponse;

        // 3. Request Parsing & Validation
        const json = await req.json();
        const parsed = aiRequestSchema.safeParse(json);

        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid request data format." }, { status: 400 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { type, data } = parsed.data as { type: string, data: any };

        // 4. AIService Routing
        let result;

        switch (type) {
            case "resume":
                if (!data.resumeText) throw new Error("Resume text is required.");
                result = await AIService.analyzeResume(data.resumeText);
                break;

            case "smartmatch":
                if (!data.userProfile || !data.opportunities) throw new Error("User profile and opportunities are required.");
                result = await AIService.getSmartMatch(data.userProfile, data.opportunities);
                break;

            case "career":
                if (!data.targetCareer) throw new Error("Target career is required.");
                result = await AIService.getCareerRoadmap(data.targetCareer, data.currentSkills || []);
                break;

            default:
                throw new Error("Invalid AI request type.");
        }

        return NextResponse.json({ success: true, data: result });

    } catch (error: unknown) {
        console.error("[AI_API_ERROR]:", error);
        const errObj = error instanceof Error ? error : new Error(String(error));
        
        // Handle specific Groq API errors
        if (errObj.message?.includes("API Key")) {
            return NextResponse.json({ error: "AI Service Configuration Error. Contact Admin." }, { status: 500 });
        }

        return NextResponse.json(
            { error: errObj.message || "The AI model is busy or failed to respond. Please try again." },
            { status: 500 }
        );
    }
}
