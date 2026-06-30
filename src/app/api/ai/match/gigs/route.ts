import { NextResponse } from 'next/server';
import { rankGigsForUser } from '@/lib/ai/rankGigs';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
        
        const ranked = await rankGigsForUser(userId);
        // Stripping vector from response for performance
        const results = ranked.map(r => {
            const { vector, ...safeGig } = r;
            return safeGig;
        });

        return NextResponse.json({ gigs: results });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
