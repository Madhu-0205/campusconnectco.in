import { NextRequest, NextResponse } from"next/server"
import { z } from"zod"

import { getSession } from"@/lib/auth-checks"
import prisma from"@/lib/prisma"
import { sanitizeInput } from"@/lib/security/sanitization"

const OrgCreateSchema = z.object({
 name: z.string().min(2,"Name must be at least 2 characters").max(100,"Name cannot exceed 100 characters").trim(),
});

// POST /api/employer/organization — Create a new organization
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

 const parseResult = OrgCreateSchema.safeParse(body)
 if (!parseResult.success) {
 return NextResponse.json(
 { error:"Validation failed", details: parseResult.error.flatten().fieldErrors },
 { status: 400 }
 );
 }

 const name = sanitizeInput(parseResult.data.name);

 // Check if user already has an org
 
 const existing = await (prisma as any).member.findFirst({ where: { userId: user.id } })
 if (existing) return NextResponse.json({ error:"Already in an organization" }, { status: 409 })

 const slug = name
 .toLowerCase()
 .replace(/[^a-z0-9]+/g,"-")
 .replace(/^-+|-+$/g,"")

 
 const org = await (prisma as any).organization.create({
 data: {
 name: name.trim(),
 slug: `${slug}-${Date.now()}`,
 members: {
 create: { userId: user.id, role:"OWNER" },
 },
 },
 })

 return NextResponse.json(org, { status: 201 })
 } catch (error) {
 console.error("[/api/employer/organization POST]", error)
 return NextResponse.json({ error:"Internal server error" }, { status: 500 })
 }
}
