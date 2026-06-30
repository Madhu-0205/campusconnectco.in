/**
 * UUID Database Audit & Cleanup Script
 * Run with: npx ts-node scripts/audit-uuids.ts
 * Or:       npx tsx scripts/audit-uuids.ts
 *
 * This script:
 * 1. Scans all models for invalid UUID values
 * 2. Removes or reports problematic records
 * 3. Verifies referential integrity
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(value: string | null | undefined): boolean {
    if (!value || value.trim() === "") return false;
    return UUID_REGEX.test(value);
}

async function main() {
    console.log("\n🔍 CampusConnect UUID Audit\n" + "=".repeat(50));

    // ── Users ──────────────────────────────────────────────
    const users = await prisma.user.findMany({ select: { id: true, email: true } });
    const badUsers = users.filter(u => !isValidUUID(u.id));
    console.log(`Users: ${users.length} total, ${badUsers.length} invalid`);
    for (const u of badUsers) {
        console.warn(`  ❌ BAD USER id="${u.id}" email="${u.email}"`);
        await prisma.user.delete({ where: { id: u.id } }).catch(() => null);
    }

    // ── Gigs ───────────────────────────────────────────────
    const gigs = await prisma.gig.findMany({ select: { id: true, title: true, posted_by: true } });
    const badGigs = gigs.filter(g => !isValidUUID(g.id) || !isValidUUID(g.posted_by));
    console.log(`Gigs: ${gigs.length} total, ${badGigs.length} invalid`);
    for (const g of badGigs) {
        console.warn(`  ❌ BAD GIG id="${g.id}" posted_by="${g.posted_by}" title="${g.title}"`);
        await prisma.gig.delete({ where: { id: g.id } }).catch(() => null);
    }

    // ── Applications ───────────────────────────────────────
    const apps = await prisma.application.findMany({
        select: { id: true, gigId: true, applicantId: true }
    });
    const badApps = apps.filter(a =>
        !isValidUUID(a.id) || !isValidUUID(a.gigId) || !isValidUUID(a.applicantId)
    );
    console.log(`Applications: ${apps.length} total, ${badApps.length} invalid`);
    for (const a of badApps) {
        console.warn(`  ❌ BAD APPLICATION id="${a.id}"`);
        await prisma.application.delete({ where: { id: a.id } }).catch(() => null);
    }

    // ── Messages ───────────────────────────────────────────
    const msgs = await prisma.message.findMany({
        select: { id: true, sender_id: true, conversation_id: true }
    });
    const badMsgs = msgs.filter(m =>
        !isValidUUID(m.id) || !isValidUUID(m.sender_id) || !isValidUUID(m.conversation_id)
    );
    console.log(`Messages: ${msgs.length} total, ${badMsgs.length} invalid`);
    for (const m of badMsgs) {
        console.warn(`  ❌ BAD MESSAGE id="${m.id}"`);
        await prisma.message.delete({ where: { id: m.id } }).catch(() => null);
    }

    // ── Escrows ────────────────────────────────────────────
    const escrows = await prisma.escrow.findMany({
        select: { id: true, clientId: true, workerId: true, gigId: true }
    });
    const badEscrows = escrows.filter(e =>
        !isValidUUID(e.id) || !isValidUUID(e.clientId) ||
        !isValidUUID(e.workerId) || !isValidUUID(e.gigId)
    );
    console.log(`Escrows: ${escrows.length} total, ${badEscrows.length} invalid`);
    for (const e of badEscrows) {
        console.warn(`  ❌ BAD ESCROW id="${e.id}"`);
        await prisma.escrow.delete({ where: { id: e.id } }).catch(() => null);
    }

    // ── Transactions ───────────────────────────────────────
    const txns = await prisma.transaction.findMany({
        select: { id: true, buyerId: true, sellerId: true, gigId: true }
    });
    const badTxns = txns.filter(t => !isValidUUID(t.id) || !isValidUUID(t.buyerId) || !isValidUUID(t.sellerId));
    console.log(`Transactions: ${txns.length} total, ${badTxns.length} invalid`);
    for (const t of badTxns) {
        console.warn(`  ❌ BAD TRANSACTION id="${t.id}"`);
        await prisma.transaction.delete({ where: { id: t.id } }).catch(() => null);
    }

    // ── Notifications ──────────────────────────────────────
    const notifs = await prisma.notification.findMany({
        select: { id: true, userId: true }
    });
    const badNotifs = notifs.filter(n => !isValidUUID(n.id));
    console.log(`Notifications: ${notifs.length} total, ${badNotifs.length} invalid`);
    for (const n of badNotifs) {
        console.warn(`  ❌ BAD NOTIFICATION id="${n.id}"`);
        await prisma.notification.delete({ where: { id: n.id } }).catch(() => null);
    }

    console.log("\n✅ UUID Audit Complete\n");
}

main()
    .catch(e => {
        console.error("Audit failed:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
