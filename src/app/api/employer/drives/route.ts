import { NextRequest, NextResponse } from"next/server"
import { z } from"zod"

import { getSession } from"@/lib/auth-checks"
import prisma from"@/lib/prisma"
import { sanitizeInput } from"@/lib/security/sanitization"

const DriveCreateSchema = z.object({
 organizationId: z.string().uuid("Invalid Organization ID format"),
 title: z.string().min(3,"Title must be at least 3 characters").max(100,"Title is too long").trim(),
 description: z.string().min(10,"Description must be at least 10 characters").max(5000,"Description is too long").trim(),
 startDate: z.string().refine(val => !isNaN(Date.parse(val)),"Invalid start date").transform(val => new Date(val)),
 endDate: z.string().refine(val => !isNaN(Date.parse(val)),"Invalid end date").transform(val => new Date(val)),
 colleges: z.array(z.string().max(100)).optional(),
});

// POST /api/employer/drives — Create a new campus drive
export async function POST(req: NextRequest) {
 try {
 const user = await getSession()
 if (!user) return NextResponse.json({ error:"Unauthorized" }, { status: 401 })

 let body;
 try {
 body = await req.json()
 } catch {
 return NextResponse.json({ error:"Invalid JSON body" }, { status: 400 })
 }

 const parseResult = DriveCreateSchema.safeParse(body)
 if (!parseResult.success) {
 return NextResponse.json(
 { error:"Validation failed", details: parseResult.error.flatten().fieldErrors },
 { status: 400 }
 );
 }

 const { organizationId, startDate, endDate, colleges } = parseResult.data
 const title = sanitizeInput(parseResult.data.title)
 const description = sanitizeInput(parseResult.data.description)

 // Verify user is a member of the organization
 
 const membership = await (prisma as any).member.findFirst({
 where: { userId: user.id, organizationId },
 })
 if (!membership) {
 return NextResponse.json({ error:"Forbidden: Not a member of this organization" }, { status: 403 })
 }

 
 const drive = await (prisma as any).campusDrive.create({
 data: {
 organizationId,
 title,
 description,
 startDate,
 endDate,
 targetColleges: colleges || [],
 status:"UPCOMING",
 },
 })

 return NextResponse.json(drive, { status: 201 })
 } catch (error) {
 console.error("[/api/employer/drives POST]", error)
 return NextResponse.json({ error:"Internal server error" }, { status: 500 })
 }
}

// GET /api/employer/drives — List drives for the user's organization
export async function GET(req: NextRequest) {
 try {
 const user = await getSession()
 if (!user) return NextResponse.json({ error:"Unauthorized" }, { status: 401 })

 
 const membership = await (prisma as any).member.findFirst({
 where: { userId: user.id },
 include: { organization: true },
 })

 if (!membership) {
 return NextResponse.json([])
 }

 
 const drives = await (prisma as any).campusDrive.findMany({ take: 50,
 where: { organizationId: membership.organizationId },
 orderBy: { createdAt:"desc" },
 })

 return NextResponse.json(drives)
 } catch (error) {
 console.error("[/api/employer/drives GET]", error)
 return NextResponse.json({ error:"Internal server error" }, { status: 500 })
 }
}
