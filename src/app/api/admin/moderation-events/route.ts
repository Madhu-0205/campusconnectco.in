import { NextResponse } from 'next/server';
import { protectApi } from '@/lib/auth-checks';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await protectApi(['FOUNDER']);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const events = await prisma.analytics.findMany({
      where: { event: 'CONTENT_MODERATION' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ events });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = await protectApi(['FOUNDER']);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { analyticsId, contentType, contentId, action } = await req.json();

    if (!analyticsId || !contentType || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'approve' && contentId) {
      // Approve: set content to active/OPEN
      if (contentType === 'gig') {
        await prisma.gig.update({ where: { id: contentId }, data: { status: 'active' } });
      } else if (contentType === 'post') {
        await prisma.post.update({ where: { id: contentId }, data: { status: 'OPEN' } });
      }
    } else if (action === 'remove' && contentId) {
      // Remove: delete or suspend
      if (contentType === 'gig') {
        await prisma.gig.update({ where: { id: contentId }, data: { status: 'REJECTED' } });
      } else if (contentType === 'post') {
        await prisma.post.update({ where: { id: contentId }, data: { status: 'REMOVED' } });
      }
    }

    // Remove from moderation queue
    await prisma.analytics.delete({ where: { id: analyticsId } });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
