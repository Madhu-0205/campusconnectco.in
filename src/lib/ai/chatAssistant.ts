import { puterAI } from './puter';
import type { AIChatMessage, CopilotContextData } from './types';

export interface ChatContext {
  userId?: string;
  gigTitle?: string;
  gigDescription?: string;
  gigSkills?: string;
  gigBudget?: number;
  studentSkills?: string;
  studentName?: string;
  currentPage?: string;
  mode: 'gig-help' | 'career-advice' | 'general';
}

export async function streamChatResponse(
  messages: { role: string; content: string }[],
  context: ChatContext,
  onChunk: (chunk: string) => void
): Promise<void> {
  const userMessages = messages.filter(m => m.role === 'user');
  const lastUserMsg = userMessages.pop();
  const userQuery = lastUserMsg?.content || 'What is CampusConnectCo?';

  const history: AIChatMessage[] = messages
    .filter(m => m !== lastUserMsg)
    .map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

  const copilotContext: CopilotContextData = {
    user: context.studentName ? {
      id: context.userId,
      name: context.studentName,
      careerGoal: context.mode === 'career-advice' ? 'Software Engineering / Freelancing' : undefined,
      skills: context.studentSkills || undefined,
    } : undefined,
  };

  const { message } = await puterAI.copilotChat(userQuery, history, copilotContext);

  // Stream out the message in small chunks for responsive UX
  const words = message.split(' ');
  const chunkSize = 4;
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ') + (i + chunkSize < words.length ? ' ' : '');
    onChunk(chunk);
    // Micro-delay between chunks for smooth streaming
    await new Promise(r => setTimeout(r, 20));
  }
}

export async function getQuickGigTips(gigDescription: string, studentSkills: string): Promise<string[]> {
  try {
    const raw = await puterAI.chat([
      {
        role: 'system',
        content: 'Return a JSON object with a "tips" key containing a list of 3 brief, actionable tips (strings) for a student applying to this gig. Max 15 words each. Return ONLY valid JSON.',
      },
      {
        role: 'user',
        content: `Gig: ${gigDescription.slice(0, 300)}\nStudent skills: ${studentSkills}`,
      },
    ], { temperature: 0.6, maxTokens: 250 });

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.tips) && parsed.tips.length > 0) {
      return parsed.tips;
    }
  } catch {
    // Fallback to grounded tips
  }

  return [
    'Highlight projects matching the required skills in your proposal.',
    'Clarify milestones and scope before accepting the gig.',
    'Deliver clean, well-commented code to earn high ratings.',
  ];
}
