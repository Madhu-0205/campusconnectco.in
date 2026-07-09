import { NextResponse } from 'next/server';

import { assembleHomeFeed } from '@/lib/ai/feedAssembler';
import { aiLimiter } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!(await aiLimiter.check(ip))) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const feed = await assembleHomeFeed(user.id);

    return NextResponse.json(feed);
  } catch (e: any) {
    console.error('[feed]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
