const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("=== PUBLIC RLS POLICIES ===");
        const publicPolicies = await prisma.$queryRaw`
            SELECT c.relname AS table_name, p.polname AS policy_name, p.polcmd AS command, pg_get_expr(p.polqual, p.polrelid) AS qual, pg_get_expr(p.polwithcheck, p.polrelid) AS with_check
            FROM pg_policy p
            JOIN pg_class c ON p.polrelid = c.oid
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'public'
            ORDER BY table_name, policy_name;
        `;
        console.log(JSON.stringify(publicPolicies, null, 2));

        console.log("\n=== STORAGE BUCKETS ===");
        const buckets = await prisma.$queryRaw`SELECT id, name, public FROM storage.buckets;`;
        console.log(JSON.stringify(buckets, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
