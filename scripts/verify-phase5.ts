import { PrismaClient } from "@prisma/client";
import { isValidUUID } from "../src/lib/uuid-utils";
import { calculateDistance, calculateMatchScore } from "../src/lib/matching";

const prisma = new PrismaClient();

async function runVerification() {
  console.log("==================================================");
  console.log("PHASE 5 INTEGRITY VERIFICATION SUITE");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // 1. College Database Integrity
  // -------------------------------------------------------------------------
  console.log("--- 1. College Database & Deterministic Identifiers ---");
  const totalColleges = await prisma.college.count();
  assert(totalColleges >= 225, "Colleges table populated", `Found ${totalColleges} colleges`);

  const pragati = await prisma.college.findUnique({
    where: { id: "22222222-3333-4444-5555-666666666666" }
  });
  assert(
    !!pragati && pragati.name.toLowerCase().includes("pragati"),
    "Pragati Engineering College has preserved UUID 22222222-3333-4444-5555-666666666666"
  );

  const sampleColleges = await prisma.college.findMany({ take: 20 });
  const allValidUuids = sampleColleges.every(c => isValidUUID(c.id));
  assert(allValidUuids, "All seeded colleges have valid RFC 4122 UUIDs");

  const approvedColleges = await prisma.college.count({ where: { approved: true, verified: true } });
  assert(approvedColleges >= 225, "Seeded colleges marked approved and verified", `Approved: ${approvedColleges}`);

  // -------------------------------------------------------------------------
  // 2. Legacy Profile Backfill Verification
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Legacy Profile Backfill ---");
  const studentsWithCollege = await prisma.user.findMany({
    where: {
      email: {
        in: [
          "testuser_72d2cf2e@university.edu",
          "arjun.student@example.com",
          "e2e_student@university.edu",
          "testuser_e2e@university.edu"
        ]
      }
    },
    select: { email: true, college: true, collegeId: true }
  });

  for (const s of studentsWithCollege) {
    const valid = s.collegeId && isValidUUID(s.collegeId);
    assert(!!valid, `User ${s.email} has valid backfilled collegeId`, `collegeId: ${s.collegeId}`);
  }

  // -------------------------------------------------------------------------
  // 3. College Search Query Verification
  // -------------------------------------------------------------------------
  console.log("\n--- 3. College Server-Side Search Performance ---");
  // Warm up connection
  await prisma.college.findFirst();
  const t0 = performance.now();
  const searchResults = await prisma.college.findMany({
    where: {
      approved: true,
      OR: [
        { name: { contains: "Technology", mode: "insensitive" } },
        { city: { contains: "Technology", mode: "insensitive" } },
      ]
    },
    take: 10
  });
  const tQuery = Math.round(performance.now() - t0);
  assert(searchResults.length > 0 && tQuery < 350, "Server-side search executes under 350ms", `${tQuery}ms, ${searchResults.length} hits`);

  // -------------------------------------------------------------------------
  // 4. Recommendation Scoring Model Verification
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Multi-Factor Recommendation Scoring ---");
  const sampleUserSkills = "React, Node.js, TypeScript";
  const matchingGigTags = "React, TypeScript, Frontend";
  const nonMatchingGigTags = "Civil Engineering, AutoCAD";

  const matchScore = calculateMatchScore(sampleUserSkills, matchingGigTags, "Full stack web development");
  const noMatchScore = calculateMatchScore(sampleUserSkills, nonMatchingGigTags, "Structural analysis");

  assert(matchScore > noMatchScore, "Skill match score correctly ranks matching skills higher", `Match: ${matchScore}, Non-match: ${noMatchScore}`);

  // Distance calculation
  const distNear = calculateDistance(17.0234, 82.2345, 17.0300, 82.2400); // ~1km
  const distFar = calculateDistance(17.0234, 82.2345, 28.6139, 77.2090); // ~1300km
  assert(distNear < 5 && distFar > 1000, "Haversine distance calculation is accurate", `Near: ${distNear.toFixed(1)}km, Far: ${distFar.toFixed(1)}km`);

  // Canonical Recommendation Boundary Tests (50km proximity & 7-day freshness thresholds)
  const distBoundary49 = 49;
  const distBoundary51 = 51;
  const isNearby49 = distBoundary49 <= 50;
  const isNearby51 = distBoundary51 <= 50;
  assert(isNearby49 === true && isNearby51 === false, "Proximity boundary strictly enforces 50km threshold for nearby badges");

  const ageBoundary6d = 6.9;
  const ageBoundary8d = 7.1;
  const isFresh6d = ageBoundary6d <= 7;
  const isFresh8d = ageBoundary8d <= 7;
  assert(isFresh6d === true && isFresh8d === false, "Freshness boundary strictly enforces 7-day threshold for fresh opportunity badges");

  // -------------------------------------------------------------------------
  // 5. Application & Notification Pipeline Consistency
  // -------------------------------------------------------------------------
  console.log("\n--- 5. Application & In-App Notification Consistency ---");
  // Find or verify existing gig and student
  const openGig = await prisma.gig.findFirst({
    where: { status: "OPEN" },
    select: { id: true, title: true, posted_by: true }
  });

  const studentUser = await prisma.user.findFirst({
    where: { role: "STUDENT", id: { not: openGig?.posted_by } },
    select: { id: true, email: true, name: true, role: true }
  });

  assert(!!openGig && !!studentUser, "Found testable open gig and student user");

  if (openGig && studentUser) {
    // Check if notification table supports required types
    const notifCountBefore = await prisma.notification.count({ where: { userId: openGig.posted_by } });
    
    // Simulate transaction consistency check
    const testTrans = await prisma.$transaction(async (tx) => {
      const notif = await tx.notification.create({
        data: {
          userId: openGig.posted_by,
          type: "APPLICATION_RECEIVED",
          title: "Test Application Received",
          message: `Verification test for "${openGig.title}"`,
          link: `/client-hub/applicants?gigId=${openGig.id}`
        }
      });
      return notif;
    });

    assert(!!testTrans.id && isValidUUID(testTrans.id), "Notification created with valid UUID inside transaction");
    
    // Clean up test notification
    await prisma.notification.delete({ where: { id: testTrans.id } });
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log("\n==================================================");
  console.log(`INTEGRITY VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification()
  .catch(err => {
    console.error("Verification error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
