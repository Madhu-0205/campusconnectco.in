import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function check() {
    try {
        const gig = await prisma.gig.findFirst();
        console.log('Gig fields:', Object.keys(gig || {}));
        const user = await prisma.user.findFirst();
        console.log('User fields:', Object.keys(user || {}));
    } catch (e) {
        console.error('Check failed:', e);
    } finally {
        await prisma.$disconnect()
    }
}

check();
