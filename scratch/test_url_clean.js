const { PrismaClient } = require('@prisma/client');

// Clean connection URL by parsing it as a URL object and replacing parameters
const rawUrl = process.env.DATABASE_URL;
const urlObj = new URL(rawUrl);
urlObj.searchParams.set("connection_limit", "5");
urlObj.searchParams.set("pool_timeout", "40");
const dbUrl = urlObj.toString();

console.log("Cleaned DATABASE_URL:", dbUrl);

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
