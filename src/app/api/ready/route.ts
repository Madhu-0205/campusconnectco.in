import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Evaluate critical database connection
        await prisma.$queryRaw`SELECT 1`;
        
        // Evaluate Redis configuration status
        const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
        const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
        let redisStatus = "not_configured";
        
        if (redisUrl && redisToken) {
            try {
                const baseUrl = redisUrl.endsWith("/") ? redisUrl.slice(0, -1) : redisUrl;
                const res = await fetch(`${baseUrl}/ping`, {
                    headers: { Authorization: `Bearer ${redisToken}` },
                    signal: AbortSignal.timeout(2000),
                });
                if (res.ok) {
                    const data = await res.json();
                    redisStatus = data.result === "PONG" ? "connected" : "unhealthy";
                } else {
                    redisStatus = "unhealthy";
                }
            } catch {
                redisStatus = "disconnected";
            }
        }

        return NextResponse.json({
            status: "ready",
            timestamp: new Date().toISOString(),
            checks: {
                database: "connected",
                redis: redisStatus,
            }
        });
    } catch (error) {
        console.error("[Readiness Check Failed]:", error);
        return NextResponse.json(
            {
                status: "not_ready",
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : String(error)
            },
            { status: 503 }
        );
    }
}
