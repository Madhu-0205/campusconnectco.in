import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
const checks: Record<string, any> = {};
let isHealthy = true;
try {
        await prisma.$queryRaw`SELECT 1`;
        checks.database = { status: "healthy" };
    } catch (err: any) {
        checks.database = { status: "unhealthy", error: "Database connection failed" };
        isHealthy = false;
    }
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
if (redisUrl && redisToken) {
        try {
            const baseUrl = redisUrl.endsWith("/") ? redisUrl.slice(0, -1) : redisUrl;
            const res = await fetch(`${baseUrl}/ping`, {
                headers: { Authorization: `Bearer ${redisToken}` },
                signal: AbortSignal.timeout(2000),
            });
            if (res.ok) {
                const data = await res.json();
                checks.redis = { status: data.result === "PONG" ? "healthy" : "unhealthy" };
            } else {
                checks.redis = { status: "unhealthy", statusCode: res.status };
            }
        } catch (err: any) {
            checks.redis = { status: "unhealthy", error: "Redis connection failed" };
        }
    } else {
        checks.redis = { status: "not_configured" };
    }
try {
        await prisma.$queryRaw`SELECT id FROM storage.buckets WHERE name = 'avatars' LIMIT 1`;
        checks.storage = { status: "healthy", bucket: "avatars" };
    } catch (err: any) {
        checks.storage = { status: "unhealthy", error: "Storage connection failed" };
    }
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
        try {
            const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
                signal: AbortSignal.timeout(2000),
            });
            checks.email = { status: res.ok ? "healthy" : "unhealthy", statusCode: res.status };
        } catch (err: any) {
            checks.email = { status: "unhealthy", error: "Supabase connection failed" };
        }
    } else {
        checks.email = { status: "not_configured" };
    }
const groqKey = process.env.GROQ_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
checks.ai = {
        groqConfigured: Boolean(groqKey && !groqKey.includes("placeholder")),
        openaiConfigured: Boolean(openaiKey && !openaiKey.includes("placeholder")),
    };
const rzpKey = process.env.RAZORPAY_KEY_ID;
const rzpSecret = process.env.RAZORPAY_KEY_SECRET;
checks.payments = {
        razorpayConfigured: Boolean(rzpKey && rzpSecret && !rzpKey.includes("placeholder")),
    };
const requiredEnv = [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "DATABASE_URL",
        "CRON_SECRET",
        "NEXT_PUBLIC_APP_URL"
    ];
const missing = requiredEnv.filter(k => !process.env[k]);
checks.environment = {
        status: missing.length === 0 ? "healthy" : "degraded",
        missing: missing.length > 0 ? missing : undefined
    };
const statusCode = isHealthy ? 200 : 503;
return NextResponse.json({
        status: isHealthy ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        checks
    }, { status: statusCode });
  } catch (error) {
    console.error("API Error in src/app/api/health/route.ts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
