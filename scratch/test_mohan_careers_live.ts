import prisma from "../src/lib/prisma";
import { runDiscoveryForSource } from "../src/lib/automation/sources/discovery-worker";
import { isAutoPublishEnabled } from "../src/lib/automation/quality";

async function main() {
  console.log("==================================================");
  console.log("PHASE 16D: MOHAN CAREERS CONTROLLED LIVE RUNS");
  console.log("==================================================");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Autopublish Enabled:", isAutoPublishEnabled());

  // 1. RUN A: Initial Live Discovery
  console.log("\n>>> STARTING RUN A (Initial Discovery)...");
  const startA = Date.now();
  const resA = await runDiscoveryForSource("mohan_careers");
  const durationA = Date.now() - startA;

  console.log("Run A Result:", JSON.stringify(resA, null, 2));

  // 2. Query Staged Records in Database
  const stagedRecords = await prisma.discoveredOpportunity.findMany({
    where: { source: "mohan_careers" },
    orderBy: { createdAt: "desc" }
  });

  console.log(`\nStaged Records Count: ${stagedRecords.length}`);
  for (const rec of stagedRecords.slice(0, 5)) {
    console.log("--------------------------------------------------");
    console.log(`ID: ${rec.id}`);
    console.log(`External ID: ${rec.externalId}`);
    console.log(`Title: ${rec.title}`);
    console.log(`Company: ${rec.company}`);
    console.log(`Category/Type: ${rec.opportunityType}`);
    console.log(`Application URL: ${rec.applicationUrl}`);
    console.log(`Source URL: ${rec.sourceUrl}`);
    console.log(`Status: ${rec.status} (Expected: NEEDS_REVIEW)`);
    console.log(`Source Trust: ${rec.sourceTrust} (Expected: UNKNOWN)`);
    console.log(`Verification State: ${rec.verificationState}`);
    console.log(`Quality Score: ${rec.qualityScore}, Spam Risk: ${rec.spamRiskScore}`);
    console.log(`Deadline: ${rec.deadline ? rec.deadline.toISOString() : "null"}`);
    console.log(`Work Mode: ${rec.workMode}, Location: ${rec.location}`);
  }

  // 3. Query Source Health
  const healthA = await prisma.sourceHealth.findUnique({
    where: { source: "mohan_careers" }
  });
  console.log("\nSource Health after Run A:", JSON.stringify(healthA, null, 2));

  // 4. RUN B: Idempotency & Repeated Ingestion
  console.log("\n>>> STARTING RUN B (Idempotency & Dedup Verification)...");
  const startB = Date.now();
  const resB = await runDiscoveryForSource("mohan_careers");
  const durationB = Date.now() - startB;

  console.log("Run B Result:", JSON.stringify(resB, null, 2));

  // 5. Query Staged Records after Run B
  const stagedAfterB = await prisma.discoveredOpportunity.findMany({
    where: { source: "mohan_careers" }
  });

  console.log(`\nStaged Records Count After Run B: ${stagedAfterB.length}`);
  console.log(`New Records in Run B: ${resB.itemsNew} (Expected: 0)`);
  console.log(`Duplicates Prevented in Run B: ${resB.duplicatesPrevented}`);

  // 6. Public Surface Verification
  console.log("\n>>> VERIFYING PUBLIC SURFACES...");
  const publicCount = await prisma.internship.count({
    where: {
      OR: [
        { description: { contains: "Mohan Careers" } },
        { company: { in: stagedRecords.map(r => r.company).filter(Boolean) } }
      ],
      deletedAt: null
    }
  });

  console.log(`Public Listings matching staged records: ${publicCount} (Expected: 0)`);

  // Check search visibility
  const unreviewedPublic = await prisma.discoveredOpportunity.count({
    where: {
      source: "mohan_careers",
      status: "PUBLISHED"
    }
  });
  console.log(`Published Mohan Careers Records: ${unreviewedPublic} (Expected: 0)`);

  const needsReviewCount = await prisma.discoveredOpportunity.count({
    where: {
      source: "mohan_careers",
      status: "NEEDS_REVIEW"
    }
  });
  console.log(`Records correctly held in NEEDS_REVIEW: ${needsReviewCount}`);

  console.log("\n==================================================");
  console.log("LIVE EXECUTION SUMMARY COMPLETE");
  console.log("==================================================");
}

main()
  .catch((err) => {
    console.error("FATAL in test_mohan_careers_live:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
