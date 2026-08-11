const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const report = {};
        
        // Row counts
        report.rowCounts = {
            Users: await prisma.user.count(),
            Gigs: await prisma.gig.count(),
            Applications: await prisma.application.count(),
            Internships: await prisma.internship.count()
        };

        // Query status values to ensure no data loss
        const openGigs = await prisma.gig.count({ where: { status: 'OPEN' } });
        const pendingApps = await prisma.application.count({ where: { status: 'PENDING' } });
        
        report.dataChecks = {
            openGigs,
            pendingApps
        };
        
        console.log(JSON.stringify(report, null, 2));
    } catch (e) {
        console.error("VERIFICATION FAILED", e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
