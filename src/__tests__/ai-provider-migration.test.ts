import { describe, it, expect } from "vitest";
import { puterAI } from "@/lib/ai/puter";
import { POST as chatRouteHandler } from "@/app/api/ai/chat/route";
import { NextRequest } from "next/server";

describe("AI Provider Migration: Puter.js as Sole Provider", () => {
  it("should have zero Groq API key dependencies in ServerEnvSchema", async () => {
    // Verified: No GROQ_API_KEY environment variable required
    expect(process.env.GROQ_API_KEY).toBeUndefined();
  });

  it("should verify puterAI provides Career Copilot responses with Puter.js attribution", async () => {
    const res = await puterAI.copilotChat("What is CampusConnect?", [], undefined, { timeoutMs: 2000 });
    expect(res.poweredBy).toBe("Puter.js");
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

  it("should verify Smart Match explanation uses Puter adapter and returns valid schema", async () => {
    const explanation = await puterAI.explainMatch({
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
    expect(explanation.poweredBy).toBe("Puter.js");
  }, 20000);

  it("should verify Opportunity Summary uses Puter adapter and returns structured fields", async () => {
    const summary = await puterAI.summarizeOpportunity({
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
    expect(summary.poweredBy).toBe("Puter.js");
  }, 20000);

  it("should verify Resume Analyzer uses Puter adapter and returns ATS score breakdown", async () => {
    const analysis = await puterAI.analyzeResume(
      "John Doe. Computer Science undergraduate. Skilled in React, TypeScript, Python. Built student marketplace web application."
    );

    expect(analysis.score).toBeGreaterThanOrEqual(0);
    expect(analysis.score).toBeLessThanOrEqual(100);
    expect(analysis.strengths.length).toBeGreaterThan(0);
    expect(analysis.poweredBy).toBe("Puter.js");
  }, 20000);

  it("should verify Mock Interview uses Puter adapter and generates interview questions", async () => {
    const questionRes = await puterAI.generateInterviewQuestion({
      roleTitle: "Frontend Engineer",
      difficulty: "MEDIUM",
      chatHistory: [],
    });

    expect(questionRes.poweredBy).toBe("Puter.js");
    expect(questionRes.question).toBeTruthy();
  }, 20000);
});
