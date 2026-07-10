import fs from 'fs';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'madhuvalurouthu52@gmail.com';

    const publicUser = await prisma.user.findUnique({
        where: { email }
    });

     
    let authUsers: any[] = [];
    try {
        authUsers = await prisma.$queryRaw`SELECT id, email FROM auth.users WHERE email = ${email}`;
    } catch { }

    fs.writeFileSync('user_check.txt', JSON.stringify({ publicUser, authUsers }, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
