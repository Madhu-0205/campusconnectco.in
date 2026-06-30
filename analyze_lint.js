/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
let raw = fs.readFileSync('lint_errors.json');
let text = raw.toString('utf16le');
if (text.startsWith('\uFEFF')) text = text.slice(1);
const data = JSON.parse(text);
const errors = data.flatMap(f => f.messages.filter(m => m.severity === 2).map(m => `${f.filePath}:${m.line}:${m.column} ${m.ruleId} ${m.message}`));
console.log(errors.join('\n'));
