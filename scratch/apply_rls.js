const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sqlPath = path.join(__dirname, '../prisma/supabase_rls_policies.sql');
  let sql = fs.readFileSync(sqlPath, 'utf-8');

  // Replace double-quoted table names globally
  sql = sql.replaceAll('"Gig"', '"gigs"');
  sql = sql.replaceAll('"Message"', '"messages"');
  sql = sql.replaceAll('"Application"', '"applications"');

  // Update user_select_policy to remove TO authenticated
  sql = sql.replace(
    /CREATE POLICY user_select_policy ON "User"\s+FOR SELECT\s+TO authenticated\s+USING \(true\);/g,
    'CREATE POLICY user_select_policy ON "User"\n    FOR SELECT\n    USING (true);'
  );

  // Update user_select_policy if already replaced but maybe has TO authenticated
  sql = sql.replace(
    /CREATE POLICY user_select_policy ON "User"\s+FOR SELECT\s+TO authenticated/g,
    'CREATE POLICY user_select_policy ON "User"\n    FOR SELECT'
  );

  // Update gig_select_policy to remove TO authenticated
  sql = sql.replace(
    /CREATE POLICY gig_select_policy ON "gigs"\s+FOR SELECT\s+TO authenticated\s+USING \(true\);/g,
    'CREATE POLICY gig_select_policy ON "gigs"\n    FOR SELECT\n    USING (true);'
  );

  // Append grants at the end
  const grants = `
-- =========================================================================
-- 4. EXPLICIT DB PRIVILEGE GRANTS FOR SUPABASE ROLES
-- =========================================================================
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
`;
  if (!sql.includes('4. EXPLICIT DB PRIVILEGE GRANTS')) {
    sql += grants;
  }

  // Save the updated policies SQL file
  fs.writeFileSync(sqlPath, sql, 'utf-8');
  console.log("Updated prisma/supabase_rls_policies.sql saved locally.");

  // Apply to database
  console.log("Applying updated RLS policies & grants to PostgreSQL database...");
  
  const statements = sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      // Drop existing policies first to avoid "policy already exists" errors
      if (stmt.startsWith('CREATE POLICY') || stmt.startsWith('create policy')) {
        const match = stmt.match(/CREATE POLICY (\w+) ON "(\w+)"/i);
        if (match) {
          const policyName = match[1];
          const tableName = match[2];
          await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS ${policyName} ON "${tableName}";`).catch(() => {});
        }
      }
      await prisma.$executeRawUnsafe(stmt);
    } catch (err) {
      console.warn(`Statement [${i}] failed: ${stmt.substring(0, 100)}...`);
      console.warn(`Reason:`, err.message);
    }
  }

  console.log("RLS policies & grants successfully applied to database.");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
