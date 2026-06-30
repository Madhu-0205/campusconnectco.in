const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Notifying PostgREST to reload schema cache...");
  await prisma.$executeRawUnsafe("NOTIFY pgrst, 'reload schema';");
  console.log("Notification sent successfully!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
