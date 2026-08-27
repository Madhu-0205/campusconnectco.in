const { PrismaClient } = require('@prisma/client');

const { moderateGig } = require('./src/lib/ai/moderator');
const prisma = new PrismaClient();

async function run() {
    console.log("=== TRIGGERING AI MODERATOR ===");
    
    // Simulate low-risk content
    const res1 = await moderateGig("Need a developer", "This is a normal gig.", "author-123");
    console.log("Low Risk:", res1.action);

    // Simulate high-risk content (spam payload)
    const res2 = await moderateGig("Pay me via whatsapp 9999999999", "Contact me off platform", "author-456");
    console.log("High Risk:", res2.action);

    console.log("\n=== VERIFYING DATABASE LOGS ===");
    const events = await prisma.moderationEvent.findMany({
        orderBy: { createdAt: 'desc' }
    });
    console.log(`Found ${events.length} moderation events.`);
    for (const ev of events) {
        console.log(`[${ev.action}] ${ev.entityType} ${ev.entityId} - ${ev.reason}`);
    }

    await prisma.$disconnect();
}

run().catch(console.error);
