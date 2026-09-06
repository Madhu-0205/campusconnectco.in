import { PrismaClient } from "@prisma/client";
import { INDIA_COLLEGES } from "../src/lib/colleges-dataset";
import { isValidUUID } from "../src/lib/uuid-utils";

const prisma = new PrismaClient();

async function main() {
  console.log("=== PHASE 5: COLLEGE DATABASE SEED & BACKFILL ===");
  console.log(`Loading ${INDIA_COLLEGES.length} curated colleges...`);

  let upsertedCount = 0;

  for (const c of INDIA_COLLEGES) {
    await prisma.college.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        name: c.name,
        city: c.city,
        district: c.district,
        state: c.state,
        latitude: c.latitude,
        longitude: c.longitude,
        type: c.type,
        approved: true,
        verified: true,
      },
      update: {
        name: c.name,
        city: c.city,
        district: c.district,
        state: c.state,
        latitude: c.latitude,
        longitude: c.longitude,
        type: c.type,
        approved: true,
        verified: true,
      },
    });
    upsertedCount++;
  }

  console.log(`Successfully upserted ${upsertedCount} colleges into PostgreSQL 'colleges' table.`);

  // -------------------------------------------------------------------------
  // Safe Legacy Profile Backfill
  // -------------------------------------------------------------------------
  console.log("\nAuditing legacy user college profiles...");

  const usersWithColleges = await prisma.user.findMany({
    where: {
      OR: [
        { college: { not: null } },
        { collegeId: { not: null } },
      ],
    },
    select: {
      id: true,
      email: true,
      college: true,
      collegeId: true,
    },
  });

  console.log(`Found ${usersWithColleges.length} users with college metadata.`);

  let backfilled = 0;
  let skipped = 0;

  for (const u of usersWithColleges) {
    const hasValidId = u.collegeId && isValidUUID(u.collegeId);

    // If user already has a valid UUID collegeId that exists in DB, verify it
    if (hasValidId) {
      const exists = await prisma.college.findUnique({ where: { id: u.collegeId! } });
      if (exists) {
        console.log(`User ${u.email}: already linked to verified college "${exists.name}" (${exists.id}).`);
        continue;
      }
    }

    // If college string exists, attempt deterministic exact match
    if (u.college && u.college.trim().length > 0) {
      const cleanName = u.college.trim();
      const matches = await prisma.college.findMany({
        where: {
          name: { equals: cleanName, mode: "insensitive" },
        },
      });

      if (matches.length === 1) {
        const matched = matches[0];
        await prisma.user.update({
          where: { id: u.id },
          data: {
            collegeId: matched.id,
            college: matched.name,
          },
        });
        console.log(`[BACKFILL] Linked ${u.email} -> "${matched.name}" (UUID: ${matched.id}).`);
        backfilled++;
      } else if (matches.length > 1) {
        console.warn(`[AMBIGUOUS] Multiple colleges match "${cleanName}" for user ${u.email}. Leaving unresolved.`);
        skipped++;
      } else {
        console.warn(`[UNMATCHED] No curated college matches "${cleanName}" for user ${u.email}. Leaving unresolved.`);
        skipped++;
      }
    } else {
      skipped++;
    }
  }

  console.log(`\nLegacy Profile Backfill Summary:`);
  console.log(`- Backfilled: ${backfilled}`);
  console.log(`- Skipped / Unresolved (Safely untouched): ${skipped}`);

  // Final count of colleges
  const totalColleges = await prisma.college.count();
  console.log(`Total colleges currently in database: ${totalColleges}`);
}

main()
  .catch((e) => {
    console.error("Seed script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
