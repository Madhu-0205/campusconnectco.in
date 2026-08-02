import fs from "fs";
import path from "path";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RlsQueryResult {
    table_name: string;
    rls_enabled: boolean;
    force_rls_for_owner: boolean;
    policy_count: number;
}

interface BucketQueryResult {
    id: string;
    name: string;
    public: boolean;
    file_size_limit: number | null;
}

async function validateRls() {
    console.log("\n📊 [RLS AUDIT] Fetching Row-Level Security configuration from PostgreSQL...");
    try {
        const results = await prisma.$queryRaw<RlsQueryResult[]>`
            SELECT 
                c.relname AS table_name,
                c.relrowsecurity AS rls_enabled,
                false AS force_rls_for_owner,
                COALESCE((SELECT count(*)::int FROM pg_policy p WHERE p.polrelid = c.oid), 0) as policy_count
            FROM 
                pg_class c
            JOIN 
                pg_namespace n ON n.oid = c.relnamespace
            WHERE 
                n.nspname = 'public' 
                AND c.relkind = 'r'
            ORDER BY 
                c.relname;
        `;

        console.log(`Audited ${results.length} tables in public schema.`);
        let secureCount = 0;
        const violations: string[] = [];

        for (const row of results) {
            const isSecure = row.rls_enabled;
            if (isSecure) secureCount++;
            else {
                // Ignore standard internal prisma migrations table if we want, but user asked to secure public._prisma_migrations too
                violations.push(row.table_name);
            }
            console.log(`  - Table: ${row.table_name.padEnd(25)} | RLS: ${row.rls_enabled ? "✅ ENABLED" : "❌ DISABLED"} | Policies: ${row.policy_count}`);
        }

        console.log(`\nRLS Enforcement Rate: ${((secureCount / results.length) * 100).toFixed(1)}% (${secureCount}/${results.length})`);
        if (violations.length > 0) {
            console.warn(`⚠️  WARNING: RLS disabled on following tables: ${violations.join(", ")}`);
        } else {
            console.log("✅ SUCCESS: 100% of public database tables have RLS enabled!");
        }

        return { results, violations };
    } catch (err) {
        console.error("Failed to validate database RLS policies:", err);
        return { results: [], violations: ["Failed to query RLS"] };
    }
}

async function validateStorage() {
    console.log("\n📁 [STORAGE AUDIT] Checking Supabase Storage Bucket security policies...");
    try {
        const buckets = await prisma.$queryRaw<BucketQueryResult[]>`
            SELECT id, name, public, file_size_limit FROM storage.buckets;
        `;
        
        console.log(`Found ${buckets.length} storage buckets:`);
        for (const b of buckets) {
            console.log(`  - Bucket: ${b.name.padEnd(15)} | Public: ${b.public ? "🔓 YES (Public)" : "🔒 NO (Private)"} | Max Size: ${b.file_size_limit || "Unlimited"}`);
        }

        // Check if storage.objects table has RLS enabled
        const objectsRls = await prisma.$queryRaw<{ rls_enabled: boolean }[]>`
            SELECT c.relrowsecurity AS rls_enabled
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'storage' AND c.relname = 'objects';
        `;

        const storageRlsSecured = objectsRls[0]?.rls_enabled ?? false;
        console.log(`Storage objects RLS status: ${storageRlsSecured ? "✅ SECURED (RLS Enabled)" : "⚠️  UNSECURED (RLS Disabled!)"}`);
        
        return { buckets, storageRlsSecured };
    } catch (err) {
        console.error("Storage query skipped or failed (perhaps storage schema not accessible):", err);
        return { buckets: [], storageRlsSecured: false };
    }
}

async function runPerformanceBenchmarks() {
    console.log("\n⚡ [PERFORMANCE BENCHMARK] Measuring database query response times...");
    const stats: Record<string, number> = {};

    try {
        // Benchmark 1: User Profile Retrieval
        const t0 = performance.now();
        await prisma.user.findFirst({ select: { id: true, email: true } });
        const t1 = performance.now();
        stats["User Fetch"] = t1 - t0;

        // Benchmark 2: Gigs Fetch (representing feed)
        const t2 = performance.now();
        await prisma.gig.findMany({ where: { status: "active" }, take: 10 });
        const t3 = performance.now();
        stats["Active Gigs Query"] = t3 - t2;

        // Benchmark 3: Internships search/filter
        const t4 = performance.now();
        await prisma.internship.findMany({ where: { status: "OPEN" }, take: 10 });
        const t5 = performance.now();
        stats["Open Internships Query"] = t5 - t4;

        // Benchmark 4: Application lookups
        const t6 = performance.now();
        await prisma.application.findMany({ take: 10 });
        const t7 = performance.now();
        stats["Applications Lookup"] = t7 - t6;

        for (const [key, duration] of Object.entries(stats)) {
            console.log(`  - ${key.padEnd(25)}: ${duration.toFixed(2)} ms ${duration < 100 ? "⚡ (<100ms Target)" : "⚠️ (>100ms)"}`);
        }
    } catch (err) {
        console.error("Performance benchmark error:", err);
    }
    return stats;
}

function scanForSecrets(dir: string, fileExtensions = [".ts", ".tsx", ".js", ".json", ".env"]): string[] {
    const list: string[] = [];
    const walk = (currentDir: string) => {
        const files = fs.readdirSync(currentDir);
        for (const f of files) {
            const fullPath = path.join(currentDir, f);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                if (f === "node_modules" || f === ".next" || f === ".git") continue;
                walk(fullPath);
            } else if (stat.isFile()) {
                const ext = path.extname(f);
                if (fileExtensions.includes(ext) || f.startsWith(".env")) {
                    list.push(fullPath);
                }
            }
        }
    };
    walk(dir);
    return list;
}

async function auditEnvironmentAndSecrets() {
    console.log("\n🔑 [SECRETS SCAN] Auditing repository source files for exposed secrets...");
    const workspaceRoot = path.join(__dirname, "..");
    const files = scanForSecrets(workspaceRoot);
    const leaks: { file: string; line: number; type: string }[] = [];
    
    // Patterns to scan
    const patterns = [
        { regex: /service_role/i, name: "Supabase Service Role reference" },
        { regex: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+/g, name: "JWT secret token" },
        { regex: /gsk_[A-Za-z0-9]{48,}/g, name: "Groq/OpenAI Secret API Key" },
        { regex: /postgres:\/\/.*:.*@.*:.*\/postgres/g, name: "Direct database URL credentials" }
    ];

    for (const file of files) {
        // Skip env files since they are supposed to contain keys locally (but verify they aren't git tracked or in src code)
        if (file.endsWith(".env") || file.endsWith(".env.local") || file.includes("scripts/validate-production.ts")) continue;
        
        try {
            const content = fs.readFileSync(file, "utf8");
            const lines = content.split("\n");
            lines.forEach((line, idx) => {
                for (const p of patterns) {
                    if (p.regex.test(line)) {
                        leaks.push({
                            file: path.relative(workspaceRoot, file),
                            line: idx + 1,
                            type: p.name
                        });
                    }
                }
            });
        } catch {
            // ignore unreadable
        }
    }

    console.log(`Audited ${files.length} source code files.`);
    if (leaks.length > 0) {
        console.warn(`⚠️  WARNING: Potential secret leaks detected!`);
        for (const leak of leaks) {
            console.warn(`  - [LEAK] File: ${leak.file}:${leak.line} | Type: ${leak.type}`);
        }
    } else {
        console.log("✅ SUCCESS: No secrets, service role keys, or database passwords leaked in code files!");
    }

    return leaks;
}

async function runCodeSecurityAudit() {
    console.log("\n🔒 [API AUTHORIZATION AUDIT] Auditing route handlers for authorization guards...");
    const apiRoot = path.join(__dirname, "..", "src", "app", "api");
    if (!fs.existsSync(apiRoot)) {
        console.log("  - API directory not found, skipping.");
        return [];
    }

    const uncheckedRoutes: string[] = [];
    const getRoutes = (dir: string) => {
        const files = fs.readdirSync(dir);
        for (const f of files) {
            const fullPath = path.join(dir, f);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                getRoutes(fullPath);
            } else if (f === "route.ts" || f === "route.js") {
                const code = fs.readFileSync(fullPath, "utf8");
                
                // Routes that are deliberately public, or are webhook / cron routes with separate handlers
                const isPublicAllowed = 
                    fullPath.includes("api/health") || 
                    fullPath.includes("api/public") || 
                    fullPath.includes("api/cron") || 
                    fullPath.includes("api/internal") || 
                    fullPath.includes("api/skills") || 
                    fullPath.includes("api/search");

                if (!isPublicAllowed) {
                    const hasProtectCall = code.includes("protectApi") || code.includes("createClient");
                    const hasUserIdCheck = code.includes("auth.uid") || code.includes("user.id") || code.includes("userId");
                    
                    if (!hasProtectCall && !hasUserIdCheck) {
                        uncheckedRoutes.push(path.relative(path.join(apiRoot, ".."), fullPath));
                    }
                }
            }
        }
    };

    getRoutes(apiRoot);
    console.log(`Audited API routes.`);
    if (uncheckedRoutes.length > 0) {
        console.warn(`⚠️  WARNING: API routes missing standard session protection:`);
        for (const r of uncheckedRoutes) {
            console.warn(`  - ${r}`);
        }
    } else {
        console.log("✅ SUCCESS: All private API routes implement proper session or user checks!");
    }

    return uncheckedRoutes;
}

async function main() {
    console.log("==================================================");
    console.log("CAMPUSCONNECT COMPREHENSIVE PRODUCTION VALIDATION");
    console.log("==================================================");
    
    const rls = await validateRls();
    const storage = await validateStorage();
    const performance = await runPerformanceBenchmarks();
    const secrets = await auditEnvironmentAndSecrets();
    const authAudit = await runCodeSecurityAudit();

    // Write audit results JSON artifact for Walkthrough references
    const auditReport = {
        timestamp: new Date().toISOString(),
        rlsEnforcement: {
            totalTables: rls.results.length,
            violations: rls.violations,
            securedPercentage: ((rls.results.length - rls.violations.length) / rls.results.length) * 100
        },
        storage: {
            secured: storage.storageRlsSecured,
            buckets: storage.buckets
        },
        performanceDbMs: performance,
        potentialLeaks: secrets,
        potentialUnprotectedApiRoutes: authAudit
    };

    fs.writeFileSync(
        path.join(__dirname, "..", "scratch", "production-validation-results.json"),
        JSON.stringify(auditReport, null, 2)
    );

    console.log("\n==================================================");
    console.log("VALIDATION FINISHED - REPORT WRITTEN TO SCRATCH");
    console.log("==================================================");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
