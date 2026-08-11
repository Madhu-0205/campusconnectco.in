const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("=== RLS POLICIES ON PUBLIC TABLES ===");
        const publicPolicies = await prisma.$queryRaw`
            SELECT c.relname AS table_name, p.polname AS policy_name, p.polcmd AS command, pg_get_expr(p.polqual, p.polrelid) AS qual, pg_get_expr(p.polwithcheck, p.polrelid) AS with_check
            FROM pg_policy p
            JOIN pg_class c ON p.polrelid = c.oid
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'public'
            ORDER BY table_name, policy_name;
        `;
        console.table(publicPolicies);

        console.log("\n=== STORAGE BUCKETS ===");
        const buckets = await prisma.$queryRaw`SELECT id, name, public FROM storage.buckets;`;
        console.table(buckets);

        console.log("\n=== STORAGE OBJECT POLICIES ===");
        const storagePolicies = await prisma.$queryRaw`
            SELECT c.relname AS table_name, p.polname AS policy_name, p.polcmd AS command, pg_get_expr(p.polqual, p.polrelid) AS qual, pg_get_expr(p.polwithcheck, p.polrelid) AS with_check
            FROM pg_policy p
            JOIN pg_class c ON p.polrelid = c.oid
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'storage' AND c.relname = 'objects'
            ORDER BY policy_name;
        `;
        console.table(storagePolicies);

        console.log("\n=== REALTIME PUBLICATIONS ===");
        const realtimePubs = await prisma.$queryRaw`
            SELECT pubname, puballtables, pubinsert, pubupdate, pubdelete 
            FROM pg_publication;
        `;
        console.table(realtimePubs);
        
        console.log("\n=== REALTIME POLICIES (if any) ===");
        const realtimePolicies = await prisma.$queryRaw`
            SELECT c.relname AS table_name, p.polname AS policy_name, pg_get_expr(p.polqual, p.polrelid) AS qual
            FROM pg_policy p
            JOIN pg_class c ON p.polrelid = c.oid
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'realtime'
        `;
        console.table(realtimePolicies);
        
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
