import { NextResponse } from 'next/server';

import { puterAI } from '@/lib/ai/puter';
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

 const prompt = `
You are an expert Career Coach and Technical Interviewer.
The user wants to become a ${targetRole || 'Software Engineer'}.
Here is their parsed resume data:
${JSON.stringify(resumeData)}

Generate a personalized Career Roadmap and Interview Preparation guide.
Return JSON strictly adhering to this schema:
{
"roadmap": {
"currentLevel":"e.g. Junior",
"nextSkills": ["..."],
"recommendedCourses": ["..."],
"suggestedProjects": ["..."],
"timeline": ["Month 1: ...","Month 2: ..."]
 },
"interviewPrep": {
"behavioralQuestions": [{"question":"...","difficulty":"Medium" }],
"technicalTopics": ["..."],
"systemDesignTopics": ["..."],
"companySpecific": ["..."]
 }
}
Return ONLY valid JSON.
 `;

    let guidanceData: any;
    try {
      const content = await puterAI.chat([
        { role: 'system', content: prompt }
      ], { temperature: 0.3, maxTokens: 1000 });

      const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
      guidanceData = JSON.parse(cleaned);
    } catch {
      guidanceData = {
        roadmap: {
          currentLevel: "Junior / Entry Level",
          nextSkills: ["TypeScript", "System Architecture", "Testing (Vitest/Jest)"],
          recommendedCourses: ["Full Stack Open", "CS50 Web Programming"],
          suggestedProjects: ["Full-stack e-commerce or marketplace with live database"],
          timeline: ["Month 1: Core DSA and System Foundations", "Month 2: Capstone Projects and Interview Prep"]
        },
        interviewPrep: {
          behavioralQuestions: [{ question: "Describe a complex technical challenge you solved.", difficulty: "Medium" }],
          technicalTopics: ["Data Structures", "REST & GraphQL APIs", "Database Indexing"],
          systemDesignTopics: ["Caching", "Authentication and Authorization", "Rate Limiting"],
          companySpecific: ["Focus on core product development and clean code practices."]
        }
      };
    }

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
