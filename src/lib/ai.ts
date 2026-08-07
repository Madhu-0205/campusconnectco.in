import { GoogleGenerativeAI } from "@google/generative-ai";

import { logger } from "@/lib/logger";

// Fail fast at module load time if the key is missing.
// This surfaces a clear 503 (config error) instead of a cryptic 500 from a
// runtime "dummy" key rejection by the Google API.
if (!process.env.GEMINI_API_KEY) {
    console.error(
        "[AIService] CRITICAL: GEMINI_API_KEY environment variable is not set. " +
        "All AI endpoints will return 503 until it is configured."
    );
}

// Lazily initialised so that the module can be imported without crashing
// tests / builds that don't exercise AI paths.
let _genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
    if (!process.env.GEMINI_API_KEY) {
        throw new AIConfigurationError("GEMINI_API_KEY is not configured.");
    }
    if (!_genAI) {
        _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return _genAI;
}

/**
 * Thrown when the AI service is misconfigured (missing / invalid API key).
 * Routes should catch this and return 503.
 */
export class AIConfigurationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AIConfigurationError";
    }
}

/**
 * Thrown when the AI service is rate-limited by the upstream provider.
 * Routes should catch this and return 429.
 */
export class AIRateLimitError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AIRateLimitError";
    }
}

export type AIRequestType = "resume" | "smartmatch" | "career";

export interface AIResponse {
    success: boolean;
    data: unknown;
    error?: string;
}

export class AIService {
    /**
     * Send a request to Gemini and return a structured JSON response.
     * Throws typed errors that callers can map to specific HTTP status codes.
     */
    static async generateJSON(systemPrompt: string, userPrompt: string, model: string = "gemini-1.5-flash") {
        const genAI = getGenAI(); // throws AIConfigurationError if key is missing

        const generativeModel = genAI.getGenerativeModel({
            model,
            systemInstruction: `${systemPrompt}\n\nIMPORTANT: Respond ONLY with a valid JSON object. No markdown, no thinking, no preamble.`,
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1,
            }
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 50000); // 50 seconds

        try {
            const result = await generativeModel.generateContent({
                contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            }, { signal: controller.signal });

            clearTimeout(timeoutId);

            const content = result.response.text();
            if (!content) throw new Error("Empty response from AI model.");

            // Resiliency: the model might occasionally wrap results in markdown
            // even when instructed not to.
            const cleanedContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(cleanedContent);

        } catch (error: unknown) {
            clearTimeout(timeoutId);

            // Re-throw typed errors unchanged so callers can pattern-match them.
            if (error instanceof AIConfigurationError || error instanceof AIRateLimitError) {
                throw error;
            }

            if (error instanceof Error && error.name === "AbortError") {
                logger.error("AI Request Timeout", error, { model });
                throw new Error("AI request timed out after 50 seconds. Please try again.");
            }

            // Detect upstream provider auth / config errors without fragile
            // substring matching on HTTP status codes embedded in messages.
            const msg = error instanceof Error ? error.message : String(error);
            const lowerMsg = msg.toLowerCase();

            if (
                lowerMsg.includes("api key not valid") ||
                lowerMsg.includes("api_key_invalid") ||
                lowerMsg.includes("invalid api key") ||
                lowerMsg.includes("permission_denied") ||
                // Google SDK wraps HTTP 400 / 403 for auth failures
                (lowerMsg.includes("[400]") || lowerMsg.includes("[403]"))
            ) {
                logger.error("AI Service Configuration Error", error, { model });
                throw new AIConfigurationError(
                    `Gemini API key is invalid or lacks permission. Original: ${msg}`
                );
            }

            if (lowerMsg.includes("429") || lowerMsg.includes("resource_exhausted") || lowerMsg.includes("quota")) {
                logger.error("AI Rate Limit Hit", error, { model });
                throw new AIRateLimitError(`Gemini API quota exceeded. Original: ${msg}`);
            }

            // Preserve the original error (with its stack) rather than wrapping it,
            // so the route logger captures the full trace.
            logger.error("AI Service Error", error, { model });
            throw error;
        }
    }

    /**
     * Resume Analysis Logic
     */
    static async analyzeResume(resumeText: string) {
        const systemPrompt = `You are an expert ATS (Applicant Tracking System) and Career Coach. 
        Analyze the provided resume text and provide a detailed score and feedback.
        Return JSON structure: { "score": number, "strengths": string[], "weaknesses": string[], "missingSkills": string[], "suggestions": string[] }`;

        return this.generateJSON(systemPrompt, `Analyze this resume: ${resumeText}`);
    }

    /**
     * SmartMatch Recommendations
     */
    static async getSmartMatch(userData: Record<string, unknown>, opportunities: Record<string, unknown>) {
        const systemPrompt = `You are a career matching engine. 
        Match the user's profile with the available opportunities (internships and gigs).
        Provide match scores (0-100) and explain why it's a match.
        Also suggest 3 specific skills to learn and a brief roadmap.
        Return JSON structure: { "internships": { "id": string, "title": string, "description": string, "matchScore": number }[], "gigs": { "id": string, "title": string, "description": string, "matchScore": number }[], "skillsToLearn": string[], "roadmap": string[] }`;

        const userContext = JSON.stringify(userData);
        const opportunitiesContext = JSON.stringify(opportunities);

        return this.generateJSON(systemPrompt, `User: ${userContext}\nOpportunities: ${opportunitiesContext}`);
    }

    /**
     * Career Copilot Roadmap
     */
    static async getCareerRoadmap(targetCareer: string, currentSkills: string[] | string) {
        const systemPrompt = `You are a professional career path architect. 
        Based on the target career and current skills, create a highly actionable roadmap.
        Return JSON structure: { "roadmapSteps": string[], "learningPath": string[], "projects": string[], "jobPrepTips": string[] }`;

        const skillsString = Array.isArray(currentSkills) ? currentSkills.join(", ") : String(currentSkills || "");
        return this.generateJSON(systemPrompt, `Target: ${targetCareer}\nSkills: ${skillsString}`);
    }
}
