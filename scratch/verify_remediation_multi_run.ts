import { getSourceConfig, getAllEnabledSources } from "../src/lib/automation/sources/registry";
import { runDiscoveryForSource } from "../src/lib/automation/sources/discovery-worker";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("============================================================");
  console.log("PHASE 16B REMEDIATION: MULTI-RUN IDEMPOTENCY & PROVENANCE PROOF");
  console.log("============================================================");

  // 1. Initial State
  const initialTotal = await prisma.discoveredOpportunity.count();
  const initialPublished = await prisma.discoveredOpportunity.count({
    where: { status: "APPROVED" }
  });
  console.log(`Initial DB Count: ${initialTotal}, Auto-Published: ${initialPublished}`);

  // 2. Run B: Execute discovery on the 5 remediation sources
  console.log("\n--- RUN B: Executing Same Sources to Prove Idempotency ---");
  const testSources = [
    "github_tech_apprenticeships",
    "confs_tech_events",
    "zapply_undergrad_research",
    "indian_postgrad_scholarships",
    "monajalal_cs_fellowships"
  ];

  let runBNew = 0;
  let runBUpdated = 0;
  let runBUnchanged = 0;
  let runBDedup = 0;

  for (const src of testSources) {
    const config = getSourceConfig(src)!;
    const res = await runDiscoveryForSource(config);
    console.log(`[Run B - ${src}] Found: ${res.itemsFound}, New: ${res.itemsNew}, Updated: ${res.itemsUpdated}, DedupPrevented: ${res.duplicatesPrevented}`);
    runBNew += res.itemsNew;
    runBUpdated += res.itemsUpdated;
    runBDedup += res.duplicatesPrevented;
  }

  const postRunBTotal = await prisma.discoveredOpportunity.count();
  console.log(`\nPost-Run B DB Count: ${postRunBTotal} (Change: +${postRunBTotal - initialTotal})`);
  console.log(`Run B Results: New Inserted=${runBNew}, Updated/Preserved=${runBUpdated + runBDedup}`);

  // 3. Run C: Targeted recheck / refresh of a specific source
  console.log("\n--- RUN C: Targeted Refresh of confs_tech_events ---");
  const confsConfig = getSourceConfig("confs_tech_events")!;
  const resC = await runDiscoveryForSource(confsConfig);
  console.log(`[Run C - confs_tech_events] Found: ${resC.itemsFound}, New: ${resC.itemsNew}, Updated: ${resC.itemsUpdated}, DedupPrevented: ${resC.duplicatesPrevented}`);

  const postRunCTotal = await prisma.discoveredOpportunity.count();
  console.log(`Post-Run C DB Count: ${postRunCTotal} (Change: +${postRunCTotal - postRunBTotal})`);

  // 4. Verify Safety Gates
  console.log("\n============================================================");
  console.log("SAFETY GATES VERIFICATION");
  console.log("============================================================");
  const totalInDb = await prisma.discoveredOpportunity.count();
  const autoPublishedCount = await prisma.discoveredOpportunity.count({
    where: {
      OR: [
        { status: "APPROVED" },
        { publishedOpportunityId: { not: null } }
      ]
    }
  });
  console.log(`Total Opportunities Staged: ${totalInDb}`);
  console.log(`Auto-Published Count: ${autoPublishedCount}`);
  console.log(`OPPORTUNITY_AUTOPUBLISH_ENABLED: ${process.env.OPPORTUNITY_AUTOPUBLISH_ENABLED ?? "false (unset/disabled)"}`);
  console.log(`Auto-Publish Safety Gate: ${autoPublishedCount === 0 ? "PASSED (0 auto-published)" : "FAILED"}`);

  // 5. Verify Canonical Category Distribution
  console.log("\n============================================================");
  console.log("CANONICAL CATEGORY DISTRIBUTION (ALL REAL DATA)");
  console.log("============================================================");
  const categories = await prisma.discoveredOpportunity.groupBy({
    by: ["opportunityType"],
    _count: { id: true }
  });
  console.table(categories.map(c => ({ Category: c.opportunityType, StagedCount: c._count.id })));

  // 6. Verify Trust Model Independence & Provenance on Samples
  console.log("\n============================================================");
  console.log("TRUST MODEL INDEPENDENCE & PROVENANCE INSPECTION");
  console.log("============================================================");
  const sampleCategories = ["APPRENTICESHIP", "EVENT", "RESEARCH", "FELLOWSHIP", "SCHOLARSHIP", "JOB", "INTERNSHIP", "HACKATHON"];
  for (const cat of sampleCategories) {
    const opp = await prisma.discoveredOpportunity.findFirst({
      where: { opportunityType: cat },
      select: {
        id: true,
        title: true,
        company: true,
        opportunityType: true,
        sourceTrust: true,
        verificationState: true,
        qualityScore: true,
        status: true,
        metadata: true
      }
    });
    if (opp) {
      const meta = opp.metadata as any;
      console.log(`\n[${cat}] "${opp.title}" by ${opp.company}`);
      console.log(`  Source Trust:       ${opp.sourceTrust}`);
      console.log(`  Verification State: ${opp.verificationState}`);
      console.log(`  Quality Score:      ${opp.qualityScore}/100`);
      console.log(`  Lifecycle / Fresh:  ${meta?.lifecycleState ?? "ACTIVE"}`);
      console.log(`  Risk Flags:         ${JSON.stringify(meta?.riskFlags ?? [])}`);
      console.log(`  Status:             ${opp.status}`);
      console.log(`  Provenance Count:   ${meta?.provenance?.length ?? 0}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
