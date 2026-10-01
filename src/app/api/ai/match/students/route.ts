import { NextResponse } from 'next/server';

import { rankStudentsForUser } from '@/lib/ai/rankStudents';
import { protectApi } from '@/lib/auth-checks';

export async function GET(req: Request) {
  try {
    const auth = await protectApi(['FOUNDER', 'STARTUP', 'CLIENT', 'STUDENT']);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    // IDOR protection: Non-privileged users may only query student recommendations for their own profile
    if (auth.role === 'STUDENT' && auth.user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden: Cannot query student matches for another user' }, { status: 403 });
    }

    const ranked = await rankStudentsForUser(userId);
    const results = ranked.map(r => {
      const { ...safeStudent } = r;
      return safeStudent;
    });

    return NextResponse.json({ students: results });
  } catch (e: any) {
    console.error('[ai/match/students Error]:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
