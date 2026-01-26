const fs = require('fs');

try {
    let content = fs.readFileSync('lint_report.json', 'utf8');
    // Strip BOM if present
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }

    // Attempt to find the start of JSON array if there's garbage before it
    const jsonStart = content.indexOf('[');
    if (jsonStart > -1) {
        content = content.slice(jsonStart);
    }

    const report = JSON.parse(content);
    const summary = {};
    let totalErrors = 0;
    let totalWarnings = 0;

    const errorsByFile = [];

    report.forEach(file => {
        if (file.errorCount > 0 || file.warningCount > 0) {

            const fileErrors = [];
            file.messages.forEach(msg => {
                if (msg.severity === 2) { // 2 is error
                    const key = msg.ruleId || 'unknown';
                    summary[key] = (summary[key] || 0) + 1;
                    totalErrors++;
                    fileErrors.push(`${msg.line}:${msg.column} - ${msg.message} (${msg.ruleId})`);
                } else if (msg.severity === 1) {
                    totalWarnings++;
                }
            });

            if (fileErrors.length > 0) {
                errorsByFile.push({
                    path: file.filePath,
                    errors: fileErrors
                });
            }
        }
    });

    console.log('--- LINT SUMMARY ---');
    console.log(JSON.stringify(summary, null, 2));
    console.log(`\nTotal Errors: ${totalErrors}`);
    console.log(`Total Warnings: ${totalWarnings}`);

    console.log('\n--- FILES WITH ERRORS ---');
    errorsByFile.forEach(f => {
        console.log(`\nFile: ${f.path}`);
        f.errors.forEach(e => console.log(`  ${e}`));
    });

} catch (e) {
    console.error("Failed to parse report:", e);
}
