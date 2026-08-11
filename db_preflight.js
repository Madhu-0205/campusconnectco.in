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
            Transactions: await prisma.transaction.count(),
            Escrows: await prisma.escrow.count(),
            Internships: await prisma.internship.count()
        };

        // Duplicates in Application
        const apps = await prisma.application.findMany({ select: { applicantId: true, gigId: true, id: true } });
        const appMap = {};
        let duplicates = 0;
        apps.forEach(a => {
            const key = a.applicantId + "_" + a.gigId;
            if (appMap[key]) duplicates++;
            else appMap[key] = true;
        });
        report.duplicateApplications = duplicates;

        // Orphan records
        // Transactions with missing buyer/seller
        let orphanTransactions = 0;
        const txs = await prisma.transaction.findMany({ select: { buyerId: true, sellerId: true } });
        for (let tx of txs) {
            const buyer = await prisma.user.findUnique({ where: { id: tx.buyerId } });
            const seller = await prisma.user.findUnique({ where: { id: tx.sellerId } });
            if (!buyer || !seller) orphanTransactions++;
        }
        report.orphanTransactions = orphanTransactions;
        
        // Escrows with missing client/worker
        let orphanEscrows = 0;
        const escrows = await prisma.escrow.findMany({ select: { clientId: true, workerId: true } });
        for (let e of escrows) {
            const client = await prisma.user.findUnique({ where: { id: e.clientId } });
            const worker = await prisma.user.findUnique({ where: { id: e.workerId } });
            if (!client || !worker) orphanEscrows++;
        }
        report.orphanEscrows = orphanEscrows;
        
        console.log(JSON.stringify(report, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
