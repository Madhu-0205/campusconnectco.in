import { NextRequest, NextResponse } from "next/server";

import { puterAI } from "@/lib/ai/puter";
import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

export const maxDuration = 60;

// ────────────────────────────────────────────────────────────────────────────
// POST /api/ai/resume-analyze
// Analyzes a resume using Puter AI and persists the result to ResumeAnalysis table.
// ────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const auth = await protectApi(["FOUNDER", "STUDENT", "STARTUP", "CLIENT"]);
    if (auth.errorResponse) return auth.errorResponse;

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
    if (resumeText.length > 25000) {
      return NextResponse.json(
        { error: "resumeText is too long. Maximum allowed length is 25000 characters." },
        { status: 400 }
      );
    }

    // Call Puter AI Resume Analyzer
    const parsed = await puterAI.analyzeResume(resumeText);

    const formattedResult = {
      score: parsed.score,
      grade: parsed.grade,
      strengths: parsed.strengths,
      weaknesses: parsed.weaknesses,
      skills: parsed.skills,
      missingSkills: parsed.missingSkills,
      suggestions: parsed.suggestions,
      keywords: parsed.keywords,
      experienceLevel: parsed.experienceLevel,
      summary: parsed.summary,
      section_scores: {
        skills_match: parsed.sectionScores.skillsMatch,
        structure: parsed.sectionScores.structure,
        content_depth: parsed.sectionScores.contentDepth,
        keyword_density: parsed.sectionScores.keywordDensity
      },
      poweredBy: "Puter.js"
    };

    // ── Persist the result to the database ──────────────────────────────────
    const wordCount = resumeText.trim().split(/\s+/).length;
    const savedAnalysis = await prisma.resumeAnalysis.create({
      data: {
        userId: auth.user!.id,
        score: formattedResult.score,
        grade: formattedResult.grade,
        resumeSnippet: resumeText.slice(0, 200),
        wordCount,
        result: formattedResult as object
      },
      select: { id: true, createdAt: true }
    });

    return NextResponse.json({
      success: true,
      resume_id: savedAnalysis.id,
      data: {
        ...formattedResult,
        word_count: wordCount,
        created_at: savedAnalysis.createdAt
      }
    });
  } catch (error: unknown) {
 const err = error as {
 message?: string;
 status?: number;
 };
 console.error("[resume-analyze] error:", error);

 if (err?.message?.includes("OPENAI_API_KEY")) {
 return NextResponse.json({ error:"AI service not configured" }, { status: 503 });
 }
 if (err?.status === 401) {
 return NextResponse.json({ error:"Invalid AI API key" }, { status: 503 });
 }
 if (err?.status === 429) {
 return NextResponse.json({ error:"AI rate limit reached. Try again shortly." }, { status: 429 });
 }
 if (err?.status === 503) {
 return NextResponse.json({ error:"AI service temporarily unavailable" }, { status: 503 });
 }

 return NextResponse.json(
 { error: err?.message ??"Unexpected server error" },
 { status: 500 }
 );
 }
}

// ────────────────────────────────────────────────────────────────────────────
// GET /api/ai/resume-analyze
// Returns the authenticated user's resume analysis history (latest 10 results).
// ────────────────────────────────────────────────────────────────────────────
export async function GET() {
 try {
 const auth = await protectApi(["FOUNDER","STUDENT","STARTUP","CLIENT"]);
 if (auth.errorResponse) return auth.errorResponse;

 const analyses = await prisma.resumeAnalysis.findMany({
 where: { userId: auth.user!.id },
 orderBy: { createdAt:"desc" },
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
 return NextResponse.json({ error:"Failed to fetch analysis history" }, { status: 500 });
 }
}
