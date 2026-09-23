/**
 * Database Cleanup Script for the 6 Affected Internship Records
 * CampusConnectCo
 *
 * Pre-conditions:
 * 1. Verifies scratch/pre_cleanup_internship_snapshot.json exists and contains exactly 6 records.
 * 2. Re-queries database and validates each row against snapshot.
 * 3. Applies sanitizeGeneratedTitleSuffix() to title (and company where affected).
 * 4. Preserves primary key, status, applicationLink, and externalId (remains null - truthful provenance).
 * 5. Generates detailed before/after audit report.
 */

import fs from "fs";
import path from "path";
import prisma from "../src/lib/prisma";
import { sanitizeGeneratedTitleSuffix } from "../src/lib/automation/normalizer";

async function main() {
  const snapshotPath = path.join(process.cwd(), "scratch", "pre_cleanup_internship_snapshot.json");
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`CRITICAL: Snapshot file not found at ${snapshotPath}`);
  }

  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf-8"));
  if (!Array.isArray(snapshot) || snapshot.length !== 6) {
    throw new Error(`CRITICAL: Snapshot must contain exactly 6 records, found ${snapshot?.length}`);
  }

  const targetIds = snapshot.map((s: any) => s.id);

  // 1. Re-query database
  const currentDbRows = await prisma.internship.findMany({
    where: { id: { in: targetIds } }
  });

  if (currentDbRows.length !== 6) {
    throw new Error(`CRITICAL: Expected 6 rows in DB, found ${currentDbRows.length}`);
  }

  console.log("=== PRE-CLEANUP VALIDATION ===");
  const auditReport: any[] = [];

  for (const snap of snapshot) {
    const dbRow = currentDbRows.find((r) => r.id === snap.id);
    if (!dbRow) {
      throw new Error(`Missing record in database: ${snap.id}`);
    }

    if (dbRow.title !== snap.title) {
      throw new Error(`Title mismatch for ${snap.id}: DB="${dbRow.title}", Snapshot="${snap.title}"`);
    }

    const titleSanitization = sanitizeGeneratedTitleSuffix(dbRow.title);
    if (!titleSanitization.wasSanitized) {
      throw new Error(`Expected title ${dbRow.title} to be sanitized, but wasSanitized is false!`);
    }

    const companySanitization = sanitizeGeneratedTitleSuffix(dbRow.company);

    auditReport.push({
      databaseId: dbRow.id,
      originalTitle: dbRow.title,
      cleanedTitle: titleSanitization.cleanTitle,
      titleSuffix: titleSanitization.extractedSuffix,
      titleTimestampDate: titleSanitization.timestampDate?.toISOString(),
      originalCompany: dbRow.company,
      cleanedCompany: companySanitization.cleanTitle,
      companySuffix: companySanitization.extractedSuffix,
      statusBefore: dbRow.status,
      statusAfter: dbRow.status,
      externalIdBefore: dbRow.externalId,
      externalIdAfter: dbRow.externalId, // Preserved as null - test timestamps must not be misrepresented
      sourceUrl: dbRow.applicationLink,
      source: dbRow.source,
      createdAt: dbRow.createdAt.toISOString()
    });
  }

  console.log(`Validated all ${auditReport.length} rows against strict timestamp criteria.`);

  // 2. Perform transactional update
  console.log("Applying database cleanup updates...");
  await prisma.$transaction(
    auditReport.map((item) =>
      prisma.internship.update({
        where: { id: item.databaseId },
        data: {
          title: item.cleanedTitle,
          company: item.cleanedCompany
          // Note: externalId is intentionally NOT updated to timestamp (keeps truthful provenance)
          // status is intentionally preserved
        }
      })
    )
  );

  // 3. Post-cleanup verification
  const postDbRows = await prisma.internship.findMany({
    where: { id: { in: targetIds } }
  });

  console.log("=== POST-CLEANUP VERIFICATION ===");
  for (const item of auditReport) {
    const updated = postDbRows.find((r) => r.id === item.databaseId);
    if (!updated) {
      throw new Error(`Record ${item.databaseId} disappeared after update!`);
    }

    if (updated.title !== item.cleanedTitle) {
      throw new Error(`Title update failed for ${item.databaseId}: expected "${item.cleanedTitle}", got "${updated.title}"`);
    }

    if (updated.company !== item.cleanedCompany) {
      throw new Error(`Company update failed for ${item.databaseId}: expected "${item.cleanedCompany}", got "${updated.company}"`);
    }

    if (updated.status !== item.statusBefore) {
      throw new Error(`Status changed unexpectedly for ${item.databaseId}!`);
    }

    if (updated.externalId !== item.externalIdBefore) {
      throw new Error(`externalId changed unexpectedly for ${item.databaseId}!`);
    }

    console.log(`✓ ID ${item.databaseId}:`);
    console.log(`  Title:   "${item.originalTitle}" -> "${updated.title}"`);
    console.log(`  Company: "${item.originalCompany}" -> "${updated.company}"`);
    console.log(`  Status:  ${updated.status} (unchanged)`);
    console.log(`  externalId: ${updated.externalId} (preserved null)`);
  }

  // 4. Save audit log artifact
  const auditPath = path.join(process.cwd(), "scratch", "title_cleanup_audit_report.json");
  fs.writeFileSync(auditPath, JSON.stringify(auditReport, null, 2), "utf-8");
  console.log("Audit report saved to", auditPath);
  console.log("SUCCESS: Database cleanup completed for exactly 6 records.");
}

main()
  .catch((err) => {
    console.error("Cleanup failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
