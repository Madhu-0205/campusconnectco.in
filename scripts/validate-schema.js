const { execSync } = require('child_process');

console.log('🔍 Validating Prisma schema and database sync status...');

try {
  // Check if all migrations are applied and the database schema is up-to-date
  const output = execSync('npx prisma migrate status', { encoding: 'utf-8' });
  
  if (output.includes('Following migration have not yet been applied')) {
    console.error('❌ ERROR: Pending migrations detected!');
    console.error(output);
    process.exit(1);
  }
  
  console.log('✅ Prisma schema is fully synchronized with the database!');
} catch (error) {
  console.error('❌ ERROR: Prisma schema validation failed.');
  console.error(error.stdout || error.message);
  process.exit(1);
}
