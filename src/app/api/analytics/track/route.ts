import { NextResponse } from "next/server";
import { z } from "zod";

import { trackEvent } from "@/lib/analytics";
import { analyticsLimiter } from "@/lib/rate-limit";

const MAX_PAYLOAD_BYTES = 4096; // 4KB

const TrackSchema = z.object({
  event: z
    .string()
    .min(1, "Missing event name")
    .max(64, "Event name must be 64 characters or fewer")
    .regex(/^[a-zA-Z0-9_\-\.:]+$/, "Invalid event name format"),
  data: z
    .record(z.string(), z.any())
    .nullable()
    .optional(),
  userId: z.string().max(128).nullable().optional(),
  sessionId: z.string().max(128).nullable().optional(),
});

export async function POST(req: Request) {
  try {
    // 1. IP-based Rate Limiting (60 events/minute/IP)
    const ip = (
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for") ||
      "127.0.0.1"
    )
      .split(",")[0]
      .trim();

    const allowed = await analyticsLimiter.check(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // 2. Parse JSON body (must preserve existing 400 "Invalid JSON body" error contract)
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // 3. Preserve existing "Missing event name" error if event is empty/missing
    if (!body.event || typeof body.event !== "string" || body.event.trim().length === 0) {
      return NextResponse.json({ error: "Missing event name" }, { status: 400 });
    }

    // 4. Validate data payload size (Reject serialized data payloads above 4KB)
    if (body.data !== undefined && body.data !== null) {
      if (typeof body.data !== "object" || Array.isArray(body.data)) {
        return NextResponse.json(
          { error: "Data must be a valid JSON object" },
          { status: 400 }
        );
      }
      try {
        const serialized = JSON.stringify(body.data);
        if (new TextEncoder().encode(serialized).length > MAX_PAYLOAD_BYTES) {
          return NextResponse.json(
            { error: "Payload exceeds 4KB limit" },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json({ error: "Invalid JSON data payload" }, { status: 400 });
      }
    }

    // 5. Schema validation via Zod
    const parseResult = TrackSchema.safeParse(body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: issue?.message || "Invalid analytics payload" },
        { status: 400 }
      );
    }

    const { event, data, userId, sessionId } = parseResult.data;

    await trackEvent({ event, data: data || {}, userId, sessionId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Track API Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
