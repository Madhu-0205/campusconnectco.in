/**
 * Opportunity Intelligence Helper
 * CampusConnectCo — Phase 2 Groq Migration
 *
 * Groq / openai/gpt-oss-120b AI intelligence layer.
 * AI is advisory for skill classification and summary refinement.
 * Deterministic algorithms remain authoritative.
 * Gracefully falls back if Groq is unconfigured or times out.
 */

import { aiAdapter } from "./adapter";

const COMMON_TECH_SKILLS = [
  "React", "Next.js", "TypeScript", "JavaScript", "Python", "Java", "C++",
  "Node.js", "Express", "PostgreSQL", "MongoDB", "SQL", "Git", "GitHub",
  "TailwindCSS", "CSS", "HTML", "Docker", "Kubernetes", "AWS", "GCP",
  "Azure", "Machine Learning", "Deep Learning", "AI", "Data Science",
  "Pandas", "NumPy", "PyTorch", "TensorFlow", "Cybersecurity", "DevOps",
  "CI/CD", "Linux", "REST API", "GraphQL", "Figma", "UI/UX", "Product Management"
];

/**
 * Deterministically extracts tech skills from text without AI.
 */
export function extractSkillsDeterministically(text: string): string[] {
  const lower = text.toLowerCase();
  const matched = new Set<string>();

  for (const skill of COMMON_TECH_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(lower)) {
      matched.add(skill);
    }
  }

  return Array.from(matched).slice(0, 8);
}

/**
 * Refines opportunity metadata (skills & summary) using AI with deterministic fallback.
 */
export async function refineOpportunityIntelligence(
  title: string,
  company: string,
  description: string
): Promise<{
  skills: string[];
  summary: string;
  usedAI: boolean;
}> {
  const fallbackSkills = extractSkillsDeterministically(`${title} ${description}`);
  const fallbackSummary = description.length > 200 ? description.slice(0, 200).trim() + "..." : description;

  try {
    const prompt = `Analyze the following job/internship listing for CampusConnectCo students.
Output a strict JSON object with:
- "skills": an array of up to 6 key technical or professional skills.
- "summary": a crisp, 2-sentence summary tailored for student applicants.

Listing:
Title: ${title}
Company: ${company}
Description: ${description.slice(0, 1000)}

JSON format:
{"skills": ["Skill1", "Skill2"], "summary": "Two sentences."}`;

    const responseText = await aiAdapter.chat([
      { role: "system", content: "You are an opportunity intelligence assistant for CampusConnectCo. Output strict JSON only." },
      { role: "user", content: prompt }
    ], { timeoutMs: 5000 });

    // Parse JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const aiSkills = Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : fallbackSkills;
      const aiSummary = typeof parsed.summary === "string" && parsed.summary.trim() ? parsed.summary.trim() : fallbackSummary;

      return {
        skills: aiSkills.map((s: any) => String(s).trim()).filter(Boolean).slice(0, 8),
        summary: aiSummary,
        usedAI: true
      };
    }
  } catch {
    // Call failed, timed out, or in offline environment — fall back gracefully
  }

  return {
    skills: fallbackSkills,
    summary: fallbackSummary,
    usedAI: false
  };
}
