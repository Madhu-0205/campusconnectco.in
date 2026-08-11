const fs = require('fs');

const findings = JSON.parse(fs.readFileSync('audit_pagination.json', 'utf8'));

findings.forEach(finding => {
    const filePath = finding.file;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Some are .findMany();
    if (content.includes('findMany()')) {
        content = content.replace('findMany()', 'findMany({ take: 50 })');
        fs.writeFileSync(filePath, content);
        console.log("Patched", filePath);
        return;
    }
    
    // Otherwise they are findMany({
    // We will do a simple string replace for the first occurrence of findMany({ that doesn't have a take nearby.
    // Wait, it's safer to split by lines and insert take: 50, after findMany({
    
    const lines = content.split('\n');
    let patched = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('findMany({')) {
            // Check if this block already has 'take'
            const block = lines.slice(i, i+20).join(' ');
            if (!block.includes('take:') && !block.includes('take :')) {
                lines[i] = lines[i].replace('findMany({', 'findMany({ take: 50,');
                patched = true;
            }
        }
    }
    
    if (patched) {
        fs.writeFileSync(filePath, lines.join('\n'));
        console.log("Patched", filePath);
    }
});
