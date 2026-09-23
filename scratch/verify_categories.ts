import { prisma } from "../src/lib/prisma";

async function main() {
  const counts = await prisma.discoveredOpportunity.groupBy({
    by: ["opportunityType"],
    _count: {
      id: true,
    },
  });

  console.log("=== Category Counts in Staged Opportunities ===");
  console.log(JSON.stringify(counts, null, 2));

  const total = await prisma.discoveredOpportunity.count();
  console.log("Total records:", total);

  // Check sample records for each category
  const categories = [
    "APPRENTICESHIP",
    "EVENT",
    "FELLOWSHIP",
    "GIG",
    "HACKATHON",
    "INTERNSHIP",
    "JOB",
    "RESEARCH"
  ];

  console.log("\n=== First Record in Each of 8 Categories ===");
  for (const cat of categories) {
    const opp = await prisma.discoveredOpportunity.findFirst({
      where: { opportunityType: cat },
      orderBy: { discoveredAt: "asc" },
      select: {
        id: true,
        title: true,
        company: true,
        opportunityType: true,
        source: true,
        sourceTrust: true,
        verificationState: true,
        qualityScore: true,
        spamRiskScore: true,
        status: true,
        applicationUrl: true
      }
    });
    if (opp) {
      console.log(`[${cat}] ID: ${opp.id} | "${opp.title}" @ ${opp.company} (Status: ${opp.status}, Trust: ${opp.sourceTrust}, Verification: ${opp.verificationState})`);
    } else {
      console.log(`[${cat}] NONE FOUND`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
