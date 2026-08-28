import { NextRequest, NextResponse } from"next/server"
import { z } from"zod"

import prisma from"@/lib/prisma"

const submitSchema = z.object({
 name: z.string().min(3).max(200),
 city: z.string().min(2).max(100),
 district: z.string().min(2).max(100),
 state: z.string().min(2).max(100),
 university: z.string().max(200).optional(),
 website: z.string().url().optional().or(z.literal("")),
 userId: z.string().optional(),
})

export async function POST(req: NextRequest) {
 try {
 const body = await req.json()
 const parsed = submitSchema.safeParse(body)

 if (!parsed.success) {
 return NextResponse.json(
 { error:"Invalid data", details: parsed.error.flatten() },
 { status: 400 }
 )
 }

 const { name, city, district, state, website, userId } = parsed.data

 // Check if college already exists (case-insensitive)
 const existing = await prisma.college.findFirst({
 where: {
 name: { equals: name, mode:"insensitive" },
 city: { equals: city, mode:"insensitive" },
 },
 })

 if (existing) {
 return NextResponse.json({
 success: true,
 college: existing,
 message:"College already exists",
 isNew: false,
 })
 }

 const college = await prisma.college.create({
 data: {
 name: name.trim(),
 city: city.trim(),
 district: district.trim(),
 state: state.trim(),
 website: website?.trim() || null,
 approved: false,
 verified: false,
 createdBy: userId || null,
 },
 })

 return NextResponse.json({
 success: true,
 college,
 message:"College submitted for review",
 isNew: true,
 })
 } catch (err) {
 console.error("[colleges/submit]", err)
 return NextResponse.json({ error:"Server error" }, { status: 500 })
 }
}
