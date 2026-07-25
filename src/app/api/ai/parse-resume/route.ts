import { NextResponse } from 'next/server';

import { parseResume } from '@/lib/ai/resumeParser';
import prisma from '@/lib/prisma'; // Assuming standard prisma import
import { resumeParseLimiter } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';


export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        if (!(await resumeParseLimiter.check(ip))) {
            return NextResponse.json({ error: 'Rate limit exceeded. Max 3 parses per day.' }, { status: 429 });
        }

        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { fileUrl } = body;

        if (!fileUrl) {
            return NextResponse.json({ error: 'fileUrl is required' }, { status: 400 });
        }

        // Process synchronously
        let resumeData;
        try {
            resumeData = await parseResume(fileUrl);
        } catch (err: any) {
            console.error("[parseResume Error]:", err);
            return NextResponse.json({ error: err.message || 'Failed to parse resume' }, { status: 422 });
        }

        try {
            // Update Prisma User
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    // @ts-ignore
                    resumeData: resumeData as any,
                    // Update basic stringified skills array if present
                    skills: Array.isArray(resumeData.skills) ? resumeData.skills.join(',') : undefined
                }
            });

            // Create a ResumeHistory (Analysis) Record
            await prisma.resumeAnalysis.create({
                data: {
                    userId: user.id,
                    score: resumeData.atsScore?.overallScore || 0,
                    grade: resumeData.atsScore?.overallScore >= 80 ? "A" : resumeData.atsScore?.overallScore >= 60 ? "B" : "C",
                    resumeSnippet: resumeData.summary?.substring(0, 200) || "",
                    wordCount: 0,
                    result: resumeData as any,
                    fileName: fileUrl.split('/').pop()
                }
            });
        } catch (dbErr: any) {
            console.error("[Database Error updating resumeData]:", dbErr);
            return NextResponse.json({ error: 'Failed to save resume data to database' }, { status: 500 });
        }

        return NextResponse.json({ status: 'completed', result: resumeData, message: 'Resume processed successfully' });
    } catch (e: any) {
        console.error("[parse-resume API Route Error]:", e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}
