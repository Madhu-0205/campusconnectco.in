import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runBenchmark(iterations = 5) {
    console.log("==================================================");
    console.log("DATABASE WARM-UP & CONSECUTIVE QUERY BENCHMARK");
    console.log("==================================================");

    // Warm-up query
    console.log("\n🔥 Warming up Prisma connection pool...");
    const twarm0 = performance.now();
    await prisma.user.findFirst({ select: { id: true } });
    const twarm1 = performance.now();
    console.log(`Connection Pool Warm-up: ${(twarm1 - twarm0).toFixed(2)} ms`);

    for (let i = 1; i <= iterations; i++) {
        console.log(`\n🏃 Iteration ${i} (Warm Connection):`);
        
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

        console.log(`  - User Fetch:             ${userTime.toFixed(2)} ms ${userTime < 100 ? "⚡" : "⚠️"}`);
        console.log(`  - Active Gigs Query:      ${gigTime.toFixed(2)} ms ${gigTime < 100 ? "⚡" : "⚠️"}`);
        console.log(`  - Open Internships Query: ${internshipTime.toFixed(2)} ms ${internshipTime < 100 ? "⚡" : "⚠️"}`);
    }
}

runBenchmark()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
