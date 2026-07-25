import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET(_req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const analyses = await prisma.resumeAnalysis.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        const roadmaps = await prisma.careerRoadmap.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        return NextResponse.json({ 
            analyses, 
            roadmaps 
        });
    } catch (e: any) {
        console.error("[resume-history GET Error]:", e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
