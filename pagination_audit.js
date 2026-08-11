const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        if (file === 'node_modules' || file === '.next' || file === '.git') return;
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const apiFiles = walk('src/app/api');
const findings = [];

apiFiles.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('findMany(')) {
            // Check the next few lines for 'take:' or 'skip:'
            const block = lines.slice(i, i+15).join(' ');
            if (!block.includes('take:') && !block.includes('take :')) {
                findings.push({
                    file: f,
                    line: i + 1,
                    code: lines[i].trim()
                });
            }
        }
    }
});

fs.writeFileSync('audit_pagination.json', JSON.stringify(findings, null, 2));
console.log(`Found ${findings.length} findMany calls lacking 'take' pagination.`);
