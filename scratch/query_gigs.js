const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const statuses = await prisma.$queryRaw`
    SELECT status, COUNT(*) as count 
    FROM gigs 
    GROUP BY status;
  `;
  console.log("Gig Status Counts in Database:");
  console.log(statuses);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
