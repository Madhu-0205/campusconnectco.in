-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Follows_followingId_idx" ON "Follows"("followingId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserSkill_skillId_idx" ON "UserSkill"("skillId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GigSkill_skillId_idx" ON "GigSkill"("skillId");
