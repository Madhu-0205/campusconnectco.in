import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as parseResumeHandler, GET as parseResumeJobHandler } from "../app/api/ai/parse-resume/route";
import { streamChatResponse } from "../lib/ai/chatAssistant";
import { NextRequest } from "next/server";

// Mock cookies helper
vi.mock("next/headers", () => {
  return {
    cookies: vi.fn().mockResolvedValue({
      getAll: () => [],
    }),
  };
});

// Mock Supabase SSR Server Client creation
vi.mock("@supabase/ssr", () => {
  return {
    createServerClient: vi.fn().mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-123" } },
          error: null,
        }),
      },
    }),
  };
});

// Mock database prisma import
vi.mock("@/lib/prisma", () => {
  return {
    default: {
      user: {
        update: vi.fn().mockResolvedValue({}),
      },
    },
  };
});

// Mock parseResume parser engine
vi.mock("../lib/ai/resumeParser", () => {
  return {
    parseResume: vi.fn().mockResolvedValue({
      skills: ["React", "TypeScript", "Node.js"],
      tools: ["VS Code", "Git"],
      domains: ["Frontend Engineering"],
      experienceLevel: "junior",
      summary: "Qualified front-end engineer.",
    }),
  };
});

// Mock OpenAI client creator
vi.mock("../lib/ai/client", () => {
  return {
    getOpenAI: vi.fn().mockReturnValue({
      chat: {
        completions: {
          create: vi.fn().mockImplementation(async (params: any) => {
            if (params.stream) {
              return (async function* () {
                yield { choices: [{ delta: { content: "Highlight skills" } }] };
              })();
            }
            return {
              choices: [
                {
                  message: { content: '{"tips":["Format your resume","Highlight skills"]}' },
                },
              ],
            };
          }),
        },
      },
    }),
  };
});

describe("AI Platform Features Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Resume Parser Job API", () => {
    it("should accept resume url, spawn background parser, and return processing job details", async () => {
      const req = new NextRequest("http://localhost/api/ai/parse-resume", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "12.34.56.78" },
        body: JSON.stringify({ fileUrl: "https://supabase-bucket/resumes/my-resume.pdf" }),
      });

      const response = await parseResumeHandler(req);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.jobId).toBeDefined();
      expect(data.message).toContain("Resume is being processed");

      // Verify that checking job progress returns status
      const getReq = new NextRequest(`http://localhost/api/ai/parse-resume?jobId=${data.jobId}`);
      const getRes = await parseResumeJobHandler(getReq);
      expect(getRes.status).toBe(200);
      const getVal = await getRes.json();
      expect(["processing", "completed"]).toContain(getVal.status);
    });
  });

  describe("Chat Assistant stream helper", () => {
    it("should construct prompts and stream chunks correctly", async () => {
      const messages = [{ role: "user" as const, content: "Give me career advice." }];
      const context = { mode: "career-advice" as const };

      const chunksReceived: string[] = [];
      const onChunk = (chunk: string) => {
        chunksReceived.push(chunk);
      };

      await streamChatResponse(messages, context, onChunk);

      expect(chunksReceived.length).toBeGreaterThan(0);
      expect(chunksReceived[0]).toContain("Highlight skills");
    });
  });
});
