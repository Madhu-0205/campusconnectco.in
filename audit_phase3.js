const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');

const report = {
    mockedOrStatic: [],
    missingErrorHandling: [],
    hardcodedValues: [],
    deadCode: [],
    inconsistentStates: []
};

function searchPattern(pattern, desc) {
    try {
        const cmd = `grep -rnl "${pattern}" src/app src/components`;
        const files = execSync(cmd, { encoding: 'utf8' }).split('\n').filter(Boolean);
        return files.map(f => ({ file: f, reason: desc }));
    } catch (e) {
        return [];
    }
}

// MOCKED/STATIC
report.mockedOrStatic.push(...searchPattern("TODO:", "TODO Comment"));
report.mockedOrStatic.push(...searchPattern("FIXME:", "FIXME Comment"));
report.mockedOrStatic.push(...searchPattern("mockData", "Mock Data Usage"));
report.mockedOrStatic.push(...searchPattern("const FAKE", "Fake Data"));
report.mockedOrStatic.push(...searchPattern("dummy", "Dummy Data"));
report.mockedOrStatic.push(...searchPattern("static data", "Static Data Comment"));
report.mockedOrStatic.push(...searchPattern("Math.random()", "Random/Fake Metrics"));
report.mockedOrStatic.push(...searchPattern("NotImplemented", "Not Implemented Exception"));

// MISSING ERROR HANDLING IN API
try {
    const apiFilesCmd = `find src/app/api -name "route.ts"`;
    const apiFiles = execSync(apiFilesCmd, { encoding: 'utf8' }).split('\n').filter(Boolean);
    
    apiFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        if (!content.includes('try {') || !content.includes('catch (error)')) {
            report.missingErrorHandling.push({ file, reason: "Missing global try/catch block" });
        }
        if (!content.includes('NextResponse.json({ error')) {
            report.missingErrorHandling.push({ file, reason: "Missing JSON error response" });
        }
    });
} catch (e) {}

fs.writeFileSync('audit_phase3_output.json', JSON.stringify(report, null, 2));
console.log("Audit complete. Results in audit_phase3_output.json");
