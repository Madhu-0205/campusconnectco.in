import { getSourceConfig } from "../src/lib/automation/sources/registry";
import { runDiscoveryForSource } from "../src/lib/automation/sources/discovery-worker";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("=== Testing Real Discovery for 5 Remediation Sources ===");
  const newSources = [
    "github_tech_apprenticeships",
    "confs_tech_events",
    "zapply_undergrad_research",
    "indian_postgrad_scholarships",
    "monajalal_cs_fellowships"
  ];

  for (const src of newSources) {
    const config = getSourceConfig(src);
    if (!config) {
      console.error(`Config not found for ${src}`);
      continue;
    }
    console.log(`\n--- Running Discovery for ${src} ---`);
    const result = await runDiscoveryForSource(config);
    console.log(`Result: Found=${result.itemsFound}, Processed=${result.itemsProcessed}, Staged=${result.itemsStaged}, New=${result.itemsNew}, Updated=${result.itemsUpdated}, Errors=${result.errors.length}`);
  }

  // Check category counts across discovered opportunities in DB
  const typeCounts = await prisma.discoveredOpportunity.groupBy({
    by: ["opportunityType"],
    _count: { id: true }
  });
  console.log("\n=== Current Database Opportunity Types ===");
  console.table(typeCounts.map(t => ({ Type: t.opportunityType, Count: t._count.id })));

  // Sample check for each new category
  const sampleCats = ["APPRENTICESHIP", "EVENT", "RESEARCH", "FELLOWSHIP", "SCHOLARSHIP"];
  for (const cat of sampleCats) {
    const sample = await prisma.discoveredOpportunity.findFirst({
      where: { opportunityType: cat },
      select: {
        id: true,
        title: true,
        company: true,
        opportunityType: true,
        sourceTrust: true,
        verificationState: true,
        qualityScore: true,
        lifecycleState: true,
        status: true,
        applicationUrl: true
      }
    });
    console.log(`\nSample for ${cat}:`, sample);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
