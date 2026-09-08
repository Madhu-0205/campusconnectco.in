import { puterAI } from './puter';

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
- Address the gig poster directly (use"I" for self-reference)
- 3 paragraphs: intro + relevant experience + call to action
- Mention at least one specific skill that matches the gig
- Keep it under 200 words
- Sound like a motivated student, NOT a corporate robot
- Do NOT start with"Dear Hiring Manager"
- End with readiness and a specific ask
`;

 try {
  const response = await puterAI.chat([
   {
    role: 'system',
    content: 'You are an expert career coach helping students write compelling, authentic cover letters for freelance gig applications.',
   },
   { role: 'user', content: prompt },
  ], {
   temperature: 0.75,
   maxTokens: 400,
  });

  return response.trim();
 } catch (error) {
  console.warn('[coverLetter] Puter AI generation error:', error);
  return `Hi, I am excited to apply for "${gigTitle}". With my background in ${studentSkills}, I am confident in delivering high quality work for this project. Looking forward to discussing how I can contribute!`;
 }
}

export async function improveCoverLetter(
 originalLetter: string,
 feedback: string
): Promise<string> {
 try {
  const response = await puterAI.chat([
   {
    role: 'system',
    content: 'You are a career coach. Improve the student cover letter based on the feedback provided. Keep the same voice and length.',
   },
   {
    role: 'user',
    content: `Original letter:\n${originalLetter}\n\nFeedback:\n${feedback}\n\nRewrite the letter incorporating the feedback.`,
   },
  ], {
   temperature: 0.7,
   maxTokens: 400,
  });

  return response.trim() || originalLetter;
 } catch (error) {
  console.warn('[coverLetter] Puter AI improve error:', error);
  return originalLetter;
 }
}
