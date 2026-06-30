import * as mammoth from 'mammoth';

import { getOpenAI } from './client';

const pdfParse = require('pdf-parse');

export interface ResumeData {
  skills: string[];
  tools: string[];
  domains: string[];
  education: { degree: string; field: string; college: string; year: string }[];
  projects: { name: string; description: string; techStack: string[]; url: string }[];
  experience: { role: string; company: string; duration: string; description: string }[];
  languages: string[];
  certifications: string[];
  keywords: string[];
  experienceLevel: 'fresher' | 'junior' | 'intermediate' | 'senior';
  summary: string;
}

export async function parseResume(fileUrl: string): Promise<ResumeData> {
  let fileBuffer: Buffer;
  
  if (fileUrl.startsWith('http')) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
          const response = await fetch(fileUrl, {
              signal: controller.signal,
              headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain'
              }
          });
          clearTimeout(timeoutId);

          if (!response.ok) throw new Error(`Failed to download resume: ${response.status} ${response.statusText}`);
          
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('text/html')) {
              throw new Error("Security block detected: The file provider is blocking automated access. Please download the file and upload it manually.");
          }

          const arrayBuffer = await response.arrayBuffer();
          fileBuffer = Buffer.from(arrayBuffer);
      } catch (err: any) {
          clearTimeout(timeoutId);
          if (err.name === 'AbortError') {
              throw new Error("Resume download timed out. Please download the file and upload it manually.");
          }
          throw err;
      }
  } else {
      // In case it's a local path or pre-downloaded buffer, but usually it's a url
      throw new Error("Invalid file URL provided.");
  }

  let text = '';
  const lowerUrl = fileUrl.toLowerCase();

  // Extract raw text
  if (lowerUrl.includes('.pdf')) {
      const pdfParseModule = (pdfParse as any).default || pdfParse;
      const pdfResult = await (typeof pdfParseModule === 'function' ? pdfParseModule(fileBuffer) : pdfParseModule.default(fileBuffer));
      text = pdfResult.text || '';
  } else if (lowerUrl.includes('.docx')) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      text = result.value || '';
  } else {
      text = fileBuffer.toString('utf-8');
  }

  if (!text.trim()) {
      throw new Error("Could not extract any text from the document.");
  }

  // Send to OpenAI
  const apiKey = process.env.OPENAI_API_KEY || "";
  const isGroq = apiKey.startsWith("gsk_");
  const model = isGroq ? 'llama-3.3-70b-versatile' : (process.env.AI_CHAT_MODEL || 'gpt-4o-mini');

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
      model: model,
      response_format: { type: 'json_object' },
      messages: [
          {
              role: 'system',
              content: `Extract structured data from this resume.
Return JSON with:
- skills: string[] (tech + soft skills)
- tools: string[] (software, frameworks, platforms)
- domains: string[] (web, mobile, AI, design, etc.)
- education: { degree, field, college, year }[]
- projects: { name, description, techStack[], url }[]
- experience: { role, company, duration, description }[]
- languages: string[]
- certifications: string[]
- keywords: string[] (20 most important career keywords)
- experienceLevel: fresher|junior|intermediate|senior
- summary: string (2 sentence professional summary)
Return ONLY valid JSON. No preamble.`
          },
          {
              role: 'user',
              content: text
          }
      ]
  });

  const content = response.choices[0].message.content;
  if (!content) {
      throw new Error("OpenAI returned empty response");
  }

  try {
      return JSON.parse(content) as ResumeData;
  } catch (e) {
      throw new Error("Failed to parse JSON response from OpenAI");
  }
}

export async function generateProfileBio(resumeData: ResumeData): Promise<string> {
    const promptData = `
    Level: ${resumeData.experienceLevel}
    Skills: ${resumeData.skills.join(', ')}
    Experience: ${resumeData.experience.map(e => e.role + ' at ' + e.company).join(', ')}
    Summary: ${resumeData.summary}
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
                content: "Write a 3-sentence first-person professional bio for a student with this background. Make it confident, specific, and authentic. Avoid generic phrases. Max 150 words."
            },
            {
                role: 'user',
                content: promptData
            }
        ]
    });

    return response.choices[0].message.content?.trim() || "";
}

export function suggestSkills(currentSkills: string[], resumeText: string): string[] {
    // A more advanced version would use an LLM, but a simple NLP matching or a fast AI request can be used.
    // Let's implement an AI call for it using a small prompt to be robust, 
    // or just rely on the resumeData.skills parsed earlier. 
    // For now, let's use a quick extraction via OpenAI just to find differences.
    // Note: returning string[] as per requirements. We'll do a synchronous simulated find, or actually, 
    // the prompt says suggestSkills is a sync `string[]`. This means it cannot use OpenAI if it's sync.
    // Wait, the interface in prompt is `suggestSkills(currentSkills[], resumeText): string[]` without Promise.
    // We'll use NLP compromise to find technical skills simply, or regex.
    
    // Quick heuristic: find common developer keywords in text that aren't in currentSkills
    const textLower = resumeText.toLowerCase();
    const commonTechSkills = ['react', 'node.js', 'typescript', 'javascript', 'python', 'java', 'c++', 'aws', 'docker', 'kubernetes', 'figma', 'ui/ux', 'sql', 'mongodb', 'express', 'next.js', 'vue', 'angular', 'django', 'spring boot'];
    
    const currentLower = new Set(currentSkills.map(s => s.toLowerCase()));
    const suggested: string[] = [];

    for (const skill of commonTechSkills) {
        if (textLower.includes(skill) && !currentLower.has(skill)) {
            // Check if it's a standalone word roughly
            const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (regex.test(textLower)) {
                suggested.push(skill);
            }
        }
    }
    
    return suggested.slice(0, 10);
}
