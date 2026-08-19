const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    await prisma.user.findFirst();
  } catch (e) {
    console.error("ERROR:", e);
  }
}
main();
