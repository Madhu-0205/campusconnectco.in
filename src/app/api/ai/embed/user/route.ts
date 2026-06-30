import { NextResponse } from 'next/server';
import { computeUserEmbedding } from '@/lib/ai/embeddings';
import { protectApi } from '@/lib/auth-checks';

export async function POST(req: Request) {
    try {
        const auth = await protectApi(["FOUNDER", "STUDENT", "STARTUP", "CLIENT"]);
        if (auth.errorResponse) return auth.errorResponse;

        const { userId } = await req.json();
        if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
        
        // IDOR prevention: standard users can only calculate their own profile embeddings
        if (auth.role !== "FOUNDER" && auth.user.id !== userId) {
            return NextResponse.json({ error: 'Forbidden: Cannot compute embedding for other user' }, { status: 403 });
        }

        const vector = await computeUserEmbedding(userId);
        return NextResponse.json({ success: true, dimensions: vector.length });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
