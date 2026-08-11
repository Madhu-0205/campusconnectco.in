const fs = require('fs');

const extractFile = (path) => {
    try {
        return fs.readFileSync(path, 'utf8');
    } catch(e) {
        return null;
    }
}

// 3A-3 AI Model Compatibility
const aiFiles = [
    'src/app/api/ai/smartmatch/route.ts',
    'src/app/api/ai/parse-resume/route.ts',
    'src/app/api/ai/cover-letter/route.ts'
];
console.log("=== 3A-3 AI MODELS ===");
aiFiles.forEach(f => {
    const content = extractFile(f);
    if (!content) return;
    const modelMatches = content.match(/model:\s*['"](.*?)['"]/g);
    console.log(f, "Models used:", modelMatches);
});

// 3A-4 AI Output Validation
console.log("\n=== 3A-4 AI VALIDATION ===");
aiFiles.forEach(f => {
    const content = extractFile(f);
    if (!content) return;
    const hasZod = content.includes('z.object');
    const hasSafeParse = content.includes('safeParse');
    const hasJSONParse = content.includes('JSON.parse');
    console.log(f, "Has Zod:", hasZod, "Has SafeParse:", hasSafeParse, "Has JSON.parse:", hasJSONParse);
});

// 3A-2 Frontend Save Optimistic UI
console.log("\n=== 3A-2 SAVED OPPORTUNITY OPTIMISTIC UI ===");
const gigCard = extractFile('src/components/gigs/GigCard.tsx') || extractFile('src/components/GigCard.tsx');
if (gigCard) {
    const optimistic = gigCard.includes('setSaved(prev => !prev)') || gigCard.includes('setSaved(!saved)');
    const revert = gigCard.includes('catch') && (gigCard.includes('setSaved') || gigCard.includes('toast'));
    console.log("GigCard Optimistic update:", optimistic, "Revert on error:", revert);
}

