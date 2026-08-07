import crypto from "crypto";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const maxDuration = 15;

const opportunitySchema = z.object({
  externalId: z.string().min(1, "externalId is required"),
  source: z.string().min(1, "source is required"),
  title: z.string().min(3, "title must be at least 3 characters"),
  description: z.string().min(10, "description must be at least 10 characters"),
  company: z.string().min(1, "company is required"),
  skills: z.string().optional().nullable(),
  stipend: z.number().optional().nullable(),
  duration: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  status: z.string().optional().default("OPEN"),
  applicationLink: z.string().url("Must be a valid URL").optional().nullable(),
  tags: z.string().optional().nullable(),
}).strict();

// Simple in-memory rate limiter per instance
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 60; // Max requests
const WINDOW_MS = 60 * 1000; // Per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowData = rateLimitMap.get(ip);
  if (!windowData) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return false;
  }
  if (now - windowData.timestamp > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return false;
  }
  if (windowData.count >= RATE_LIMIT) {
    return true;
  }
  windowData.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // 2. HTTP Strictness
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 400 });
    }

    const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
    if (contentLength > 100_000) {
      console.warn("[Internal API] Oversized payload rejected based on Content-Length");
      return NextResponse.json({ error: "Payload too large" }, { status: 400 });
    }

    const idempotencyKey = request.headers.get("idempotency-key");
    if (idempotencyKey) {
      console.log(`[Internal API] Request received with Idempotency-Key: ${idempotencyKey}`);
    }

    // 3. Authentication (Constant Time Comparison)
    const internalKey = request.headers.get("x-internal-key");
    const expectedKey = process.env.INTERNAL_API_KEY;

    if (!expectedKey) {
      console.error("[Internal API] INTERNAL_API_KEY is not configured in the environment.");
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    if (!internalKey) {
      console.warn("[Internal API] Missing x-internal-key header from IP:", ip);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const internalKeyBuf = Buffer.from(internalKey);
    const expectedKeyBuf = Buffer.from(expectedKey);

    if (internalKeyBuf.length !== expectedKeyBuf.length || !crypto.timingSafeEqual(internalKeyBuf, expectedKeyBuf)) {
      console.warn("[Internal API] Authentication failure - Invalid key from IP:", ip);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 4. Payload Validation
    let payload;
    try {
      payload = await request.json();
    } catch {
      console.warn("[Internal API] Malformed JSON payload");
      return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
    }

    const parsed = opportunitySchema.safeParse(payload);
    if (!parsed.success) {
      console.warn(`[Internal API] Validation failure: ${parsed.error.message}`);
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const deadlineDate = data.deadline ? new Date(data.deadline) : null;

    // 5. Database Operations (Atomic Upsert)
    const internship = await prisma.internship.upsert({
      where: {
        externalId: data.externalId,
      },
      update: {
        title: data.title,
        description: data.description,
        company: data.company,
        skills: data.skills || null,
        stipend: data.stipend || null,
        duration: data.duration || null,
        location: data.location || null,
        deadline: deadlineDate,
        status: data.status,
        applicationLink: data.applicationLink || null,
        tags: data.tags || null,
        source: data.source,
      },
      create: {
        externalId: data.externalId,
        source: data.source,
        title: data.title,
        description: data.description,
        company: data.company,
        skills: data.skills || null,
        stipend: data.stipend || null,
        duration: data.duration || null,
        location: data.location || null,
        deadline: deadlineDate,
        status: data.status,
        applicationLink: data.applicationLink || null,
        tags: data.tags || null,
      },
    });

    // Check if it was created or updated by comparing timestamps
    const isNew = internship.createdAt.getTime() === internship.updatedAt.getTime();

    if (isNew) {
      console.log(`[Internal API] Created new opportunity: ${data.externalId}`);
      return NextResponse.json(
        { message: "Opportunity created successfully", id: internship.id },
        { status: 201 }
      );
    } else {
      console.log(`[Internal API] Updated existing opportunity: ${data.externalId}`);
      return NextResponse.json(
        { message: "Opportunity updated successfully", id: internship.id },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("[Internal API] Internal Server Error", error instanceof Error ? error.message : error);
    // Return safe production error without stack trace
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
