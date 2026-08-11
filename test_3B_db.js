const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    console.log("=== CHECKING SKILLS ===");
    const usersWithSkills = await prisma.user.count({ where: { skills: { not: null, not: '' } } });
    const userSkillsCount = await prisma.userSkill.count();
    console.log(`Users with string skills: ${usersWithSkills}`);
    console.log(`Total UserSkill records: ${userSkillsCount}`);

    const gigsWithSkills = await prisma.gig.count({ where: { required_skills: { not: null } } });
    const gigSkillsCount = await prisma.gigSkill.count();
    console.log(`Gigs with JSON skills: ${gigsWithSkills}`);
    console.log(`Total GigSkill records: ${gigSkillsCount}`);

    const skillsCount = await prisma.skill.count();
    console.log(`Unique Skill definitions: ${skillsCount}`);

    console.log("\n=== CHECKING DUPLICATES ===");
    const dupSkills = await prisma.$queryRawUnsafe(`SELECT name, count(*) FROM "Skill" GROUP BY name HAVING count(*) > 1`);
    console.log(`Duplicate Skill names:`, dupSkills);

    const dupUserSkills = await prisma.$queryRawUnsafe(`SELECT "userId", "skillId", count(*) FROM "UserSkill" GROUP BY "userId", "skillId" HAVING count(*) > 1`);
    console.log(`Duplicate UserSkill mappings:`, dupUserSkills);

    const dupGigSkills = await prisma.$queryRawUnsafe(`SELECT "gigId", "skillId", count(*) FROM "GigSkill" GROUP BY "gigId", "skillId" HAVING count(*) > 1`);
    console.log(`Duplicate GigSkill mappings:`, dupGigSkills);

    console.log("\n=== CHECKING VECTORS ===");
    const userEmbed = await prisma.$queryRawUnsafe(`SELECT 
        count(vector) as old_vector_count, 
        count(vector_pg) as new_vector_count 
        FROM "UserEmbedding"`);
    console.log(`UserEmbedding vectors:`, userEmbed);

    const gigEmbed = await prisma.$queryRawUnsafe(`SELECT 
        count(vector) as old_vector_count, 
        count(vector_pg) as new_vector_count 
        FROM "GigEmbedding"`);
    console.log(`GigEmbedding vectors:`, gigEmbed);
    
    await prisma.$disconnect();
}

run().catch(console.error);
