import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getChatModel(): string {
  const apiKey = process.env.OPENAI_API_KEY || "";
  if (apiKey.startsWith("gsk_")) {
    const envModel = process.env.AI_CHAT_MODEL;
    if (envModel && (envModel.includes("llama") || envModel.includes("mixtral") || envModel.includes("gemma"))) {
      return envModel;
    }
    return "llama-3.3-70b-versatile";
  }
  return process.env.AI_CHAT_MODEL || "gpt-4o-mini";
}

export function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY || "";
  const isPlaceholder = apiKey === "" || apiKey.includes("placeholder") || apiKey.includes("your_openai");

  if (isPlaceholder) {
    return new Proxy({}, {
      get(target, prop) {
        if (prop === 'chat') {
          return {
            completions: {
              create: async (params: any) => {
                if (params.stream) {
                  return (async function* () {
                    yield { choices: [{ delta: { content: "This is a placeholder AI response. Please configure a valid API key in your settings." } }] };
                  })();
                }
                // Return a mock payload that is parseable by different callers
                const systemPrompt = params.messages?.find((m: any) => m.role === 'system')?.content || '';
                let contentObj: any = { tips: ["Configure API key", "Run tests", "Check RLS"] };
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
            create: async (params: any) => {
              const dimensions = params.model?.includes('nomic') ? 768 : 1536;
              const vector = new Array(dimensions).fill(0).map(() => Math.random());
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
      ...(apiKey.startsWith("gsk_")
        ? { baseURL: "https://api.groq.com/openai/v1" }
        : {}),
    });
  }
  return _client;
}
