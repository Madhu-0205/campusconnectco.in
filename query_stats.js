const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== GIG STATUSES ===");
    const gigStatuses = await prisma.gig.groupBy({ by: ['status'], _count: { id: true } });
    console.log(gigStatuses);

    console.log("\n=== INTERNSHIP STATUSES ===");
    const internshipStatuses = await prisma.internship.groupBy({ by: ['status'], _count: { id: true } });
    console.log(internshipStatuses);

    console.log("\n=== APPLICATION STATUSES ===");
    const appStatuses = await prisma.application.groupBy({ by: ['status'], _count: { id: true } });
    console.log(appStatuses);

    console.log("\n=== USER SKILLS (String vs Relational) ===");
    const usersWithStringSkills = await prisma.user.count({ where: { skills: { not: null, not: "" } } });
    const usersWithRelationalSkills = await prisma.userSkill.groupBy({ by: ['userId'] }).then(res => res.length);
    console.log(`String skills: ${usersWithStringSkills}, Relational skills: ${usersWithRelationalSkills}`);
    
    console.log("\n=== GIG SKILLS (JSON vs Relational) ===");
    // 'required_skills' is Json? in schema
    const gigsWithJsonSkills = await prisma.gig.count({ where: { required_skills: { not: null } } });
    const gigsWithRelationalSkills = await prisma.gigSkill.groupBy({ by: ['gigId'] }).then(res => res.length);
    console.log(`JSON skills: ${gigsWithJsonSkills}, Relational skills: ${gigsWithRelationalSkills}`);
    
    console.log("\n=== EMBEDDINGS ===");
    const gigEmbeds = await prisma.gigEmbedding.count();
    const userEmbeds = await prisma.userEmbedding.count();
    console.log(`Gig embeddings: ${gigEmbeds}, User embeddings: ${userEmbeds}`);
    
    console.log("\n=== FINANCIAL DELETION RISKS (Cascades) ===");
    // Checking how many transactions point to users
    const buyers = await prisma.transaction.groupBy({ by: ['buyerId'] }).then(res => res.length);
    const sellers = await prisma.transaction.groupBy({ by: ['sellerId'] }).then(res => res.length);
    const escrows = await prisma.escrow.count();
    console.log(`Distinct buyers: ${buyers}, Distinct sellers: ${sellers}, Escrows: ${escrows}`);
    
    await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
