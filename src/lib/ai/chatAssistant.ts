import { getOpenAI } from './client';

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

function buildSystemPrompt(ctx: ChatContext): string {
  const parts = [
    `You are CampusConnect AI, a helpful career and gig assistant for students on the CampusConnect platform — a student gig marketplace and networking site.`,
    `Always be concise, encouraging, and practical. Use simple language. Avoid corporate jargon.`,
  ];

  if (ctx.currentPage) {
    parts.push(`The user is currently viewing the "${ctx.currentPage}" page on the platform.`);
  }

  if (ctx.mode === 'gig-help' && ctx.gigTitle) {
    parts.push(`\nCurrent context: The student is working on applying to a gig.`);
    parts.push(`Gig Title: ${ctx.gigTitle}`);
    if (ctx.gigDescription) parts.push(`Gig Description: ${ctx.gigDescription}`);
    if (ctx.gigSkills) parts.push(`Required Skills: ${ctx.gigSkills}`);
    if (ctx.gigBudget) parts.push(`Budget: ₹${ctx.gigBudget}`);
    if (ctx.studentSkills) parts.push(`\nStudent Skills: ${ctx.studentSkills}`);
    if (ctx.studentName) parts.push(`Student Name: ${ctx.studentName}`);
    parts.push(`\nHelp the student: draft or improve their cover letter, estimate the timeline, ask clarifying questions for requirements, and negotiate confidently.`);
  }

  if (ctx.mode === 'career-advice') {
    parts.push(`\nYou're in career advice mode. Help the student with career planning, skill recommendations, portfolio tips, and networking strategies as a student.`);
    if (ctx.studentSkills) parts.push(`Student's current skills: ${ctx.studentSkills}`);
  }

  parts.push(`\nIMPORTANT: Keep responses under 150 words unless asked for a full draft. Format with bullet points when listing items.`);

  return parts.join('\n');
}

export async function streamChatResponse(
  messages: { role: string; content: string }[],
  context: ChatContext,
  onChunk: (chunk: string) => void
): Promise<void> {
  const systemPrompt = buildSystemPrompt(context);

  const formattedMessages = messages.map(m => ({
    role: m.role as 'user' | 'assistant' | 'system',
    content: m.content,
  }));

  const apiKey = process.env.OPENAI_API_KEY || "";
  const isGroq = apiKey.startsWith("gsk_");
  const model = isGroq ? 'llama-3.3-70b-versatile' : (process.env.AI_CHAT_MODEL || 'gpt-4o-mini');

  const openai = getOpenAI();
  const stream = await openai.chat.completions.create({
    model: model,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...formattedMessages,
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      onChunk(content);
    }
  }
}

export async function getQuickGigTips(gigDescription: string, studentSkills: string): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY || "";
  const isGroq = apiKey.startsWith("gsk_");
  const model = isGroq ? 'llama-3.3-70b-versatile' : (process.env.AI_CHAT_MODEL || 'gpt-4o-mini');

  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'system',
        content: 'Return a JSON object with a "tips" key containing a list of 3 brief, actionable tips (strings) for a student applying to this gig. Max 15 words each. Return ONLY valid JSON.',
      },
      {
        role: 'user',
        content: `Gig: ${gigDescription.slice(0, 300)}\nStudent skills: ${studentSkills}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.6,
  });

  try {
    const raw = response.choices[0].message.content || '{"tips":[]}';
    const parsed = JSON.parse(raw);
    return parsed.tips || [];
  } catch {
    return [];
  }
}
