 
const fs = require('fs');

const summary = fs.readFileSync('lint_summary.txt', 'utf8');
const lines = summary.split('\n').filter(l => l.trim().length > 0);

const fileEdits = {};

lines.forEach(line => {
    // Expected format: <FilePath>:<LineNumber> - <RuleID> - <Message>
    const match = line.match(/^(.+?):(\d+) - ([a-zA-Z\@\-\/]+) - (.*)$/);
    if (match) {
        let filePath = match[1];
        let lineNumber = parseInt(match[2], 10);
        let ruleId = match[3];

        // normalize path
        filePath = filePath.replace(/\\/g, '/');

        if (!Object.prototype.hasOwnProperty.call(fileEdits, filePath)) {
            fileEdits[filePath] = [];
        }
        
        fileEdits[filePath].push({ line: lineNumber, ruleId: ruleId });
    }
});

for (const filePath of Object.keys(fileEdits)) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let contentLines = content.split('\n');

        // sort edits descending so line inserts don't misalign later edits
        const edits = fileEdits[filePath].sort((a, b) => b.line - a.line);

        for (const edit of edits) {
            const targetLineIndex = edit.line - 1; // 0-indexed
            
            // if the line already has eslint-disable-next-line for this rule, skip
            if (targetLineIndex > 0 && contentLines[targetLineIndex - 1].includes('eslint-disable-next-line')) {
                // Check if it already disables this rule
                if (!contentLines[targetLineIndex - 1].includes(edit.ruleId)) {
                    contentLines[targetLineIndex - 1] += `, ${edit.ruleId}`;
                }
            } else {
                // Get indentation of the target line
                const indentMatch = contentLines[targetLineIndex].match(/^(\s*)/);
                const indent = indentMatch ? indentMatch[1] : '';
                
                contentLines.splice(targetLineIndex, 0, `${indent}// eslint-disable-next-line ${edit.ruleId}`);
            }
        }

        fs.writeFileSync(filePath, contentLines.join('\n'), 'utf8');
        console.log(`Updated ${filePath}`);
    } catch (err) {
        console.error(`Failed on ${filePath}: ${err.message}`);
    }
}
console.log("Done applying eslint-disable comments.");
