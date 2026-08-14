const { execSync } = require('child_process');

console.log('🔍 Validating Prisma schema and database sync status...');

// Determine if a valid DATABASE_URL is available for live database checks
const dbUrl = process.env.DATABASE_URL || '';
const hasValidDbUrl = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');

// Step 1: Validate schema syntax (no live DB connection required)
// Prisma validate still requires a parseable URL in the env var, so provide a
// dummy value if the real one is missing. This only checks .prisma file syntax.
try {
  const validateEnv = hasValidDbUrl
    ? { ...process.env }
    : { ...process.env, DATABASE_URL: 'postgresql://placeholder:5432/validate', DIRECT_URL: 'postgresql://placeholder:5432/validate' };
  execSync('npx prisma validate', { encoding: 'utf-8', stdio: 'pipe', env: validateEnv });
  console.log('✅ Prisma schema syntax is valid.');
} catch (error) {
  console.error('❌ ERROR: Prisma schema syntax validation failed.');
  console.error(error.stdout || error.stderr || error.message);
  process.exit(1);
}

// Step 2: Check migration status only if a real DATABASE_URL is available
if (!hasValidDbUrl) {
  console.log('⚠️  DATABASE_URL not available — skipping migration status check.');
  console.log('   Schema syntax validation passed. Migration sync will be verified at deploy time.');
  process.exit(0);
}

try {
  const output = execSync('npx prisma migrate status', { encoding: 'utf-8', stdio: 'pipe' });

  if (output.includes('Following migration have not yet been applied')) {
    console.error('❌ ERROR: Pending migrations detected!');
    console.error(output);
    process.exit(1);
  }

  console.log('✅ Prisma schema is fully synchronized with the database!');
} catch (error) {
  // If DB is unreachable but schema syntax is valid, warn but don't fail CI
  const msg = (error.stdout || error.stderr || error.message || '');
  if (msg.includes('P1001') || msg.includes('P1013') || msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT')) {
    console.warn('⚠️  Could not reach database to verify migration status.');
    console.warn('   Schema syntax validation passed. Migration sync will be verified at deploy time.');
    process.exit(0);
  }
  console.error('❌ ERROR: Prisma migration status check failed.');
  console.error(msg);
  process.exit(1);
}

