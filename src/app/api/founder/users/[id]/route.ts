import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

const UserActionSchema = z.object({
    action: z.enum(["verify", "unverify", "ban", "unban", "email"]),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { errorResponse } = await protectApi(["ADMIN", "FOUNDER"]);
    if (errorResponse) return errorResponse;

    try {
        const { id: userId } = await params;

        // Validate UUID format to prevent DB casting crashes
        if (!z.string().uuid().safeParse(userId).success) {
            return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const parseResult = UserActionSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { action } = parseResult.data;

        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        switch (action) {
            case "verify":
                await prisma.user.update({
                    where: { id: userId },
                    data: { isVerified: true },
                });
                return NextResponse.json({ message: "User verified" });

            case "unverify":
                await prisma.user.update({
                    where: { id: userId },
                    data: { isVerified: false },
                });
                return NextResponse.json({ message: "User verification removed" });

            case "ban":
                await prisma.user.update({
                    where: { id: userId },
                    data: { isSuspended: true },
                });
                return NextResponse.json({ message: "User suspended" });

            case "unban":
                await prisma.user.update({
                    where: { id: userId },
                    data: { isSuspended: false },
                });
                return NextResponse.json({ message: "User unsuspended" });

            case "email":
                // Placeholder — integrate Resend/SMTP when ready
                console.log(`[Founder] Email action requested for: ${targetUser.email}`);
                return NextResponse.json({ message: "Email action logged" });

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error) {
        console.error("[PATCH /api/founder/users/[id]]", error);
        return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { errorResponse, user } = await protectApi(["ADMIN", "FOUNDER"]);
    if (errorResponse) return errorResponse;

    try {
        const { id: userId } = await params;

        // Validate UUID format to prevent DB casting crashes
        if (!z.string().uuid().safeParse(userId).success) {
            return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
        }

        // Prevent self-deletion
        if (userId === user?.id) {
            return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
        }

        // Soft delete — suspend instead of destroy
        await prisma.user.update({
            where: { id: userId },
            data: { isSuspended: true },
        });

        return NextResponse.json({ message: "User suspended (soft delete)" });
    } catch (error) {
        console.error("[DELETE /api/founder/users/[id]]", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
