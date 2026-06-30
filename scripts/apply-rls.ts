import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Use DIRECT_URL since DDL statements should run on a direct connection bypassing pgbouncer transaction pooler
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL || process.env.DATABASE_URL,
        },
    },
});

async function main() {
    console.log("🚀 Starting Supabase RLS Policies Migration...");

    const sqlFilePath = path.join(process.cwd(), "prisma", "supabase_rls_policies.sql");
    if (!fs.existsSync(sqlFilePath)) {
        throw new Error(`SQL file not found at: ${sqlFilePath}`);
    }

    const fullSql = fs.readFileSync(sqlFilePath, "utf8");

    // Simple parser to split SQL commands by semicolons while ignoring comments and empty lines
    const lines = fullSql.split("\n");
    let currentStatement = "";
    const statements: string[] = [];

    for (let line of lines) {
        // Remove trailing carriage returns/whitespace
        line = line.trim();

        // Skip full comment lines or empty lines
        if (line.startsWith("--") || line === "") {
            continue;
        }

        // Handle inline comments
        const commentIndex = line.indexOf("--");
        if (commentIndex !== -1) {
            line = line.substring(0, commentIndex).trim();
        }

        currentStatement += " " + line;

        // If the line ends with a semicolon, we completed a statement
        if (line.endsWith(";")) {
            statements.push(currentStatement.trim());
            currentStatement = "";
        }
    }

    console.log(`Parsed ${statements.length} SQL statements to execute.`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        try {
            // Log first 100 characters of the statement for clarity
            const logSnippet = stmt.length > 100 ? stmt.substring(0, 100) + "..." : stmt;
            console.log(`[Statement ${i + 1}/${statements.length}] Executing: "${logSnippet}"`);

            await prisma.$executeRawUnsafe(stmt);
            successCount++;
        } catch (error: any) {
            console.error(`❌ [Statement ${i + 1}/${statements.length}] Failed:`, error.message);
            failCount++;
        }
    }

    console.log("\n" + "=".repeat(40));
    console.log(`Migration complete! Successfully executed: ${successCount}, Failed: ${failCount}`);
    console.log("=".repeat(40) + "\n");
}

main()
    .catch((error) => {
        console.error("Migration failed:", error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
