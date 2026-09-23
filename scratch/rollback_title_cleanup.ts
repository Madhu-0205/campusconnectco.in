/**
 * Rollback Script for Opportunity Title Cleanup
 * CampusConnectCo
 *
 * Targets strictly the 6 records defined in scratch/pre_cleanup_internship_snapshot.json.
 * Restores original title and company values without modifying any other fields or records.
 */

import fs from "fs";
import path from "path";
import prisma from "../src/lib/prisma";

export interface SnapshotRecord {
  id: string;
  title: string;
  company: string;
  status: string;
  externalId: string | null;
  applicationLink: string | null;
  createdAt: string;
}

export function loadSnapshot(): SnapshotRecord[] {
  const snapshotPath = path.join(process.cwd(), "scratch", "pre_cleanup_internship_snapshot.json");
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`CRITICAL: Snapshot file not found at ${snapshotPath}`);
  }
  const content = fs.readFileSync(snapshotPath, "utf-8");
  const records: SnapshotRecord[] = JSON.parse(content);
  if (!Array.isArray(records) || records.length !== 6) {
    throw new Error(`CRITICAL: Snapshot must contain exactly 6 records, found ${records?.length}`);
  }
  return records;
}

export async function simulateRollback(): Promise<{
  targetCount: number;
  updates: Array<{ id: string; currentTitle: string; restoreTitle: string; currentCompany: string; restoreCompany: string }>;
}> {
  const snapshot = loadSnapshot();
  const targetIds = snapshot.map((r) => r.id);

  const currentRecords = await prisma.internship.findMany({
    where: { id: { in: targetIds } },
    select: { id: true, title: true, company: true, status: true, externalId: true }
  });

  const updates: Array<{ id: string; currentTitle: string; restoreTitle: string; currentCompany: string; restoreCompany: string }> = [];

  for (const snap of snapshot) {
    const curr = currentRecords.find((c) => c.id === snap.id);
    if (!curr) {
      throw new Error(`Cannot rollback: Record ${snap.id} not found in database!`);
    }
    updates.push({
      id: snap.id,
      currentTitle: curr.title,
      restoreTitle: snap.title,
      currentCompany: curr.company,
      restoreCompany: snap.company
    });
  }

  return {
    targetCount: updates.length,
    updates
  };
}

export async function executeRollback(): Promise<void> {
  const { updates } = await simulateRollback();
  console.log(`Executing rollback for ${updates.length} records...`);

  await prisma.$transaction(
    updates.map((u) =>
      prisma.internship.update({
        where: { id: u.id },
        data: {
          title: u.restoreTitle,
          company: u.restoreCompany
        }
      })
    )
  );

  console.log(`SUCCESS: Rolled back ${updates.length} records to pre-cleanup state.`);
}

async function main() {
  const isExecute = process.argv.includes("--execute");

  if (isExecute) {
    await executeRollback();
  } else {
    console.log("=== ROLLBACK SIMULATION (DRY RUN) ===");
    const { targetCount, updates } = await simulateRollback();
    console.log(`Validated ${targetCount} target records from snapshot:`);
    for (const u of updates) {
      console.log(`- ID: ${u.id}`);
      console.log(`  Title:   "${u.currentTitle}" -> Restores to: "${u.restoreTitle}"`);
      console.log(`  Company: "${u.currentCompany}" -> Restores to: "${u.restoreCompany}"`);
    }
    console.log("SIMULATION SUCCESS: No database writes performed. Pass --execute to apply.");
  }
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error("Rollback failed:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
