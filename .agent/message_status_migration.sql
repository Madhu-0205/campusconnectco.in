-- Add message status fields for real-time messaging
-- Run this migration with: npx prisma migrate dev --name add_message_status

-- Add isRead column to Message table
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "isRead" BOOLEAN NOT NULL DEFAULT false;

-- Add readAt column to Message table
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP(3);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "Message_conversationId_idx" ON "Message"("conversationId");
CREATE INDEX IF NOT EXISTS "Message_senderId_idx" ON "Message"("senderId");

-- Add lastMessageAt to Conversation for sorting
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "lastMessageAt" TIMESTAMP(3);

-- Update existing conversations with their last message time
UPDATE "Conversation" c
SET "lastMessageAt" = (
  SELECT MAX("createdAt")
  FROM "Message" m
  WHERE m."conversationId" = c.id
)
WHERE EXISTS (
  SELECT 1 FROM "Message" m WHERE m."conversationId" = c.id
);
