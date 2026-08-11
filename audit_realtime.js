const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const tablesInPub = await prisma.$queryRaw`
            SELECT p.pubname, c.relname AS table_name
            FROM pg_publication p
            JOIN pg_publication_rel pr ON p.oid = pr.prpubid
            JOIN pg_class c ON pr.prrelid = c.oid
            WHERE p.pubname IN ('supabase_realtime', 'supabase_realtime_messages_publication');
        `;
        console.log(JSON.stringify(tablesInPub, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
