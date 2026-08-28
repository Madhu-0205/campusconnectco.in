import { NextRequest, NextResponse } from"next/server";
import { z } from"zod";

import { requireUser, requireConversationParticipant } from"@/lib/auth-checks";
import prisma from"@/lib/prisma";

// GET - Fetch messages for a conversation
export async function GET(
 request: NextRequest,
 props: { params: Promise<{ id: string }> }
) {
 const params = await props.params;
 try {
 const { user, errorResponse: authErrorResponse } = await requireUser();
 if (authErrorResponse) return authErrorResponse;

 const userId = user.id;
 const conversation_id = params.id;

 // Validate UUID format to prevent DB casting crashes
 if (!z.string().uuid().safeParse(conversation_id).success) {
 return NextResponse.json({ error:"Invalid conversation ID format" }, { status: 400 });
 }

 // Verify user is part of this conversation
 const { conversation, errorResponse: convError } = await requireConversationParticipant(userId, conversation_id);
 if (convError) return convError;

 // Ensure we fetch with the required includes
 const fullConversation = await prisma.conversation.findUnique({
 where: { id: conversation_id },
 include: {
 user1: { select: { id: true, name: true, full_name: true, email: true, image: true, avatar_url: true } },
 user2: { select: { id: true, name: true, full_name: true, email: true, image: true, avatar_url: true } },
 },
 });

 // Fetch messages
 const messages = await prisma.message.findMany({ take: 50,
 where: { conversation_id: conversation_id },
 include: {
 sender: {
 select: { id: true, name: true, full_name: true, email: true, image: true, avatar_url: true },
 },
 },
 orderBy: { created_at:"asc" },
 });

 // Mark unread messages as read
 await prisma.message.updateMany({
 where: {
 conversation_id: conversation_id,
 sender_id: { not: userId },
 read_at: null,
 },
 data: { read_at: new Date() },
 });

 return NextResponse.json({ conversation: fullConversation, messages });
 } catch (error) {
 console.error("Error fetching messages:", error);
 return NextResponse.json({ error:"Failed to fetch messages" }, { status: 500 });
 }
}

// POST - Send a new message
export async function POST(
 request: NextRequest,
 props: { params: Promise<{ id: string }> }
) {
 const params = await props.params;
 try {
 const { user, errorResponse: authErrorResponse } = await requireUser();
 if (authErrorResponse) return authErrorResponse;

 const userId = user.id;
 const conversation_id = params.id;
 const { text, content: bodyContent } = await request.json();
 const messageContent = text || bodyContent;

 // Validate UUID format to prevent DB casting crashes
 if (!z.string().uuid().safeParse(conversation_id).success) {
 return NextResponse.json({ error:"Invalid conversation ID format" }, { status: 400 });
 }

 if (!messageContent || messageContent.trim().length === 0) {
 return NextResponse.json({ error:"Message content is required" }, { status: 400 });
 }

 // Verify user is part of this conversation
 const { errorResponse: convError } = await requireConversationParticipant(userId, conversation_id);
 if (convError) return convError;

 // Create message and update conversation last_message
 const [message] = await prisma.$transaction([
 prisma.message.create({
 data: {
 conversation_id: conversation_id,
 sender_id: userId,
 content: messageContent.trim(),
 },
 include: {
 sender: {
 select: { id: true, name: true, full_name: true, email: true, image: true, avatar_url: true },
 },
 },
 }),
 prisma.conversation.update({
 where: { id: conversation_id },
 data: {
 last_message: messageContent.trim(),
 last_message_at: new Date(),
 },
 }),
 ]);

 return NextResponse.json({ message });
 } catch (error) {
 console.error("Error sending message:", error);
 return NextResponse.json({ error:"Failed to send message" }, { status: 500 });
 }
}

// PATCH - Mark messages as read
export async function PATCH(
 request: NextRequest,
 props: { params: Promise<{ id: string }> }
) {
 const params = await props.params;
 try {
 const { user, errorResponse: authErrorResponse } = await requireUser();
 if (authErrorResponse) return authErrorResponse;

 const userId = user.id;
 const conversation_id = params.id;

 // Validate UUID format to prevent DB casting crashes
 if (!z.string().uuid().safeParse(conversation_id).success) {
 return NextResponse.json({ error:"Invalid conversation ID format" }, { status: 400 });
 }

 // Verify user is part of this conversation
 const { errorResponse: convError } = await requireConversationParticipant(userId, conversation_id);
 if (convError) return convError;

 const result = await prisma.message.updateMany({
 where: {
 conversation_id: conversation_id,
 sender_id: { not: userId },
 read_at: null,
 },
 data: { read_at: new Date() },
 });

 return NextResponse.json({ message:"Messages marked as read", count: result.count });
 } catch (error) {
 console.error("Error marking messages as read:", error);
 return NextResponse.json({ error:"Failed to mark messages as read" }, { status: 500 });
 }
}
