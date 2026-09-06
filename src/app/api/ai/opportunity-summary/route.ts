import { NextRequest, NextResponse } from "next/server";

import { puterAI } from "@/lib/ai/puter";
import type { OpportunitySummaryInput } from "@/lib/ai/types";
import prisma from "@/lib/prisma";
import { aiLimiter } from "@/lib/rate-limit";

export const maxDuration = 30;

async function handleOpportunitySummary(gigId?: string | null, internshipId?: string | null, ip: string = "unknown") {
  const isAllowed = await aiLimiter.check(ip).catch(() => true);
  if (!isAllowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Please try again in a few moments." }, { status: 429 });
  }

  if (!gigId && !internshipId) {
    return NextResponse.json({ error: "Missing gigId or internshipId" }, { status: 400 });
  }

  let summaryInput: OpportunitySummaryInput;

  if (gigId) {
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      select: {
        id: true,
        title: true,
        description: true,
        tags: true,
        budget: true,
        city: true,
        state: true,
        work_mode: true,
        deadline: true,
        poster: {
          select: {
            company_name: true,
            name: true,
            full_name: true
          }
        }
      }
    });

    if (!gig) return NextResponse.json({ error: "Gig not found" }, { status: 404 });

    const tags = (gig.tags || "")
      .split(/[,;\n]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    summaryInput = {
      title: gig.title,
      company: gig.poster?.company_name || gig.poster?.full_name || gig.poster?.name || "CampusConnect Startup",
      description: gig.description || "Project deliverables described by client.",
      tags,
      compensation: gig.budget ? `₹${gig.budget}` : undefined,
      location: [gig.city, gig.state].filter(Boolean).join(", ") || (gig.work_mode === "remote" ? "Remote" : "Campus"),
      deadline: gig.deadline ? gig.deadline.toISOString().split("T")[0] : null,
      type: "gig"
    };
  } else {
    const internship = await prisma.internship.findUnique({
      where: { id: internshipId! },
      select: {
        id: true,
        title: true,
        description: true,
        skills: true,
        stipend: true,
        company: true,
        location: true,
        deadline: true
      }
    });

    if (!internship) return NextResponse.json({ error: "Internship not found" }, { status: 404 });

    const tags = (internship.skills || "")
      .split(/[,;\n]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    summaryInput = {
      title: internship.title,
      company: internship.company,
      description: internship.description || "Internship responsibilities and scope.",
      tags,
      compensation: internship.stipend ? `₹${internship.stipend}` : undefined,
      location: internship.location || "CampusConnect Partner Office / Remote",
      deadline: internship.deadline ? internship.deadline.toISOString().split("T")[0] : null,
      type: "internship"
    };
  }

  const summary = await puterAI.summarizeOpportunity(summaryInput);

  return NextResponse.json({
    success: true,
    data: summary,
    ...summary,
    poweredBy: "Puter.js"
  });
}

export async function GET(req: NextRequest) {
  try {
    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    const gigId = req.nextUrl.searchParams.get("gigId");
    const internshipId = req.nextUrl.searchParams.get("internshipId");
    return await handleOpportunitySummary(gigId, internshipId, ip);
  } catch (error: any) {
    console.error("[OPPORTUNITY_SUMMARY_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to generate opportunity summary." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    const body = await req.json().catch(() => ({}));
    const { gigId, internshipId } = body;
    return await handleOpportunitySummary(gigId, internshipId, ip);
  } catch (error: any) {
    console.error("[OPPORTUNITY_SUMMARY_POST_ERROR]", error);
    return NextResponse.json({ error: "Failed to generate opportunity summary." }, { status: 500 });
  }
}
