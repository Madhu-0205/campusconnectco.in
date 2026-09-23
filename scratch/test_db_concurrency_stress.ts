import { prisma } from "../src/lib/prisma";

interface StageResult {
  concurrency: number;
  total: number;
  successful: number;
  failed: number;
  connectionErrors: number;
  p2024Errors: number;
  avgLatencyMs: number;
  maxLatencyMs: number;
  minLatencyMs: number;
}

async function runStage(concurrency: number): Promise<StageResult> {
  console.log(`\n--- Running Concurrency Level: ${concurrency} ---`);
  const latencies: number[] = [];
  let successful = 0;
  let failed = 0;
  let connectionErrors = 0;
  let p2024Errors = 0;

  const tasks = Array.from({ length: concurrency }).map(async (_, idx) => {
    const start = Date.now();
    try {
      // Alternate between read-only queries: count, findFirst, findMany
      if (idx % 3 === 0) {
        await prisma.internship.count();
      } else if (idx % 3 === 1) {
        await prisma.internship.findFirst({
          select: { id: true, title: true, status: true },
        });
      } else {
        await prisma.gig.findMany({
          take: 3,
          select: { id: true, title: true, budget: true },
        });
      }
      const dur = Date.now() - start;
      latencies.push(dur);
      successful++;
    } catch (err: any) {
      const dur = Date.now() - start;
      latencies.push(dur);
      failed++;
      const msg = err?.message || String(err);
      console.error(`  [Task ${idx}] Error:`, msg);
      if (msg.includes("Closed") || msg.includes("Can't reach database server")) {
        connectionErrors++;
      }
      if (err?.code === "P2024" || msg.includes("P2024")) {
        p2024Errors++;
      }
    }
  });

  await Promise.all(tasks);

  const avgLatencyMs = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
  const maxLatencyMs = latencies.length > 0 ? Math.max(...latencies) : 0;
  const minLatencyMs = latencies.length > 0 ? Math.min(...latencies) : 0;

  return {
    concurrency,
    total: concurrency,
    successful,
    failed,
    connectionErrors,
    p2024Errors,
    avgLatencyMs,
    maxLatencyMs,
    minLatencyMs,
  };
}

async function main() {
  console.log("==================================================");
  console.log("DATABASE REGRESSION & CONCURRENCY STRESS TEST");
  console.log("==================================================");

  const tiers = [1, 5, 10, 20];
  const results: StageResult[] = [];

  for (const tier of tiers) {
    const res = await runStage(tier);
    results.push(res);
    console.log(`Results for ${tier} concurrent: ${res.successful}/${res.total} passed (Avg: ${res.avgLatencyMs}ms, Max: ${res.maxLatencyMs}ms, ConnErrs: ${res.connectionErrors}, P2024: ${res.p2024Errors})`);
  }

  console.log("\n==================================================");
  console.log("FINAL CONCURRENCY TEST SUMMARY:");
  console.log("==================================================");
  console.table(results);

  const totalFailed = results.reduce((acc, r) => acc + r.failed, 0);
  const totalConnErrors = results.reduce((acc, r) => acc + r.connectionErrors, 0);
  const totalP2024 = results.reduce((acc, r) => acc + r.p2024Errors, 0);

  if (totalFailed === 0 && totalConnErrors === 0 && totalP2024 === 0) {
    console.log("\n✅ ALL CONCURRENCY STRESS TIERS (1, 5, 10, 20) PASSED WITH 0 ERRORS!");
    process.exit(0);
  } else {
    console.error(`\n❌ FAILED: ${totalFailed} queries failed (${totalConnErrors} connection errors, ${totalP2024} P2024 errors)`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Stress test runner crashed:", err);
  process.exit(1);
});
