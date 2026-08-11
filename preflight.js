const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("=== 3B-2 Preflight ===");
    const userSkillsCount = await prisma.userSkill.count();
    const gigSkillsCount = await prisma.gigSkill.count();
    console.log(`UserSkill Count: ${userSkillsCount}`);
    console.log(`GigSkill Count: ${gigSkillsCount}`);

    console.log("=== 3B-3 Preflight ===");
    try {
        await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
        console.log("pgvector extension enabled/exists.");
    } catch (e) {
        console.log("pgvector extension error:", e.message);
    }
    
    const userEmbedDims = await prisma.$queryRawUnsafe(`SELECT array_length(vector, 1) as dim, COUNT(*) FROM "UserEmbedding" GROUP BY array_length(vector, 1)`);
    console.log("UserEmbedding Dimensions:", userEmbedDims);
    
    await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
