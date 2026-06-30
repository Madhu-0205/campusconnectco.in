const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  console.log("Tables:");
  console.log(tables.map(t => t.table_name).join(', '));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
