-- CreateTable AgentRun
CREATE TABLE IF NOT EXISTS "AgentRun" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "agentType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "model" TEXT,
    "inputSummary" TEXT,
    "outputSummary" TEXT,
    "error" TEXT,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable AgentDecision
CREATE TABLE IF NOT EXISTS "AgentDecision" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "agentRunId" UUID NOT NULL,
    "decisionType" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable SourceEvidence
CREATE TABLE IF NOT EXISTS "SourceEvidence" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "opportunityId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL,
    "contentHash" TEXT,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "SourceEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE INDEX IF NOT EXISTS "AgentRun_agentType_status_idx" ON "AgentRun"("agentType", "status");
CREATE INDEX IF NOT EXISTS "AgentRun_entityType_entityId_idx" ON "AgentRun"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "AgentRun_startedAt_idx" ON "AgentRun"("startedAt");
CREATE INDEX IF NOT EXISTS "AgentDecision_agentRunId_idx" ON "AgentDecision"("agentRunId");
CREATE INDEX IF NOT EXISTS "AgentDecision_decisionType_idx" ON "AgentDecision"("decisionType");
CREATE INDEX IF NOT EXISTS "SourceEvidence_opportunityId_idx" ON "SourceEvidence"("opportunityId");
CREATE INDEX IF NOT EXISTS "SourceEvidence_evidenceType_idx" ON "SourceEvidence"("evidenceType");
CREATE INDEX IF NOT EXISTS "SourceEvidence_observedAt_idx" ON "SourceEvidence"("observedAt");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'AgentDecision_agentRunId_fkey'
    ) THEN
        ALTER TABLE "AgentDecision" ADD CONSTRAINT "AgentDecision_agentRunId_fkey" FOREIGN KEY ("agentRunId") REFERENCES "AgentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
