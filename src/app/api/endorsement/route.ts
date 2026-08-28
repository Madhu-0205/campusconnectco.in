import { NextRequest, NextResponse } from"next/server";

// Server refresh
import prisma from"@/lib/prisma";
import { createClient } from"@/lib/supabase/server";

export async function POST(req: NextRequest) {
 try {
 const supabase = await createClient();
 const { data: { user }, error } = await supabase.auth.getUser();

 if (error || !user) {
 return NextResponse.json({ error:"Unauthorized" }, { status: 401 });
 }

 const { endorseeId, skillId } = await req.json();

 if (!endorseeId || !skillId) {
 return NextResponse.json({ error:"Missing parameters" }, { status: 400 });
 }

 if (user.id === endorseeId) {
 return NextResponse.json({ error:"Cannot endorse yourself" }, { status: 400 });
 }

 // Verify skill exists
 const skill = await prisma.skill.findUnique({ where: { id: skillId } });
 if (!skill) return NextResponse.json({ error:"Skill not found" }, { status: 404 });

 // Upsert Endorsement
 const endorsement = await prisma.endorsement.upsert({
 where: {
 endorserId_endorseeId_skillId: {
 endorserId: user.id,
 endorseeId,
 skillId
 }
 },
 update: {}, // Already exists, do nothing
 create: {
 endorserId: user.id,
 endorseeId,
 skillId
 }
 });

 // Notify endorsee
 await prisma.notification.create({
 data: {
 userId: endorseeId,
 title:"New Skill Endorsement",
 message: `Someone just endorsed you for ${skill.name}.`,
 type:"ENDORSEMENT",
 link:"/profile"
 }
 });

 return NextResponse.json({ success: true, endorsement });
 } catch (error: unknown) {
 console.error("Endorsement error:", error);
 return NextResponse.json({ error:"Internal Server Error" }, { status: 500 });
 }
}
