import { NextRequest, NextResponse } from "next/server";

import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS = {
    platformName: "Campus Connect",
    supportEmail: "support@campusconnectco.in",
    maintenanceMode: "false",
    studentFee: "5",
    clientFee: "10",
    escrowEnabled: "true",
    aiEnabled: "true",
    emailNotifications: "true",
    commissionEnterprise: "10",
    commissionStandard: "8.5",
    commissionMicro: "7",
};

export async function GET() {
    const { errorResponse } = await protectApi(["ADMIN"]);
    if (errorResponse) return errorResponse;

    try {
        const records = await prisma.platformSetting.findMany({ take: 50 });
        const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
        for (const rec of records) {
            settings[rec.key] = rec.value;
        }
        return NextResponse.json({ settings });
    } catch (error) {
        console.error("[GET /api/founder/settings]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const { errorResponse } = await protectApi(["ADMIN"]);
    if (errorResponse) return errorResponse;

    try {
        const body = await request.json();
        const { settings } = body as { settings: Record<string, string> };

        // Upsert each setting
        await Promise.all(
            Object.entries(settings).map(([key, value]) =>
                prisma.platformSetting.upsert({
                    where: { key },
                    update: { value: String(value) },
                    create: { key, value: String(value) },
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PATCH /api/founder/settings]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
