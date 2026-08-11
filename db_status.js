const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const results = {};
        
        results.Gig = await prisma.gig.groupBy({ by: ['status'], _count: true });
        results.Application = await prisma.application.groupBy({ by: ['status'], _count: true });
        results.Transaction = await prisma.transaction.groupBy({ by: ['status'], _count: true });
        results.Escrow = await prisma.escrow.groupBy({ by: ['status'], _count: true });
        results.Dispute = await prisma.dispute.groupBy({ by: ['status'], _count: true });
        results.Internship = await prisma.internship.groupBy({ by: ['status'], _count: true });
        results.SavedGig = await prisma.savedGig.groupBy({ by: ['liked'], _count: true });
        results.SavedInternship = await prisma.savedInternship.groupBy({ by: ['liked'], _count: true });
        results.Post = await prisma.post.groupBy({ by: ['status'], _count: true });
        results.ConnectionRequest = await prisma.connectionRequest.groupBy({ by: ['status'], _count: true });
        
        console.log(JSON.stringify(results, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
