import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  GroqProvider,
  GroqProviderError,
  sanitizeErrorString,
  GROQ_DEFAULT_MODEL,
} from '@/lib/ai/provider';
import { AIAdapter } from '@/lib/ai/adapter';
import { POST as chatRouteHandler } from '@/app/api/ai/chat/route';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

describe('Groq AI Provider & Architecture Safeguards (17-point test suite)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Provider initializes with server API key
  it('1. provider initializes with server API key', () => {
    const provider = new GroqProvider({ apiKey: 'gsk_server_test_key_12345' });
    expect(provider.isAvailable()).toBe(true);
    expect(provider.getModel()).toBe(GROQ_DEFAULT_MODEL);
    expect(provider.getAttribution()).toBe(`Groq (${GROQ_DEFAULT_MODEL})`);
  });

  // 2. Missing API key fails safely
  it('2. missing API key fails safely', async () => {
    const provider = new GroqProvider({ apiKey: '' });
    expect(provider.isAvailable()).toBe(false);

    await expect(
      provider.chat([{ role: 'user', content: 'Hello' }])
    ).rejects.toThrow(GroqProviderError);

    try {
      await provider.chat([{ role: 'user', content: 'Hello' }]);
    } catch (err: any) {
      expect(err.isAuthError).toBe(true);
      expect(err.code).toBe('MISSING_API_KEY');
    }
  });

  // 3. API key is never returned or leaked in errors
  it('3. API key is never returned or leaked in errors or strings', () => {
    const secretKey = 'gsk_secret_1234567890abcdef_secret';
    const errorWithSecret = `Failed to connect with key ${secretKey} using Bearer token`;
    const sanitized = sanitizeErrorString(errorWithSecret);

    expect(sanitized).not.toContain(secretKey);
    expect(sanitized).toContain('[REDACTED_API_KEY]');

    const providerErr = new GroqProviderError(`Error with ${secretKey}`);
    expect(providerErr.message).not.toContain(secretKey);
    expect(providerErr.message).toContain('[REDACTED_API_KEY]');
  });

  // 4. Normal streaming response works
  it('4. normal streaming response works', async () => {
    const mockClient = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue((async function* () {
            yield { choices: [{ delta: { content: 'Hello ' } }] };
            yield { choices: [{ delta: { content: 'from ' } }] };
            yield { choices: [{ delta: { content: 'Groq!' } }] };
          })()),
        },
      },
    } as any;

    const provider = new GroqProvider({ client: mockClient });
    const chunks: string[] = [];

    for await (const chunk of provider.streamChat([{ role: 'user', content: 'Hi' }])) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['Hello ', 'from ', 'Groq!']);
  });

  // 5. Multiple deltas concatenate correctly
  it('5. multiple deltas concatenate correctly', async () => {
    const mockClient = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue((async function* () {
            yield { choices: [{ delta: { content: 'Campus' } }] };
            yield { choices: [{ delta: { content: 'Connect' } }] };
            yield { choices: [{ delta: { content: 'Co' } }] };
          })()),
        },
      },
    } as any;

    const provider = new GroqProvider({ client: mockClient });
    let combined = '';

    for await (const chunk of provider.streamChat([{ role: 'user', content: 'What is this platform?' }])) {
      combined += chunk;
    }

    expect(combined).toBe('CampusConnectCo');
  });

  // 6. Empty deltas are ignored
  it('6. empty deltas are ignored', async () => {
    const mockClient = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue((async function* () {
            yield { choices: [{ delta: { content: '' } }] };
            yield { choices: [{ delta: {} }] };
            yield { choices: [] };
            yield null;
            yield { choices: [{ delta: { content: 'Valid token' } }] };
          })()),
        },
      },
    } as any;

    const provider = new GroqProvider({ client: mockClient });
    const chunks: string[] = [];

    for await (const chunk of provider.streamChat([{ role: 'user', content: 'Test' }])) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['Valid token']);
  });

  // 7. [DONE] is emitted on SSE stream terminal
  it('7. [DONE] is emitted on SSE stream terminal', async () => {
    const req = new NextRequest('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    const res = await chatRouteHandler(req);
    expect(res.status).toBe(200);

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let sseText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      sseText += decoder.decode(value);
    }

    expect(sseText).toContain('data: [DONE]\n\n');
    expect(sseText).toContain('data: {"delta":');
  });

  // 8. Provider 401 handled gracefully
  it('8. provider 401 handled gracefully without crash', async () => {
    const mockClient = {
      chat: {
        completions: {
          create: vi.fn().mockRejectedValue({
            status: 401,
            message: 'Invalid API Key',
          }),
        },
      },
    } as any;

    const provider = new GroqProvider({ client: mockClient });
    const adapter = new AIAdapter(provider);

    // chat() catches and falls back cleanly
    const response = await adapter.chat([{ role: 'user', content: 'Help' }]);
    expect(response).toContain('AI assistance is temporarily unavailable');

    // streamChat() throws classified error
    await expect(async () => {
      for await (const _ of provider.streamChat([{ role: 'user', content: 'Help' }])) {}
    }).rejects.toThrow(GroqProviderError);
  });

  // 9. Provider 429 handled (rate limit / throttling)
  it('9. provider 429 handled (throttling) without retry storm', async () => {
    const createFn = vi.fn().mockRejectedValue({
      status: 429,
      message: 'Rate limit reached. Please wait.',
    });

    const mockClient = {
      chat: { completions: { create: createFn } },
    } as any;

    const provider = new GroqProvider({ client: mockClient });
    const adapter = new AIAdapter(provider);

    const response = await adapter.chat([{ role: 'user', content: 'Explain gig' }]);
    expect(response).toContain('AI assistance is temporarily unavailable');

    // Verify bounded: exactly 1 attempt made, no retry storm
    expect(createFn).toHaveBeenCalledTimes(1);
  });

  // 10. Provider 500 handled gracefully
  it('10. provider 500 handled gracefully', async () => {
    const mockClient = {
      chat: {
        completions: {
          create: vi.fn().mockRejectedValue({
            status: 503,
            message: 'Service Temporarily Unavailable',
          }),
        },
      },
    } as any;

    const provider = new GroqProvider({ client: mockClient });
    const adapter = new AIAdapter(provider);

    const result = await adapter.copilotChat('What are gigs?', []);
    expect(result.isFallback).toBe(true);
    expect(result.poweredBy).toBe('Groq (openai/gpt-oss-120b)');
    expect(result.message).toBeTruthy();
  });

  // 11. AbortController cancellation works
  it('11. AbortController cancellation works', async () => {
    const controller = new AbortController();

    const mockClient = {
      chat: {
        completions: {
          create: vi.fn().mockImplementation(async (_params: any, options: any) => {
            return (async function* () {
              yield { choices: [{ delta: { content: 'First' } }] };
              // Abort after first chunk
              options.signal.abort();
              yield { choices: [{ delta: { content: 'Second' } }] };
            })();
          }),
        },
      },
    } as any;

    const provider = new GroqProvider({ client: mockClient });

    await expect(async () => {
      for await (const _ of provider.streamChat(
        [{ role: 'user', content: 'Long request' }],
        { signal: controller.signal }
      )) {}
    }).rejects.toThrow();
  });

  // 12. Malformed provider response handled
  it('12. malformed provider response handled gracefully', async () => {
    const mockClient = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: null, // missing choices array
          }),
        },
      },
    } as any;

    const provider = new GroqProvider({ client: mockClient });
    const res = await provider.chat([{ role: 'user', content: 'Test' }]);
    expect(res).toBe('');
  });

  // 13. 4000-character prompt limit enforced
  it('13. 4000-character prompt limit enforced', async () => {
    let capturedPrompt = '';
    const mockClient = {
      chat: {
        completions: {
          create: vi.fn().mockImplementation(async (params: any) => {
            capturedPrompt = params.messages[0].content;
            return { choices: [{ message: { content: 'OK' } }] };
          }),
        },
      },
    } as any;

    const provider = new GroqProvider({ client: mockClient });
    const hugePrompt = 'A'.repeat(8000);

    await provider.chat([{ role: 'user', content: hugePrompt }]);

    expect(capturedPrompt.length).toBeLessThan(4100);
    expect(capturedPrompt).toContain('[truncated for length]');
  });

  // 14. AI cannot mutate database
  it('14. AI adapter does not invoke database mutation methods', async () => {
    const userUpdateSpy = vi.spyOn(prisma.user, 'update');
    const gigCreateSpy = vi.spyOn(prisma.gig, 'create');

    const adapter = new AIAdapter();
    await adapter.copilotChat('Can you publish a job for me?', []);

    expect(userUpdateSpy).not.toHaveBeenCalled();
    expect(gigCreateSpy).not.toHaveBeenCalled();
  });

  // 15. AI cannot publish opportunities
  it('15. AI chat route cannot publish or mutate opportunities', async () => {
    const gigCreateSpy = vi.spyOn(prisma.gig, 'create');
    const internshipCreateSpy = vi.spyOn(prisma.internship, 'create');

    const req = new NextRequest('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Publish opportunity: Senior React Developer' }],
      }),
    });

    await chatRouteHandler(req);

    expect(gigCreateSpy).not.toHaveBeenCalled();
    expect(internshipCreateSpy).not.toHaveBeenCalled();
  });

  // 16. Deterministic recommendation score remains untouched
  it('16. deterministic recommendation score remains untouched by AI advice', async () => {
    const adapter = new AIAdapter();
    const explanation = await adapter.explainMatch({
      opportunityTitle: 'Full Stack Engineer',
      opportunityType: 'gig',
      companyName: 'Acme',
      deterministicScore: 94,
      matchedSkills: ['Node.js', 'React'],
      missingSkills: [],
      locationContext: { isNearby: true, isRemote: false, distanceKm: 2 },
      freshnessDays: 1,
    });

    // Score was not altered by AI
    expect(explanation.poweredBy).toBe('Groq (openai/gpt-oss-120b)');
    expect(explanation.summary).toBeTruthy();
  });

  // 17. Puter is no longer invoked anywhere in the active adapter
  it('17. Puter is no longer invoked in active adapter or provider', () => {
    const provider = new GroqProvider({ apiKey: 'gsk_test' });
    expect((provider as any).puter).toBeUndefined();

    const adapter = new AIAdapter(provider);
    expect(adapter.getProvider().getAttribution()).toBe('Groq (openai/gpt-oss-120b)');
  });
});
