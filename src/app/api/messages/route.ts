import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security/sanitization";
import { createClient } from "@/lib/supabase/server";

const MessageCreateSchema = z.object({
    conversationId: z.string().uuid("Invalid Conversation ID format"),
    content: z.string().max(2000, "Message must be under 2000 characters").optional().nullable(),
    attachmentType: z.string().max(50).optional().nullable(),
    attachmentUrl: z.string().url("Invalid attachment URL").or(z.literal("")).optional().nullable(),
});

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = user.id;
        
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const parseResult = MessageCreateSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { conversationId, attachmentType, attachmentUrl } = parseResult.data;
        const content = parseResult.data.content ? sanitizeInput(parseResult.data.content) : "";

        if (!content && !attachmentUrl) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify conversation belongs to user
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                OR: [
                    { participant_1: userId },
                    { participant_2: userId },
                ]
            }
        });

        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found or unauthorized" }, { status: 403 });
        }

        // Create message and update conversation's last_message in a transaction
        const [newMessage] = await prisma.$transaction([
            prisma.message.create({
                data: {
                    conversation_id: conversationId,
                    sender_id: userId,
                    content: content || "",
                    attachment_type: attachmentType,
                    attachment_url: attachmentUrl,
                }
            }),
            prisma.conversation.update({
                where: { id: conversationId },
                data: {
                    last_message: content || "Sent an attachment",
                    last_message_at: new Date(),
                }
            })
        ]);

        return NextResponse.json(newMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
