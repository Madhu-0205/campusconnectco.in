import { cookies } from"next/headers";
import { NextResponse } from"next/server";
import { z } from"zod";

import { logger } from"@/lib/logger";
import prisma from"@/lib/prisma";
import { sanitizeInput } from"@/lib/security/sanitization";
import { createClient } from"@/lib/supabase/server";
import { validateSessionUserId } from"@/lib/uuid-utils";

const ApplySchema = z.object({
 gigId: z.string().uuid("Invalid Gig ID format"),
 coverLetter: z.string().max(5000,"Cover letter must be under 5000 characters").optional().nullable(),
});

export const dynamic ="force-dynamic";

export async function POST(req: Request) {
 try {
 const cookieStore = await cookies();
 const isPreview = (await cookieStore).get('admin_preview_mode')?.value === 'true';

 if (isPreview) {
 return NextResponse.json({ error:"Cannot submit applications in Preview Mode" }, { status: 403 });
 }

 // Get authenticated user
 const supabase = await createClient();
 const {
 data: { user },
 error: authError,
 } = await supabase.auth.getUser();

 if (authError || !user) {
 return NextResponse.json({ error:"Unauthorized" }, { status: 401 });
 }

 const userId = user.id;

 // 🛡️ UUID Guard
 try {
 validateSessionUserId(userId,"POST /api/applications/apply");
 } catch (uuidErr) {
 logger.error("[P2023 Guard] Invalid Session ID", uuidErr, { userId });
 return NextResponse.json({ error:"Invalid session. Please sign out and sign in again." }, { status: 400 });
 }
 // Parse request body
 let body;
 try {
 body = await req.json();
 } catch {
 return NextResponse.json({ error:"Invalid JSON body" }, { status: 400 });
 }

 const parseResult = ApplySchema.safeParse(body);
 if (!parseResult.success) {
 return NextResponse.json(
 { error:"Validation failed", details: parseResult.error.flatten().fieldErrors },
 { status: 400 }
 );
 }

 const { gigId } = parseResult.data;
 const coverLetter = parseResult.data.coverLetter ? sanitizeInput(parseResult.data.coverLetter) : null;

 // Check if gig exists and is open
 const gig = await prisma.gig.findUnique({
 where: { id: gigId },
 select: {
 id: true,
 status: true,
 posted_by: true,
 title: true,
 poster: {
 select: {
 name: true,
 email: true,
 },
 },
 },
 });

 if (!gig) {
 return NextResponse.json({ error:"Gig not found" }, { status: 404 });
 }

 if (gig.status !=="OPEN") {
 return NextResponse.json({ error:"This gig is no longer accepting applications" }, { status: 400 });
 }

 // Check if user is the poster
 if (gig.posted_by === userId) {
 return NextResponse.json({ error:"You cannot apply to your own gig" }, { status: 400 });
 }

 // Check if user has already applied
 const existingApplication = await prisma.application.findFirst({
 where: {
 gigId,
 applicantId: userId,
 },
 });

 if (existingApplication) {
 return NextResponse.json({ error:"You have already applied to this gig" }, { status: 400 });
 }

 // Create application
 const application = await prisma.application.create({
 data: {
 gigId,
 applicantId: userId,
 coverLetter: coverLetter || null,
 status:"PENDING",
 },
 include: {
 gig: {
 select: {
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

 // Fire-and-forget emails
 import("@/lib/email/resend").then(async ({ sendTransactionalEmail }) => {
 const { ApplicationSubmittedEmail } = await import("@/lib/email/templates/ApplicationSubmittedEmail");
 const { NewApplicationFounderEmail } = await import("@/lib/email/templates/NewApplicationFounderEmail");
 
 // 1. Send confirmation to applicant
 if (application.applicant?.email) {
 await sendTransactionalEmail({
 to: application.applicant.email,
 subject: `Application Submitted: ${gig.title}`,
 react: ApplicationSubmittedEmail({
 applicantName: application.applicant.name ||"Student",
 gigTitle: gig.title,
 applicationId: application.id
 }) as any
 });
 }

 // 2. Send notification to founder
 if (gig.poster?.email) {
 await sendTransactionalEmail({
 to: gig.poster.email,
 subject: `New Application for ${gig.title}`,
 react: NewApplicationFounderEmail({
 founderName: gig.poster.name ||"Founder",
 applicantName: application.applicant.name ||"A student",
 gigTitle: gig.title,
 applicationId: application.id
 }) as any
 });
 }
 }).catch(console.error);

 return NextResponse.json({
 message:"Application submitted successfully",
 application: {
 id: application.id,
 status: application.status,
 createdAt: application.createdAt,
 },
 });
 } catch (error) {
 logger.error("Error creating application", error, { gigId: req.url });
 return NextResponse.json(
 { error:"Failed to submit application. Please try again later." },
 { status: 500 }
 );
 }
}
