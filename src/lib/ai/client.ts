import OpenAI from "openai";

/**
 * Produces a numeric seed from a string using DJB2 hash.
 * Same input → always same seed. Used by the embedding fallback.
 */
function deterministicSeed(text: string): number {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash) ^ text.charCodeAt(i);
    hash = hash >>> 0; // keep unsigned 32-bit
  }
  return hash;
}

/**
 * Generates a stable float32 vector of the given dimension using an
 * XOR-shift PRNG seeded from `seed`. Values are normalized to [-1, 1].
 * This is deterministic: same seed + dimension → same vector.
 */
function deterministicVector(seed: number, dimensions: number): number[] {
  let state = seed === 0 ? 1 : seed;
  return Array.from({ length: dimensions }, () => {
    // XOR-shift 32-bit
    state ^= state << 13;
    state ^= state >> 17;
    state ^= state << 5;
    state = state >>> 0;
    // Map [0, 2^32] → [-1, 1]
    return (state / 0xffffffff) * 2 - 1;
  });
}

let _client: OpenAI | null = null;

export function getChatModel(): string {
  // Always use gemini-1.5-flash as default
  return process.env.AI_CHAT_MODEL || "gemini-1.5-flash";
}

export function getOpenAI(): OpenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "";
  const isPlaceholder = apiKey === "" || apiKey.includes("placeholder") || apiKey.includes("your_");

  if (isPlaceholder) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SERVER CONFIGURATION ERROR: AI API keys are missing in production environment.");
    }
    return new Proxy({}, {
      get(target, prop) {
        if (prop === 'chat') {
          return {
            completions: {
              create: async (params: { stream?: boolean; messages?: Array<{ role: string; content: string }> }) => {
                if (params.stream) {
                  return (async function* () {
                    yield { choices: [{ delta: { content: "AI service unavailable: configure GEMINI_API_KEY." } }] };
                  })();
                }
                const systemPrompt = params.messages?.find((m) => m.role === 'system')?.content || '';
                let contentObj: Record<string, unknown> = { tips: ["Configure AI API key"] };
                if (systemPrompt.includes("score") || systemPrompt.includes("strengths")) {
                  contentObj = {
                    score: 85,
                    strengths: ["Strong communication", "Problem solving"],
                    weaknesses: ["Lacks automated tests"],
                    missingSkills: ["Vitest", "Docker"],
                    suggestions: ["Install vitest and write tests", "Containerize the app"]
                  };
                } else if (systemPrompt.includes("roadmapSteps")) {
                  contentObj = {
                    roadmapSteps: ["Learn Next.js 16 basics", "Understand Prisma ORM", "Master Supabase Auth"],
                    learningPath: ["Official Documentation", "Video Tutorials"],
                    projects: ["Task Manager", "Social Dashboard"],
                    jobPrepTips: ["Prepare behavior questions", "Do mock coding tests"]
                  };
                } else if (systemPrompt.includes("rating") || systemPrompt.includes("communication")) {
                  contentObj = {
                    communication: 4,
                    technical: 4,
                    structure: 4,
                    overall: "Good performance"
                  };
                }
                
                return {
                  choices: [{
                    message: {
                      content: JSON.stringify(contentObj)
                    }
                  }]
                };
              }
            }
          };
        }
        if (prop === 'embeddings') {
          return {
            create: async (params: { model?: string; input?: string }) => {
              const dimensions = params.model?.includes('nomic') ? 768 : 1536;
              const seed = deterministicSeed(String(params.input ?? ''));
              const vector = deterministicVector(seed, dimensions);
              return { data: [{ embedding: vector }] };
            }
          };
        }
        return undefined;
      }
    }) as unknown as OpenAI;
  }

  if (!_client) {
    _client = new OpenAI({
      apiKey: apiKey,
      baseURL: process.env.GEMINI_API_KEY ? "https://generativelanguage.googleapis.com/v1beta/openai/" : undefined,
      timeout: 8000, // 8-second timeout to prevent Edge functions from hanging
    });
  }
  return _client;
}
