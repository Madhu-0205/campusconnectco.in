import { NextRequest, NextResponse } from"next/server";
import { z } from"zod";

import { requireUser, getUserRoleFromDb } from"@/lib/auth-checks";
import prisma from"@/lib/prisma";
import { createClient } from"@/lib/supabase/server";

export async function GET(
 request: NextRequest,
 props: { params: Promise<{ userId: string; fileName: string }> }
) {
 const params = await props.params;
 try {
 const { errorResponse, user } = await requireUser();
 if (errorResponse || !user) {
 return errorResponse || NextResponse.json({ error:"Unauthorized" }, { status: 401 });
 }

 const { userId, fileName } = params;

 if (!z.string().uuid().safeParse(userId).success) {
 return NextResponse.json({ error:"Invalid user ID" }, { status: 400 });
 }

 if (fileName.includes("/") || fileName.includes("\\") || fileName.includes("..")) {
 return NextResponse.json({ error:"Invalid file name" }, { status: 400 });
 }

 // Authorization checks
 let authorized = false;

 // 1. Owner
 if (user.id === userId) {
 authorized = true;
 } else {
 const role = await getUserRoleFromDb(user.id);
 
 // 2. Admin
 if (role ==="ADMIN") {
 authorized = true;
 } 
 // 3. Founder/Employer who has an application from this user
 else if (role ==="FOUNDER" || role ==="STARTUP" || role ==="CLIENT") {
 const application = await prisma.application.findFirst({
 where: {
 applicantId: userId,
 gig: {
 posted_by: user.id
 }
 }
 });

 if (application) {
 authorized = true;
 }
 }
 }

 if (!authorized) {
 return NextResponse.json({ error:"Forbidden: You do not have permission to view this resume" }, { status: 403 });
 }

 const { createAdminClient } = await import("@/lib/supabase/admin");
 const supabaseAdmin = createAdminClient();
 const filePath = `${userId}/${fileName}`;

 // Create short-lived signed URL (60 seconds) using the admin client
 // This bypasses RLS since we already authorized the user at the application level above.
 const { data, error } = await supabaseAdmin.storage
 .from("resumes")
 .createSignedUrl(filePath, 60);

 if (error || !data?.signedUrl) {
 console.error("[Resume proxy error]:", error);
 return NextResponse.json({ error:"Failed to generate access URL" }, { status: 500 });
 }

 // Redirect to the signed URL
 return NextResponse.redirect(data.signedUrl);

 } catch (error) {
 console.error("[GET /api/resumes/[userId]/[fileName]] Error:", error);
 return NextResponse.json({ error:"Internal server error" }, { status: 500 });
 }
}
