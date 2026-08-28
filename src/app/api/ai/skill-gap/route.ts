import { NextResponse } from"next/server";

import { getOpenAI, getChatModel } from"@/lib/ai/client";
import { protectApi } from"@/lib/auth-checks";
import prisma from"@/lib/prisma";

export const dynamic ="force-dynamic";

export async function POST(req: Request) {
 try {
 const auth = await protectApi(["FOUNDER","STUDENT"]);
 if (auth.errorResponse) return auth.errorResponse;
 const { user } = auth;
 if (!user) return NextResponse.json({ error:"Unauthorized" }, { status: 401 });

 const body = await req.json();
 const { targetRole } = body;

 if (!targetRole) {
 return NextResponse.json({ error:"targetRole is required" }, { status: 400 });
 }

 // Fetch user's current skills from database
 const dbUser = await prisma.user.findUnique({
 where: { id: user.id },
 include: { userSkills: { include: { skill: true } } }
 });

 const currentSkills = dbUser?.userSkills.map((us: any) => us.skill.name) || [];

 const prompt = `
Candidate is targeting the role:"${targetRole}"
Candidate's current skills: ${currentSkills.join(",") ||"None listed"}

Analyze the skill gap. Identify:
1. Matched Skills: Which of the candidate's current skills are relevant for this target role.
2. Missing Skills: Which essential technical skills, tools, or libraries are missing for this role.
3. Actionable Learning Plan: A structured list of bullet points detailing topics/tools to learn, projects to build, and recommended next steps to bridge the gap.

Return ONLY a valid JSON object matching this structure:
{
"matchedSkills": string[],
"missingSkills": string[],
"learningPlan": string[]
}
`;

 const openai = getOpenAI();
 const response = await openai.chat.completions.create({
 model: getChatModel(),
 response_format: { type:"json_object" },
 messages: [
 { 
 role:"system", 
 content:"You are a professional technical recruiter and talent advisor. Return ONLY valid JSON matching the schema." 
 },
 { 
 role:"user", 
 content: prompt 
 }
 ],
 temperature: 0.5,
 });

 const raw = response.choices[0]?.message?.content ||"{}";
 let parsed;
 try {
 parsed = JSON.parse(raw);
 } catch {
 parsed = {
 matchedSkills: currentSkills.slice(0, 3),
 missingSkills: ["Docker","Kubernetes","Redis"],
 learningPlan: ["Understand containerization principles","Set up Redis cache in Next.js","Deploy a multi-container app"]
 };
 }

 return NextResponse.json({ success: true, data: parsed });
 } catch (error: any) {
 console.error("[SKILL_GAP_POST_ERROR]:", error);
 return NextResponse.json({ error:"Internal Server Error" }, { status: 500 });
 }
}
