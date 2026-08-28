import { NextRequest, NextResponse } from"next/server";
import { z } from"zod";

import prisma from"@/lib/prisma";
import { sanitizeInput } from"@/lib/security/sanitization";
import { createClient } from"@/lib/supabase/server";

const ConversationCreateSchema = z.object({
 otherUserId: z.string().uuid("Invalid user ID format"),
 initialMessage: z.string().max(2000,"Message must be under 2000 characters").optional().nullable(),
});
import { validateSessionUserId } from"@/lib/uuid-utils";

// GET - Fetch all conversations for the current user
export async function GET(req: Request) {
 try {
 const supabase = await createClient();
 const { data: { user }, error: authError } = await supabase.auth.getUser();

 if (authError || !user) {
 return NextResponse.json({ error:"Unauthorized" }, { status: 401 });
 }

 const userId = user.id;

 try {
 validateSessionUserId(userId,"GET /api/conversations");
 } catch (uuidErr) {
 console.error("[P2023 Guard]", uuidErr);
 return NextResponse.json({ error:"Invalid session." }, { status: 400 });
 }

 const searchParams = new URL(req.url).searchParams;
 const page = Math.max(parseInt(searchParams.get("page") ||"1"), 1);
 const pageSize = Math.min(Math.max(parseInt(searchParams.get("limit") ||"20"), 20), 100);
 const skip = (page - 1) * pageSize;

 // Fetch conversations where user is participant_1 or participant_2
 const [conversations] = await Promise.all([
 prisma.conversation.findMany({
 where: {
 OR: [
 { participant_1: userId },
 { participant_2: userId },
 ],
 },
 include: {
 user1: {
 select: { id: true, name: true, full_name: true, email: true, image: true, avatar_url: true },
 },
 user2: {
 select: { id: true, name: true, full_name: true, email: true, image: true, avatar_url: true },
 },
 messages: {
 orderBy: { created_at:"desc" },
 take: 1,
 select: {
 id: true,
 content: true,
 created_at: true,
 sender_id: true,
 read_at: true,
 },
 },
 },
 orderBy: { last_message_at:"desc" },
 skip,
 take: pageSize,
 }),
 prisma.conversation.count({
 where: {
 OR: [
 { participant_1: userId },
 { participant_2: userId },
 ],
 },
 }),
 ]);

 const formattedConversations = conversations.map((conv: any) => {
 const otherUser = conv.participant_1 === userId ? conv.user2 : conv.user1;
 const lastMessage = conv.messages[0];

 return {
 id: conv.id,
 user1: conv.user1,
 user2: conv.user2,
 otherUser,
 lastMessage: lastMessage
 ? {
 text: lastMessage.content,
 createdAt: lastMessage.created_at,
 isFromMe: lastMessage.sender_id === userId,
 isRead: !!lastMessage.read_at,
 }
 : null,
 last_message: conv.last_message,
 last_message_at: conv.last_message_at,
 created_at: conv.created_at,
 };
 });

 return NextResponse.json({ conversations: formattedConversations });
 } catch (error) {
 console.error("Error fetching conversations:", error);
 return NextResponse.json({ error:"Failed to fetch conversations" }, { status: 500 });
 }
}

// POST - Create a new conversation
export async function POST(request: NextRequest) {
 try {
 const supabase = await createClient();
 const { data: { user }, error: authError } = await supabase.auth.getUser();

 if (authError || !user) {
 return NextResponse.json({ error:"Unauthorized" }, { status: 401 });
 }

 const userId = user.id;
 let body;
 try {
 body = await request.json();
 } catch {
 return NextResponse.json({ error:"Invalid JSON body" }, { status: 400 });
 }

 const parseResult = ConversationCreateSchema.safeParse(body);
 if (!parseResult.success) {
 return NextResponse.json(
 { error:"Validation failed", details: parseResult.error.flatten().fieldErrors },
 { status: 400 }
 );
 }

 const { otherUserId } = parseResult.data;
 const initialMessage = parseResult.data.initialMessage ? sanitizeInput(parseResult.data.initialMessage) : undefined;

 if (otherUserId === userId) {
 return NextResponse.json({ error:"Cannot start a conversation with yourself" }, { status: 400 });
 }

 // Ensure deterministic ordering (smaller UUID first)
 const [p1, p2] = [userId, otherUserId].sort();

 // Check if conversation already exists
 const existingConversation = await prisma.conversation.findFirst({
 where: {
 OR: [
 { participant_1: userId, participant_2: otherUserId },
 { participant_1: otherUserId, participant_2: userId },
 ],
 },
 include: {
 user1: { select: { id: true, name: true, full_name: true, email: true, image: true, avatar_url: true } },
 user2: { select: { id: true, name: true, full_name: true, email: true, image: true, avatar_url: true } },
 },
 });

 if (existingConversation) {
 return NextResponse.json({ conversation: existingConversation, isNew: false });
 }

 // Create new conversation
 const conversation = await prisma.conversation.create({
 data: {
 participant_1: p1,
 participant_2: p2,
 ...(initialMessage && {
 messages: {
 create: {
 content: initialMessage,
 sender_id: userId,
 },
 },
 last_message: initialMessage,
 last_message_at: new Date(),
 }),
 },
 include: {
 user1: { select: { id: true, name: true, full_name: true, email: true, image: true, avatar_url: true } },
 user2: { select: { id: true, name: true, full_name: true, email: true, image: true, avatar_url: true } },
 messages: true,
 },
 });

 return NextResponse.json({ conversation, isNew: true });
 } catch (error) {
 console.error("Error creating conversation:", error);
 return NextResponse.json({ error:"Failed to create conversation" }, { status: 500 });
 }
}
