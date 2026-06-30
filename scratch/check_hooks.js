const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let files = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        files = files.concat(getFiles(filePath));
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      files.push(filePath);
    }
  });
  return files;
}

const hookRegex = /\buse[A-Z][a-zA-Z0-9]*\b/g;

function analyzeFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const lines = code.split('\n');
  let insideConditional = false;
  let hasReturn = false;
  let bracesStack = 0;
  
  // A simple heuristic parser:
  // If we see if/switch/for/while/try/catch/&&/?: with a hook inside, flag it.
  // Also flag if a hook is called after any return statement in a function body.
  
  lines.forEach((line, index) => {
    // Check if line contains a return
    if (/\breturn\b/.test(line) && !line.trim().startsWith('*') && !line.trim().startsWith('//')) {
      // Simplistic return tracker (might be inside sub-functions, but useful indicator)
      hasReturn = true;
    }
    
    let match;
    while ((match = hookRegex.exec(line)) !== null) {
      const hookName = match[0];
      // Ignore React standard imports
      if (line.includes('import') && line.includes(hookName)) continue;
      
      // Look around the hook call for conditional patterns on the same line or nearby lines
      // Or if it is called after a return statement in the file (heuristic)
      const lineNum = index + 1;
      
      // Let's print occurrences of hooks to examine them
      if (hasReturn && !line.includes('export default') && !line.includes('import')) {
        console.log(`HOOK AFTER RETURN: ${filePath}:${lineNum} - Hook ${hookName} called on line: ${line.trim()}`);
      }
      
      // Check for common conditional block prefixes in the same line
      if (/\b(if|for|while|catch|switch)\b/.test(line) || line.includes('&&') || line.includes('||') || line.includes('?')) {
        console.log(`CONDITIONAL HOOK: ${filePath}:${lineNum} - ${line.trim()}`);
      }
    }
  });
}

const srcFiles = getFiles('/Users/madhu/Desktop/campusconnectco.in-main/src');
console.log(`Auditing ${srcFiles.length} files...`);
srcFiles.forEach(analyzeFile);
