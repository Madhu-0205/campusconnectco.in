import { describe, it, expect } from "vitest";

import {
  scrubSensitiveData,
  validatePromptLength,
  safeParseJson,
  MatchExplanationSchema,
  OpportunitySummarySchema,
  ResumeAnalysisSchema,
  InterviewEvaluationSchema
} from "../lib/ai/guards";
import {
  careerCopilotSystemPrompt,
  matchExplanationPrompt,
  opportunitySummaryPrompt,
  resumeAnalysisPrompt,
  interviewQuestionPrompt,
  interviewEvaluationPrompt
} from "../lib/ai/prompts";
import { puterAI } from "../lib/ai/puter";

describe("CampusConnect Intelligence Layer — Puter.js Integration", () => {
  describe("1. Privacy & Security Guards", () => {
    it("should redact sensitive tokens, payment keys, and credentials", () => {
      const sensitiveInput =
        "My token is Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 and session sb-access-token-12345. Razorpay key rzp_test_99999 and resend re_secret_key.";
      const scrubbed = scrubSensitiveData(sensitiveInput);

      expect(scrubbed).not.toContain("Bearer eyJhbGci");
      expect(scrubbed).not.toContain("sb-access-token-12345");
      expect(scrubbed).not.toContain("rzp_test_99999");
      expect(scrubbed).not.toContain("re_secret_key");
      expect(scrubbed).toContain("[REDACTED_TOKEN]");
      expect(scrubbed).toContain("[REDACTED_SESSION]");
      expect(scrubbed).toContain("[REDACTED_PAYMENT_KEY]");
      expect(scrubbed).toContain("[REDACTED_API_KEY]");
    });

    it("should strip malicious script tags and inline handlers", () => {
      const maliciousInput =
        "Hello <script>alert('xss')</script> world <img src='x' onerror='alert(1)'> and javascript:void(0)";
      const scrubbed = scrubSensitiveData(maliciousInput);

      expect(scrubbed).not.toContain("<script>");
      expect(scrubbed).not.toContain("javascript:");
      expect(scrubbed).not.toContain("onerror=");
    });

    it("should truncate oversized prompts to prevent token exhaustion", () => {
      const hugeInput = "a".repeat(10000);
      const validated = validatePromptLength(hugeInput, 2000);

      expect(validated.length).toBeLessThan(2100);
      expect(validated).toContain("[truncated for length]");
    });
  });

  describe("2. Schema Validation & Safe Parsing", () => {
    it("should validate and parse structured match explanations", () => {
      const validJson = JSON.stringify({
        summary: "Strong skill overlap with React and TypeScript requirements.",
        scoreBreakdown: {
          skillMatchExplanation: "Matches 3 of 4 core skills.",
          locationExplanation: "Remote project accessible from your campus.",
          freshnessExplanation: "Posted within the last 48 hours."
        },
        suggestedAction: "Submit application with portfolio links.",
        poweredBy: "Puter.js"
      });

      const parsed = safeParseJson(validJson, MatchExplanationSchema, {} as any);
      expect(parsed.summary).toBe("Strong skill overlap with React and TypeScript requirements.");
      expect(parsed.poweredBy).toBe("Puter.js");
    });

    it("should gracefully recover from malformed JSON using safe fallback", () => {
      const malformedJson = "This is not valid JSON at all";
      const fallback = {
        summary: "Default fallback summary",
        scoreBreakdown: {
          skillMatchExplanation: "Default skill explanation",
          locationExplanation: "Default location explanation",
          freshnessExplanation: "Default freshness explanation"
        },
        suggestedAction: "Apply now",
        poweredBy: "Puter.js" as const
      };

      const parsed = safeParseJson(malformedJson, MatchExplanationSchema, fallback);
      expect(parsed.summary).toBe("Default fallback summary");
      expect(parsed.poweredBy).toBe("Puter.js");
    });
  });

  describe("3. Prompt Grounding & Platform Authority", () => {
    it("should ground Career Copilot in verified student profile and deterministic matches", () => {
      const prompt = careerCopilotSystemPrompt({
        user: {
          id: "student-1",
          name: "Arjun Sharma",
          skills: "React, Node.js, Python",
          branch: "Computer Science",
          year: "3rd Year",
          careerGoal: "Full-Stack Web Development",
          collegeName: "Pragati Engineering College"
        },
        topRecommendations: [
          {
            id: "gig-1",
            title: "React Component Library",
            company: "TechNova",
            location: "Remote",
            compensation: "₹15,000",
            matchScore: 92,
            badges: ["Matches your skills", "Near your college"],
            type: "gig"
          }
        ]
      });

      expect(prompt).toContain("Arjun Sharma");
      expect(prompt).toContain("Pragati Engineering College");
      expect(prompt).toContain("React Component Library");
      expect(prompt).toContain("TechNova");
      expect(prompt).toContain("[VERIFIED DATA]");
      expect(prompt).toContain("[AI ADVICE]");
    });

    it("should generate grounded opportunity summary prompt without hallucination", () => {
      const prompt = opportunitySummaryPrompt({
        title: "Frontend Next.js Developer",
        company: "Stripe Partner",
        description: "Build high-performance landing pages and checkout UI.",
        tags: ["Next.js", "TailwindCSS"],
        compensation: "₹25,000",
        location: "Surampalem / Remote",
        type: "gig"
      });

      expect(prompt).toContain("Frontend Next.js Developer");
      expect(prompt).toContain("Stripe Partner");
      expect(prompt).toContain("₹25,000");
      expect(prompt).toContain("Puter.js");
    });
  });

  describe("4. Puter AI Adapter Resilience & Fallbacks", () => {
    it("should provide structured resume analysis with grade, ATS score, and suggestions", async () => {
      const sampleResume = `
        Arjun Sharma - Computer Science Student
        Skills: React, TypeScript, Node.js, SQL, Git, Next.js
        Experience: Developed a full-stack campus marketplace using PostgreSQL and Next.js.
        Education: B.Tech Computer Science, Pragati Engineering College.
      `;

      const result = await puterAI.analyzeResume(sampleResume, { timeoutMs: 3000 });

      expect(result).toHaveProperty("score");
      expect(result.score).toBeGreaterThanOrEqual(60);
      expect(result).toHaveProperty("grade");
      expect(result.skills.length).toBeGreaterThan(0);
      expect(result.poweredBy).toBe("Puter.js");
    });

    it("should generate grounded match explanations", async () => {
      const result = await puterAI.explainMatch({
        opportunityTitle: "React Gig",
        opportunityType: "gig",
        companyName: "Acme Corp",
        deterministicScore: 88,
        matchedSkills: ["React", "TypeScript"],
        missingSkills: ["GraphQL"],
        locationContext: {
          isNearby: true,
          distanceKm: 12,
          collegeName: "Pragati Engineering College",
          isRemote: false
        },
        freshnessDays: 2
      }, { timeoutMs: 3000 });

      expect(result).toHaveProperty("summary");
      expect(result.scoreBreakdown).toBeDefined();
      expect(result.scoreBreakdown.skillMatchExplanation).toContain("React");
      expect(result.poweredBy).toBe("Puter.js");
    });

    it("should generate structured opportunity summary", async () => {
      const result = await puterAI.summarizeOpportunity({
        title: "Node.js Backend Developer",
        company: "Apex Tech",
        description: "Develop REST APIs using Prisma and Express.",
        tags: ["Node.js", "Express", "Prisma"],
        compensation: "₹20,000",
        location: "Remote",
        type: "gig"
      }, { timeoutMs: 3000 });

      expect(result).toHaveProperty("whatYouWillDo");
      expect(result.whatYouWillDo.length).toBeGreaterThan(0);
      expect(result).toHaveProperty("whoThisSuits");
      expect(result.poweredBy).toBe("Puter.js");
    });

    it("should generate interview questions and evaluation with disclaimer", async () => {
      const questionResult = await puterAI.generateInterviewQuestion({
        roleTitle: "Next.js Frontend Engineer",
        difficulty: "MEDIUM",
        chatHistory: []
      }, { timeoutMs: 3000 });

      expect(questionResult.question).toBeDefined();
      expect(questionResult.question.length).toBeGreaterThan(15);
      expect(questionResult.poweredBy).toBe("Puter.js");

      const evalResult = await puterAI.evaluateInterview({
        roleTitle: "Next.js Frontend Engineer",
        difficulty: "MEDIUM",
        chatHistory: [
          { role: "assistant", content: "Explain React Server Components." },
          { role: "user", content: "React Server Components run only on the server and send zero client-side JavaScript." }
        ]
      }, { timeoutMs: 3000 });

      expect(evalResult).toHaveProperty("score");
      expect(evalResult.feedback).toHaveProperty("technical");
      expect(evalResult.disclaimer).toContain("Advisory only");
      expect(evalResult.poweredBy).toBe("Puter.js");
    });
  });
});
