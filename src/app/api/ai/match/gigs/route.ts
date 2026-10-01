import { NextResponse } from 'next/server';

import { rankGigsForUser } from '@/lib/ai/rankGigs';
import { protectApi } from '@/lib/auth-checks';

export async function GET(req: Request) {
  try {
    const auth = await protectApi(['FOUNDER', 'STUDENT', 'STARTUP', 'CLIENT']);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    // IDOR protection: Standard users can only get gig recommendations for their own profile
    if (auth.role !== 'FOUNDER' && auth.user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden: Cannot query gig matches for another user' }, { status: 403 });
    }

    const ranked = await rankGigsForUser(userId);
    // Stripping vector from response for performance
    const results = ranked.map(r => {
      const { ...safeGig } = r;
      return safeGig;
    });

    return NextResponse.json({ gigs: results });
  } catch (e: any) {
    console.error('[ai/match/gigs Error]:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
