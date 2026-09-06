import { NextRequest, NextResponse } from "next/server";

import { puterAI } from "@/lib/ai/puter";
import type { AIChatMessage, CopilotContextData } from "@/lib/ai/types";
import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user server-side
    const auth = await protectApi(["STUDENT", "FOUNDER", "STARTUP", "CLIENT", "ADMIN"]);
    if (auth.errorResponse) return auth.errorResponse;
    const { user } = auth;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const messages: AIChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const lastUserQuery = body.query || messages.filter((m) => m.role === "user").pop()?.content || "";

    if (!lastUserQuery.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // 2. Fetch authenticated student profile from PostgreSQL
    const student = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        skills: true,
        branch: true,
        year: true,
        careerGoal: true,
        college: true,
        collegeId: true
      }
    });

    let collegeName = student?.college || null;
    if (student?.collegeId) {
      const collegeRecord = await prisma.college.findUnique({
        where: { id: student.collegeId },
        select: { name: true }
      });
      if (collegeRecord?.name) collegeName = collegeRecord.name;
    }

    // 3. Fetch top open opportunities from CampusConnect
    const topGigs = await prisma.gig.findMany({
      where: { status: { in: ["active", "OPEN"] } },
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        city: true,
        state: true,
        work_mode: true,
        budget: true,
        tags: true,
        poster: {
          select: {
            company_name: true,
            name: true,
            full_name: true
          }
        }
      }
    });

    const contextData: CopilotContextData = {
      user: {
        id: user.id,
        name: student?.name,
        skills: student?.skills,
        branch: student?.branch,
        year: student?.year,
        careerGoal: student?.careerGoal,
        collegeName
      },
      topRecommendations: topGigs.map((g) => ({
        id: g.id,
        title: g.title,
        company: g.poster?.company_name || g.poster?.full_name || g.poster?.name || "CampusConnect Partner",
        location: [g.city, g.state].filter(Boolean).join(", ") || (g.work_mode === "remote" ? "Remote" : "Campus Opportunity"),
        compensation: g.budget ? `₹${g.budget}` : undefined,
        matchScore: 85,
        badges: ["Matches your skills", "Verified opportunity"],
        type: "gig"
      }))
    };

    // 4. Query Puter AI Copilot
    const result = await puterAI.copilotChat(lastUserQuery, messages, contextData);

    return NextResponse.json({
      success: true,
      role: "assistant",
      content: result.message,
      poweredBy: "Puter.js"
    });
  } catch (error: any) {
    console.error("[COPILOT_CHAT_API_ERROR]", error);
    return NextResponse.json(
      {
        error: "Failed to generate copilot response.",
        content: "CampusConnect Career Copilot is temporarily unavailable. Your verified profile and opportunities are still accessible."
      },
      { status: 500 }
    );
  }
}
