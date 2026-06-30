const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      username: true
    },
    take: 10
  });
  console.log("Users in DB:");
  console.log(users);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
