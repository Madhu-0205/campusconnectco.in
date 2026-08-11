const fs = require('fs');

let sql = `
-- Drop defaults first to avoid type casting issues on defaults
ALTER TABLE "Internship" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "applications" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "gigs" ALTER COLUMN "status" DROP DEFAULT;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GigStatus') THEN
        CREATE TYPE "GigStatus" AS ENUM ('OPEN', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'REJECTED', 'PENDING_APPROVAL');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ApplicationStatus') THEN
        CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'HIRED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InternshipStatus') THEN
        CREATE TYPE "InternshipStatus" AS ENUM ('OPEN', 'CLOSED', 'FILLED', 'DELETED', 'PENDING_APPROVAL');
    END IF;
END $$;

-- Now alter types with USING clauses
ALTER TABLE "Internship" ALTER COLUMN "status" TYPE "InternshipStatus" USING "status"::"InternshipStatus";
ALTER TABLE "applications" ALTER COLUMN "status" TYPE "ApplicationStatus" USING "status"::"ApplicationStatus";
ALTER TABLE "gigs" ALTER COLUMN "status" TYPE "GigStatus" USING "status"::"GigStatus";

-- Set enum defaults back
ALTER TABLE "Internship" ALTER COLUMN "status" SET DEFAULT 'OPEN';
ALTER TABLE "applications" ALTER COLUMN "status" SET DEFAULT 'PENDING';
ALTER TABLE "gigs" ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- Create Indexes and Constraints
CREATE INDEX IF NOT EXISTS "applications_status_idx" ON "applications"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "applications_applicantId_gigId_key" ON "applications"("applicantId", "gigId");
CREATE INDEX IF NOT EXISTS "gigs_status_idx" ON "gigs"("status");
CREATE INDEX IF NOT EXISTS "gigs_collegeId_idx" ON "gigs"("collegeId");
`;

fs.writeFileSync('prisma/migrations/20260811000000_phase_2b_hardening/migration.sql', sql);
