import { GoogleGenerativeAI } from "@google/generative-ai";

import { logger } from "@/lib/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy");

export type AIRequestType = "resume" | "smartmatch" | "career";

export interface AIResponse {
    success: boolean;
    data: unknown;
    error?: string;
}

export class AIService {
    /**
     * Send a request to Gemini and return a structured JSON response
     */
    static async generateJSON(systemPrompt: string, userPrompt: string, model: string = "gemini-1.5-flash") {
        try {
            const generativeModel = genAI.getGenerativeModel({
                model: model,
                systemInstruction: `${systemPrompt}\n\nIMPORTANT: Respond ONLY with a valid JSON object. No markdown, no thinking, no preamble.`,
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.1,
                }
            });

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 50000); // 50 seconds

            const result = await generativeModel.generateContent({
                contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            }, { signal: controller.signal });
            
            clearTimeout(timeoutId);

            const content = result.response.text();
            
            if (!content) throw new Error("Empty response from AI");

            // Resiliency: The model might occasionally wrap results in markdown even if told not to
            const cleanedContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(cleanedContent);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "AI Generation Failed";
            
            if (error instanceof Error && error.name === 'AbortError') {
                logger.error("AI Request Timeout", error, { model });
                throw new Error("AI Request timed out. Please try again.");
            }
            
            logger.error("AI Service Error", error, { model });
            throw new Error(msg);
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
