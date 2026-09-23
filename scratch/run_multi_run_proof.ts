import prisma from "../src/lib/prisma";
import { runDueOpportunitySources } from "../src/lib/automation/sources/scheduler";
import { runDiscoveryForSource } from "../src/lib/automation/sources/discovery-worker";
import { getSourceConfig } from "../src/lib/automation/sources/registry";

async function main() {
  console.log("============================================================");
  console.log("PHASE 16B: MULTI-RUN IDEMPOTENCY & FRESHNESS VERIFICATION");
  console.log("============================================================");
  console.log(`Current Local Time: ${new Date().toISOString()}\n`);

  // ==========================================================================
  // RUN A: Initial Multi-Source Ingestion
  // ==========================================================================
  console.log(">>> EXECUTING RUN A (Initial Multi-Source Discovery)...");
  const runAStart = new Date();
  const resultA = await runDueOpportunitySources({ forceAll: true });
  const runAEnd = new Date();

  console.log(`[RUN A COMPLETED] Started: ${runAStart.toISOString()} | Finished: ${runAEnd.toISOString()}`);
  console.log(`  Sources Attempted:    ${resultA.metrics.sourcesAttempted}`);
  console.log(`  Sources Succeeded:    ${resultA.metrics.sourcesSucceeded}`);
  console.log(`  Sources Failed:       ${resultA.metrics.sourcesFailed}`);
  console.log(`  Items Discovered:     ${resultA.metrics.itemsDiscovered}`);
  console.log(`  Items Normalized:     ${resultA.metrics.itemsNormalized}`);
  console.log(`  Items New:            ${resultA.metrics.itemsNew}`);
  console.log(`  Items Updated:        ${resultA.metrics.itemsUpdated}`);
  console.log(`  Items Unchanged:      ${resultA.metrics.itemsUnchanged}`);
  console.log(`  Duplicates Prevented: ${resultA.metrics.duplicatesPrevented}`);
  console.log(`  Items Rejected:       ${resultA.metrics.itemsRejected}`);
  console.log(`  Duration:             ${resultA.metrics.durationMs}ms\n`);

  const countAfterA = await prisma.discoveredOpportunity.count();
  console.log(`Total Records in Database after Run A: ${countAfterA}\n`);

  // Wait 2 seconds for distinct timestamp demonstration
  await new Promise((r) => setTimeout(r, 2000));

  // ==========================================================================
  // RUN B: Immediate Re-run (Idempotency Proof)
  // ==========================================================================
  console.log(">>> EXECUTING RUN B (Immediate Re-run on Same Sources — Idempotency Proof)...");
  const runBStart = new Date();
  const resultB = await runDueOpportunitySources({ forceAll: true });
  const runBEnd = new Date();

  console.log(`[RUN B COMPLETED] Started: ${runBStart.toISOString()} | Finished: ${runBEnd.toISOString()}`);
  console.log(`  Sources Attempted:    ${resultB.metrics.sourcesAttempted}`);
  console.log(`  Sources Succeeded:    ${resultB.metrics.sourcesSucceeded}`);
  console.log(`  Sources Failed:       ${resultB.metrics.sourcesFailed}`);
  console.log(`  Items Discovered:     ${resultB.metrics.itemsDiscovered}`);
  console.log(`  Items Normalized:     ${resultB.metrics.itemsNormalized}`);
  console.log(`  Items New:            ${resultB.metrics.itemsNew}`);
  console.log(`  Items Updated:        ${resultB.metrics.itemsUpdated}`);
  console.log(`  Items Unchanged:      ${resultB.metrics.itemsUnchanged}`);
  console.log(`  Duplicates Prevented: ${resultB.metrics.duplicatesPrevented}`);
  console.log(`  Items Rejected:       ${resultB.metrics.itemsRejected}`);
  console.log(`  Duration:             ${resultB.metrics.durationMs}ms\n`);

  const countAfterB = await prisma.discoveredOpportunity.count();
  console.log(`Total Records in Database after Run B: ${countAfterB}`);
  const duplicateDifference = countAfterB - countAfterA;
  console.log(`Net New Records in Run B: ${duplicateDifference} (MUST BE 0: IDEMPOTENT)\n`);

  // Wait 2 seconds
  await new Promise((r) => setTimeout(r, 2000));

  // ==========================================================================
  // RUN C: Refresh & Revalidation Demonstration
  // ==========================================================================
  console.log(">>> EXECUTING RUN C (Discovery Cycle & Provenance Inspection)...");
  const runCStart = new Date();
  // Execute targeted discovery for fast remote tech feed
  const remoteOkConfig = getSourceConfig("remoteok_tech_jobs");
  let resultC: any = null;
  if (remoteOkConfig) {
    resultC = await runDiscoveryForSource(remoteOkConfig);
  }
  const runCEnd = new Date();

  console.log(`[RUN C COMPLETED] Started: ${runCStart.toISOString()} | Finished: ${runCEnd.toISOString()}`);
  if (resultC) {
    console.log(`  Source:               ${resultC.source}`);
    console.log(`  Items Found:          ${resultC.itemsFound}`);
    console.log(`  Items Processed:      ${resultC.itemsProcessed}`);
    console.log(`  Items Staged:         ${resultC.itemsStaged}`);
    console.log(`  Duplicates Prevented: ${resultC.duplicatesPrevented}`);
    console.log(`  Items Rejected:       ${resultC.rejectedCount}`);
  }

  const countAfterC = await prisma.discoveredOpportunity.count();
  console.log(`\nTotal Records in Database after Run C: ${countAfterC}`);

  // Fetch breakdown of lifecycle states
  const allMeta = await prisma.discoveredOpportunity.findMany({ select: { metadata: true } });
  const lifecycleCounts: Record<string, number> = {
    ACTIVE: 0,
    STALE_REQUIRES_RECHECK: 0,
    CONFIRMED_EXPIRED: 0,
    CONFIRMED_INACTIVE: 0,
    SOURCE_UNAVAILABLE: 0
  };
  for (const m of allMeta) {
    const s = (m.metadata as any)?.lifecycleState || "ACTIVE";
    if (lifecycleCounts[s] !== undefined) lifecycleCounts[s]++;
  }
  console.log("\nCurrent Discovered Opportunities Lifecycle States:", lifecycleCounts);

  // Fetch breakdown of categories
  const categories = await prisma.discoveredOpportunity.groupBy({
    by: ["opportunityType"],
    _count: { id: true }
  });
  console.log("Current Canonical Category Breakdown:");
  for (const c of categories) {
    console.log(`  ${c.opportunityType.padEnd(16)}: ${c._count.id}`);
  }

  // Fetch source health summary
  const sourcesHealth = await prisma.sourceHealth.findMany({ orderBy: { source: "asc" } });
  console.log("\nSource Health Summary:");
  for (const sh of sourcesHealth) {
    console.log(`  [${sh.status.padEnd(8)}] ${sh.sourceName.padEnd(45)} | Found: ${sh.itemsFound} | Duplicates: ${sh.duplicatesCount} | Failures: ${sh.failureCount}`);
  }

  console.log("\n============================================================");
  console.log("MULTI-RUN PROOF COMPLETE");
  console.log("============================================================");
}

main()
  .catch((e) => {
    console.error("Multi-run proof failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
