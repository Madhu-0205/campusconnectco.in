import { ImageResponse } from 'next/og';

import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const alt = 'CampusConnect Gig Opportunity';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function GigOGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let gig: {
    title: string;
    budget: number;
    tags: string | null;
    work_mode: string;
    poster: { name: string | null } | null;
  } | null = null;

  try {
    gig = await prisma.gig.findUnique({
      where: { id },
      select: {
        title: true,
        budget: true,
        tags: true,
        work_mode: true,
        poster: { select: { name: true } },
      },
    });
  } catch {
    // Gracefully fall through to default card on DB error
  }

  const title = gig?.title ?? 'Campus Gig Opportunity';
  const budget = gig?.budget ? `₹${gig.budget.toLocaleString('en-IN')}` : '';
  const location = gig?.work_mode ? (gig.work_mode.charAt(0).toUpperCase() + gig.work_mode.slice(1)) : 'Remote / India';
  const poster = gig?.poster?.name ?? 'CampusConnect';
  const tags = gig?.tags
    ? gig.tags.split(',').map(t => t.trim()).slice(0, 4)
    : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0F0F23 0%, #1a1a3e 50%, #0d1117 100%)',
          padding: '64px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Accent glow */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '200px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)',
          }}
        />

        {/* Brand badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              borderRadius: '12px',
              padding: '8px 18px',
              color: 'white',
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
            }}
          >
            CampusConnect
          </div>
          <div
            style={{
              background: 'rgba(139,92,246,0.15)',
              border: '1px solid rgba(139,92,246,0.4)',
              borderRadius: '8px',
              padding: '6px 14px',
              color: '#a78bfa',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            🎯 Open Gig
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 50 ? '42px' : '52px',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: '-1px',
            marginBottom: '28px',
            maxWidth: '900px',
          }}
        >
          {title}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
            {tags.map(tag => (
              <div
                key={tag}
                style={{
                  background: 'rgba(59,130,246,0.15)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  color: '#93c5fd',
                  fontSize: '15px',
                  fontWeight: 600,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        )}

        {/* Bottom info row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            marginTop: 'auto',
            paddingTop: '32px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {budget && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Budget</span>
              <span style={{ fontSize: '28px', fontWeight: 900, color: '#34d399' }}>{budget}</span>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Location</span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#e2e8f0' }}>📍 {location}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Posted by</span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#e2e8f0' }}>{poster}</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>campusconnectco.in</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
