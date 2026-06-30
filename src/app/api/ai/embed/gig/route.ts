import { NextResponse } from 'next/server';
import { computeGigEmbedding } from '@/lib/ai/embeddings';
import { protectApi } from '@/lib/auth-checks';

export async function POST(req: Request) {
    try {
        const auth = await protectApi(["FOUNDER", "STUDENT", "STARTUP", "CLIENT"]);
        if (auth.errorResponse) return auth.errorResponse;

        const { gigId } = await req.json();
        if (!gigId) return NextResponse.json({ error: 'gigId required' }, { status: 400 });
        const vector = await computeGigEmbedding(gigId);
        return NextResponse.json({ success: true, dimensions: vector.length });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
