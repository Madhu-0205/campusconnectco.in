import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

function sanitizeInput(str: string): string {
    return str.trim();
}

async function main() {
    console.log("Starting User.skills backfill...");
    const users = await prisma.user.findMany({
        where: {
            skills: { not: null }
        },
        select: { id: true, skills: true }
    });

    for (const user of users) {
        if (!user.skills || user.skills === '') continue;
        const skillsArr = user.skills.split(",");
        const distinctSkills = [...new Set(skillsArr.map(s => sanitizeInput(s)).filter(Boolean))];
        
        for (const s of distinctSkills) {
            await prisma.skill.upsert({
                where: { name: s },
                update: {},
                create: { name: s, category: 'General' }
            });
        }
        
        const skillRecords = await prisma.skill.findMany({
            where: { name: { in: distinctSkills } }
        });
        
        if (skillRecords.length > 0) {
            await prisma.userSkill.createMany({
                data: skillRecords.map(sr => ({
                    userId: user.id,
                    skillId: sr.id
                })),
                skipDuplicates: true
            });
        }
    }
    console.log(`User.skills backfilled: ${users.length} users processed.`);

    console.log("Starting Gig.required_skills backfill...");
    const gigs = await prisma.gig.findMany({
        where: {
            required_skills: { not: Prisma.DbNull }
        },
        select: { id: true, required_skills: true }
    });

    for (const gig of gigs) {
        if (!gig.required_skills) continue;
        let skillsArr: string[] = [];
        if (Array.isArray(gig.required_skills)) {
            skillsArr = gig.required_skills as string[];
        } else if (typeof gig.required_skills === 'string') {
            skillsArr = gig.required_skills.split(",");
        }
        
        const distinctSkills = [...new Set(skillsArr.map(s => sanitizeInput(s)).filter(Boolean))];
        
        for (const s of distinctSkills) {
            await prisma.skill.upsert({
                where: { name: s },
                update: {},
                create: { name: s, category: 'General' }
            });
        }
        
        const skillRecords = await prisma.skill.findMany({
            where: { name: { in: distinctSkills } }
        });
        
        if (skillRecords.length > 0) {
            await prisma.gigSkill.createMany({
                data: skillRecords.map(sr => ({
                    gigId: gig.id,
                    skillId: sr.id
                })),
                skipDuplicates: true
            });
        }
    }
    console.log(`Gig.required_skills backfilled: ${gigs.length} gigs processed.`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
