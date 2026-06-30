const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Renaming tables in PostgreSQL...");
  
  // We check if the table "Gig" exists before renaming to prevent errors
  const checkGig = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'Gig'
    );
  `;
  
  if (checkGig[0].exists) {
    console.log("Renaming 'Gig' to 'gigs'...");
    await prisma.$executeRawUnsafe('ALTER TABLE "Gig" RENAME TO "gigs";');
  } else {
    console.log("'Gig' table does not exist (already renamed or missing).");
  }

  const checkMessage = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'Message'
    );
  `;
  
  if (checkMessage[0].exists) {
    console.log("Renaming 'Message' to 'messages'...");
    await prisma.$executeRawUnsafe('ALTER TABLE "Message" RENAME TO "messages";');
  } else {
    console.log("'Message' table does not exist (already renamed or missing).");
  }

  const checkApplication = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'Application'
    );
  `;
  
  if (checkApplication[0].exists) {
    console.log("Renaming 'Application' to 'applications'...");
    await prisma.$executeRawUnsafe('ALTER TABLE "Application" RENAME TO "applications";');
  } else {
    console.log("'Application' table does not exist (already renamed or missing).");
  }

  console.log("Renaming complete.");
}

main()
  .catch(e => {
    console.error("Error during table renaming:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
