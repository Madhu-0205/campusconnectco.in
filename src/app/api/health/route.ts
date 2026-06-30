import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    const checks: Record<string, any> = {};
    let isHealthy = true;

    // 1. Check Database
    try {
        await prisma.$queryRaw`SELECT 1`;
        checks.database = { status: "healthy" };
    } catch (err: any) {
        checks.database = { status: "unhealthy", error: err.message };
        isHealthy = false;
    }

    // 2. Check Redis (Upstash)
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
            checks.redis = { status: "unhealthy", error: err.message };
        }
    } else {
        checks.redis = { status: "not_configured" };
    }

    // 3. Check Storage (Supabase avatars bucket access via SQL)
    try {
        await prisma.$queryRaw`SELECT id FROM storage.buckets WHERE name = 'avatars' LIMIT 1`;
        checks.storage = { status: "healthy", bucket: "avatars" };
    } catch (err: any) {
        checks.storage = { status: "unhealthy", error: err.message };
    }

    // 4. Check Email Service (Supabase Auth Endpoint ping)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
        try {
            const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
                signal: AbortSignal.timeout(2000),
            });
            checks.email = { status: res.ok ? "healthy" : "unhealthy", statusCode: res.status };
        } catch (err: any) {
            checks.email = { status: "unhealthy", error: err.message };
        }
    } else {
        checks.email = { status: "not_configured" };
    }

    // 5. Check AI Providers (Verify Keys)
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    checks.ai = {
        groqConfigured: Boolean(groqKey && !groqKey.includes("placeholder")),
        openaiConfigured: Boolean(openaiKey && !openaiKey.includes("placeholder")),
    };

    // 6. Check Payment Provider (Razorpay configuration)
    const rzpKey = process.env.RAZORPAY_KEY_ID;
    const rzpSecret = process.env.RAZORPAY_KEY_SECRET;
    checks.payments = {
        razorpayConfigured: Boolean(rzpKey && rzpSecret && !rzpKey.includes("placeholder")),
    };

    // 7. Check Environment Configuration
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
}
