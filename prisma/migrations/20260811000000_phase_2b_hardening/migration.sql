-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "applications_applicantId_gigId_key" ON "applications"("applicantId", "gigId");

-- CreateIndex
CREATE INDEX "gigs_status_idx" ON "gigs"("status");

-- CreateIndex
CREATE INDEX "gigs_collegeId_idx" ON "gigs"("collegeId");

