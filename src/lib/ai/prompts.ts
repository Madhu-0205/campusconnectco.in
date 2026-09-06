/**
 * Centralized Prompt Architecture for CampusConnect Intelligence Layer (Puter.js)
 *
 * CORE PRINCIPLE:
 * "CampusConnect decides what is true. Puter helps users understand, create, and act on it."
 *
 * RULES ENFORCED IN PROMPTS:
 * 1. Never invent platform facts (salaries, companies, deadlines, locations, roles).
 * 2. Clearly distinguish VERIFIED CAMPUSCONNECT DATA from AI-GENERATED ADVICE.
 * 3. State when information is unavailable in platform records.
 * 4. Never reveal another user's private data.
 * 5. State that AI career/interview evaluations are advisory and not certified guarantees.
 */

import { scrubSensitiveData, validatePromptLength } from "./guards";
import type {
  CopilotContextData,
  MatchExplanationInput,
  OpportunitySummaryInput,
  InterviewQuestionInput
} from "./types";

export function careerCopilotSystemPrompt(context?: CopilotContextData): string {
  let contextSection = "";

  if (context?.user) {
    const u = context.user;
    contextSection += `
AUTHENTICATED STUDENT CONTEXT (VERIFIED):
- Student Name: ${scrubSensitiveData(u.name || "Student")}
- College: ${scrubSensitiveData(u.collegeName || "Campus Network")}
- Branch & Year: ${scrubSensitiveData(`${u.branch || ""} ${u.year || ""}`.trim() || "Not specified")}
- Verified Skills: ${scrubSensitiveData(u.skills || "Not specified")}
- Career Goal: ${scrubSensitiveData(u.careerGoal || "Explore tech gigs and internships")}
`;
  }

  if (context?.topRecommendations && context.topRecommendations.length > 0) {
    contextSection += `
CURRENT VERIFIED TOP MATCHES (from CampusConnect deterministic scoring engine):
${context.topRecommendations
  .map(
    (rec, i) =>
      `${i + 1}. [${rec.type.toUpperCase()}] "${scrubSensitiveData(rec.title)}" by "${scrubSensitiveData(
        rec.company
      )}" | Location: ${scrubSensitiveData(rec.location)} | Score: ${rec.matchScore}/100 | Badges: ${rec.badges.join(", ")}`
  )
  .join("\n")}
`;
  }

  return `You are the CampusConnect Career Copilot, powered by Puter.js.
You are an expert, encouraging mentor for college students finding freelance gigs and tech internships.

${contextSection}

STRICT GUIDELINES:
1. Ground your answers strictly in the verified student profile and marketplace data provided above.
2. If the student asks what to apply for, reference the VERIFIED TOP MATCHES above with their exact titles and companies.
3. Clearly distinguish between:
   - [VERIFIED DATA]: Factual details explicitly provided in the platform context.
   - [AI ADVICE]: Suggested next steps, study resources, and resume preparation.
4. NEVER invent compensation, company facts, deadlines, or locations not present in the verified context.
5. If data is not available, explicitly state: "This detail is not specified in the current opportunity record."
6. Keep answers concise, actionable, structured with markdown, and tailored for college students.
7. End responses with actionable next steps.`.trim();
}

export function matchExplanationPrompt(input: MatchExplanationInput): string {
  return `You are explaining why an opportunity matches a student's profile on CampusConnect.

OPPORTUNITY DATA (VERIFIED):
- Title: ${scrubSensitiveData(input.opportunityTitle)} (${input.opportunityType})
- Company: ${scrubSensitiveData(input.companyName)}
- Deterministic Match Score: ${input.deterministicScore}/100
- Matched Skills: ${input.matchedSkills.join(", ") || "General alignment"}
- Missing Skills: ${input.missingSkills.join(", ") || "None"}
- Location Match: ${
    input.locationContext.isRemote
      ? "Remote opportunity (accessible nationwide)"
      : input.locationContext.isNearby
      ? `Within campus proximity (${input.locationContext.distanceKm ?? 10} km from ${input.locationContext.collegeName ?? "college"})`
      : "Regional campus network"
  }
- Freshness: Posted ${input.freshnessDays === 0 ? "today" : `${input.freshnessDays} days ago`}

INSTRUCTIONS:
Generate a JSON object explaining the match without hallucinating any other data.
Return ONLY valid JSON with this exact schema:
{
  "summary": "1-2 sentence overview of why this opportunity matches",
  "scoreBreakdown": {
    "skillMatchExplanation": "Explanation of skill overlap and relevancy",
    "locationExplanation": "Explanation of proximity or remote convenience",
    "freshnessExplanation": "Explanation of freshness status"
  },
  "suggestedAction": "Concrete next step (e.g. apply, review missing skill)",
  "poweredBy": "Puter.js"
}
Do NOT wrap in extra preamble. Output valid JSON only.`.trim();
}

export function opportunitySummaryPrompt(input: OpportunitySummaryInput): string {
  const sanitizedDesc = validatePromptLength(input.description, 2000);
  return `Summarize this verified opportunity for a college student on CampusConnect.

OPPORTUNITY (VERIFIED):
- Title: ${scrubSensitiveData(input.title)} (${input.type})
- Company: ${scrubSensitiveData(input.company)}
- Location: ${scrubSensitiveData(input.location)}
- Compensation: ${scrubSensitiveData(input.compensation || "Standard platform compensation / competitive")}
- Tags: ${input.tags.join(", ") || "General"}
- Description: ${sanitizedDesc}

INSTRUCTIONS:
Extract and summarize into structured points. Never invent facts not in the description.
Return ONLY a valid JSON object matching this schema:
{
  "whatYouWillDo": ["Bullet 1", "Bullet 2", "Bullet 3"],
  "skillsNeeded": ["Skill 1", "Skill 2"],
  "whoThisSuits": "1 concise sentence describing the ideal student candidate",
  "compensationVerified": "${scrubSensitiveData(input.compensation || "Refer to opportunity listing")}",
  "locationDetails": "${scrubSensitiveData(input.location)}",
  "importantRequirements": ["Requirement 1", "Requirement 2"],
  "preparationTips": ["Tip 1", "Tip 2"],
  "poweredBy": "Puter.js"
}
Output valid JSON only without markdown formatting.`.trim();
}

export function resumeAnalysisPrompt(resumeText: string): string {
  const sanitizedResume = validatePromptLength(resumeText, 8000);
  return `You are an expert Applicant Tracking System (ATS) evaluator and tech career coach for university students.
Analyze the following student resume text:

--- RESUME TEXT ---
${sanitizedResume}
--- END RESUME TEXT ---

INSTRUCTIONS:
Evaluate the resume objectively for technical clarity, impact, readability, and ATS readiness.
Return ONLY a valid JSON object matching this exact schema:
{
  "score": number (0-100),
  "grade": "A+" | "A" | "B+" | "B" | "C+" | "C" | "D",
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string"],
  "skills": ["string", "string"],
  "missingSkills": ["string", "string"],
  "suggestions": ["string", "string", "string"],
  "keywords": ["string", "string"],
  "experienceLevel": "Fresher" | "Junior" | "Mid-level" | "Senior" | "Lead",
  "summary": "2-sentence objective assessment",
  "sectionScores": {
    "skillsMatch": number (0-100),
    "structure": number (0-100),
    "contentDepth": number (0-100),
    "keywordDensity": number (0-100)
  },
  "poweredBy": "Puter.js"
}
Output valid JSON only.`.trim();
}

export function interviewQuestionPrompt(input: InterviewQuestionInput): string {
  const historyText = input.chatHistory
    .map((m) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${scrubSensitiveData(m.content)}`)
    .join("\n");

  return `You are conducting a live technical mock interview for the role of "${scrubSensitiveData(
    input.roleTitle
  )}" at ${input.difficulty} difficulty on CampusConnect, powered by Puter.js.

INTERVIEW CONVERSATION SO FAR:
${historyText || "No previous questions yet. This is the opening question."}

INSTRUCTIONS:
- If this is the start, introduce yourself briefly (under 15 words) and ask the FIRST technical question appropriate for ${input.difficulty} difficulty.
- If the candidate just answered, briefly evaluate their response (1 sentence), provide a constructive hint if incomplete, and ask ONE follow-up or next technical question.
- Ask ONLY ONE question at a time.
- Keep the response concise, professional, and directly relevant to ${scrubSensitiveData(input.roleTitle)}.
- Do not output preamble or commentary. Just speak as the interviewer.`.trim();
}

export function interviewEvaluationPrompt(input: InterviewQuestionInput): string {
  const historyText = input.chatHistory
    .map((m) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${scrubSensitiveData(m.content)}`)
    .join("\n");

  return `Evaluate this technical mock interview transcript for the role of "${scrubSensitiveData(
    input.roleTitle
  )}" at ${input.difficulty} difficulty:

TRANSCRIPT:
${historyText}

INSTRUCTIONS:
Evaluate the candidate's answers for technical depth, communication clarity, and logical problem solving.
Return ONLY a valid JSON object matching this schema:
{
  "score": number (0-100 overall score),
  "feedback": {
    "technical": number (0-100),
    "communication": number (0-100),
    "structure": number (0-100),
    "strengths": ["Top strength 1", "Top strength 2", "Top strength 3"],
    "improvements": ["Improvement 1", "Improvement 2", "Improvement 3"]
  },
  "summary": "2-sentence summary of candidate performance",
  "disclaimer": "AI-generated interview feedback. Advisory only, not a certified assessment.",
  "poweredBy": "Puter.js"
}
Output valid JSON only.`.trim();
}
