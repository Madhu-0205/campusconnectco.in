import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        // Get authenticated user
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = user.id;
        const applicationId = params.id;

        // 🛡️ UUID Guard
        if (!z.string().uuid().safeParse(applicationId).success) {
            return NextResponse.json({ error: "Invalid application ID format" }, { status: 400 });
        }

        // Parse request body
        const body = await request.json();
        const { status } = body;

        if (!status || !["ACCEPTED", "REJECTED", "PENDING"].includes(status)) {
            return NextResponse.json(
                { error: "Invalid status. Must be ACCEPTED, REJECTED, or PENDING" },
                { status: 400 }
            );
        }

        // Get application with gig info
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                gig: {
                    select: {
                        posted_by: true,
                        title: true,
                    },
                },
                applicant: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        // Check if user is the gig poster (only poster can update status)
        if (application.gig.posted_by !== userId) {
            return NextResponse.json(
                { error: "Only the gig poster can update application status" },
                { status: 403 }
            );
        }

        // Prepare transaction operations
        const operations: Prisma.PrismaPromise<unknown>[] = [
            prisma.application.update({
                where: { id: applicationId },
                data: { status },
                select: {
                    id: true,
                    status: true,
                    updatedAt: true,
                },
            })
        ];

        // We do NOT update the gig status to IN_PROGRESS here.
        // That should only happen AFTER the client completes the escrow payment.

        operations.push(
            prisma.notification.create({
                data: {
                    userId: application.applicantId,
                    title: "Application Update",
                    message: `Your application for ${application.gig.title} has been ${status.toLowerCase()}.`,
                    type: "APPLICATION",
                    link: `/get-gig`
                }
            })
        );

        // Execute sequentially in transaction
        const [updatedApplication] = await prisma.$transaction(operations);

        return NextResponse.json({
            message: "Application status updated successfully",
            application: updatedApplication,
        });
    } catch (error) {
        console.error("Error updating application:", error);
        return NextResponse.json(
            { error: "Failed to update application status" },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        // Get authenticated user
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const applicationId = params.id;

        // 🛡️ UUID Guard
        if (!z.string().uuid().safeParse(applicationId).success) {
            return NextResponse.json({ error: "Invalid application ID format" }, { status: 400 });
        }

        // Get application details
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                gig: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        budget: true,
                        status: true,
                        posted_by: true,
                    },
                },
                applicant: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        skills: true,
                        bio: true,
                    },
                },
            },
        });

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        // 🛡️ IDOR Authorization Check: Only applicant or gig poster can view
        if (application.applicantId !== user.id && application.gig.posted_by !== user.id) {
            return NextResponse.json(
                { error: "Forbidden: You do not have access to view this application" },
                { status: 403 }
            );
        }

        return NextResponse.json({ application });
    } catch (error) {
        console.error("Error fetching application:", error);
        return NextResponse.json(
            { error: "Failed to fetch application" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        // Get authenticated user
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = user.id;
        const applicationId = params.id;

        // 🛡️ UUID Guard
        if (!z.string().uuid().safeParse(applicationId).success) {
            return NextResponse.json({ error: "Invalid application ID format" }, { status: 400 });
        }

        // Get application
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            select: {
                applicantId: true,
                status: true,
            },
        });

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        // Check if user is the applicant (only applicant can withdraw)
        if (application.applicantId !== userId) {
            return NextResponse.json(
                { error: "You can only withdraw your own applications" },
                { status: 403 }
            );
        }

        // Don't allow withdrawal of accepted applications
        if (application.status === "ACCEPTED") {
            return NextResponse.json(
                { error: "Cannot withdraw an accepted application" },
                { status: 400 }
            );
        }

        // Delete application
        await prisma.application.delete({
            where: { id: applicationId },
        });

        return NextResponse.json({
            message: "Application withdrawn successfully",
        });
    } catch (error) {
        console.error("Error deleting application:", error);
        return NextResponse.json(
            { error: "Failed to withdraw application" },
            { status: 500 }
        );
    }
}
