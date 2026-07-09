import { NextResponse } from 'next/server';

import { moderateContent, ContentType } from '@/lib/ai/moderator';
import prisma from '@/lib/prisma';
import { aiLimiter } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';


export async function POST(req: Request) {
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

    const body = await req.json();
    const { content, contentType, contentId } = body as {
      content: string;
      contentType: ContentType;
      contentId?: string;
    };

    if (!content || !contentType) {
      return NextResponse.json({ error: 'content and contentType are required' }, { status: 400 });
    }

    const result = await moderateContent({ content, contentType, authorId: user.id, contentId });

    // Persist moderation log for admin review (only flagged/rejected)
    if (result.action !== 'APPROVE') {
      try {
        await prisma.analytics.create({
          data: {
            event: 'CONTENT_MODERATION',
            data: {
              contentType,
              contentId: contentId || null,
              authorId: user.id,
              action: result.action,
              score: result.score,
              reason: result.reason || null,
              categories: result.categories,
              snippet: content.slice(0, 200),
            },
          },
        });
      } catch (logErr) {
        console.error('[moderate] Failed to log moderation event:', logErr);
      }
    }

    return NextResponse.json(result);
  } catch (e: any) {
    console.error('[moderate]', e);
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}
