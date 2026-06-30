import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

export const maxDuration = 60;

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    ...(process.env.OPENAI_API_KEY.startsWith("gsk_")
      ? { baseURL: "https://api.groq.com/openai/v1" }
      : {}),
  });
}

// ────────────────────────────────────────────────────────────────────────────
// POST /api/ai/resume-analyze
// Analyzes a resume and persists the result to the ResumeAnalysis table.
// ────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const auth = await protectApi(["FOUNDER", "STUDENT", "STARTUP", "CLIENT"]);
    if (auth.errorResponse) return auth.errorResponse;

    const openai = getOpenAIClient();

    let body: { resumeText?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { resumeText } = body;
    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: "resumeText is required and must be at least 50 characters" },
        { status: 400 }
      );
    }

    const model = process.env.OPENAI_API_KEY?.startsWith("gsk_")
      ? "llama-3.3-70b-versatile"
      : "gpt-4o-mini";

    const response = await openai.chat.completions.create({
      model,
      max_tokens: 1500,
      messages: [
        {
          role: "system",
          content: `You are an expert ATS (Applicant Tracking System) and senior career coach.
Analyze the resume text and return ONLY a JSON object with exactly this structure:
{
  "score": number (0-100, ATS compatibility score),
  "grade": string ("A+", "A", "B+", "B", "C+", "C", "D"),
  "strengths": string[] (3-5 specific strengths found in this resume),
  "weaknesses": string[] (3-5 specific weaknesses),
  "skills": string[] (all technical and soft skills detected),
  "missingSkills": string[] (high-demand skills absent from this resume),
  "suggestions": string[] (5-7 concrete, actionable improvement suggestions),
  "keywords": string[] (important industry keywords present),
  "experienceLevel": string ("Fresher", "Junior", "Mid-level", "Senior", "Lead"),
  "summary": string (2-sentence objective assessment),
  "section_scores": {
    "skills_match": number (0-100),
    "structure": number (0-100),
    "content_depth": number (0-100),
    "keyword_density": number (0-100)
  }
}
No preamble. No markdown. Just JSON.`,
        },
        {
          role: "user",
          content: resumeText.slice(0, 10000),
        },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    let parsed: Record<string, unknown>;
    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON", raw }, { status: 500 });
    }

    // ── Persist the result to the database ──────────────────────────────────
    // The ResumeAnalysis model stores results per-user so users can review
    // their analysis history without re-running the AI each time.
    const wordCount = resumeText.trim().split(/\s+/).length;
    const savedAnalysis = await prisma.resumeAnalysis.create({
      data: {
        userId: auth.user!.id,
        score: typeof parsed.score === "number" ? parsed.score : 0,
        grade: typeof parsed.grade === "string" ? parsed.grade : "N/A",
        resumeSnippet: resumeText.slice(0, 200), // Store only first 200 chars for reference
        wordCount,
        result: parsed as object, // Full AI JSON stored as Prisma Json field
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({
      success: true,
      resume_id: savedAnalysis.id,
      data: {
        ...parsed,
        word_count: wordCount,
        processing_time_ms: Date.now(),
      },
    });
  } catch (error: unknown) {
    const err = error as {
      message?: string;
      status?: number;
    };
    console.error("[resume-analyze] error:", error);

    if (err?.message?.includes("OPENAI_API_KEY")) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
    }
    if (err?.status === 401) {
      return NextResponse.json({ error: "Invalid AI API key" }, { status: 503 });
    }
    if (err?.status === 429) {
      return NextResponse.json({ error: "AI rate limit reached. Try again shortly." }, { status: 429 });
    }
    if (err?.status === 503) {
      return NextResponse.json({ error: "AI service temporarily unavailable" }, { status: 503 });
    }

    return NextResponse.json(
      { error: err?.message ?? "Unexpected server error" },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────────────────────────────────────
// GET /api/ai/resume-analyze
// Returns the authenticated user's resume analysis history (latest 10 results).
// ────────────────────────────────────────────────────────────────────────────
export async function GET(_req: NextRequest) {
  try {
    const auth = await protectApi(["FOUNDER", "STUDENT", "STARTUP", "CLIENT"]);
    if (auth.errorResponse) return auth.errorResponse;

    const analyses = await prisma.resumeAnalysis.findMany({
      where: { userId: auth.user!.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        score: true,
        grade: true,
        resumeSnippet: true,
        wordCount: true,
        result: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: analyses });
  } catch (error) {
    console.error("[resume-analyze GET] error:", error);
    return NextResponse.json({ error: "Failed to fetch analysis history" }, { status: 500 });
  }
}
