const fs = require('fs');
const execSync = require('child_process').execSync;

const apis = fs.readFileSync('apis.txt', 'utf-8').split('\n').filter(Boolean);
let findings = {
  idor: [], validation: [], methods: [], dbMismatch: []
};

for (const file of apis) {
  const content = fs.readFileSync(file, 'utf-8');
  const route = file.replace('src/app/api', '/api').replace('/route.ts', '');
  
  if (content.includes('supabase.auth.getUser') && content.includes('prisma.') && content.includes('where: {') && !content.includes('userId: user.id')) {
    if (content.includes('update(') || content.includes('delete(')) {
      findings.idor.push({route, file, issue: 'Possible IDOR: Update/Delete without userId check'});
    }
  }
  
  if (content.includes('export async function POST') && !content.includes('z.object') && !content.includes('.json()')) {
    findings.validation.push({route, file, issue: 'POST missing JSON parsing or Zod validation'});
  }

  if (content.match(/status:\s*['"](OPEN|ACTIVE|CLOSED)['"]/i)) {
    findings.dbMismatch.push({route, file, issue: 'Hardcoded string status used instead of Prisma Enum/casing'});
  }
}
console.log(JSON.stringify(findings, null, 2));
