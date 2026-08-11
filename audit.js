const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'public') return;
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.prisma')) {
                results.push(file);
            }
        }
    });
    return results;
}

const allFiles = walk('src');
allFiles.push('prisma/schema.prisma');

// 1. Prisma Audit
const prismaFile = 'prisma/schema.prisma';
const prismaContent = fs.readFileSync(prismaFile, 'utf8');

const models = [];
let currentModel = null;
prismaContent.split('\n').forEach(line => {
    const modelMatch = line.match(/^model\s+(\w+)/);
    if (modelMatch) {
        currentModel = { name: modelMatch[1], fields: [], indexes: [] };
        models.push(currentModel);
    } else if (currentModel && line.match(/^\}/)) {
        currentModel = null;
    } else if (currentModel) {
        if (line.match(/@@index/)) {
            currentModel.indexes.push(line.trim());
        } else if (line.trim().length > 0 && !line.trim().startsWith('//') && !line.trim().startsWith('@@')) {
            currentModel.fields.push(line.trim());
        }
    }
});

fs.writeFileSync('audit_prisma.json', JSON.stringify(models, null, 2));

console.log("Found", models.length, "models.");

// 2. Status finding
const statusUsages = {};
allFiles.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    if (content.match(/status/i) || content.match(/OPEN|CLOSED|PENDING|ACTIVE|COMPLETED|REJECTED|ACCEPTED/)) {
        statusUsages[f] = true;
    }
});

// We can just dump a bunch of grep results to files for processing.
execSync(`grep -rn "findMany" src/ > audit_findmany.txt || true`);
execSync(`grep -rn "status" prisma/schema.prisma > audit_status_prisma.txt || true`);
execSync(`grep -rn "status" src/app/api/ > audit_status_api.txt || true`);
execSync(`grep -rn "z.object" src/app/api/ > audit_zod.txt || true`);
execSync(`grep -rn "req.json()" src/app/api/ > audit_req_json.txt || true`);
execSync(`grep -rn "Math.random" src/ > audit_mocked.txt || true`);
