import { describe, it, expect } from "vitest";
import { aiAdapter } from "@/lib/ai/adapter";
import { POST as chatRouteHandler } from "@/app/api/ai/chat/route";
import { NextRequest } from "next/server";

describe("AI Provider Migration: Groq (openai/gpt-oss-120b)", () => {
  it("should have zero Puter auth token dependencies in ServerEnvSchema", async () => {
    expect(process.env.PUTER_AUTH_TOKEN).toBeUndefined();
  });

  it("should verify aiAdapter provides Career Copilot responses with Groq attribution", async () => {
    const res = await aiAdapter.copilotChat("What is CampusConnect?", [], undefined, { timeoutMs: 2000 });
    expect(res.poweredBy).toBe("Groq (openai/gpt-oss-120b)");
    expect(res.message).toBeTruthy();
    expect(res.message.toLowerCase()).toContain("campusconnect");
  }, 15000);

  it("should allow public anonymous visitors to query /api/ai/chat without 401 Unauthorized", async () => {
    const req = new NextRequest("http://localhost:3000/api/ai/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "203.0.113.195",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "What is CampusConnect?" }],
        context: { mode: "general" },
      }),
    });

    const response = await chatRouteHandler(req);
    // Crucial acceptance criterion: Must NOT be 401 Unauthorized
    expect(response.status).toBe(200);
  });

  it("should verify Smart Match explanation uses Groq adapter and returns valid schema", async () => {
    const explanation = await aiAdapter.explainMatch({
      opportunityTitle: "Frontend Developer Intern",
      opportunityType: "internship",
      companyName: "Nexus Labs",
      deterministicScore: 88,
      matchedSkills: ["React", "TypeScript"],
      missingSkills: ["TailwindCSS"],
      locationContext: {
        isNearby: true,
        distanceKm: 4.2,
        collegeName: "IIT Delhi",
        isRemote: false,
      },
      freshnessDays: 1,
    });

    expect(explanation.summary).toBeTruthy();
    expect(explanation.scoreBreakdown).toBeDefined();
    expect(explanation.suggestedAction).toBeTruthy();
    expect(explanation.poweredBy).toBe("Groq (openai/gpt-oss-120b)");
  }, 20000);

  it("should verify Opportunity Summary uses Groq adapter and returns structured fields", async () => {
    const summary = await aiAdapter.summarizeOpportunity({
      title: "Fullstack Developer Gig",
      company: "Startup Hub",
      description: "Build a responsive dashboard using React, Node.js, and PostgreSQL for student event tracking.",
      tags: ["React", "Node.js", "PostgreSQL"],
      location: "Bengaluru, Karnataka",
      type: "gig",
      compensation: "₹15,000",
    });

    expect(summary.whatYouWillDo.length).toBeGreaterThan(0);
    expect(summary.skillsNeeded.length).toBeGreaterThan(0);
    expect(summary.whoThisSuits).toBeTruthy();
    expect(summary.poweredBy).toBe("Groq (openai/gpt-oss-120b)");
  }, 20000);

  it("should verify Resume Analyzer uses Groq adapter and returns ATS score breakdown", async () => {
    const analysis = await aiAdapter.analyzeResume(
      "John Doe. Computer Science undergraduate. Skilled in React, TypeScript, Python. Built student marketplace web application."
    );

    expect(analysis.score).toBeGreaterThanOrEqual(0);
    expect(analysis.score).toBeLessThanOrEqual(100);
    expect(analysis.strengths.length).toBeGreaterThan(0);
    expect(analysis.poweredBy).toBe("Groq (openai/gpt-oss-120b)");
  }, 20000);

  it("should verify Mock Interview uses Groq adapter and generates interview questions", async () => {
    const questionRes = await aiAdapter.generateInterviewQuestion({
      roleTitle: "Frontend Engineer",
      difficulty: "MEDIUM",
      chatHistory: [],
    });

    expect(questionRes.poweredBy).toBe("Groq (openai/gpt-oss-120b)");
    expect(questionRes.question).toBeTruthy();
  }, 20000);
});
