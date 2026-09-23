import { prisma } from "../src/lib/prisma";

const TARGET_IDS = [
  "e8719ba1-c8ee-4e72-b457-6462594548be", // APPRENTICESHIP: Amazon Software Apprenticeship
  "c1fd8628-fb0d-4fdc-8537-fe8b03cbd9b0", // EVENT: CodeMash
  "c254bf0f-92fc-49c0-9c55-e18fb96f34e5", // FELLOWSHIP: Fulbright-Nehru Fellowships
  "86c93517-777e-463e-9a4d-fac4cba39ca8", // GIG: Senior Shopify Full-stack Developer
  "700c68b1-cfaf-4a52-9461-b45d054320b8", // HACKATHON: Cognition - GameJam '26
  "9223a83d-ca66-46f6-931e-4f3952a3adb9", // JOB: AI Generalist - Entry-Level
  "a633ca67-7937-41f1-900a-c4c764547303", // RESEARCH: NLP Research Intern
];

async function main() {
  console.log("=== INSPECTING 7 REMAINING PHASE 16C PILOT RECORDS ===");
  for (const id of TARGET_IDS) {
    const opp = await prisma.discoveredOpportunity.findUnique({
      where: { id },
    });
    if (!opp) {
      console.log(`[NOT FOUND] ID: ${id}`);
      continue;
    }
    console.log("--------------------------------------------------");
    console.log(`ID: ${opp.id}`);
    console.log(`Category: ${opp.opportunityType}`);
    console.log(`Title: ${opp.title}`);
    console.log(`Company: ${opp.company}`);
    console.log(`Status: ${opp.status}`);
    console.log(`Source: ${opp.source} (${opp.sourceName})`);
    console.log(`Source Trust: ${opp.sourceTrust}`);
    console.log(`Verification State: ${opp.verificationState}`);
    console.log(`Quality Score: ${opp.qualityScore}`);
    console.log(`Spam Risk Score: ${opp.spamRiskScore}`);
    console.log(`Deadline: ${opp.deadline ? opp.deadline.toISOString() : "None"}`);
    console.log(`Location: ${opp.location || "None"} | City: ${opp.city || "None"} | WorkMode: ${opp.workMode}`);
    console.log(`Application URL: ${opp.applicationUrl}`);
    console.log(`Source URL: ${opp.sourceUrl}`);
    console.log(`Canonical URL: ${opp.canonicalUrl}`);
    console.log(`Canonical Hash: ${opp.canonicalHash}`);
    console.log(`Rejection Reason: ${opp.rejectionReason || "None"}`);
    console.log(`Review Notes: ${opp.reviewNotes || "None"}`);
    console.log(`Metadata:`, JSON.stringify(opp.metadata, null, 2));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
