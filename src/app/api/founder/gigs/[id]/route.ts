import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

// PATCH - Perform action on gig (approve, reject, flag, close)
export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify user is a founder
        const currentUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
        });

        if (currentUser?.role !== "FOUNDER") {
            return NextResponse.json(
                { error: "Forbidden - Founder access only" },
                { status: 403 }
            );
        }

        const gigId = params.id;
        const { action } = await request.json();

        // Get gig
        const gig = await prisma.gig.findUnique({
            where: { id: gigId },
        });

        if (!gig) {
            return NextResponse.json({ error: "Gig not found" }, { status: 404 });
        }

        switch (action) {
            case "approve":
                await prisma.gig.update({
                    where: { id: gigId },
                    data: { status: "OPEN" },
                });
                return NextResponse.json({
                    message: "Gig approved successfully",
                });

            case "reject":
                await prisma.gig.update({
                    where: { id: gigId },
                    data: { status: "REJECTED" },
                });
                return NextResponse.json({
                    message: "Gig rejected successfully",
                });

            case "flag":
                await prisma.gig.update({
                    where: { id: gigId },
                    data: { status: "FLAGGED" },
                });
                return NextResponse.json({
                    message: "Gig flagged for review",
                });

            case "close":
                await prisma.gig.update({
                    where: { id: gigId },
                    data: { status: "CLOSED" },
                });
                return NextResponse.json({
                    message: "Gig closed successfully",
                });

            default:
                return NextResponse.json(
                    { error: "Invalid action" },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("Error performing gig action:", error);
        return NextResponse.json(
            { error: "Failed to perform action" },
            { status: 500 }
        );
    }
}

// DELETE - Delete gig
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify user is a founder
        const currentUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true },
        });

        if (currentUser?.role !== "FOUNDER") {
            return NextResponse.json(
                { error: "Forbidden - Founder access only" },
                { status: 403 }
            );
        }

        const gigId = params.id;

        // Delete gig (cascade will handle related records)
        await prisma.gig.delete({
            where: { id: gigId },
        });

        return NextResponse.json({
            message: "Gig deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting gig:", error);
        return NextResponse.json(
            { error: "Failed to delete gig" },
            { status: 500 }
        );
    }
}
