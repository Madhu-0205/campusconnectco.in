 
const fs = require('fs');
const content = fs.readFileSync('components_lint.json', 'utf16le');
// Strip BOM
const cleanContent = content.replace(/^\uFEFF/, '');
const data = JSON.parse(cleanContent);
let output = "";
data.filter(d => d.errorCount > 0 || d.warningCount > 0).forEach(d => {
    d.messages.forEach(m => {
        output += d.filePath + ":" + m.line + " - " + (m.ruleId || 'error') + " - " + m.message + "\n";
    });
});
fs.writeFileSync('lint_summary.txt', output, 'utf8');
console.log("Done");
