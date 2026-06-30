const { PrismaClient } = require('@prisma/client');

const dbUrl = process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes('?') ? '&' : '?') + "connection_limit=5&pool_timeout=40";
console.log("Appended DATABASE_URL:", dbUrl);

const prisma = new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

async function main() {
  const count = await prisma.user.count();
  console.log("User count:", count);
}

main()
  .catch(e => console.error("Prisma error:", e))
  .finally(() => prisma.$disconnect());
