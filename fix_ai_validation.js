const fs = require('fs');
const smartmatchPath = 'src/app/api/ai/smartmatch/route.ts';
let code = fs.readFileSync(smartmatchPath, 'utf8');
if (!code.includes('z.object')) {
    code = code.replace('import { NextResponse } from "next/server";', 'import { NextResponse } from "next/server";\nimport { z } from "zod";');
    const zodSchema = `
const SmartMatchSchema = z.object({
    internships: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        matchScore: z.number()
    })).optional(),
    gigs: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        matchScore: z.number()
    })).optional(),
    skillsToLearn: z.array(z.string()).optional(),
    roadmap: z.array(z.string()).optional()
});
`;
    code = code.replace('export async function POST', zodSchema + '\nexport async function POST');
    
    // Replace const result = await AIService.getSmartMatch...
    code = code.replace('const result = await AIService.getSmartMatch(userProfile, opportunitiesContext);', 
        `const rawResult = await AIService.getSmartMatch(userProfile, opportunitiesContext);\n        const parseResult = SmartMatchSchema.safeParse(rawResult);\n        if (!parseResult.success) {\n            logger.error('SmartMatch: Zod validation failed', parseResult.error);\n            return errorResponse(422, 'AI returned an invalid structure.', requestId);\n        }\n        const result = parseResult.data;`);
    
    fs.writeFileSync(smartmatchPath, code);
}
console.log("Added Zod to SmartMatch");

const careerPath = 'src/app/api/ai/career-guidance/route.ts';
if (fs.existsSync(careerPath)) {
    let careerCode = fs.readFileSync(careerPath, 'utf8');
    if (!careerCode.includes('z.object')) {
        careerCode = careerCode.replace('import { NextResponse } from "next/server";', 'import { NextResponse } from "next/server";\nimport { z } from "zod";');
        const schema = `
const CareerRoadmapSchema = z.object({
    roadmapSteps: z.array(z.string()).optional(),
    learningPath: z.array(z.string()).optional(),
    projects: z.array(z.string()).optional(),
    jobPrepTips: z.array(z.string()).optional()
});
`;
        careerCode = careerCode.replace('export async function POST', schema + '\nexport async function POST');
        careerCode = careerCode.replace('const result = await AIService.getCareerRoadmap(targetCareer, skills);',
            `const rawResult = await AIService.getCareerRoadmap(targetCareer, skills);\n        const parseResult = CareerRoadmapSchema.safeParse(rawResult);\n        if (!parseResult.success) {\n            logger.error('CareerGuidance: Zod validation failed', parseResult.error);\n            return NextResponse.json({ error: 'AI returned an invalid structure.' }, { status: 422 });\n        }\n        const result = parseResult.data;`);
        fs.writeFileSync(careerPath, careerCode);
        console.log("Added Zod to CareerGuidance");
    }
}
