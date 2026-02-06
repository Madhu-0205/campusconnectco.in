const fs = require('fs');
try {
    const data = JSON.parse(fs.readFileSync('lint.json', 'utf8'));
    data.forEach(f => {
        f.messages.forEach(m => {
            if (m.severity === 2) {
                console.log(`${f.filePath}:${m.line} - ${m.message} (${m.ruleId})`);
            }
        });
    });
} catch (e) {
    console.error(e.message);
}
