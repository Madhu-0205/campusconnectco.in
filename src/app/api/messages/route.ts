import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = user.id;
        const { conversationId, content, attachmentType, attachmentUrl } = await request.json();

        if (!conversationId || (!content && !attachmentUrl)) {
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
