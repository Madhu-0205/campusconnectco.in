const { execSync } = require('child_process');
const fs = require('fs');

// We run eslint and parse output
execSync('npx eslint . --ext .js,.jsx,.ts,.tsx --format=json > eslint-report-3.json || true');

const data = JSON.parse(fs.readFileSync('eslint-report-3.json', 'utf8'));

data.forEach(file => {
  if (!file.messages.length) return;
  
  if (file.filePath.includes('scratch/')) return;
  
  let content = fs.readFileSync(file.filePath, 'utf8');
  let lines = content.split('\n');
  let modified = false;
  
  let msgs = file.messages
    .filter(m => m.ruleId === '@typescript-eslint/no-unused-vars')
    .sort((a,b) => b.line - a.line);
    
  msgs.forEach(msg => {
    let match = msg.message.match(/'([^']+)' is defined but never used/);
    if (!match) {
        match = msg.message.match(/'([^']+)' is assigned a value but never used/);
    }
    
    if(match) {
       let varName = match[1];
       let l = msg.line - 1;
       if (l >= lines.length) return;
       
       let orig = lines[l];
       
       // Handle standard destructurings or definitions
       let repl = orig
          .replace(new RegExp('\\b' + varName + '\\b\\s*,\\s*'), '')
          .replace(new RegExp(',\\s*\\b' + varName + '\\b'), '')
          .replace(new RegExp('\\{\\s*\\b' + varName + '\\b\\s*\\}'), '{}')
          .replace(new RegExp('catch\\s*\\(\\s*\\b' + varName + '\\b\\s*\\)'), 'catch')
          .replace(new RegExp('\\b' + varName + '\\s*:\\s*[^,}]+,\\s*'), '')
          .replace(new RegExp(',\\s*\\b' + varName + '\\s*:\\s*[^,}]+'), '')
          
       // If the line is just assigning it to something e.g. `const _req = ...` or `const vector = ...`
       if (orig.match(new RegExp('const\\s+' + varName + '\\s*='))) {
           repl = orig.replace('const ' + varName, 'const _' + varName); // just prefix with _ to ignore
       } else if (orig.match(new RegExp('let\\s+' + varName + '\\s*='))) {
           repl = orig.replace('let ' + varName, 'let _' + varName);
       }
       
       if (repl.match(/import\s*\{\s*\}\s*from/)) {
          repl = ''; 
       }
       
       if (repl !== orig) {
          lines[l] = repl;
          modified = true;
       }
    }
  });
  
  if(modified) {
    fs.writeFileSync(file.filePath, lines.join('\n'));
    console.log('Fixed', file.filePath);
  }
});
