import { getOpenAI } from './client';

export interface CoverLetterInput {
  gigTitle: string;
  gigDescription: string;
  gigBudget?: number;
  gigSkills?: string;
  studentName: string;
  studentSkills: string;
  studentBio?: string;
  studentCollege?: string;
  studentBranch?: string;
  studentYear?: string;
  studentProjects?: { title: string; description: string | null }[];
  tone?: 'professional' | 'casual' | 'enthusiastic';
}

export async function generateCoverLetter(input: CoverLetterInput): Promise<string> {
  const {
    gigTitle,
    gigDescription,
    gigBudget,
    gigSkills,
    studentName,
    studentSkills,
    studentBio,
    studentCollege,
    studentBranch,
    studentYear,
    studentProjects = [],
    tone = 'professional',
  } = input;

  const projectSnippet = studentProjects.slice(0, 3)
    .map(p => `• ${p.title}: ${p.description || ''}`)
    .join('\n');

  const prompt = `
Write a ${tone} cover letter for the following gig application.

GIG DETAILS:
Title: ${gigTitle}
Description: ${gigDescription}
${gigBudget ? `Budget: ₹${gigBudget}` : ''}
${gigSkills ? `Required Skills: ${gigSkills}` : ''}

APPLICANT PROFILE:
Name: ${studentName}
College: ${studentCollege || 'N/A'} — ${studentBranch || ''} (${studentYear || ''})
Skills: ${studentSkills}
${studentBio ? `Bio: ${studentBio}` : ''}
${projectSnippet ? `Notable Projects:\n${projectSnippet}` : ''}

INSTRUCTIONS:
- Address the gig poster directly (use "I" for self-reference)
- 3 paragraphs: intro + relevant experience + call to action
- Mention at least one specific skill that matches the gig
- Keep it under 200 words
- Sound like a motivated student, NOT a corporate robot
- Do NOT start with "Dear Hiring Manager"
- End with readiness and a specific ask
`;

  const apiKey = process.env.OPENAI_API_KEY || "";
  const isGroq = apiKey.startsWith("gsk_");
  const model = isGroq ? 'llama-3.3-70b-versatile' : (process.env.AI_CHAT_MODEL || 'gpt-4o-mini');

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'system',
        content: 'You are an expert career coach helping students write compelling, authentic cover letters for freelance gig applications.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.75,
    max_tokens: 400,
  });

  return response.choices[0].message.content?.trim() || '';
}

export async function improveCoverLetter(
  originalLetter: string,
  feedback: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || "";
  const isGroq = apiKey.startsWith("gsk_");
  const model = isGroq ? 'llama-3.3-70b-versatile' : (process.env.AI_CHAT_MODEL || 'gpt-4o-mini');

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'system',
        content: 'You are a career coach. Improve the student cover letter based on the feedback provided. Keep the same voice and length.',
      },
      {
        role: 'user',
        content: `Original letter:\n${originalLetter}\n\nFeedback:\n${feedback}\n\nRewrite the letter incorporating the feedback.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 400,
  });

  return response.choices[0].message.content?.trim() || originalLetter;
}
