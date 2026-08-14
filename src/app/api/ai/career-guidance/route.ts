import { NextResponse } from 'next/server';
import { z } from "zod";

import { getOpenAI } from '@/lib/ai/client';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { targetRole } = body;

        // Fetch latest resume analysis for this user
        const latestAnalysis = await prisma.resumeAnalysis.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        });

        if (!latestAnalysis || !latestAnalysis.result) {
            return NextResponse.json({ error: 'No parsed resume found to generate guidance. Please upload your resume first.' }, { status: 400 });
        }

        const resumeData = latestAnalysis.result as any;

        const apiKey = process.env.OPENAI_API_KEY || "";
        const isGroq = apiKey.startsWith("gsk_");
        const model = isGroq ? 'llama-3.3-70b-versatile' : (process.env.AI_CHAT_MODEL || 'gpt-4o-mini');
        const openai = getOpenAI();

        const prompt = `
You are an expert Career Coach and Technical Interviewer.
The user wants to become a ${targetRole || 'Software Engineer'}.
Here is their parsed resume data:
${JSON.stringify(resumeData)}

Generate a personalized Career Roadmap and Interview Preparation guide.
Return JSON strictly adhering to this schema:
{
  "roadmap": {
    "currentLevel": "e.g. Junior",
    "nextSkills": ["..."],
    "recommendedCourses": ["..."],
    "suggestedProjects": ["..."],
    "timeline": ["Month 1: ...", "Month 2: ..."]
  },
  "interviewPrep": {
    "behavioralQuestions": [{ "question": "...", "difficulty": "Medium" }],
    "technicalTopics": ["..."],
    "systemDesignTopics": ["..."],
    "companySpecific": ["..."]
  }
}
Return ONLY valid JSON.
        `;

        const response = await openai.chat.completions.create({
            model: model,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: prompt }
            ]
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("Empty response from AI");

        const guidanceData = JSON.parse(content);

        // Save to CareerRoadmap in DB
        await prisma.careerRoadmap.create({
            data: {
                userId: user.id,
                targetCareer: targetRole || 'Software Engineer',
                currentSkills: resumeData.skills?.join(',') || '',
                roadmapData: guidanceData
            }
        });

        return NextResponse.json({ status: 'completed', result: guidanceData });
    } catch (e: any) {
        console.error("[career-guidance Route Error]:", e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}
