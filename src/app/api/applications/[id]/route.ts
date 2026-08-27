import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const { user, errorResponse } = await requireUser();
        if (errorResponse) return errorResponse;

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

        // Prevent duplicate status updates and emails
        if (application.status === status) {
            return NextResponse.json({
                message: "Application status is already up to date",
                application: { id: applicationId, status },
            });
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
            prisma.application.updateMany({
                where: { 
                    id: applicationId,
                    gig: { posted_by: userId } 
                },
                data: { status },
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
        await prisma.$transaction(operations);

        if ((status === "ACCEPTED" || status === "REJECTED") && application.applicant?.email) {
            import("@/lib/email/resend").then(async ({ sendTransactionalEmail }) => {
                const { ApplicationStatusEmail } = await import("@/lib/email/templates/ApplicationStatusEmail");
                await sendTransactionalEmail({
                    to: application.applicant.email!,
                    subject: status === "ACCEPTED" 
                        ? `Application Accepted: ${application.gig.title}` 
                        : `Update on your application for ${application.gig.title}`,
                    react: ApplicationStatusEmail({
                        applicantName: application.applicant.name || "Student",
                        gigTitle: application.gig.title,
                        status: status
                    }) as any
                });
            }).catch(console.error);
        }

        return NextResponse.json({
            message: "Application status updated successfully",
            application: { id: applicationId, status },
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
        const { user, errorResponse } = await requireUser();
        if (errorResponse) return errorResponse;

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
        const { user, errorResponse } = await requireUser();
        if (errorResponse) return errorResponse;

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

        // Delete application atomically with ownership scope
        const deleteResult = await prisma.application.deleteMany({
            where: { 
                id: applicationId,
                applicantId: userId,
                status: { not: "ACCEPTED" } // Ensure we don't withdraw accepted apps
            },
        });

        if (deleteResult.count === 0) {
            return NextResponse.json(
                { error: "Application could not be withdrawn or already accepted" },
                { status: 400 }
            );
        }

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
