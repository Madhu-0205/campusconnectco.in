const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    console.log("=== CHECKING MOCK INTERVIEW & RESUMEDATA ===");
    // check if MockInterview records exist
    const mockCount = await prisma.mockInterview.count();
    console.log(`Total MockInterview records: ${mockCount}`);

    // check if any user has mockInterviews inside resumeData
    const usersWithMockData = await prisma.user.findMany({
        where: {
            resumeData: { not: null }
        },
        take: 10
    });
    let validJson = true;
    for (let u of usersWithMockData) {
        if (typeof u.resumeData !== 'object') {
            validJson = false;
        }
    }
    console.log(`resumeData is structurally valid JSON: ${validJson}`);

    console.log("\n=== CHECKING PLATFORM ANALYTICS AGGREGATION ===");
    const escrowRev = await prisma.escrow.aggregate({ _sum: { platformFee: true } });
    const txRev = await prisma.transaction.aggregate({ _sum: { platformFee: true } });
    console.log(`Escrow platform fee sum:`, escrowRev._sum.platformFee);
    console.log(`Transaction platform fee sum:`, txRev._sum.platformFee);
    
    // handles empty datasets
    const estimatedRevenue = Number(escrowRev._sum.platformFee || 0) + Number(txRev._sum.platformFee || 0);
    console.log(`Estimated revenue: ${estimatedRevenue} (Type: ${typeof estimatedRevenue})`);

    console.log("\n=== CHECKING COLLEGE PLACEMENT ANALYTICS ===");
    // simulate a college query
    const sampleCollege = await prisma.user.findFirst({ where: { role: 'COLLEGE' } });
    if (sampleCollege) {
        const cId = sampleCollege.collegeId;
        const count = await prisma.application.count({
            where: { status: 'HIRED', applicant: { collegeId: cId } }
        });
        console.log(`College ${cId} hired count: ${count}`);
    } else {
        console.log(`No college user found to simulate query.`);
    }

    await prisma.$disconnect();
}

run().catch(console.error);
