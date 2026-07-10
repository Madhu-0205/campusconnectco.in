import { PrismaClient } from "@prisma/client";

// Explicitly use DIRECT_URL for direct connection benchmarking
const directUrl = process.env.DIRECT_URL;
if (!directUrl) {
    console.error("DIRECT_URL is not set in environment!");
    process.exit(1);
}

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: directUrl
        }
    }
});

async function runBenchmark(iterations = 5) {
    console.log("==================================================");
    console.log("DATABASE DIRECT CONNECTION (PORT 5432) BENCHMARK");
    console.log("==================================================");

    // Warm-up query
    console.log("\n🔥 Warming up Prisma connection pool (direct port 5432)...");
    const twarm0 = performance.now();
    await prisma.user.findFirst({ select: { id: true } });
    const twarm1 = performance.now();
    console.log(`Connection Pool Warm-up: ${(twarm1 - twarm0).toFixed(2)} ms`);

    for (let i = 1; i <= iterations; i++) {
        console.log(`\n🏃 Iteration ${i} (Direct connection):`);
        
        const t0 = performance.now();
        await prisma.user.findFirst({ select: { id: true, email: true } });
        const t1 = performance.now();
        const userTime = t1 - t0;
        
        const t2 = performance.now();
        await prisma.gig.findMany({ where: { status: "active" }, take: 10 });
        const t3 = performance.now();
        const gigTime = t3 - t2;

        const t4 = performance.now();
        await prisma.internship.findMany({ where: { status: "OPEN" }, take: 10 });
        const t5 = performance.now();
        const internshipTime = t5 - t4;

        console.log(`  - User Fetch:             ${userTime.toFixed(2)} ms ${userTime < 250 ? "⚡" : "⚠️"}`);
        console.log(`  - Active Gigs Query:      ${gigTime.toFixed(2)} ms ${gigTime < 250 ? "⚡" : "⚠️"}`);
        console.log(`  - Open Internships Query: ${internshipTime.toFixed(2)} ms ${internshipTime < 250 ? "⚡" : "⚠️"}`);
    }
}

runBenchmark()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
