import { NextRequest, NextResponse } from "next/server";
import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { errorResponse } = await protectApi(["FOUNDER"]);
    if (errorResponse) return errorResponse;

    try {
        const { id: userId } = await params;
        const { action } = await request.json();

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
    const { errorResponse, user } = await protectApi(["FOUNDER"]);
    if (errorResponse) return errorResponse;

    try {
        const { id: userId } = await params;

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
