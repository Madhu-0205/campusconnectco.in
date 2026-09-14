import { NextResponse } from "next/server";
import { z } from "zod";

import { safeParseJson } from "@/lib/ai/guards";
import { puterAI } from "@/lib/ai/puter";
import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SkillGapSchema = z.object({
  matchedSkills: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  learningPlan: z.array(z.string()).default([]),
});

type SkillGapResult = z.infer<typeof SkillGapSchema>;

const ROLE_SKILL_REQUIREMENTS: Record<string, string[]> = {
  "Frontend Developer": ["React", "TypeScript", "Tailwind CSS", "Next.js", "HTML/CSS", "Git", "REST APIs"],
  "Backend Developer": ["Node.js", "Express", "PostgreSQL", "Prisma", "REST APIs", "Docker", "Redis"],
  "Full Stack Developer": ["React", "Node.js", "TypeScript", "PostgreSQL", "Git", "Tailwind CSS", "Docker"],
  "Mobile App Developer": ["React Native", "TypeScript", "Mobile UI", "REST APIs", "State Management"],
  "Data Analyst": ["Python", "SQL", "Pandas", "Excel", "Data Visualization", "Statistics"],
  "UI/UX Designer": ["Figma", "Wireframing", "User Research", "Prototyping", "Design Systems"],
};

export async function POST(req: Request) {
  try {
    const auth = await protectApi(["FOUNDER", "STUDENT"]);
    if (auth.errorResponse) return auth.errorResponse;
    const { user } = auth;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { targetRole } = body;

    if (!targetRole || typeof targetRole !== "string" || targetRole.trim().length === 0) {
      return NextResponse.json({ error: "targetRole is required" }, { status: 400 });
    }

    // Fetch user's current skills from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { userSkills: { include: { skill: true } } },
    });

    const currentSkills = dbUser?.userSkills.map((us: any) => us.skill.name) || [];

    // Construct deterministic baseline fallback
    const matchedBaseline = currentSkills.slice(0, 3);
    const standardSkills = ROLE_SKILL_REQUIREMENTS[targetRole.trim()] || ["Docker", "Kubernetes", "Redis", "TypeScript", "System Design"];
    const missingBaseline = standardSkills.filter(
      (s) => !currentSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
    ).slice(0, 4);

    const fallbackResult: SkillGapResult = {
      matchedSkills: matchedBaseline.length > 0 ? matchedBaseline : currentSkills.slice(0, 2),
      missingSkills: missingBaseline.length > 0 ? missingBaseline : ["Docker", "Kubernetes", "Redis"],
      learningPlan: [
        `Strengthen core competency in ${targetRole}`,
        "Complete hands-on projects demonstrating required technologies",
        "Publish project code to GitHub and add to CampusConnect profile",
      ],
    };

    const prompt = `
Candidate is targeting the role: "${targetRole}"
Candidate's current skills: ${currentSkills.join(", ") || "None listed"}

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

    try {
      const responseText = await puterAI.chat([
        {
          role: "system",
          content: "You are a professional technical recruiter and talent advisor. Return ONLY valid JSON matching the schema.",
        },
        {
          role: "user",
          content: prompt,
        },
      ]);

      const parsed = safeParseJson<SkillGapResult>(responseText, SkillGapSchema, fallbackResult);
      return NextResponse.json({ success: true, data: parsed, poweredBy: "Puter.js" });
    } catch {
      // Graceful fallback to deterministic response
      return NextResponse.json({ success: true, data: fallbackResult, poweredBy: "Puter.js", isFallback: true });
    }
  } catch (error: any) {
    console.error("[SKILL_GAP_POST_ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
