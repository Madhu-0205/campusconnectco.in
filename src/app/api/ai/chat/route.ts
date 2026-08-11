
import { streamChatResponse, ChatContext } from '@/lib/ai/chatAssistant';
import { aiLimiter } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!(await aiLimiter.check(ip))) {
      return new Response('Rate limit exceeded', { status: 429 });
    }

    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { messages, context } = body as { messages: any[]; context: ChatContext };

    if (!messages || !Array.isArray(messages)) {
      return new Response('messages array required', { status: 400 });
    }

    // Return a streaming response using ReadableStream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          await streamChatResponse(messages, context || { mode: 'general' }, (chunk) => {
            // Server-Sent Events format matching AIServiceAgent
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: chunk })}\n\n`));
          });
          // Send done signal
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (err: any) {
          controller.error(err);
        }
      }
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
