require('dotenv').config();
const { execSync } = require('child_process');

try {
    const cmd = `npx prisma migrate diff --from-url "${process.env.DATABASE_URL}" --to-schema-datamodel prisma/schema.prisma --script`;
    const output = execSync(cmd, { encoding: 'utf8' });
    const fs = require('fs');
    fs.writeFileSync('prisma/migrations/20260811000000_phase_2b_hardening/migration.sql', output);
    console.log("Migration SQL generated");
} catch (e) {
    console.error(e.message);
    if (e.stderr) console.error(e.stderr.toString());
}
