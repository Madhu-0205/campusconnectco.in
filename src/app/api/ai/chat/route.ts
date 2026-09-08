

import { streamChatResponse, ChatContext } from '@/lib/ai/chatAssistant';
import { scrubSensitiveData, validatePromptLength } from '@/lib/ai/guards';
import { aiLimiter } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
    if (!(await aiLimiter.check(ip))) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let user: any = null;
    try {
      const supabase = await createClient();
      const authRes = await supabase.auth.getUser();
      user = authRes.data?.user || null;
    } catch {
      // In test, headless, or unauthenticated contexts, treat gracefully as anonymous visitor
      user = null;
    }

    const body = await req.json();
    const { messages, context } = body as {
      messages: Array<{ role: string; content: string }>;
      context?: ChatContext;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Abuse prevention: limit conversation depth and message lengths
    if (messages.length > 15) {
      return new Response(JSON.stringify({ error: 'Conversation history exceeds maximum depth.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Sanitize and validate every incoming message
    const sanitizedMessages = messages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: validatePromptLength(scrubSensitiveData(String(m.content || '')), 4000),
    }));

    // Context Isolation:
    // If anonymous, ensure no private student context is accepted or mixed
    const safeContext: ChatContext = user
      ? {
          mode: context?.mode || 'general',
          currentPage: context?.currentPage ? scrubSensitiveData(context.currentPage) : undefined,
          studentName: context?.studentName ? scrubSensitiveData(context.studentName) : undefined,
          studentSkills: context?.studentSkills ? scrubSensitiveData(context.studentSkills) : undefined,
          gigTitle: context?.gigTitle ? scrubSensitiveData(context.gigTitle) : undefined,
          gigDescription: context?.gigDescription ? scrubSensitiveData(context.gigDescription) : undefined,
          userId: user.id,
        }
      : {
          mode: 'general',
          currentPage: context?.currentPage ? scrubSensitiveData(context.currentPage) : undefined,
        };

    // Return a streaming response using ReadableStream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          await streamChatResponse(sanitizedMessages, safeContext, (chunk) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: chunk })}\n\n`));
          });
          // Send done signal
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (err: any) {
          console.error('[Puter Chat Stream Error]:', err?.message || err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                delta: '\n\nAI assistance is temporarily unavailable. Please retry in a moment or explore verified opportunities directly.',
              })}\n\n`
            )
          );
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (e: any) {
    console.error('[chat]', e);
    return new Response(e.message || 'Internal Server Error', { status: 500 });
  }
}
