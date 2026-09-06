import { NextRequest, NextResponse } from"next/server";
import { z } from"zod";

import { protectApi } from"@/lib/auth-checks";
import prisma from"@/lib/prisma";
import { sanitizeInput } from"@/lib/security/sanitization";

const FounderInternshipUpdateSchema = z.object({
 action: z.enum(["approve","reject","feature"]).optional(),
 title: z.string().min(3).max(100).optional(),
 description: z.string().min(10).max(5000).optional(),
 company: z.string().min(2).max(100).optional(),
 skills: z.string().max(500).optional().nullable(),
 stipend: z.coerce.number().nonnegative().optional().nullable(),
 duration: z.string().max(50).optional().nullable(),
 location: z.string().max(100).optional().nullable(),
 deadline: z.string().nullish().transform(val => {
 if (!val || val.trim() ==="") return null;
 const d = new Date(val);
 return isNaN(d.getTime()) ? null : d;
 }),
 status: z.string().max(20).optional(),
 isFeatured: z.boolean().optional(),
 applicationLink: z.string().url().or(z.literal("")).optional().nullable(),
 tags: z.string().max(500).optional().nullable(),
});

export async function PATCH(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const { errorResponse } = await protectApi(["FOUNDER", "ADMIN"]);
 if (errorResponse) return errorResponse;

 try {
 const { id } = await params;

 // Validate UUID format to prevent DB casting crashes
 if (!z.string().uuid().safeParse(id).success) {
 return NextResponse.json({ error:"Invalid internship ID format" }, { status: 400 });
 }

 let body;
 try {
 body = await request.json();
 } catch {
 return NextResponse.json({ error:"Invalid JSON body" }, { status: 400 });
 }

 const parseResult = FounderInternshipUpdateSchema.safeParse(body);
 if (!parseResult.success) {
 return NextResponse.json(
 { error:"Validation failed", details: parseResult.error.flatten().fieldErrors },
 { status: 400 }
 );
 }

 const { action, ...updateData } = parseResult.data;

 let data: Record<string, unknown> = {};

 if (action ==="approve") {
 data = { status:"OPEN" };
 } else if (action ==="reject") {
 data = { status:"CLOSED" };
 } else if (action ==="feature") {
 const current = await prisma.internship.findUnique({ where: { id }, select: { isFeatured: true } });
 data = { isFeatured: !current?.isFeatured };
 } else {
 // Direct update with sanitization
 if (updateData.title !== undefined) data.title = sanitizeInput(updateData.title);
 if (updateData.description !== undefined) data.description = sanitizeInput(updateData.description);
 if (updateData.company !== undefined) data.company = sanitizeInput(updateData.company);
 if (updateData.skills !== undefined) data.skills = updateData.skills ? sanitizeInput(updateData.skills) : null;
 if (updateData.stipend !== undefined) data.stipend = updateData.stipend;
 if (updateData.duration !== undefined) data.duration = updateData.duration ? sanitizeInput(updateData.duration) : null;
 if (updateData.location !== undefined) data.location = updateData.location ? sanitizeInput(updateData.location) : null;
 if (updateData.deadline !== undefined) data.deadline = updateData.deadline;
 if (updateData.status !== undefined) data.status = updateData.status;
 if (updateData.isFeatured !== undefined) data.isFeatured = updateData.isFeatured;
 if (updateData.applicationLink !== undefined) data.applicationLink = updateData.applicationLink ? sanitizeInput(updateData.applicationLink) : null;
 if (updateData.tags !== undefined) data.tags = updateData.tags ? sanitizeInput(updateData.tags) : null;
 }

 const internship = await prisma.internship.update({
 where: { id },
 data,
 });

 return NextResponse.json({ internship });
 } catch (error) {
 console.error("[PATCH /api/founder/internships/[id]]", error);
 return NextResponse.json({ error:"Internal server error" }, { status: 500 });
 }
}

export async function DELETE(
 _request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const { errorResponse } = await protectApi(["FOUNDER", "ADMIN"]);
 if (errorResponse) return errorResponse;

 try {
 const { id } = await params;

 // Validate UUID format to prevent DB casting crashes
 if (!z.string().uuid().safeParse(id).success) {
 return NextResponse.json({ error:"Invalid internship ID format" }, { status: 400 });
 }

 // Soft delete via status
 await prisma.internship.update({
 where: { id },
 data: { status:"DELETED" },
 });

 return NextResponse.json({ success: true });
 } catch (error) {
 console.error("[DELETE /api/founder/internships/[id]]", error);
 return NextResponse.json({ error:"Internal server error" }, { status: 500 });
 }
}
