const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    let college = await prisma.college.findFirst({ where: { name: 'Test University E2E' }});
    if (!college) {
        college = await prisma.college.create({
            data: {
                name: 'Test University E2E',
                city: 'Mumbai',
                state: 'Maharashtra',
                district: 'Mumbai',
                type: 'E2E',
            }
        });
    }
    console.log("Created college:", college);
}

main().catch(console.error).finally(() => prisma.$disconnect());
