import { NextRequest, NextResponse } from "next/server";

import { puterAI } from "@/lib/ai/puter";
import type { MatchExplanationInput } from "@/lib/ai/types";
import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

export const maxDuration = 30;

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await protectApi(["STUDENT", "FOUNDER", "STARTUP", "CLIENT", "ADMIN"]);
    if (auth.errorResponse) return auth.errorResponse;
    const { user } = auth;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { gigId, internshipId } = body;

    if (!gigId && !internshipId) {
      return NextResponse.json({ error: "gigId or internshipId is required" }, { status: 400 });
    }

    // 1. Fetch student profile
    const student = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        skills: true,
        latitude: true,
        longitude: true,
        college: true,
        collegeId: true
      }
    });

    let studentLat = student?.latitude;
    let studentLng = student?.longitude;
    let collegeName = student?.college || null;

    if ((studentLat == null || studentLng == null) && student?.collegeId) {
      const college = await prisma.college.findUnique({
        where: { id: student.collegeId },
        select: { name: true, latitude: true, longitude: true }
      });
      if (college?.latitude != null && college?.longitude != null) {
        studentLat = college.latitude;
        studentLng = college.longitude;
        collegeName = college.name;
      }
    }

    const studentSkills = (student?.skills || "")
      .split(/[,;\n]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    let explanationInput: MatchExplanationInput;

    if (gigId) {
      const gig = await prisma.gig.findUnique({
        where: { id: gigId },
        select: {
          id: true,
          title: true,
          tags: true,
          city: true,
          state: true,
          work_mode: true,
          latitude: true,
          longitude: true,
          createdAt: true,
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

      const gigTags = (gig.tags || "")
        .split(/[,;\n]+/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const matchedSkills = gigTags.filter((t) => studentSkills.some((s) => s.includes(t) || t.includes(s)));
      const missingSkills = gigTags.filter((t) => !matchedSkills.includes(t));

      const gigLocation = [gig.city, gig.state].filter(Boolean).join(", ");
      const isRemote = gig.work_mode === "remote" || gigLocation.toLowerCase().includes("remote");
      let distanceKm: number | null = null;
      let isNearby = false;

      if (studentLat != null && studentLng != null && gig.latitude != null && gig.longitude != null) {
        distanceKm = Math.round(calculateDistanceKm(studentLat, studentLng, gig.latitude, gig.longitude));
        isNearby = distanceKm <= 50;
      }

      const ageDays = Math.floor((Date.now() - new Date(gig.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      const deterministicScore = Math.min(
        100,
        Math.round((matchedSkills.length / Math.max(1, gigTags.length)) * 60 + (isNearby ? 30 : isRemote ? 20 : 10) + (ageDays <= 7 ? 10 : 3))
      );

      explanationInput = {
        opportunityTitle: gig.title,
        opportunityType: "gig",
        companyName: gig.poster?.company_name || gig.poster?.full_name || gig.poster?.name || "Startup Client",
        deterministicScore,
        matchedSkills,
        missingSkills,
        locationContext: {
          isNearby,
          distanceKm,
          collegeName,
          isRemote
        },
        freshnessDays: ageDays
      };
    } else {
      const internship = await prisma.internship.findUnique({
        where: { id: internshipId },
        select: {
          id: true,
          title: true,
          skills: true,
          company: true,
          location: true,
          latitude: true,
          longitude: true,
          createdAt: true
        }
      });

      if (!internship) return NextResponse.json({ error: "Internship not found" }, { status: 404 });

      const internSkills = (internship.skills || "")
        .split(/[,;\n]+/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const matchedSkills = internSkills.filter((t) => studentSkills.some((s) => s.includes(t) || t.includes(s)));
      const missingSkills = internSkills.filter((t) => !matchedSkills.includes(t));

      const isRemote = (internship.location || "").toLowerCase().includes("remote");
      let distanceKm: number | null = null;
      let isNearby = false;

      if (studentLat != null && studentLng != null && internship.latitude != null && internship.longitude != null) {
        distanceKm = Math.round(calculateDistanceKm(studentLat, studentLng, internship.latitude, internship.longitude));
        isNearby = distanceKm <= 50;
      }

      const ageDays = Math.floor((Date.now() - new Date(internship.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      const deterministicScore = Math.min(
        100,
        Math.round((matchedSkills.length / Math.max(1, internSkills.length)) * 60 + (isNearby ? 30 : isRemote ? 20 : 10) + (ageDays <= 7 ? 10 : 3))
      );

      explanationInput = {
        opportunityTitle: internship.title,
        opportunityType: "internship",
        companyName: internship.company,
        deterministicScore,
        matchedSkills,
        missingSkills,
        locationContext: {
          isNearby,
          distanceKm,
          collegeName,
          isRemote
        },
        freshnessDays: ageDays
      };
    }

    const explanation = await puterAI.explainMatch(explanationInput);

    return NextResponse.json({
      success: true,
      data: explanation,
      poweredBy: "Puter.js"
    });
  } catch (error: any) {
    console.error("[MATCH_EXPLANATION_ERROR]", error);
    return NextResponse.json(
      {
        error: "Failed to generate match explanation.",
        fallback: "This opportunity matches your profile based on platform skill and location heuristics."
      },
      { status: 500 }
    );
  }
}
