import Groq from "groq-sdk";

const groq = new Groq({
    // Fallback to "dummy" so Next.js build doesn't crash if the env var is missing during static analysis
    apiKey: process.env.GROQ_API_KEY || "dummy",
});

export type AIRequestType = "resume" | "smartmatch" | "career";

export interface AIResponse {
    success: boolean;
    data: unknown;
    error?: string;
}

export class AIService {
    /**
     * Send a request to Groq and return a structured JSON response
     */
    static async generateJSON(systemPrompt: string, userPrompt: string, model: string = "llama-3.3-70b-versatile") {
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: `${systemPrompt}\n\nIMPORTANT: Respond ONLY with a valid JSON object. No markdown, no thinking, no preamble.` },
                    { role: "user", content: userPrompt },
                ],
                model: model,
                response_format: { type: "json_object" },
                temperature: 0.1, // Low temperature for consistent JSON
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error("Empty response from AI");

            // Resiliency: The model might occasionally wrap results in markdown even if told not to
            const cleanedContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(cleanedContent);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "AI Generation Failed";
            console.error("[AI_SERVICE_ERROR]:", error);
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
    static async getCareerRoadmap(targetCareer: string, currentSkills: string[]) {
        const systemPrompt = `You are a professional career path architect. 
        Based on the target career and current skills, create a highly actionable roadmap.
        Return JSON structure: { "roadmapSteps": string[], "learningPath": string[], "projects": string[], "jobPrepTips": string[] }`;

        return this.generateJSON(systemPrompt, `Target: ${targetCareer}\nSkills: ${currentSkills.join(", ")}`);
    }
}
