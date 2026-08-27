const fs = require('fs');

const { Project, SyntaxKind } = require('ts-morph');

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
    skipAddingFilesFromTsConfig: true
});

const filesToFix = [
    "src/app/api/admin/moderation-events/route.ts",
    "src/app/api/ai/career-guidance/route.ts",
    "src/app/api/ai/chat/route.ts",
    "src/app/api/ai/copilot/chat/route.ts",
    "src/app/api/ai/copilot/sessions/route.ts",
    "src/app/api/ai/cover-letter/route.ts",
    "src/app/api/ai/embed/gig/route.ts",
    "src/app/api/ai/embed/user/route.ts",
    "src/app/api/ai/feed/route.ts",
    "src/app/api/ai/match/gigs/route.ts",
    "src/app/api/ai/match/students/route.ts",
    "src/app/api/ai/mock-interview/route.ts",
    "src/app/api/ai/moderate/route.ts",
    "src/app/api/ai/parse-file/route.ts",
    "src/app/api/ai/parse-resume/route.ts",
    "src/app/api/ai/route.ts",
    "src/app/api/ai/skill-gap/route.ts",
    "src/app/api/ai/smartmatch/route.ts",
    "src/app/api/ai/trending/route.ts",
    "src/app/api/analytics/revenue/route.ts",
    "src/app/api/applications/route.ts",
    "src/app/api/career-roadmap/route.ts",
    "src/app/api/checkout/create-order/route.ts",
    "src/app/api/checkout/webhook/route.ts",
    "src/app/api/client-hub/applicants/route.ts",
    "src/app/api/colleges/reverse-geocode/route.ts",
    "src/app/api/colleges/route.ts",
    "src/app/api/colleges/submit/route.ts",
    "src/app/api/cron/weekly-report/route.ts",
    "src/app/api/endorsement/route.ts",
    "src/app/api/founder/gigs/route.ts",
    "src/app/api/founder/preview/route.ts",
    "src/app/api/founder/users/route.ts",
    "src/app/api/founder/verify-role/route.ts",
    "src/app/api/gigs/browse/route.ts",
    "src/app/api/health/route.ts",
    "src/app/api/internal/import-internship/route.ts",
    "src/app/api/internships/[id]/route.ts",
    "src/app/api/live/route.ts",
    "src/app/api/payments/escrow/create-order/route.ts",
    "src/app/api/payments/escrow/release/route.ts",
    "src/app/api/public/gigs/trending/route.ts",
    "src/app/api/ready/route.ts",
    "src/app/api/recommendations/route.ts",
    "src/app/api/review/route.ts",
    "src/app/api/skills/categories/route.ts",
    "src/app/api/skills/suggestions/route.ts",
    "src/app/api/stats/route.ts",
    "src/app/api/upload/route.ts",
    "src/app/api/user/resume-history/route.ts"
];

const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
let modifiedCount = 0;

for (const filePath of filesToFix) {
    if (!fs.existsSync(filePath)) continue;
    const sourceFile = project.addSourceFileAtPath(filePath);
    let changed = false;

    // Check if NextResponse is imported
    let hasNextResponse = false;
    const imports = sourceFile.getImportDeclarations();
    for (const imp of imports) {
        if (imp.getModuleSpecifierValue() === 'next/server') {
            const namedImports = imp.getNamedImports().map(n => n.getName());
            if (namedImports.includes('NextResponse')) {
                hasNextResponse = true;
                break;
            } else {
                imp.addNamedImport('NextResponse');
                hasNextResponse = true;
                changed = true;
                break;
            }
        }
    }
    if (!hasNextResponse) {
        sourceFile.addImportDeclaration({
            namedImports: ['NextResponse'],
            moduleSpecifier: 'next/server'
        });
        changed = true;
    }

    // Handle variable declarations
    const vars = sourceFile.getVariableDeclarations();
    for (const v of vars) {
        if (v.isExported() && methods.includes(v.getName())) {
            const initializer = v.getInitializer();
            if (initializer && (initializer.getKind() === SyntaxKind.ArrowFunction || initializer.getKind() === SyntaxKind.FunctionExpression)) {
                const body = initializer.getBody();
                if (body && body.getKind() === SyntaxKind.Block) {
                    const statements = body.getStatements();
                    
                    if (statements.length === 1 && statements[0].getKind() === SyntaxKind.TryStatement) {
                        continue;
                    }
    
                    const originalText = statements.map(s => s.getText()).join('\n');
                    
                    body.replaceWithText(`{\n  try {\n${originalText}\n  } catch (error) {\n    console.error("API Error in ${filePath}:", error);\n    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });\n  }\n}`);
                    changed = true;
                }
            }
        }
    }

    if (changed) {
        sourceFile.saveSync();
        modifiedCount++;
    }
}

console.log(`Successfully wrapped ${modifiedCount} Arrow API routes with try/catch boundaries.`);
