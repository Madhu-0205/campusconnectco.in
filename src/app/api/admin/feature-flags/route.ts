import { NextRequest, NextResponse } from "next/server";

import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET handler to retrieve current feature flags stored in database (Founder only).
 */
export async function GET() {
    try {
        const auth = await protectApi(["FOUNDER"]);
        if (auth.errorResponse) return auth.errorResponse;

        const settings = await prisma.platformSetting.findMany({
            where: {
                key: { startsWith: "flag:" }
            }
        });

        const flags = settings.map((s: any) => ({
            key: s.key.replace("flag:", ""),
            value: s.value === "true" || s.value === "enabled",
            updatedAt: s.updatedAt
        }));

        return NextResponse.json({ success: true, flags });
    } catch (error) {
        console.error("[FeatureFlags API Error]:", error);
        return NextResponse.json({ error: "Failed to list feature flags" }, { status: 500 });
    }
}

/**
 * POST handler to toggle or create feature flags (Founder only).
 */
export async function POST(req: NextRequest) {
    try {
        const auth = await protectApi(["FOUNDER"]);
        if (auth.errorResponse) return auth.errorResponse;

        const { key, value } = await req.json();

        if (!key || typeof value !== "boolean") {
            return NextResponse.json({ error: "Invalid payload parameters" }, { status: 400 });
        }

        const dbKey = `flag:${key}`;
        const strValue = String(value);

        await prisma.platformSetting.upsert({
            where: { key: dbKey },
            update: { value: strValue, updatedAt: new Date() },
            create: { key: dbKey, value: strValue }
        });

        return NextResponse.json({ success: true, flag: { key, value } });
    } catch (error) {
        console.error("[FeatureFlags Update Error]:", error);
        return NextResponse.json({ error: "Failed to update feature flag" }, { status: 500 });
    }
}
