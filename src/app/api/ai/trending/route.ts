import { NextResponse } from 'next/server';

import { getTrendingGigs, getTrendingSkills, getTrendingTopics } from '@/lib/ai/trendingEngine';
import { generalApiLimiter } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!(await generalApiLimiter.check(ip))) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';

    if (type === 'gigs') {
      const gigs = await getTrendingGigs();
      return NextResponse.json({ gigs });
    }
    if (type === 'skills') {
      const skills = await getTrendingSkills();
      return NextResponse.json({ skills });
    }
    if (type === 'topics') {
      const topics = await getTrendingTopics();
      return NextResponse.json({ topics });
    }

    // Default: all
    const [gigs, skills, topics] = await Promise.all([
      getTrendingGigs(5),
      getTrendingSkills(6),
      getTrendingTopics(5)
    ]);

    return NextResponse.json({ gigs, skills, topics });
  } catch (e: any) {
    console.error('[trending]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
