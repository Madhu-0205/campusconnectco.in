import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Querying Gig statuses from the database...");
  const result = await prisma.gig.groupBy({
    by: ['status'],
    _count: {
      status: true
    }
  });
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
