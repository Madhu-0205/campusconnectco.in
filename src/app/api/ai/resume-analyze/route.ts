import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { protectApi } from "@/lib/auth-checks";

export const maxDuration = 60;

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    // If the user has a Groq key (gsk_...) we point to Groq's OpenAI-compatible endpoint
    ...(process.env.OPENAI_API_KEY.startsWith("gsk_")
      ? { baseURL: "https://api.groq.com/openai/v1" }
      : {}),
  });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await protectApi(["FOUNDER", "STUDENT", "STARTUP", "CLIENT"]);
    if (auth.errorResponse) return auth.errorResponse;

    // 1. Lazy-init client (throws if OPENAI_API_KEY is missing)
    const openai = getOpenAIClient();

    // 2. Parse request body safely
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // 3. Validate required fields
    const { resumeText } = body;
    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json(
        { error: "resumeText is required" },
        { status: 400 }
      );
    }

    // 4. Call AI with try/catch
    const model = process.env.OPENAI_API_KEY?.startsWith("gsk_") ? "llama-3.3-70b-versatile" : "gpt-4o-mini";
    
    const response = await openai.chat.completions.create({
      model: model,
      max_tokens: 1500,
      messages: [
        {
          role: "system",
          content: `Extract structured data from this resume.
            Return ONLY valid JSON matching this structure:
            {
              "score": number (0-100),
              "grade": string (A, B, C, etc),
              "skills": string[],
              "missingSkills": string[],
              "suggestions": string[],
              "keywords": string[],
              "experienceLevel": string,
              "summary": string,
              "section_scores": {
                "skills_match": number,
                "structure": number,
                "content_depth": number,
                "keyword_density": number
              }
            }
            No preamble. No markdown. Just JSON.`
        },
        {
          role: "user",
          content: resumeText.slice(0, 10000)
        }
      ]
    });

    // 5. Parse and return result
    const raw = response.choices[0]?.message?.content ?? "{}";
    let parsed;
    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON", raw },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: parsed });

  } catch (error: any) {
    console.error("[resume-analyze] error:", error);

    // Missing API key
    if (error?.message?.includes("OPENAI_API_KEY")) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }
    // OpenAI specific errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key" },
        { status: 500 }
      );
    }
    if (error?.status === 429) {
      return NextResponse.json(
        { error: "OpenAI rate limit reached. Try again shortly." },
        { status: 429 }
      );
    }
    if (error?.status === 503) {
      return NextResponse.json(
        { error: "OpenAI is temporarily unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error?.message ?? "Unexpected server error" },
      { status: 500 }
    );
  }
}
