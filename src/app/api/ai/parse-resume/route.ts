import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { parseResume } from '@/lib/ai/resumeParser';
import prisma from '@/lib/prisma'; // Assuming standard prisma import
import { resumeParseLimiter } from '@/lib/rate-limit';


// In-memory job queue for MVP (deployments should use Upstash/Redis/Qstash)
const globalJobs = new Map<string, { status: string, result?: any, error?: string }>();

export async function POST(req: Request) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        if (!(await resumeParseLimiter.check(ip))) {
            return NextResponse.json({ error: 'Rate limit exceeded. Max 3 parses per day.' }, { status: 429 });
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll() { return cookieStore.getAll(); } } }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { fileUrl } = body;

        if (!fileUrl) {
            return NextResponse.json({ error: 'fileUrl is required' }, { status: 400 });
        }

        const jobId = crypto.randomUUID();
        globalJobs.set(jobId, { status: 'processing' });

        // Process async
        parseResume(fileUrl).then(async (resumeData) => {
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

                // In Phase 3 there will be a recomputation trigger for embeddings here.
                globalJobs.set(jobId, { status: 'completed', result: resumeData });
            } catch (err: any) {
                globalJobs.set(jobId, { status: 'failed', error: err.message });
            }
        }).catch((err) => {
            globalJobs.set(jobId, { status: 'failed', error: err.message });
        });

        return NextResponse.json({ jobId, message: 'Resume is being processed' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
        return NextResponse.json({ error: 'jobId required' }, { status: 400 });
    }

    const job = globalJobs.get(jobId);
    if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
}
