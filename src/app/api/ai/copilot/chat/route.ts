import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: `You are the CampusConnect Career Copilot. You are an expert career mentor, resume reviewer, and interview coach. 
      You help students navigate their careers, find remote work, and improve their skills.
      Keep your answers concise, encouraging, and highly actionable. Format output using markdown. 
      Do NOT ask for information like "what is your major?" - assume you already know everything about the student from their profile.`,
      messages: messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[COPILOT_CHAT_API_ERROR]", error)
    return new Response(JSON.stringify({ error: "Failed to generate response." }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
