/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = dir + '/' + file;
        if (fs.statSync(fullPath).isDirectory()) {
            if (!fullPath.includes('node_modules') && !fullPath.includes('.next')) {
                processDir(fullPath);
            }
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let orig = content;
            
            // Fix catch (error: any)
            content = content.replace(/catch\s*\(\s*([a-zA-Z0-9_]+)\s*:\s*any\s*\)/g, 'catch ($1: unknown)');
            
            // Fix err: any in catch equivalent or functions where people write error: any
            content = content.replace(/\b([a-zA-Z0-9_]+)\s*:\s*any(\s*[,)])/g, '$1: unknown$2');
            
            // Fix Record<string, any>
            content = content.replace(/Record<string,\s*any>/g, 'Record<string, unknown>');
            
            // Fix any[]
            content = content.replace(/\bany\[\]/g, 'unknown[]');
            
            // Fix as any
            content = content.replace(/\bas\s+any\b/g, 'as unknown');
            
            // Promise<any>
            content = content.replace(/Promise<any>/g, 'Promise<unknown>');

            if (content !== orig) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed types in ' + fullPath);
            }
        }
    });
}

processDir('src');
console.log('Done.');
